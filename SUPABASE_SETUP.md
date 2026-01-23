# Supabase Configuration Guide

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New project"
4. Fill in:
   - **Name**: `treasure-hunt` (or your preference)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your location
5. Click "Create new project" and wait (~3 minutes)

### 2. Get Connection Credentials

1. Once project is ready, go to **Settings → API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **Anon Public Key** (under "Project API keys")
3. Save them for Step 3

### 3. Configure Environment

1. In your project root, create `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Verify the file exists and values are correct:

```bash
cat .env.local
```

### 4. Create Database Tables

1. In Supabase Console, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL (from DATABASE_SCHEMA.md):

```sql
-- Admin Profiles Table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
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

-- Players Table
CREATE TABLE IF NOT EXISTS players (
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

-- Game Sessions Table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
  is_timer_running BOOLEAN DEFAULT false,
  timer_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX game_sessions_room_id ON game_sessions(room_id);
```

4. Click **Run** and wait for completion
5. In left sidebar, refresh **Tables** to see new tables

### 5. Enable Realtime

1. Go to **Realtime** in left sidebar
2. Under "Replication", enable for these tables:
   - `rooms` ✓
   - `players` ✓
   - `game_sessions` ✓

Click the toggle to enable each one.

### 6. Set Up Authentication

1. Go to **Authentication → Providers**
2. Find "Email"
3. Make sure it shows "Enabled"
4. Go to **Authentication → Policies**
5. Under Email:
   - **Confirm email**: OFF (for development)
   - **Double confirm changes**: OFF

### 7. Configure Row Level Security (RLS)

1. Go to **Authentication → Policies**
2. For each table, enable RLS:

#### Admin Profiles Table

```sql
-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON admin_profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON admin_profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

#### Rooms Table

```sql
-- Policy: Anyone can read rooms
CREATE POLICY "Anyone can read rooms"
ON rooms FOR SELECT
USING (true);

-- Policy: Only admin can update their rooms
CREATE POLICY "Admin can update own rooms"
ON rooms FOR UPDATE
USING (auth.uid() = admin_id)
WITH CHECK (auth.uid() = admin_id);

-- Policy: Only admin can delete their rooms
CREATE POLICY "Admin can delete own rooms"
ON rooms FOR DELETE
USING (auth.uid() = admin_id);

-- Policy: Only admin can create rooms
CREATE POLICY "Users can create rooms"
ON rooms FOR INSERT
WITH CHECK (auth.uid() = admin_id);
```

#### Players Table

```sql
-- Policy: Anyone can read players
CREATE POLICY "Anyone can read players"
ON players FOR SELECT
USING (true);

-- Policy: Players can update their own progress
CREATE POLICY "Players can update own progress"
ON players FOR UPDATE
USING (true) -- In production, add auth check
WITH CHECK (true);

-- Policy: Admin can insert players
CREATE POLICY "Admin can insert players"
ON players FOR INSERT
WITH CHECK (true);

-- Policy: Admin can delete players
CREATE POLICY "Admin can delete players"
ON players FOR DELETE
USING (true);
```

#### Game Sessions Table

```sql
-- Policy: Anyone can read game sessions
CREATE POLICY "Anyone can read sessions"
ON game_sessions FOR SELECT
USING (true);

-- Policy: Admin can update sessions
CREATE POLICY "Admin can update sessions"
ON game_sessions FOR UPDATE
USING (true)
WITH CHECK (true);
```

### 8. Test Connection

1. In terminal, run:

```bash
npm run dev
```

2. Open http://localhost:5173

3. Try to sign up as admin:
   - Email: `test@example.com`
   - Password: `Test@123456`
   - Display Name: `Test Admin`

4. Check Supabase Console:
   - Go to **Authentication → Users**
   - Should see your test user
   - Go to **Tables → admin_profiles**
   - Should see new admin profile

### 9. Create Test Room

1. Log in as your test admin
2. Go to `/admin/dashboard`
3. Click "Create Room"
4. Fill in:
   - Name: "Test Hunt"
   - House Theme: "Stark"
   - Timer: 5 minutes
5. Click "Create Room"

6. Check Supabase:
   - Go to **Tables → rooms**
   - Should see your room with status "waiting"
   - Code should be 6 alphanumeric characters

### 10. Troubleshooting

#### "Supabase not found" error

```
Fix:
1. Check .env.local has VITE_ prefix
2. Verify values are copied exactly
3. Restart dev server (npm run dev)
```

#### Authentication not working

```
Fix:
1. Go to Authentication → Policies
2. Verify Email provider is enabled
3. Check "Confirm email" is OFF
4. Try clearing browser cache
```

#### Can't create rooms

```
Fix:
1. Verify admin_profiles table exists
2. Check RLS policies are set correctly
3. Verify admin user exists in auth.users
4. Check browser console for errors
```

#### Realtime not working

```
Fix:
1. Go to Realtime settings
2. Verify tables have realtime enabled
3. Check subscription created (browser DevTools)
4. Try opening 2 browser windows
```

## Database Backup

### Export Data

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or manually in Console:
# Tables → Select table → Export
```

### Import Data

```bash
# Using Supabase CLI
supabase db push < backup.sql
```

## Security Notes

⚠️ **For Development Only**:

- Email confirmation is OFF (enable in production)
- RLS policies are basic (strengthen in production)
- Anon key is used (add separate service key for sensitive ops)

✅ **Before Production**:

1. Enable email confirmation
2. Add proper RLS policies for each user
3. Implement request signing with service key
4. Set up proper error handling
5. Enable audit logs
6. Set up backups and recovery

## Useful Supabase Commands

```bash
# Link local project to Supabase
supabase link

# Pull database changes
supabase db pull

# Push local changes
supabase db push

# View realtime logs
supabase functions serve

# Stop development mode
supabase stop
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SQL Reference](https://supabase.com/docs/guides/sql)
- [Realtime Setup](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Policies](https://supabase.com/docs/guides/auth)

## Quick Reference: Common Operations

### Add New User (Testing)

```sql
-- In Supabase Console → SQL Editor
INSERT INTO auth.users (email, encrypted_password)
VALUES ('admin2@test.com', crypt('password123', gen_salt('bf')));
```

### Clear All Data (Development)

```sql
-- Be careful! This deletes everything
DELETE FROM players;
DELETE FROM game_sessions;
DELETE FROM rooms;
DELETE FROM admin_profiles;
```

### View Table Structure

```
In Supabase Console:
Tables → Select table → Info tab
Shows: columns, types, constraints, indexes
```

### Monitor Realtime Activity

```
In Supabase Console:
Realtime → Logs tab
Shows all realtime connections and messages
```

## Next Steps

Once Supabase is configured:

1. Run `npm run dev`
2. Test admin signup/login
3. Create a test room
4. Check it appears in Supabase
5. Ready for Phase 3: Player join flow!
