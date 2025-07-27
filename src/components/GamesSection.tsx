import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gamepad2, ExternalLink } from "lucide-react";

const GamesSection: React.FC = () => {
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Games Hub</h1>
        <p className="text-muted-foreground text-center">
          Enjoy exciting games and win amazing prizes!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Limitless Wheel Game */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Limitless Wheel</CardTitle>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Spin the wheel of fortune and win exciting prizes! Test your luck with our premium wheel game.
            </p>
            <Dialog open={isWheelOpen} onOpenChange={setIsWheelOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Play Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Limitless Wheel
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      NEW
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1">
                  <div className="embed-container">
                    <iframe 
                      src="https://samp-lotto-dreams.lovable.app/"
                      title="Limitless Wheel Game"
                      className="w-full h-full border-none"
                      style={{
                        width: '100%',
                        height: '620px',
                        border: '3px solid #444',
                        borderRadius: '10px',
                        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                      }}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Placeholder for future games */}
        <Card className="hover:shadow-lg transition-shadow opacity-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg text-muted-foreground">Coming Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              More exciting games are coming soon! Stay tuned for updates.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <ExternalLink className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow opacity-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg text-muted-foreground">Coming Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              More exciting games are coming soon! Stay tuned for updates.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <ExternalLink className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GamesSection;