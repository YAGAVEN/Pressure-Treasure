# Database Schema for Treasure Hunt Game

## Tables

### admin_profiles

Stores admin user information

```sql
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### rooms

Stores game room configurations and state

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  house_theme TEXT NOT NULL,
  timer_duration INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX rooms_admin_id ON rooms(admin_id);
CREATE INDEX rooms_code ON rooms(code);
CREATE INDEX rooms_status ON rooms(status);
```

### players

Stores player information and progress

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  current_challenge INTEGER DEFAULT 1,
  completed_challenges INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX players_room_id ON players(room_id);
```

### game_sessions

Stores active game session metadata

```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
  is_timer_running BOOLEAN DEFAULT false,
  timer_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX game_sessions_room_id ON game_sessions(room_id);
```

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Copy the Project URL and Anon Key
3. Add them to your `.env` file:
   ```
   VITE_SUPABASE_URL=<your_project_url>
   VITE_SUPABASE_ANON_KEY=<your_anon_key>
   ```
4. In Supabase Console:
   - Go to SQL Editor and run all table creation scripts above
   - Enable Email authentication (Authentication → Providers)
   - Enable Realtime for tables: rooms, players, game_sessions
   - Configure Row Level Security policies as documented
