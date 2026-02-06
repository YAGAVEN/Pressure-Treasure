import { Level } from '@/types/game3Types';
import { TILE_SIZE, COLORS, GAME_HEIGHT } from '@/data/game3Constants';

// Level 3: Dragonstone - The Fire Trial
// Fire theme with lava platforms, fire bursts, disappearing platforms, screen shake

export const level3: Level = {
  id: 3,
  name: 'Dragonstone – The Fire Trial',
  theme: 'fire',
  backgroundColor: COLORS.fire.background,
  startPosition: { x: 50, y: GAME_HEIGHT - 100 },
  goalPosition: { x: 2200, y: GAME_HEIGHT - 180, width: 60, height: 100 },
  
  platforms: [
    // Starting area - volcanic rock
    { x: 0, y: GAME_HEIGHT - 50, width: 150, height: 50, type: 'normal' },
    
    // First disappearing platform
    { x: 200, y: GAME_HEIGHT - 80, width: 80, height: 25, type: 'disappearing' },
    
    // Lava platforms that rise and fall
    { x: 330, y: GAME_HEIGHT - 100, width: 70, height: 25, type: 'lava' },
    { x: 450, y: GAME_HEIGHT - 130, width: 70, height: 25, type: 'lava' },
    
    // Safe island
    { x: 570, y: GAME_HEIGHT - 160, width: 100, height: 40, type: 'normal' },
    
    // Disappearing platform chain
    { x: 720, y: GAME_HEIGHT - 200, width: 60, height: 25, type: 'disappearing' },
    { x: 830, y: GAME_HEIGHT - 240, width: 60, height: 25, type: 'disappearing' },
    { x: 940, y: GAME_HEIGHT - 280, width: 60, height: 25, type: 'disappearing' },
    
    // Mid checkpoint
    { x: 1050, y: GAME_HEIGHT - 320, width: 130, height: 40, type: 'normal' },
    
    // Fire gauntlet - narrow platforms with fire bursts
    { x: 1230, y: GAME_HEIGHT - 280, width: 50, height: 25, type: 'normal' },
    { x: 1340, y: GAME_HEIGHT - 280, width: 50, height: 25, type: 'normal' },
    { x: 1450, y: GAME_HEIGHT - 280, width: 50, height: 25, type: 'normal' },
    { x: 1560, y: GAME_HEIGHT - 280, width: 50, height: 25, type: 'normal' },
    
    // Descending lava section
    { x: 1670, y: GAME_HEIGHT - 240, width: 80, height: 25, type: 'lava' },
    { x: 1800, y: GAME_HEIGHT - 200, width: 80, height: 25, type: 'lava' },
    
    // Final disappearing platforms
    { x: 1930, y: GAME_HEIGHT - 250, width: 60, height: 25, type: 'disappearing' },
    { x: 2040, y: GAME_HEIGHT - 300, width: 60, height: 25, type: 'disappearing' },
    
    // Goal platform - Dragon's throne
    { x: 2150, y: GAME_HEIGHT - 130, width: 150, height: 130, type: 'normal' },
  ],
  
  traps: [
    // Floor spikes after first jump
    
    // Fire bursts across jump paths
    {
      id: 'fire1',
      type: 'fire_burst',
      x: 280,
      y: GAME_HEIGHT - 200,
      width: 40,
      height: 150,
      isActive: false,
      isHidden: false,
      timer: 0,
    },
    {
      id: 'fire2',
      type: 'fire_burst',
      x: 400,
      y: GAME_HEIGHT - 220,
      width: 40,
      height: 150,
      isActive: false,
      isHidden: false,
      timer: 60,
    },
    
    // Hidden spikes on safe island
    
    // Fire bursts in disappearing section
    {
      id: 'fire3',
      type: 'fire_burst',
      x: 780,
      y: GAME_HEIGHT - 350,
      width: 40,
      height: 120,
      isActive: false,
      isHidden: false,
      timer: 30,
    },
    {
      id: 'fire4',
      type: 'fire_burst',
      x: 890,
      y: GAME_HEIGHT - 380,
      width: 40,
      height: 120,
      isActive: false,
      isHidden: false,
      timer: 90,
    },
    
    // Falling spikes at checkpoint
    {
      id: 'fall1',
      type: 'falling_spike',
      x: 1100,
      y: GAME_HEIGHT - 450,
      width: 30,
      height: 50,
      isActive: true,
      isHidden: true,
      triggerDistance: 80,
      speed: 8,
    },
    
    // Fire gauntlet bursts
    {
      id: 'fire5',
      type: 'fire_burst',
      x: 1280,
      y: GAME_HEIGHT - 400,
      width: 50,
      height: 130,
      isActive: true,
      isHidden: true,
      timer: 0,
    },
    {
      id: 'fire6',
      type: 'fire_burst',
      x: 1390,
      y: GAME_HEIGHT - 400,
      width: 50,
      height: 130,
      isActive: false,
      isHidden: false,
      timer: 45,
    },
    {
      id: 'fire7',
      type: 'fire_burst',
      x: 1500,
      y: GAME_HEIGHT - 400,
      width: 50,
      height: 130,
      isActive: false,
      isHidden: false,
      timer: 90,
    },
    
    // Wall spikes during lava descent
    {
      id: 'wall1',
      type: 'wall_spike',
      x: 1750,
      y: GAME_HEIGHT - 280,
      width: 25,
      height: 60,
      isActive: true,
      isHidden: true,
      triggerDistance: 70,
      activationDelay: 150,
      direction: 'right',
    },
    
    // Final fire burst before goal
    {
      id: 'fire8',
      type: 'fire_burst',
      x: 2090,
      y: GAME_HEIGHT - 400,
      width: 50,
      height: 180,
      isActive: false,
      isHidden: false,
      timer: 60,
    },
    
    // Ultimate trap - hidden ceiling spikes at goal
    {
      id: 'ceil1',
      type: 'ceiling_spike',
      x: 2180,
      y: GAME_HEIGHT - 280,
      width: 60,
      height: 50,
      isActive: true,
      isHidden: true,
      triggerDistance: 50,
      activationDelay: 100,
    },
  ],
};
