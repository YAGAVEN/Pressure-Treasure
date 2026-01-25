import { supabase } from './supabase';
import { Room, HouseTheme } from '@/types/game';
import { generateRoomCode } from './gameUtils';

/**
 * Create a new room in Supabase
 */
export async function createRoomInDB(
  adminId: string,
  name: string,
  description: string,
  houseTheme: HouseTheme,
  timerDuration: number,
  code?: string
): Promise<Room | null> {
  try {
    const roomCode = code || generateRoomCode();
    console.log('[ROOMSERVICE] Creating room with code:', roomCode);
    
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        admin_id: adminId,
        code: roomCode,
        name,
        description,
        house_theme: houseTheme,
        timer_duration: timerDuration,
        timer_remaining: timerDuration,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) {
      console.error('[ROOMSERVICE] Error creating room:', error);
      return null;
    }

    if (!data) {
      console.error('[ROOMSERVICE] No data returned after room creation');
      return null;
    }

    console.log('[ROOMSERVICE] Room created successfully:', data);

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      houseTheme: data.house_theme as HouseTheme,
      timerDuration: data.timer_duration,
      timerRemaining: data.timer_duration,
      status: data.status as 'waiting' | 'playing' | 'finished',
      createdAt: new Date(data.created_at).getTime(),
      startedAt: data.started_at ? new Date(data.started_at).getTime() : null,
      endedAt: data.ended_at ? new Date(data.ended_at).getTime() : null,
      winnerId: data.winner_id || null,
      winners: data.winners ? JSON.parse(data.winners) : [],
      adminId: data.admin_id,
    };
  } catch (err) {
    console.error('[ROOMSERVICE] Unexpected error creating room:', err);
    return null;
  }
}

/**
 * Get all rooms for an admin
 */
export async function getAdminRooms(adminId: string): Promise<Room[]> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select()
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin rooms:', error);
      return [];
    }

    return (data || []).map(room => ({
      id: room.id,
      code: room.code,
      name: room.name,
      description: room.description,
      houseTheme: room.house_theme as HouseTheme,
      timerDuration: room.timer_duration,
      timerRemaining: room.timer_remaining ?? room.timer_duration,
      status: room.status as 'waiting' | 'playing' | 'finished',
      createdAt: new Date(room.created_at).getTime(),
      startedAt: room.started_at ? new Date(room.started_at).getTime() : null,
      endedAt: room.ended_at ? new Date(room.ended_at).getTime() : null,
      winnerId: room.winner_id || null,
      winners: room.winners ? (typeof room.winners === 'string' ? JSON.parse(room.winners) : room.winners) : [],
      adminId: room.admin_id,
    }));
  } catch (err) {
    console.error('Unexpected error fetching admin rooms:', err);
    return [];
  }
}

/**
 * Get a room by code
 */
export async function getRoomByCode(code: string): Promise<Room | null> {
  try {
    console.log('[ROOMSERVICE] Fetching room with code:', code);
    const { data, error } = await supabase
      .from('rooms')
      .select()
      .eq('code', code);

    if (error) {
      console.error('[ROOMSERVICE] Error fetching room:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('[ROOMSERVICE] No room found with code:', code);
      return null;
    }

    const roomData = data[0];
    console.log('[ROOMSERVICE] Found room:', roomData);

    return {
      id: roomData.id,
      code: roomData.code,
      name: roomData.name,
      description: roomData.description,
      houseTheme: roomData.house_theme as HouseTheme,
      timerDuration: roomData.timer_duration,
      timerRemaining: roomData.timer_remaining ?? roomData.timer_duration,
      status: roomData.status as 'waiting' | 'playing' | 'finished',
      createdAt: new Date(roomData.created_at).getTime(),
      startedAt: roomData.started_at ? new Date(roomData.started_at).getTime() : null,
      endedAt: roomData.ended_at ? new Date(roomData.ended_at).getTime() : null,
      winnerId: roomData.winner_id || null,
      winners: roomData.winners ? (typeof roomData.winners === 'string' ? JSON.parse(roomData.winners) : roomData.winners) : [],
      adminId: roomData.admin_id,
    };
  } catch (err) {
    console.error('[ROOMSERVICE] Unexpected error fetching room by code:', err);
    return null;
  }
}

/**
 * Delete a room
 */
export async function deleteRoomFromDB(roomId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      console.error('Error deleting room:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting room:', err);
    return false;
  }
}

/**
 * Update room status
 */
export async function updateRoomStatus(
  roomCode: string,
  status: 'waiting' | 'playing' | 'finished',
  winnerId?: string | null,
  winners?: { playerId: string; rank: number; progress: number }[]
): Promise<boolean> {
  try {
    const updateData: any = { status };
    
    if (status === 'playing') {
      updateData.started_at = new Date().toISOString();
    }
    if (status === 'finished') {
      updateData.ended_at = new Date().toISOString();
      if (winnerId) {
        updateData.winner_id = winnerId;
      }
      if (winners && winners.length > 0) {
        updateData.winners = JSON.stringify(winners);
      }
    }

    console.log('[ROOMSERVICE] Updating room status:', { roomCode, status, updateData });

    const { error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('code', roomCode);

    if (error) {
      console.error('[ROOMSERVICE] Error updating room:', error);
      return false;
    }

    console.log('[ROOMSERVICE] ✅ Room status updated successfully');
    return true;
  } catch (err) {
    console.error('[ROOMSERVICE] Unexpected error updating room:', err);
    return false;
  }
}

/**
 * Update room timer (for countdown)
 */
export async function updateRoomTimer(roomCode: string, timerRemaining: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rooms')
      .update({ timer_remaining: timerRemaining })
      .eq('code', roomCode);

    if (error) {
      console.error('[ROOMSERVICE] Error updating room timer:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[ROOMSERVICE] Unexpected error updating room timer:', err);
    return false;
  }
}

/**
 * Subscribe to room changes (realtime)
 */
export function subscribeToRoomChanges(
  roomId: string,
  callback: (room: Room | null) => void
) {
  const subscription = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.new) {
          const room = payload.new as any;
          console.log('[ROOMSERVICE] Room update received:', room);
          callback({
            id: room.id,
            code: room.code,
            name: room.name,
            description: room.description,
            houseTheme: room.house_theme as HouseTheme,
            timerDuration: room.timer_duration,
            timerRemaining: room.timer_remaining || room.timer_duration,
            status: room.status as 'waiting' | 'playing' | 'finished',
            createdAt: new Date(room.created_at).getTime(),
            startedAt: room.started_at ? new Date(room.started_at).getTime() : null,
            endedAt: room.ended_at ? new Date(room.ended_at).getTime() : null,
            winnerId: room.winner_id || null,
            winners: room.winners ? (typeof room.winners === 'string' ? JSON.parse(room.winners) : room.winners) : [],
            adminId: room.admin_id,
          });
        } else {
          callback(null);
        }
      }
    )
    .subscribe();

  return subscription;
}
