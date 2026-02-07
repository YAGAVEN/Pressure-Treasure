import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import LevelAnimation from '@/components/LevelAnimation';
import { Game5Challenge } from '@/components/Game5Challenge';

const Game5Page = () => {
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

    if (room.status !== 'playing') {
      toast({
        title: "Game Not Active",
        description: "The game must be active to play this challenge.",
        variant: "destructive",
      });
      navigate(`/game/${roomCode}`);
      return;
    }

    // All challenges are now unlocked for dev/testing purposes
  }, [room, currentPlayer, navigate, roomCode, toast]);

  const handleComplete = () => {
    completeChallenge(5);
    toast({
      title: "Challenge Complete!",
      description: "You've claimed the Iron Throne and completed the hunt!",
    });
    // Navigate to winner page after completing final challenge
    navigate(`/winner/${roomCode}`);
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
    <div className="relative min-h-screen">
      <LevelAnimation houseTheme={room.houseTheme} challengeId={5} />
      <div className="relative z-10">
        <Game5Challenge onComplete={handleComplete} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default Game5Page;
