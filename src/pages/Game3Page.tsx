import { useParams, useNavigate } from 'react-router-dom';
import Game3 from '@/components/Game3';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import LevelAnimation from '@/components/LevelAnimation';

const Game3Page = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { currentPlayer, completeChallenge, getRoom } = useGame();
  const { toast } = useToast();
  const room = roomCode ? getRoom(roomCode) : undefined;

  useEffect(() => {
    if (!room || !currentPlayer) {
      navigate('/join');
      return;
    }

    // Check if game is playing
    if (room.status !== 'playing') {
      toast({
        title: "Game Not Active",
        description: "The game must be active to play this challenge.",
        variant: "destructive",
      });
      navigate(`/game/${roomCode}`);
      return;
    }

    // Check if challenge is locked (challenge 3 requires challenge 2 to be completed)
    if (currentPlayer.currentChallenge < 3) {
      toast({
        title: "Challenge Locked",
        description: "Complete previous challenges first.",
        variant: "destructive",
      });
      navigate(`/game/${roomCode}`);
    }
  }, [room, currentPlayer, navigate, roomCode, toast]);

  const handleComplete = () => {
    completeChallenge(3); // Challenge 3
    toast({
      title: "Challenge Complete!",
      description: "You've conquered The Iron Path!",
    });
    navigate(`/game/${roomCode}`);
  };

  const handleCancel = () => {
    navigate(`/game/${roomCode}`);
  };

  if (!room || !currentPlayer) {
    return null;
  }

  // Lock the screen in fullscreen while the game is playing (best-effort).
  useEffect(() => {
    if (!room || !currentPlayer) return;

    let active = true;
    let attempts = 0;
    const maxAttempts = 8;
    const retryDelay = 500;
    const elem = document.documentElement;

    const tryEnterFullscreen = async () => {
      if (!active || room.status !== 'playing') return;
      try {
        if (document.fullscreenElement) return;
        attempts++;
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if ((elem as any).mozRequestFullScreen) await (elem as any).mozRequestFullScreen();
        else if ((elem as any).webkitRequestFullscreen) await (elem as any).webkitRequestFullscreen();
        else if ((elem as any).msRequestFullscreen) await (elem as any).msRequestFullscreen();
      } catch (err) {
        if (attempts < maxAttempts) setTimeout(tryEnterFullscreen, retryDelay);
        else {
          // Let the page show an overlay/button if user gesture is required
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!active) return;
      const isFull = !!document.fullscreenElement;
      if (!isFull && room.status === 'playing') {
        setTimeout(tryEnterFullscreen, 200);
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && room.status === 'playing') {
        e.preventDefault();
        e.stopPropagation();
        tryEnterFullscreen();
      }
    };

    const visibilityHandler = () => {
      if (document.visibilityState === 'visible' && room.status === 'playing') {
        tryEnterFullscreen();
      }
    };

    tryEnterFullscreen();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', keyHandler, true);
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      active = false;
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', keyHandler, true);
      document.removeEventListener('visibilitychange', visibilityHandler);
      if (document.fullscreenElement) {
        const exitFS = async () => {
          try {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if ((document as any).mozCancelFullScreen) await (document as any).mozCancelFullScreen();
            else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
            else if ((document as any).msExitFullscreen) await (document as any).msExitFullscreen();
          } catch (err) {}
        };
        exitFS();
      }
    };
  }, [room, currentPlayer, toast]);

  return (
    <div className="min-h-screen relative">
      {/* Background Animation */}
      <LevelAnimation 
        houseTheme={room.houseTheme}
        challengeId={3}
      />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Game3 onComplete={handleComplete} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default Game3Page;
