import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiddleChallenge } from '@/components/RiddleChallenge';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, Crown } from 'lucide-react';
import { HOUSE_NAMES } from '@/types/game';

const RiddlePage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { getRoom, completeChallenge } = useGame();
  
  const room = roomCode ? getRoom(roomCode) : undefined;

  if (!room) {
    navigate('/join');
    return null;
  }

  const handleComplete = () => {
    // Complete challenge #2
    completeChallenge(2);
    
    // Navigate back to the game
    navigate(`/game/${roomCode}`);
  };

  const handleBack = () => {
    navigate(`/game/${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-medieval-pattern">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-cinzel font-semibold">{room.name}</p>
              <p className="text-xs text-muted-foreground">{HOUSE_NAMES[room.houseTheme]}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Page Title */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="font-cinzel text-2xl text-center">
                Challenge #2: Riddle of the Maester
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Solve the cryptic riddles passed down through generations of the Citadel's wisest scholars.
              </p>
            </CardContent>
          </Card>

          {/* Riddle Challenge Component */}
          <RiddleChallenge 
            onComplete={handleComplete}
            disabled={room.status !== 'playing'}
          />

          {/* Back Button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hunt
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiddlePage;
