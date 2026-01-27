import { Level } from '@/types/game3Types';
import { TILE_SIZE, COLORS, GAME_HEIGHT } from '@/data/game3Constants';

// Level 2: King's Landing - Castle of Blades
// Castle theme with swinging blades, guillotines, narrow platforms, wall spikes

export const level2: Level = {
  id: 2,
  name: "King's Landing – Castle of Blades",
  theme: 'castle',
  backgroundColor: COLORS.castle.background,
  startPosition: { x: 50, y: GAME_HEIGHT - 100 },
  goalPosition: { x: 2000, y: GAME_HEIGHT - 150, width: 50, height: 80 },
  
  platforms: [
    // Starting area - castle floor
    { x: 0, y: GAME_HEIGHT - 50, width: 180, height: 50, type: 'normal' },
    
    // First narrow platform
    { x: 230, y: GAME_HEIGHT - 90, width: 50, height: 20, type: 'normal' },
    
    // Series of narrow stone platforms
    { x: 330, y: GAME_HEIGHT - 130, width: 45, height: 20, type: 'normal' },
    { x: 420, y: GAME_HEIGHT - 170, width: 45, height: 20, type: 'normal' },
    { x: 510, y: GAME_HEIGHT - 210, width: 45, height: 20, type: 'normal' },
    
    // Wider rest platform
    { x: 600, y: GAME_HEIGHT - 250, width: 120, height: 30, type: 'normal' },
    
    // Blade gauntlet section
    { x: 770, y: GAME_HEIGHT - 200, width: 60, height: 25, type: 'normal' },
    { x: 880, y: GAME_HEIGHT - 200, width: 60, height: 25, type: 'normal' },
    { x: 990, y: GAME_HEIGHT - 200, width: 60, height: 25, type: 'normal' },
    
    // Lower section with guillotines
    { x: 1100, y: GAME_HEIGHT - 150, width: 80, height: 30, type: 'normal' },
    { x: 1230, y: GAME_HEIGHT - 150, width: 80, height: 30, type: 'normal' },
    { x: 1360, y: GAME_HEIGHT - 150, width: 80, height: 30, type: 'normal' },
    
    // Ascending to throne
    { x: 1490, y: GAME_HEIGHT - 200, width: 70, height: 25, type: 'normal' },
    { x: 1590, y: GAME_HEIGHT - 260, width: 70, height: 25, type: 'normal' },
    { x: 1690, y: GAME_HEIGHT - 320, width: 70, height: 25, type: 'normal' },
    
    // Final narrow platforms
    { x: 1800, y: GAME_HEIGHT - 280, width: 40, height: 20, type: 'normal' },
    { x: 1880, y: GAME_HEIGHT - 240, width: 40, height: 20, type: 'normal' },
    
    // Goal platform - throne room
    { x: 1960, y: GAME_HEIGHT - 100, width: 140, height: 100, type: 'normal' },
  ],
  
  traps: [
    // First surprise spike
    {
      id: 'spike1',
      type: 'floor_spike',
      x: 250,
      y: GAME_HEIGHT - 110,
      width: 30,
      height: 20,
      isActive: false,
      isHidden: false,
      triggerDistance: 50,
      activationDelay: 150,
    },
    
    // Wall spikes mid-jump
    {
      id: 'wall1',
      type: 'wall_spike',
      x: 370,
      y: GAME_HEIGHT - 200,
      width: 20,
      height: 50,
      isActive: false,
      isHidden: false,
      triggerDistance: 80,
      activationDelay: 200,
      direction: 'right',
    },
    
    // Swinging blades in gauntlet
    {
      id: 'blade1',
      type: 'swinging_blade',
      x: 820,
      y: GAME_HEIGHT - 350,
      width: 15,
      height: 120,
      isActive: false,
      isHidden: false,
      angle: 0,
      swingSpeed: 0.04,
    },
    {
      id: 'blade2',
      type: 'swinging_blade',
      x: 930,
      y: GAME_HEIGHT - 350,
      width: 15,
      height: 120,
      isActive: false,
      isHidden: false,
      angle: Math.PI / 2,
      swingSpeed: 0.05,
    },
    {
      id: 'blade3',
      type: 'swinging_blade',
      x: 1040,
      y: GAME_HEIGHT - 350,
      width: 15,
      height: 120,
      isActive: false,
      isHidden: false,
      angle: Math.PI,
      swingSpeed: 0.04,
    },
    
    // Guillotines
    {
      id: 'guil1',
      type: 'guillotine',
      x: 1130,
      y: GAME_HEIGHT - 400,
      width: 40,
      height: 60,
      isActive: false,
      isHidden: false,
      speed: 10,
      timer: 0,
    },
    {
      id: 'guil2',
      type: 'guillotine',
      x: 1260,
      y: GAME_HEIGHT - 400,
      width: 40,
      height: 60,
      isActive: false,
      isHidden: false,
      speed: 10,
      timer: 60,
    },
    {
      id: 'guil3',
      type: 'guillotine',
      x: 1390,
      y: GAME_HEIGHT - 400,
      width: 40,
      height: 60,
      isActive: false,
      isHidden: false,
      speed: 10,
      timer: 120,
    },
    
    // Hidden wall spikes on ascent
    {
      id: 'wall2',
      type: 'wall_spike',
      x: 1560,
      y: GAME_HEIGHT - 300,
      width: 20,
      height: 60,
      isActive: false,
      isHidden: false,
      triggerDistance: 70,
      activationDelay: 150,
      direction: 'left',
    },
    
    // Ceiling spikes surprise
    {
      id: 'ceil1',
      type: 'ceiling_spike',
      x: 1650,
      y: GAME_HEIGHT - 500,
      width: 50,
      height: 40,
      isActive: false,
      isHidden: false,
      triggerDistance: 60,
      activationDelay: 100,
    },
    
    // Final trap before throne
    {
      id: 'spike2',
      type: 'floor_spike',
      x: 1900,
      y: GAME_HEIGHT - 260,
      width: 30,
      height: 20,
      isActive: false,
      isHidden: false,
      triggerDistance: 40,
      activationDelay: 80,
    },
  ],
};
