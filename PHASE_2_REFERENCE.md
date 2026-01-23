# Quick Reference: Phase 2 Implementation Details

## Files Modified/Created

### New Service Files

#### `src/lib/roomService.ts` (191 lines)

**Purpose**: Database operations for rooms with Supabase

- `createRoomInDB()` - Save room to DB
- `getAdminRooms()` - Fetch admin's rooms
- `getRoomByCode()` - Find room by code
- `deleteRoomFromDB()` - Remove room
- `updateRoomStatus()` - Update room state
- `subscribeToRoomChanges()` - Realtime updates

#### `src/lib/playerService.ts` (146 lines)

**Purpose**: Database operations for players with Supabase

- `addPlayerToRoom()` - Add player to room
- `getPlayersInRoom()` - List players
- `removePlayerFromRoom()` - Remove player
- `updatePlayerProgress()` - Track progress
- `subscribeToRoomPlayers()` - Realtime updates

### Modified Files

#### `src/contexts/GameContext.tsx`

**Changes**:

- Added imports for roomService and playerService
- Updated `createRoom()` to save to Supabase
- Updated `deleteRoom()` to delete from Supabase
- Added `useEffect` to load rooms from Supabase on admin login
- Maintains localStorage as fallback

#### `src/pages/AdminDashboard.tsx`

**Changes**:

- Updated `handleLogout` to be async

### Documentation Created

#### `DATABASE_SCHEMA.md`

SQL scripts for all tables + setup instructions

#### `SETUP_GUIDE.md`

Complete project setup and architecture guide

#### `PHASE_3_GUIDE.md`

Detailed Phase 3 implementation plan

#### `PHASE_1_2_SUMMARY.md`

Completion summary with next steps

## Key Code Snippets

### Load Rooms from Supabase

```typescript
// In GameContext useEffect
useEffect(() => {
  if (admin?.id) {
    roomService
      .getAdminRooms(admin.id)
      .then((dbRooms) => {
        if (dbRooms.length > 0) {
          setRooms(dbRooms);
        }
      })
      .catch((err) => {
        console.error("Failed to load rooms from Supabase:", err);
      });
  }
}, [admin?.id]);
```

### Create Room with Supabase

```typescript
const createRoom = useCallback(
  (
    name: string,
    description: string,
    houseTheme: HouseTheme,
    timerDuration: number,
  ): Room => {
    // Create local room
    const room: Room = {
      id: generateId(),
      code: generateRoomCode(),
      name,
      description,
      houseTheme,
      timerDuration,
      timerRemaining: timerDuration,
      status: "waiting",
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
      winnerId: null,
      adminId: admin?.id || "",
    };

    setRooms((prev) => [...prev, room]);

    // Save to Supabase
    if (admin?.id) {
      roomService
        .createRoomInDB(admin.id, name, description, houseTheme, timerDuration)
        .catch((err) => console.error("Failed to save:", err));
    }

    return room;
  },
  [admin],
);
```

### Subscribe to Room Changes (Realtime)

```typescript
import { subscribeToRoomChanges } from "@/lib/roomService";

// Usage in component
useEffect(() => {
  if (roomId) {
    const subscription = subscribeToRoomChanges(roomId, (room) => {
      if (room) {
        // Update UI with new room data
        setRoom(room);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}, [roomId]);
```

### Realtime Player List

```typescript
import { subscribeToRoomPlayers } from "@/lib/playerService";

useEffect(() => {
  if (room?.id) {
    const subscription = subscribeToRoomPlayers(room.id, (players) => {
      // Update players with room code
      const withCodes = players.map((p) => ({
        ...p,
        roomCode: room.code,
      }));
      setPlayers(withCodes);
    });

    return () => subscription.unsubscribe();
  }
}, [room?.id]);
```

## Data Flow Diagram

### Room Creation Flow

```
Admin clicks "Create Room"
    ↓
Form validation
    ↓
createRoom() called
    ↓
├→ Create local Room object
├→ setRooms() updates state
└→ roomService.createRoomInDB()
    ├→ generateRoomCode()
    ├→ INSERT to Supabase
    └→ Return Room with DB id

Admin sees room in list (from localStorage)
Supabase saves in background
```

### Room Load Flow

```
Admin logs in
    ↓
setAdmin() called
    ↓
useEffect triggered (admin?.id dependency)
    ↓
roomService.getAdminRooms(admin.id)
    ↓
Supabase query: SELECT * FROM rooms WHERE admin_id = ?
    ↓
setRooms() with DB rooms
    ↓
UI updates with all admin's rooms
```

### Real-time Update Flow

```
Another client updates room status
    ↓
Supabase Realtime detects change
    ↓
Broadcast to subscribed channels
    ↓
subscribeToRoomChanges() callback fires
    ↓
Local state updates
    ↓
UI re-renders (live update)
```

## Testing Checklist

### Room Creation

- [ ] Create room with valid data
- [ ] Room code is 6 chars
- [ ] Room appears in admin list
- [ ] Can copy room code to clipboard
- [ ] Room status is "waiting"

### Room Deletion

- [ ] Delete room removes from UI immediately
- [ ] Players in room cannot rejoin
- [ ] Associated players deleted from DB

### Room Listing

- [ ] Admin sees all their rooms
- [ ] Rooms sorted by creation date
- [ ] Room details show correctly
- [ ] Multiple admins see only their rooms

### Status Updates

- [ ] Room status changes: waiting → playing → finished
- [ ] Timer displays correctly
- [ ] Player count shows accurately
- [ ] Winner displays when game finished

### Realtime (If Supabase set up)

- [ ] Open 2 browser windows
- [ ] Create room in window 1
- [ ] Window 2 sees new room without refresh
- [ ] Change room name in Supabase console
- [ ] Window 1 & 2 update automatically

## Environment Variables

Required in `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Deployment Readiness

### Pre-Production Checklist

- [ ] Supabase project created
- [ ] Database tables created (SQL scripts run)
- [ ] RLS policies configured
- [ ] Realtime enabled for tables
- [ ] Authentication providers set up
- [ ] Environment variables configured
- [ ] Error handling tested
- [ ] Fallback to localStorage works
- [ ] Connection errors handled gracefully

## Troubleshooting

### Room Not Saving to Supabase

```typescript
// Check:
1. Supabase URL is correct
2. Anon key is correct
3. admin.id is available
4. Network tab shows POST to Supabase
5. admin_profiles table exists
6. RLS policies allow admin to insert
```

### Players Not Real-time

```typescript
// Check:
1. Realtime enabled in Supabase Console
2. players table has realtime enabled
3. Subscription created with correct roomId
4. No unsubscribe called prematurely
```

### Type Errors

```typescript
// Ensure:
1. Room type matches Supabase schema
2. Player type includes roomCode
3. Admin type has id, email, displayName
4. All service functions properly typed
```

## Performance Optimization

### Current Implementation

- ✅ Rooms loaded once on admin login
- ✅ Realtime subscriptions on active pages only
- ✅ localStorage fallback for offline
- ✅ Debounced updates (implicit via state batching)

### Future Optimizations

- [ ] Implement SWR for auto-revalidation
- [ ] Pagination for large room lists
- [ ] Caching strategy for frequently accessed rooms
- [ ] Connection pooling for Supabase
- [ ] Rate limiting on client side

## Code Quality

### Error Handling

- ✅ Try-catch in all async functions
- ✅ Fallback to localStorage
- ✅ User-friendly error messages
- ✅ Console logging for debugging

### Type Safety

- ✅ Full TypeScript types
- ✅ No `any` types in services
- ✅ Type-safe Supabase queries
- ✅ Enum for room status

### Best Practices

- ✅ Service layer abstraction
- ✅ Context for state management
- ✅ Callback hooks for optimization
- ✅ Cleanup functions for subscriptions
