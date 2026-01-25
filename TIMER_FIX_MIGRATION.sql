-- Migration to add timer_remaining column to rooms table
-- Run this in your Supabase SQL Editor

-- Add the timer_remaining column if it doesn't exist
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS timer_remaining INTEGER;

-- Initialize timer_remaining with timer_duration for existing rooms
UPDATE rooms 
SET timer_remaining = timer_duration 
WHERE timer_remaining IS NULL;

-- Verify the update
SELECT id, code, name, timer_duration, timer_remaining, status 
FROM rooms 
ORDER BY created_at DESC;
