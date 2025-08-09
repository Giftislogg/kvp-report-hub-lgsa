import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AdminPanel from "@/components/AdminPanel";
import { supabase } from "@/integrations/supabase/client";

interface FloatingAdminButtonProps {
  username: string;
}

const FloatingAdminButton: React.FC<FloatingAdminButtonProps> = ({ username }) => {
  const [open, setOpen] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const checkStaff = async () => {
      if (!username) return setIsStaff(false);
      const { data } = await supabase
        .from("user_badges")
        .select("staff")
        .eq("user_name", username)
        .maybeSingle();
      setIsStaff(!!data?.staff);
    };
    checkStaff();
  }, [username]);

  if (!isStaff) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 shadow-lg"
      >
        <Shield className="w-4 h-4 mr-2" /> Admin
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Admin Panel</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-y-auto px-6 pb-6">
            <AdminPanel skipPassword />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingAdminButton;
