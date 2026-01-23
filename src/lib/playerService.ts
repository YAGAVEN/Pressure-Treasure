import { supabase } from './supabase';
import { Player } from '@/types/game';

/**
 * Add a player to a room
 */
export async function addPlayerToRoom(
  roomId: string,
  username: string
): Promise<Player | null> {
  try {
    console.log('[PLAYERSERVICE] Adding player to room:', { roomId, username });
    const { data, error } = await supabase
      .from('players')
      .insert({
        room_id: roomId,
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
      roomCode: '', // Will be populated from room context
      progress: data.progress,
      currentChallenge: data.current_challenge,
      completedChallenges: data.completed_challenges || [],
      joinedAt: new Date(data.joined_at).getTime(),
      isOnline: data.is_online,
    };
  } catch (err) {
    console.error('[PLAYERSERVICE] Unexpected error adding player:', err);
    return null;
  }
}

/**
 * Get all players in a room
 */
export async function getPlayersInRoom(roomId: string): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select()
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }

    return (data || []).map(player => ({
      id: player.id,
      username: player.username,
      roomCode: '', // Will be populated from room context
      progress: player.progress,
      currentChallenge: player.current_challenge,
      completedChallenges: player.completed_challenges || [],
      joinedAt: new Date(player.joined_at).getTime(),
      isOnline: player.is_online,
    }));
  } catch (err) {
    console.error('Unexpected error fetching players:', err);
    return [];
  }
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
export async function updatePlayerProgress(
  playerId: string,
  completedChallenges: number[],
  progress: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .update({
        completed_challenges: completedChallenges,
        progress,
        current_challenge: Math.min(completedChallenges.length + 1, 5),
      })
      .eq('id', playerId);

    if (error) {
      console.error('Error updating player progress:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating player progress:', err);
    return false;
  }
}

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
      (payload) => {
        console.log('[PLAYERSERVICE] Change detected:', payload);
        // Re-fetch players when any change occurs
        getPlayersInRoom(roomId).then((players) => {
          console.log('[PLAYERSERVICE] Fetched updated players:', players);
          callback(players);
        });
      }
    )
    .subscribe((status) => {
      console.log('[PLAYERSERVICE] Subscription status:', status);
    });

  return subscription;
}
