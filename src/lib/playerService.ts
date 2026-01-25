import { supabase } from './supabase';
import { Player } from '@/types/game';
import { calculateProgress } from './gameUtils';

/**
 * Add a player to a room
 */
export async function addPlayerToRoom(
  roomId: string,
  username: string,
  roomCode: string
): Promise<Player | null> {
  try {
    console.log('[PLAYERSERVICE] Adding player to room:', { roomCode, username });
    const { data, error } = await supabase
      .from('players')
      .insert({
        room_code: roomCode, // Only use room_code
        username,
        progress: 0,
        current_challenge: 1,
        completed_challenges: [],
        is_online: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[PLAYERSERVICE] Error adding player:', error);
      return null;
    }

    if (!data) {
      console.error('[PLAYERSERVICE] No data returned after adding player');
      return null;
    }

    console.log('[PLAYERSERVICE] Player added successfully:', data);

    return {
      id: data.id,
      username: data.username,
      roomCode: data.room_code || '',
      progress: data.progress,
      currentChallenge: data.current_challenge,
      completedChallenges: Array.isArray(data.completed_challenges) 
        ? data.completed_challenges.map((c: any) => typeof c === 'string' ? parseInt(c) : c)
        : [],
      joinedAt: new Date(data.joined_at).getTime(),
      isOnline: data.is_online,
      completedAt: data.completed_at ? new Date(data.completed_at).getTime() : null,
      progressUpdatedAt: data.progress_updated_at ? new Date(data.progress_updated_at).getTime() : Date.now(),
    };
  } catch (err) {
    console.error('[PLAYERSERVICE] Unexpected error adding player:', err);
    return null;
  }
}

/**
 * Get all players in a room
 */
// getPlayersInRoom - FIXED room_id vs room_code & parsing
export async function getPlayersInRoom(roomCode: string): Promise<Player[]> {  // Use roomCode!
  const { data, error } = await supabase
    .from('players')
    .select()
    .eq('room_code', roomCode)  // ← FIXED: was room_id!
    .order('joined_at', { ascending: true });

  return (data || []).map(player => ({
    id: player.id,
    username: player.username,
    roomCode: roomCode,
    progress: player.progress,
    currentChallenge: player.current_challenge,
    completedChallenges: Array.isArray(player.completed_challenges) 
      ? player.completed_challenges.map((c: string | number) => Number(c))
      : [],
    joinedAt: new Date(player.joined_at).getTime(),
    isOnline: player.is_online !== false,
    completedAt: player.completed_at ? new Date(player.completed_at).getTime() : null,
    progressUpdatedAt: player.progress_updated_at ? new Date(player.progress_updated_at).getTime() : Date.now(),
  }));
}

// updatePlayerProgress - Only set completed_at on 100%
export async function updatePlayerProgress(playerId: string, completedChallenges: number[]): Promise<boolean> {
  const progress = calculateProgress(completedChallenges);
  const completedAt = progress === 100 ? new Date().toISOString() : null;
  const progressUpdatedAt = new Date().toISOString(); // Always update when progress changes

  console.log('[PLAYERSERVICE] 💾 Updating player progress:', {
    playerId,
    completedChallenges,
    progress,
    completedAt,
    progressUpdatedAt
  });

  const { error } = await supabase.from('players').update({
    completed_challenges: completedChallenges,  // PostgreSQL JSONB handles arrays directly
    progress,
    current_challenge: Math.min(completedChallenges.length + 1, 6),
    completed_at: completedAt,
    progress_updated_at: progressUpdatedAt  // Track when progress was updated
  }).eq('id', playerId);

  if (error) {
    console.error('[PLAYERSERVICE] ❌ Error updating progress:', error);
  }

  return !error;
}


/**
 * Remove a player from a room
 */
export async function removePlayerFromRoom(playerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error('Error removing player:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error removing player:', err);
    return false;
  }
}

/**
 * Update player progress
 */

/**
 * Update player online status
 */
export async function updatePlayerOnlineStatus(
  playerId: string,
  isOnline: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .update({ is_online: isOnline })
      .eq('id', playerId);

    if (error) {
      console.error('Error updating player status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating player status:', err);
    return false;
  }
}

/**
 * Get online players count in a room
 */
export async function getOnlinePlayersCount(roomId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('id', { count: 'exact' })
      .eq('room_id', roomId)
      .eq('is_online', true);

    if (error) {
      console.error('Error getting online players count:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (err) {
    console.error('Unexpected error getting online players count:', err);
    return 0;
  }
}

/**
 * Subscribe to player changes in a room (realtime)
 */
export function subscribeToRoomPlayers(
  roomId: string,
  callback: (players: Player[]) => void
) {
  console.log('[PLAYERSERVICE] Setting up subscription for room:', roomId);
  
  // Note: This function receives roomId but getPlayersInRoom expects roomCode
  // The subscription filter uses room_id, but we can't call getPlayersInRoom(roomId)
  // This needs to be handled by the caller passing the correct parameter
  const subscription = supabase
    .channel(`room-players-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        console.log('[PLAYERSERVICE] Change detected:', payload);
        // Fetch players directly using room_id since subscription uses it
        const { data, error } = await supabase
          .from('players')
          .select()
          .eq('room_id', roomId)
          .order('joined_at', { ascending: true });
        
        if (!error && data) {
          const players = data.map(player => ({
            id: player.id,
            username: player.username,
            roomCode: '', // Will be set by caller
            progress: player.progress,
            currentChallenge: player.current_challenge,
            completedChallenges: Array.isArray(player.completed_challenges) 
              ? player.completed_challenges.map((c: string | number) => Number(c))
              : [],
            joinedAt: new Date(player.joined_at).getTime(),
            isOnline: player.is_online !== false,
            completedAt: player.completed_at ? new Date(player.completed_at).getTime() : null,
            progressUpdatedAt: player.progress_updated_at ? new Date(player.progress_updated_at).getTime() : Date.now(),
          }));
          console.log('[PLAYERSERVICE] Fetched updated players:', players);
          callback(players);
        }
      }
    )
    .subscribe((status) => {
      console.log('[PLAYERSERVICE] Subscription status:', status);
    });

  return subscription;
}
