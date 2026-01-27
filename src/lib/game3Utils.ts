import { Rectangle, Vector2D } from '@/types/game3Types';

// Collision detection
export function rectanglesIntersect(a: Rectangle, b: Rectangle): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Check if point is inside rectangle
export function pointInRect(point: Vector2D, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// Distance between two points
export function distance(a: Vector2D, b: Vector2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Lerp (linear interpolation)
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Random number between min and max
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Random integer between min and max (inclusive)
export function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

// Draw pixel art style rectangle
export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  borderColor?: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
  
  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(Math.floor(x), Math.floor(y), width, height);
  }
}

// Draw pixel art platform with 3D effect
export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  baseColor: string,
  highlightColor: string
): void {
  // Base
  ctx.fillStyle = baseColor;
  ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
  
  // Top highlight
  ctx.fillStyle = highlightColor;
  ctx.fillRect(Math.floor(x), Math.floor(y), width, 4);
  
  // Left highlight
  ctx.fillRect(Math.floor(x), Math.floor(y), 4, height);
  
  // Bottom shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(Math.floor(x), Math.floor(y) + height - 4, width, 4);
  
  // Right shadow
  ctx.fillRect(Math.floor(x) + width - 4, Math.floor(y), 4, height);
}

// Draw spike
export function drawSpike(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  direction: 'up' | 'down' | 'left' | 'right' = 'up'
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  
  switch (direction) {
    case 'up':
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height);
      break;
    case 'down':
      ctx.moveTo(x, y);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x + width, y);
      break;
    case 'left':
      ctx.moveTo(x + width, y);
      ctx.lineTo(x, y + height / 2);
      ctx.lineTo(x + width, y + height);
      break;
    case 'right':
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x, y + height);
      break;
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Add highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  
  switch (direction) {
    case 'up':
      ctx.moveTo(x + 2, y + height);
      ctx.lineTo(x + width / 2, y + 4);
      ctx.lineTo(x + width / 2, y + height);
      break;
    case 'down':
      ctx.moveTo(x + 2, y);
      ctx.lineTo(x + width / 2, y + height - 4);
      ctx.lineTo(x + width / 2, y);
      break;
  }
  
  ctx.closePath();
  ctx.fill();
}

// Draw player character (pixel art warrior)
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  facingRight: boolean,
  frame: number,
  isDead: boolean
): void {
  const px = Math.floor(x);
  const py = Math.floor(y);
  
  if (isDead) {
    // Death animation - red flash
    ctx.fillStyle = '#ff0000';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(px, py, width, height);
    ctx.globalAlpha = 1;
    return;
  }
  
  // Body
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(px + 4, py + 8, width - 8, height - 12);
  
  // Armor overlay
  ctx.fillStyle = '#5c5c5c';
  ctx.fillRect(px + 6, py + 10, width - 12, height - 18);
  
  // Head
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(px + 6, py, width - 12, 10);
  
  // Helmet
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(px + 4, py - 2, width - 8, 6);
  ctx.fillRect(px + 8, py + 4, width - 16, 4);
  
  // Eyes
  ctx.fillStyle = '#000000';
  if (facingRight) {
    ctx.fillRect(px + 14, py + 4, 2, 2);
  } else {
    ctx.fillRect(px + 8, py + 4, 2, 2);
  }
  
  // Legs (animated)
  const legOffset = Math.sin(frame * 0.3) * 2;
  ctx.fillStyle = '#5c4033';
  ctx.fillRect(px + 6, py + height - 8, 4, 8);
  ctx.fillRect(px + width - 10, py + height - 8, 4, 8);
  
  // Sword
  ctx.fillStyle = '#c0c0c0';
  if (facingRight) {
    ctx.fillRect(px + width - 2, py + 12, 8, 3);
    ctx.fillRect(px + width + 4, py + 10, 2, 7);
  } else {
    ctx.fillRect(px - 6, py + 12, 8, 3);
    ctx.fillRect(px - 6, py + 10, 2, 7);
  }
}

// Create particles for effects
export function createParticles(
  x: number,
  y: number,
  count: number,
  color: string,
  speed: number = 3
): Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }> {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = random(0, Math.PI * 2);
    const velocity = random(1, speed);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: random(20, 40),
      maxLife: 40,
      color,
      size: random(2, 5),
    });
  }
  return particles;
}
