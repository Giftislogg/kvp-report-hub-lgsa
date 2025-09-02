import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, ArrowLeft, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminMessagesChat from "./AdminMessagesChat";

interface ReportsCenterProps {
  username?: string;
  onBack: () => void;
}

interface Report {
  id: string;
  type: string;
  description: string;
  status: string | null;
  timestamp: string;
  admin_response: string | null;
}

const ReportsCenter: React.FC<ReportsCenterProps> = ({ username, onBack }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (username) fetchReports();
  }, [username]);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('guest_name', username!)
      .order('timestamp', { ascending: false });
    setReports(data || []);
  };

  const filtered = reports.filter(r =>
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts: string) => new Date(ts).toLocaleString();

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2 hover:bg-blue-50">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Your Reports</h2>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white/60 backdrop-blur-sm border-b">
        <Input 
          placeholder="Search reports..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="bg-white/80 border-gray-200 focus:border-blue-400"
        />
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No reports yet</p>
            <p className="text-sm text-gray-400">Your submitted reports will appear here</p>
          </div>
        ) : (
          filtered.map((r) => (
            <Card key={r.id} className="bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{r.type}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.status === 'closed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.status || 'open'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">{r.description}</p>
                
                {r.admin_response && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <strong className="text-blue-700 text-sm">Admin Response:</strong>
                    </div>
                    <p className="text-sm text-blue-600 ml-7">{r.admin_response}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">{formatTime(r.timestamp)}</p>
                  {r.admin_response && (
                    <p className="text-xs text-blue-500">Admin replied</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Chat with Admin - Fixed positioning */}
      <div className="bg-white/95 backdrop-blur-sm border-t shadow-lg">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">Chat with Admin</span>
          </div>
          {username && <AdminMessagesChat guestName={username} />}
        </div>
      </div>
    </div>
  );
};

export default ReportsCenter;
