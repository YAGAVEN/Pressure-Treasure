// Game 3 Constants

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;

// Physics
export const GRAVITY = 0.6;
export const MAX_FALL_SPEED = 15;
export const PLAYER_SPEED = 5;
export const PLAYER_JUMP_FORCE = -14;
export const ICE_FRICTION = 0.98;
export const NORMAL_FRICTION = 0.85;

// Player
export const PLAYER_WIDTH = 24;
export const PLAYER_HEIGHT = 32;

// Animation
export const ANIMATION_SPEED = 8;

// Traps
export const SPIKE_ACTIVATION_DELAY = 100; // ms
export const BLADE_SWING_SPEED = 0.05;
export const GUILLOTINE_FALL_SPEED = 12;
export const FIRE_BURST_INTERVAL = 2000; // ms
export const COLLAPSE_DELAY = 500; // ms
export const DISAPPEAR_DELAY = 1000; // ms

// Colors - Medieval Theme
export const COLORS = {
  // Level 1 - Ice
  ice: {
    background: '#1a1a2e',
    platform: '#4a6fa5',
    platformHighlight: '#7b9fd4',
    accent: '#a8d8ea',
    spike: '#c4e1f6',
  },
  // Level 2 - Castle
  castle: {
    background: '#1a1612',
    platform: '#4a3f35',
    platformHighlight: '#6b5b4f',
    accent: '#8b7355',
    spike: '#5c5c5c',
  },
  // Level 3 - Fire
  fire: {
    background: '#1a0a0a',
    platform: '#3d2626',
    platformHighlight: '#5c3a3a',
    accent: '#ff6b35',
    lava: '#ff4500',
    fire: '#ff8c00',
  },
  // Common
  player: '#c9a959',
  playerOutline: '#8b7355',
  goal: '#ffd700',
  death: '#ff0000',
  text: '#ffffff',
  textShadow: '#000000',
};

// Level themes
export const LEVEL_NAMES = [
  'The North – Frozen Path',
  "King's Landing – Castle of Blades",
  'Dragonstone – The Fire Trial',
];
