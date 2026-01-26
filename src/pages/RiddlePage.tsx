import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiddleChallenge } from '@/components/RiddleChallenge';
import { DoorClosingAnimation } from '@/components/DoorClosingAnimation';
import { DoorOpeningAnimation } from '@/components/DoorOpeningAnimation';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, Crown } from 'lucide-react';
import { HOUSE_NAMES } from '@/types/game';
import './RiddlePage.css';

const RiddlePage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { getRoom, completeChallenge } = useGame();
  const [showDoorAnimation, setShowDoorAnimation] = useState(true);
  const [showDoorOpenAnimation, setShowDoorOpenAnimation] = useState(false);
  
  const room = roomCode ? getRoom(roomCode) : undefined;

  if (!room) {
    navigate('/join');
    return null;
  }

  const handleComplete = () => {
    // Show door opening animation
    setShowDoorOpenAnimation(true);
    
    // Complete challenge #2
    completeChallenge(2);
    
    // Navigate back to the game after animation completes
    // 2 seconds delay + 5 seconds animation + 2 seconds move further
    setTimeout(() => {
      navigate(`/game/${roomCode}`);
    }, 9000);
  };

  const handleBack = () => {
    navigate(`/game/${roomCode}`);
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-fixed bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: 'url(/winterfell-bg.jpg)',
      }}
    >
      {/* Enhanced Color Grading Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[2] bg-gradient-to-b from-blue-900/20 via-slate-900/30 to-blue-950/40" />
      
      {/* Door Opening Animation on Complete */}
      {showDoorOpenAnimation && (
        <DoorOpeningAnimation onAnimationComplete={() => setShowDoorOpenAnimation(false)} />
      )}

      {/* Door Closing Animation on First Load */}
      {showDoorAnimation && (
        <DoorClosingAnimation onAnimationComplete={() => setShowDoorAnimation(false)} />
      )}

      {/* Animated Snowfall Overlay */}
      <div className="snowfall">
        {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} className="snowflake" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${12 + Math.random() * 6}s`,
            opacity: Math.random() * 0.5 + 0.4,
          }}>
            ❄
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-blue-400/20 bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-md shadow-lg shadow-blue-500/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400/40">
              <Crown className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-cinzel font-semibold text-white">{room.name}</p>
              <p className="text-xs text-blue-300">{HOUSE_NAMES[room.houseTheme]}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Page Layout */}
      <main className="flex-1 w-full px-4 py-8 flex items-center justify-center relative z-10">
        <div className="w-full max-w-4xl space-y-8">
          {/* Page Title Card */}
          <div className="rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70 backdrop-blur-xl p-8 shadow-2xl shadow-cyan-500/30">
            <h1 className="font-cinzel text-2xl font-bold text-center text-white drop-shadow-lg mb-2">
              Challenge #2: Riddle of the Maester
            </h1>
            <p className="text-center text-cyan-200 text-sm">
              Solve the cryptic riddles passed down through generations of the Citadel's wisest scholars.
            </p>
          </div>

          {/* Riddle Challenge Component */}
          <RiddleChallenge 
            onComplete={handleComplete}
            disabled={room.status !== 'playing'}
          />

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200"
            >
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
