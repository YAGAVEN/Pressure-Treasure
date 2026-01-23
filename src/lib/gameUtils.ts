export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateProgress(completedChallenges: number[], totalChallenges: number = 5): number {
  return Math.round((completedChallenges.length / totalChallenges) * 100);
}

export function getLeaderboard(players: { id: string; username: string; progress: number; completedChallenges: number[]; joinedAt: number }[]): typeof players {
  return [...players].sort((a, b) => {
    // First sort by progress
    if (b.progress !== a.progress) {
      return b.progress - a.progress;
    }
    // If tied, sort by who completed their latest challenge first (earlier joinedAt wins as proxy)
    return a.joinedAt - b.joinedAt;
  });
}
