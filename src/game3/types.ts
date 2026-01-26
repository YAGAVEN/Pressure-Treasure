// Game types and interfaces

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerState {
  position: Vector2D;
  velocity: Vector2D;
  isGrounded: boolean;
  isJumping: boolean;
  isDead: boolean;
  facingRight: boolean;
  animationFrame: number;
  animationTimer: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'ice' | 'collapsing' | 'disappearing' | 'lava';
  isCollapsing?: boolean;
  collapseTimer?: number;
  isVisible?: boolean;
  disappearTimer?: number;
  hasBeenTouched?: boolean;
}

export interface Trap {
  id: string;
  type: TrapType;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  isHidden: boolean;
  triggerDistance?: number;
  activationDelay?: number;
  timer?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  speed?: number;
  angle?: number;
  swingSpeed?: number;
  activated?: boolean;
}

export type TrapType = 
  | 'floor_spike'
  | 'wall_spike'
  | 'ceiling_spike'
  | 'swinging_blade'
  | 'guillotine'
  | 'freeze_zone'
  | 'fire_burst'
  | 'falling_spike';

export interface Level {
  id: number;
  name: string;
  theme: 'ice' | 'castle' | 'fire';
  platforms: Platform[];
  traps: Trap[];
  startPosition: Vector2D;
  goalPosition: Rectangle;
  backgroundColor: string;
  parallaxLayers?: ParallaxLayer[];
}

export interface ParallaxLayer {
  color: string;
  speed: number;
  elements: Rectangle[];
}

export interface GameState {
  currentLevel: number;
  deaths: number;
  isPlaying: boolean;
  isPaused: boolean;
  levelComplete: boolean;
  gameComplete: boolean;
  showStartScreen: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
  smoothing: number;
}
