
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  author: string;
  likes: number;
}

interface AnnouncementsSectionProps {
  username?: string;
}

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ username }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [likedAnnouncements, setLikedAnnouncements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        toast.error('Failed to load announcements');
        return;
      }

      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (announcementId: string) => {
    if (!username) {
      toast.error('Please login to like announcements');
      return;
    }

    if (likedAnnouncements.has(announcementId)) {
      toast.info('You already liked this announcement');
      return;
    }

    try {
      // Update likes count
      const { error } = await supabase
        .from('announcements')
        .update({ likes: announcements.find(a => a.id === announcementId)?.likes + 1 || 1 })
        .eq('id', announcementId);

      if (error) {
        console.error('Error liking announcement:', error);
        toast.error('Failed to like announcement');
        return;
      }

      // Update local state
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === announcementId 
            ? { ...announcement, likes: announcement.likes + 1 }
            : announcement
        )
      );
      
      setLikedAnnouncements(prev => new Set([...prev, announcementId]));
      toast.success('Announcement liked!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to like announcement');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
        <p className="text-gray-600">Stay updated with the latest news and updates from KVRP</p>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Announcements Yet</h3>
            <p className="text-gray-500">Check back later for updates and news from the admin team.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(announcement.created_at)}</span>
                  <span className="text-sm">• By {announcement.author}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {announcement.image_url && (
                  <div className="mb-4">
                    <img 
                      src={announcement.image_url} 
                      alt={announcement.title}
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                <p className="text-gray-700 leading-relaxed mb-4">
                  {announcement.content}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(announcement.id)}
                    className={`flex items-center gap-2 ${
                      likedAnnouncements.has(announcement.id) 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                    disabled={!username}
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        likedAnnouncements.has(announcement.id) ? 'fill-current' : ''
                      }`} 
                    />
                    {announcement.likes} {announcement.likes === 1 ? 'Like' : 'Likes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsSection;
