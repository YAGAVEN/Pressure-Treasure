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

    // All challenges unlocked - no lock checking
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

  return (
    <div className="min-h-screen relative">
      <LevelAnimation houseTheme={room.houseTheme} challengeId={5} />
      <div className="relative z-10">
        <Game5Challenge onComplete={handleComplete} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default Game5Page;
