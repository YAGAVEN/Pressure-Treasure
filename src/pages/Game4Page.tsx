import { useParams, useNavigate } from 'react-router-dom';
import { Game4Challenge } from '@/components/Game4Challenge';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import LevelAnimation from '@/components/LevelAnimation';

const Game4Page = () => {
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

    // Check if challenge is locked (challenge 4 requires challenge 3 to be completed)
    if (currentPlayer.currentChallenge < 4) {
      toast({
        title: "Challenge Locked",
        description: "Complete previous challenges first.",
        variant: "destructive",
      });
      navigate(`/game/${roomCode}`);
      return;
    }
  }, [room, currentPlayer, navigate, roomCode, toast]);

  const handleComplete = () => {
    completeChallenge(4); // Challenge 4
    toast({
      title: "Challenge Complete!",
      description: "You've completed the Maester's Trial!",
    });
    navigate(`/game/${roomCode}`);
  };

  const handleCancel = () => {
    navigate(`/game/${roomCode}`);
  };

  if (!room || !currentPlayer) {
    return null;
  }

  return (
    <Game4Challenge 
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
};

export default Game4Page;
