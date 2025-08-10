import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, ArrowLeft, Send } from "lucide-react";
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
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" /> Your Reports
        </h2>
      </div>

      <div className="p-4 border-b">
        <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No reports yet.</p>
        ) : (
          filtered.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{r.type}</span>
                  <span className="text-xs capitalize">{r.status || 'open'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-2">{r.description}</p>
                {r.admin_response && (
                  <div className="text-xs p-2 rounded bg-muted/50">
                    <strong>Admin:</strong> {r.admin_response}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatTime(r.timestamp)}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply to admins */}
      <div className="p-4 border-t">
        {username && <AdminMessagesChat guestName={username} />}
      </div>
    </div>
  );
};

export default ReportsCenter;
