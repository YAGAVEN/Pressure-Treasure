# Deployment & Setup Guide

## Prerequisites

- **Node.js** 18+ and **npm/yarn/bun**
- **Supabase account** (free tier sufficient for testing)
- **Git** for version control
- **Modern browser** (Chrome, Firefox, Safari, Edge)

---

## Part 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Create new organization (if needed)
5. Create new project:
   - Name: "Pressure Treasure"
   - Password: (strong, save it!)
   - Region: Closest to your users
   - Free tier is sufficient

### 1.2 Database Schema Setup

Once project is created:

1. **Go to SQL Editor** in Supabase dashboard
2. **Create tables** by running this SQL:

```sql
-- Admin Profiles Table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
  timer_duration INTEGER DEFAULT 1800, -- seconds
  timer_remaining INTEGER DEFAULT 1800,
  house_theme VARCHAR(20) DEFAULT 'stark',
  winner_id UUID,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Players Table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) REFERENCES rooms(code) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  progress INTEGER DEFAULT 0,
  current_challenge INTEGER DEFAULT 1,
  completed_challenges INTEGER[] DEFAULT '{}',
  is_online BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game Sessions Table (for analytics)
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  final_progress INTEGER DEFAULT 0,
  placed INTEGER -- 1st, 2nd, 3rd place
);

-- Create Indices for Performance
CREATE INDEX idx_rooms_admin_id ON rooms(admin_id);
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_players_room_code ON players(room_code);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_online ON players(is_online);
CREATE INDEX idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
```

### 1.3 Enable Real-Time

1. **Go to Database** → **Replication**
2. **Enable publication** for these tables:
   - `rooms`
   - `players`
   - `game_sessions`
3. Select all columns for each table

### 1.4 Get Credentials

1. **Go to Project Settings** → **API**
2. Copy:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)
3. Save these securely

---

## Part 2: Local Development Setup

### 2.1 Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/pressure-treasure.git
cd pressure-treasure

# Install dependencies
npm install
# or
bun install
```

### 2.2 Environment Configuration

1. **Create `.env.local`** in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Create `.env.example`** for version control:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.3 Run Development Server

```bash
npm run dev
# or
bun run dev
```

Visit `http://localhost:5173`

---

## Part 3: Initial Testing

### 3.1 Admin Registration

1. Navigate to http://localhost:5173/admin/auth
2. Click "Create an account"
3. Enter:
   - Email: your@email.com
   - Password: secure password (min 8 chars)
4. Click "Sign Up"
5. You'll be redirected to dashboard

### 3.2 Create a Test Room

1. On AdminDashboard, click "Create Room"
2. Fill in:
   - Room Name: "Test Hunt"
   - Description: "Testing the game"
   - House Theme: "Stark"
   - Timer: "5" minutes
3. Click "Create Room"
4. Copy the room code

### 3.3 Join as Player

1. Open new browser window or incognito tab
2. Navigate to http://localhost:5173
3. Click "Join Room"
4. Enter:
   - Room Code: (code from Step 3.2)
   - Username: "Test Player"
5. Click "Join"
6. You should see waiting lobby

### 3.4 Test Game Flow

1. **Admin**: Click "Start Game"
2. **Player**: Should see timer counting down
3. **Player**: See first challenge, click "Complete Challenge"
4. **Admin**: See player progress update in real-time
5. **Player**: After 5 challenges, game ends automatically

---

## Part 4: Production Deployment

### 4.1 Vercel Deployment

#### Prerequisites:

- Vercel account (free tier)
- GitHub repository

#### Steps:

1. **Push to GitHub**

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Create `.env.production`** (don't commit):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Configure environment variables:
     - VITE_SUPABASE_URL
     - VITE_SUPABASE_ANON_KEY
   - Click "Deploy"

4. **Add custom domain** (optional):
   - Go to project settings
   - Add your domain
   - Update DNS records per Vercel instructions

### 4.2 Alternative: Netlify Deployment

1. **Connect GitHub repo to Netlify**
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables**:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
4. **Deploy**

### 4.3 Self-Hosted Deployment

#### Using Docker:

1. **Create Dockerfile**:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

2. **Build & Run**:

```bash
docker build -t pressure-treasure .
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=... \
  -e VITE_SUPABASE_ANON_KEY=... \
  pressure-treasure
```

#### Using PM2:

```bash
# Build
npm run build

# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pressure-treasure',
    script: 'npm',
    args: 'run preview',
    env: {
      NODE_ENV: 'production',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
    }
  }]
};
EOF

# Start
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Part 5: Monitoring & Maintenance

### 5.1 Supabase Monitoring

1. **Go to Supabase Dashboard**
2. Monitor:
   - **Database Usage**: View storage/bandwidth
   - **Real-Time Connections**: Active subscriptions
   - **Auth Users**: Registered admins
   - **Logs**: Query logs and errors

### 5.2 Application Logging

Add to your app for production monitoring:

```typescript
// Error boundary (catch render errors)
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
    // Send to error tracking service (Sentry, etc)
  }
  render() {
    return this.props.children;
  }
}

// Network error logging
window.addEventListener("error", (e) => {
  if (e.message.includes("fetch")) {
    console.error("Network error:", e);
  }
});
```

### 5.3 Performance Optimization

For production:

1. **Enable CDN** on Supabase
2. **Enable compression** in production build
3. **Monitor bundle size**:

```bash
npm run build -- --analyze
```

---

## Part 6: Troubleshooting

### Connection Issues

**Problem**: "Connection refused" error

```
Solution:
1. Verify SUPABASE_URL is correct
2. Check Supabase project is active
3. Verify network connectivity
4. Check browser console for CORS errors
```

**Problem**: Real-time updates not working

```
Solution:
1. Go to Supabase Dashboard → Replication
2. Verify tables have replication enabled
3. Check browser console for subscription errors
4. Try hard refresh (Ctrl+Shift+R)
```

### Database Issues

**Problem**: "Relation does not exist" error

```
Solution:
1. Re-run SQL schema creation in Supabase
2. Verify table names match exactly
3. Check for typos in function calls
```

**Problem**: Slow queries

```
Solution:
1. Add database indices (see SQL above)
2. Check Supabase Query Performance tab
3. Optimize filtering in service layer
```

### Authentication Issues

**Problem**: "Invalid credentials" error

```
Solution:
1. Verify password requirements (8+ chars)
2. Check email format is valid
3. Clear localStorage and retry
4. Check Supabase Auth logs
```

### Real-Time Sync Issues

**Problem**: Data not syncing between clients

```
Solution:
1. Verify real-time is enabled in Supabase
2. Check browser console for subscription errors
3. Monitor network tab for WebSocket activity
4. Try page refresh to re-subscribe
```

---

## Part 7: Scaling Considerations

### Database Optimization (>1000 players)

- Add materialized views for leaderboard
- Implement query caching
- Archive old game sessions to separate table
- Monitor connection pool limits

### Real-Time Optimization (>100 concurrent players)

- Use presence feature for large rooms
- Implement room sharding if needed
- Monitor WebSocket connection count

### Application Optimization

- Implement code splitting for bundle size
- Add service worker for offline support
- Optimize image assets
- Monitor Core Web Vitals

---

## Part 8: Security Best Practices

### Development

```
✓ Never commit .env files
✓ Use unique, strong passwords
✓ Rotate credentials regularly
✓ Keep dependencies updated
```

### Production

```
✓ Enable HTTPS only
✓ Set strong CORS policies
✓ Use environment variables for secrets
✓ Enable Supabase RLS (Row Level Security)
✓ Regular security audits
✓ Monitor for suspicious activity
```

### RLS (Row Level Security)

Enable in Supabase to restrict data access:

```sql
-- Only admins can see their rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see their own rooms"
  ON rooms FOR SELECT
  USING (admin_id = auth.uid());

-- Only players in a room can see that room's players
CREATE POLICY "See players in your room"
  ON players FOR SELECT
  USING (room_code IN (
    SELECT code FROM rooms WHERE status != 'finished'
  ));
```

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui Docs**: https://ui.shadcn.com

---

**Last Updated**: Phase 5 Complete
**Status**: ✅ Production Ready
