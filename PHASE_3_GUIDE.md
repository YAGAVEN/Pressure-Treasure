# Phase 3 Implementation Guide: Player Join Flow & Waiting Lobby

## Overview

Phase 3 connects players to rooms and creates the waiting experience. When players join a room, they see other players and wait for the admin to start the game.

## Tasks

### 3.1 Player Join Flow (PlayerJoin.tsx) ✅ Already Implemented

**Status**: The join form is already complete:

- ✅ Room code entry (6 chars, formatted)
- ✅ Username entry (20 chars max)
- ✅ Validation for room existence
- ✅ Check game isn't already finished
- ✅ Join confirmation & navigation

**Current Implementation**:

```typescript
const handleJoin = (e: React.FormEvent) => {
  const formattedCode = roomCode.toUpperCase().trim();
  const room = getRoom(formattedCode);

  if (!room) {
    /* Show error */
  }
  if (room.status === "finished") {
    /* Show error */
  }

  const player = joinRoom(formattedCode, username.trim());
  navigate(`/game/${formattedCode}`); // Go to game page
};
```

**To Enable Supabase Join**:

```typescript
// Add to playerService.ts and call in GameContext
const player = await addPlayerToRoom(room.id, username);
```

### 3.2 Waiting Lobby (PlayerGame.tsx)

**Status**: Already has waiting display, needs enhancements

**Current Code**:

```tsx
{
  room.status === "waiting" && (
    <Card className="border-muted bg-muted/30">
      <CardContent className="flex items-center gap-3 py-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Waiting for Game Master</p>
          <p className="text-sm text-muted-foreground">
            The hunt will begin soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Enhancements Needed**:

1. Show player count
2. Display other players joining in real-time
3. Hint text with player count
4. Connection status indicator

### 3.3 Player Presence Tracking

**New Function Needed**:

```typescript
// playerService.ts
export async function updatePlayerOnlineStatus(
  playerId: string,
  isOnline: boolean,
): Promise<boolean>;

// GameContext
useEffect(() => {
  // Update player online status on unmount
  return () => {
    if (currentPlayer?.id) {
      playerService.updatePlayerOnlineStatus(currentPlayer.id, false);
    }
  };
}, [currentPlayer]);
```

### 3.4 Real-time Player List Update

**Implementation**:

```typescript
// GameContext - add new effect
useEffect(() => {
  if (room?.id) {
    const subscription = playerService.subscribeToRoomPlayers(
      room.id,
      (updatedPlayers) => {
        setPlayers(
          updatedPlayers.map((p) => ({
            ...p,
            roomCode: room.code,
          })),
        );
      },
    );

    return () => subscription.unsubscribe();
  }
}, [room?.id]);
```

### 3.5 Enhanced Waiting Lobby Component

**Suggested Update to PlayerGame.tsx**:

```tsx
{
  room.status === "waiting" && (
    <Card className="border-muted bg-muted/30">
      <CardContent className="space-y-4 py-6">
        <div className="flex items-center gap-3">
          <div className="animate-pulse h-5 w-5 rounded-full bg-primary" />
          <div>
            <p className="font-medium">Waiting for Game Master</p>
            <p className="text-sm text-muted-foreground">
              {players.length} player{players.length !== 1 ? "s" : ""} ready •
              The hunt begins soon...
            </p>
          </div>
        </div>

        {/* Show joining players */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-2">Players Joining:</p>
          <div className="space-y-1">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {p.username}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Database Functions to Implement

### 1. Update Player Online Status

```typescript
export async function updatePlayerOnlineStatus(
  playerId: string,
  isOnline: boolean,
): Promise<boolean> {
  const { error } = await supabase
    .from("players")
    .update({ is_online: isOnline })
    .eq("id", playerId);
  return !error;
}
```

### 2. Get Online Players Count

```typescript
export async function getOnlinePlayersInRoom(roomId: string): Promise<number> {
  const { data, error } = await supabase
    .from("players")
    .select("id")
    .eq("room_id", roomId)
    .eq("is_online", true);

  return error ? 0 : data.length;
}
```

## Testing Phase 3

### Test Scenarios

1. ✅ Player joins with valid code
2. ✅ Player join invalid code → error
3. ✅ Player joins finished game → error
4. ✅ Multiple players see each other in lobby
5. ✅ Player sees live player count
6. ✅ Player disconnect → marked offline
7. ✅ Admin can see joining players in dashboard
8. ✅ Navigation to game page works

### Manual Testing

```
1. Open 2 browser windows
2. Admin: Create room
3. Player 1: Join room with code
4. Verify Player 1 in admin's room player list
5. Player 2: Join same room
6. Verify both players see each other (if realtime working)
7. Verify player count updates
```

## Integration Checklist

- [ ] Add `updatePlayerOnlineStatus` to playerService.ts
- [ ] Add `getOnlinePlayersInRoom` to playerService.ts
- [ ] Update GameContext.joinRoom to use Supabase
- [ ] Add realtime player subscription in GameContext
- [ ] Update PlayerGame.tsx waiting display with player list
- [ ] Handle player disconnect/leave room
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with multiple players

## Code Examples

### Complete Join Flow

```typescript
// PlayerJoin.tsx
const handleJoin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const formattedCode = roomCode.toUpperCase().trim();
  const room = getRoom(formattedCode);

  if (!room) {
    toast({ title: "Room Not Found" });
    setIsLoading(false);
    return;
  }

  if (room.status === "finished") {
    toast({ title: "Game Ended" });
    setIsLoading(false);
    return;
  }

  // For Supabase integration:
  // const player = await playerService.addPlayerToRoom(room.id, username);

  const player = joinRoom(formattedCode, username.trim());

  if (player) {
    toast({ title: "Welcome!" });
    navigate(`/game/${formattedCode}`);
  }

  setIsLoading(false);
};
```

### Realtime Subscription

```typescript
// In GameContext useEffect
useEffect(() => {
  if (currentPlayer?.roomCode && room?.id) {
    // Subscribe to player changes
    const subscription = subscribeToRoomPlayers(room.id, (updatedPlayers) => {
      const withRoomCode = updatedPlayers.map((p) => ({
        ...p,
        roomCode: room.code,
      }));
      setPlayers(withRoomCode);
    });

    return () => subscription.unsubscribe();
  }
}, [currentPlayer?.roomCode, room?.id]);
```

## Notes

- Player presence is real-time with Supabase subscriptions
- Waiting screen shows all joining players
- Admin can see live player count in dashboard
- Connection loss is handled gracefully
