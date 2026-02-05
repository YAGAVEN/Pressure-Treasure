import { Level } from '@/types/game3Types';
import { TILE_SIZE, COLORS, GAME_HEIGHT } from '@/data/game3Constants';

// Level 1: The North - Frozen Path
// Ice theme with slippery platforms, floor spikes, freeze zones, and collapsing platforms

export const level1: Level = {
  id: 1,
  name: 'The North – Frozen Path',
  theme: 'ice',
  backgroundColor: COLORS.ice.background,
  startPosition: { x: 50, y: GAME_HEIGHT - 100 },
  goalPosition: { x: 1800, y: GAME_HEIGHT - 150, width: 50, height: 80 },
  
  platforms: [
    // Starting area
    { x: 0, y: GAME_HEIGHT - 50, width: 200, height: 50, type: 'normal' },
    
    // First jump - ice platform
    { x: 250, y: GAME_HEIGHT - 80, width: 100, height: 30, type: 'ice' },
    
    // Collapsing platform trap!
    { x: 400, y: GAME_HEIGHT - 100, width: 80, height: 25, type: 'collapsing' },
    
    // Safe platform after trap
    { x: 520, y: GAME_HEIGHT - 130, width: 120, height: 30, type: 'ice' },
    
    // Series of small ice platforms
    { x: 680, y: GAME_HEIGHT - 160, width: 60, height: 25, type: 'ice' },
    { x: 780, y: GAME_HEIGHT - 200, width: 60, height: 25, type: 'ice' },
    { x: 880, y: GAME_HEIGHT - 180, width: 80, height: 25, type: 'ice' },
    
    // Another collapsing platform
    { x: 1000, y: GAME_HEIGHT - 220, width: 100, height: 25, type: 'collapsing' },
    
    // Mid-level rest area
    { x: 1140, y: GAME_HEIGHT - 250, width: 150, height: 40, type: 'normal' },
    
    // Ascending section
    { x: 1320, y: GAME_HEIGHT - 300, width: 80, height: 25, type: 'ice' },
    { x: 1430, y: GAME_HEIGHT - 350, width: 80, height: 25, type: 'ice' },
    
    // Collapsing trap before goal
    { x: 1540, y: GAME_HEIGHT - 380, width: 70, height: 25, type: 'collapsing' },
    
    // Final platforms
    { x: 1650, y: GAME_HEIGHT - 350, width: 100, height: 30, type: 'ice' },
    
    // Goal platform
    { x: 1780, y: GAME_HEIGHT - 100, width: 120, height: 100, type: 'normal' },
  ],
  
  traps: [
    // Floor spikes - hidden until player is close
    
    // Freeze zone - slows player
    {
      id: 'freeze1',
      type: 'freeze_zone',
      x: 550,
      y: GAME_HEIGHT - 180,
      width: 60,
      height: 50,
      isActive: true,
      isHidden: false,
    },
    
    // Hidden spikes after ice platforms
    {
      id: 'spike2',
      type: 'floor_spike',
      x: 700,
      y: GAME_HEIGHT - 185,
      width: 30,
      height: 25,
      isActive: true,
      isHidden: true,
      triggerDistance: 60,
      activationDelay: 150,
    },
    
    // Ceiling spikes - surprise!
    {
      id: 'spike3',
      type: 'ceiling_spike',
      x: 820,
      y: GAME_HEIGHT - 280,
      width: 40,
      height: 30,
      isActive: true,
      isHidden: true,
      triggerDistance: 70,
      activationDelay: 100,
    },
    
    // More floor spikes in mid section
    {
      id: 'spike4',
      type: 'floor_spike',
      x: 1180,
      y: GAME_HEIGHT - 290,
      width: 50,
      height: 40,
      isActive: true,
      isHidden: true,
      triggerDistance: 90,
      activationDelay: 250,
    },
    
    // Freeze zone before ascending
    {
      id: 'freeze2',
      type: 'freeze_zone',
      x: 1300,
      y: GAME_HEIGHT - 350,
      width: 80,
      height: 50,
      isActive: false,
      isHidden: false,
    },
    
    // Wall spikes - appear mid-jump
    {
      id: 'spike5',
      type: 'wall_spike',
      x: 1400,
      y: GAME_HEIGHT - 380,
      width: 20,
      height: 60,
      isActive: true,
      isHidden: true,
      triggerDistance: 100,
      activationDelay: 300,
      direction: 'right',
    },
    
    // Final trap before goal
    {
      id: 'spike6',
      type: 'floor_spike',
      x: 1680,
      y: GAME_HEIGHT - 380,
      width: 40,
      height: 30,
      isActive: true,
      isHidden: true,
      triggerDistance: 60,
      activationDelay: 100,
    },
  ],
};
