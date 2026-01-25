import { Player } from '@/types/game';

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

export function getLeaderboard(players: { id: string; username: string; progress: number; completedChallenges: number[]; joinedAt: number; completedAt?: number | null; progressUpdatedAt?: number | null }[]): typeof players {
  return [...players].sort((a, b) => {
    const aProgress = calculateProgress(a.completedChallenges);
    const bProgress = calculateProgress(b.completedChallenges);
    
    console.log('[LEADERBOARD] Comparing:', {
      a: { username: (a as any).username, progress: aProgress, completedAt: a.completedAt, progressUpdatedAt: a.progressUpdatedAt },
      b: { username: (b as any).username, progress: bProgress, completedAt: b.completedAt, progressUpdatedAt: b.progressUpdatedAt }
    });
    
    if (aProgress === 100 && bProgress === 100) {
      // Both completed: use completedAt (who finished first)
      if (a.completedAt && b.completedAt) {
        console.log('[LEADERBOARD] Both have completedAt, sorting by completion time');
        return a.completedAt - b.completedAt; // Earlier time wins
      }
      if (a.completedAt) return -1;
      if (b.completedAt) return 1;
      console.warn('[LEADERBOARD] Both 100% but no completedAt - using progressUpdatedAt');
      return (a.progressUpdatedAt || a.joinedAt) - (b.progressUpdatedAt || b.joinedAt);
    }
    
    // Different progress: higher is better
    if (bProgress !== aProgress) {
      return bProgress - aProgress;
    }
    
    // Same progress (not 100%): who reached this level first wins
    const aTime = a.progressUpdatedAt || a.joinedAt;
    const bTime = b.progressUpdatedAt || b.joinedAt;
    console.log('[LEADERBOARD] Same progress, sorting by progressUpdatedAt:', { aTime, bTime });
    return aTime - bTime;
  });
}


export function calculateTopWinners(players: Player[]): { playerId: string; rank: number; progress: number }[] {
  if (players.length === 0) return [];

  const enriched = players.map(p => ({
    ...p,
    calcProgress: calculateProgress(p.completedChallenges),
    // For 100%: use completedAt. For others: use progressUpdatedAt (when they reached current level)
    sortTime: p.calcProgress === 100 
      ? (p.completedAt ?? p.progressUpdatedAt ?? p.joinedAt ?? Infinity)
      : (p.progressUpdatedAt ?? p.joinedAt ?? Infinity)
  })).sort((a, b) => {
    // 1st: First to 100% (by completedAt)
    if (a.calcProgress === 100 && b.calcProgress === 100) {
      return a.sortTime - b.sortTime;
    }
    if (a.calcProgress === 100) return -1;
    if (b.calcProgress === 100) return 1;
    
    // 2nd/3rd: Highest progress, ties broken by progressUpdatedAt (who reached it first)
    if (b.calcProgress !== a.calcProgress) return b.calcProgress - a.calcProgress;
    return a.sortTime - b.sortTime;
  });

  return enriched.slice(0, 3).map((p, i) => ({
    playerId: p.id,
    rank: i + 1,
    progress: p.calcProgress
  }));
}

