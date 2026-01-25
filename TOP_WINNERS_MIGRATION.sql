-- Migration to add top 3 winners support
-- Run this in your Supabase SQL Editor

-- Add completed_at column to players table to track completion time
ALTER TABLE players ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add progress_updated_at column to track when player last reached current progress level
ALTER TABLE players ADD COLUMN IF NOT EXISTS progress_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for better query performance on completed_at
CREATE INDEX IF NOT EXISTS players_completed_at_idx ON players(completed_at);

-- Create index for better query performance on progress_updated_at
CREATE INDEX IF NOT EXISTS players_progress_updated_at_idx ON players(progress_updated_at);

-- Create a type for winner information
CREATE TYPE winner_info AS (
  player_id UUID,
  rank INTEGER,
  progress INTEGER
);

-- Add new column to store top 3 winners
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS winners JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS rooms_winners_idx ON rooms USING GIN (winners);

-- Optional: Migrate existing winner_id data to winners array
-- This will convert any existing single winner to the first place in the winners array
UPDATE rooms
SET winners = jsonb_build_array(
  jsonb_build_object(
    'playerId', winner_id,
    'rank', 1,
    'progress', 100
  )
)
WHERE winner_id IS NOT NULL AND winners = '[]'::jsonb;

-- Note: winner_id column is kept for backward compatibility
-- You can optionally drop it later if needed:
-- ALTER TABLE rooms DROP COLUMN winner_id;

COMMENT ON COLUMN rooms.winners IS 'Top 3 winners stored as JSON array with playerId, rank, and progress';
COMMENT ON COLUMN players.completed_at IS 'Timestamp when player completed all challenges (used for ranking by speed)';
