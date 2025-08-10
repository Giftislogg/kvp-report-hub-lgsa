import React, { useEffect, useState } from 'react';
import { Shield, BadgeCheck, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NameWithBadgesProps {
  username: string;
  className?: string;
}

const NameWithBadges: React.FC<NameWithBadgesProps> = ({ username, className }) => {
  const [roles, setRoles] = useState<{ staff: boolean; verified: boolean; bot: boolean } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRoles = async () => {
      try {
        const { data } = await supabase
          .from('user_badges')
          .select('staff, verified, bot')
          .eq('user_name', username)
          .maybeSingle();
        if (!isMounted) return;
        setRoles({
          staff: !!data?.staff,
          verified: !!data?.verified,
          bot: !!data?.bot,
        });
      } catch (e) {
        // ignore
      }
    };
    fetchRoles();
    return () => {
      isMounted = false;
    };
  }, [username]);

  return (
    <span className={`inline-flex items-center gap-1 ${className || ''}`}>
      <span>{username}</span>
      {roles?.staff && (
        <Shield className="w-3 h-3 text-primary" aria-label="Staff" />
      )}
      {roles?.verified && (
        <BadgeCheck className="w-3 h-3 text-primary" aria-label="Verified" />
      )}
      {roles?.bot && (
        <Bot className="w-3 h-3 text-primary" aria-label="Bot" />
      )}
    </span>
  );
};

export default NameWithBadges;
