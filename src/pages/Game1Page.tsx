import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Game1Challenge } from '@/components/Game1Challenge';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';

const Game1Page = () => {
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
        title: 'Game Not Active',
        description: 'The game must be active to play this challenge.',
        variant: 'destructive',
      });
      navigate(`/game/${roomCode}`);      return;
    }

    // Check if challenge is locked
    if (currentPlayer.currentChallenge > 1 || currentPlayer.completedChallenges.includes(1)) {
      // Challenge already completed or player moved past it
      if (!currentPlayer.completedChallenges.includes(1) && currentPlayer.currentChallenge !== 1) {
        toast({
          title: "Challenge Locked",
          description: "Complete previous challenges first.",
          variant: "destructive",
        });
        navigate(`/game/${roomCode}`);
      }
    }
  }, [room, currentPlayer, navigate, roomCode, toast]);

  const handleComplete = () => {
    completeChallenge(1);
    toast({
      title: 'Challenge Complete!',
      description: "You've completed the Trial of the First Men.",
    });
    navigate(`/game/${roomCode}`);
  };

  const handleCancel = () => {
    navigate(`/game/${roomCode}`);
  };

  if (!room || !currentPlayer) {
    return null;
  }

  return <Game1Challenge onComplete={handleComplete} onCancel={handleCancel} />;
};

export default Game1Page;
