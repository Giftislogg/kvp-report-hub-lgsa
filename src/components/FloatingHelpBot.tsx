import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, X, ChevronRight, Home, MessageCircle, FileText, Settings, Users, Gamepad2 } from 'lucide-react';

interface FeatureGuide {
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
}

const FloatingHelpBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureGuide | null>(null);

  const features: FeatureGuide[] = [
    {
      title: "Home Page",
      description: "Navigate and discover community content",
      icon: <Home className="w-5 h-5" />,
      steps: [
        "View community announcements and updates",
        "Browse featured content and tutorials",
        "Access quick navigation to all features",
        "See community statistics and activity"
      ]
    },
    {
      title: "Chat Features",
      description: "Communicate with the community",
      icon: <MessageCircle className="w-5 h-5" />,
      steps: [
        "Public Chat: Join the main community discussion",
        "Private Chat: Send direct messages to other users",
        "Share images and voice messages (up to 30 seconds)",
        "Reply to messages and add reactions",
        "View message history and notifications"
      ]
    },
    {
      title: "Posts & Community",
      description: "Share and discover community content",
      icon: <Users className="w-5 h-5" />,
      steps: [
        "Create posts with text and images",
        "Like and interact with community posts",
        "Browse posts by category or popularity",
        "Follow other community members",
        "Share interesting content"
      ]
    },
    {
      title: "Reports & Support",
      description: "Get help and report issues",
      icon: <FileText className="w-5 h-5" />,
      steps: [
        "Submit reports for bugs, suggestions, or violations",
        "Attach screenshots to help explain issues",
        "Track the status of your reports",
        "Receive responses from administrators",
        "Access community guidelines and FAQ"
      ]
    },
    {
      title: "Games & Entertainment",
      description: "Access community games and activities",
      icon: <Gamepad2 className="w-5 h-5" />,
      steps: [
        "Access the Limitless Wheel game",
        "Participate in community challenges",
        "View tutorials for games and features",
        "Join scheduled community events",
        "Track your game progress and achievements"
      ]
    },
    {
      title: "Settings & Profile",
      description: "Customize your experience",
      icon: <Settings className="w-5 h-5" />,
      steps: [
        "Update your profile information",
        "Manage notification preferences",
        "Customize privacy settings",
        "View your activity history",
        "Log out or switch accounts"
      ]
    }
  ];

  const handleFeatureClick = (feature: FeatureGuide) => {
    setSelectedFeature(feature);
  };

  const handleBack = () => {
    setSelectedFeature(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFeature(null);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 rounded-full h-14 w-auto px-4 bg-primary hover:bg-primary/90 shadow-lg z-40"
      >
        <HelpCircle className="w-5 h-5 mr-2" />
        LGSA Bot - Need Help?
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 w-80 max-h-96 z-40 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">LGSA Help Bot</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {selectedFeature && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="self-start p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to features
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="max-h-64 overflow-y-auto">
        {!selectedFeature ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Welcome! Select a feature below to learn more about it:
            </p>
            {features.map((feature, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between h-auto p-3"
                onClick={() => handleFeatureClick(feature)}
              >
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <div className="text-left">
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedFeature.icon}
              <div>
                <h3 className="font-semibold">{selectedFeature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedFeature.description}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">
                How to use:
              </Badge>
              <ul className="space-y-2 text-sm">
                {selectedFeature.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FloatingHelpBot;