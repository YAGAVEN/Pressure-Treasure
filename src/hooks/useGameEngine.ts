import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  GRAVITY, 
  MAX_FALL_SPEED, 
  PLAYER_SPEED, 
  PLAYER_JUMP_FORCE,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  ICE_FRICTION,
  NORMAL_FRICTION,
  COLORS,
  COLLAPSE_DELAY,
  DISAPPEAR_DELAY,
} from '@/data/game3Constants';
import { 
  PlayerState, 
  GameState, 
  Level, 
  Platform, 
  Trap, 
  Camera,
  Particle,
} from '@/types/game3Types';
import { 
  rectanglesIntersect, 
  lerp, 
  clamp, 
  drawPlatform, 
  drawSpike, 
  drawPlayer,
  createParticles,
  distance,
} from '@/lib/game3Utils';
import { levels } from '@/data/game3';

interface GameEngineState {
  player: PlayerState;
  gameState: GameState;
  camera: Camera;
  particles: Particle[];
  screenShake: { x: number; y: number; intensity: number };
}

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const [engineState, setEngineState] = useState<GameEngineState>({
    player: {
      position: { x: 50, y: GAME_HEIGHT - 100 },
      velocity: { x: 0, y: 0 },
      isGrounded: false,
      isJumping: false,
      isDead: false,
      facingRight: true,
      animationFrame: 0,
      animationTimer: 0,
    },
    gameState: {
      currentLevel: 1,
      deaths: 0,
      isPlaying: false,
      isPaused: false,
      levelComplete: false,
      gameComplete: false,
      showStartScreen: true,
    },
    camera: {
      x: 0,
      y: 0,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      targetX: 0,
      smoothing: 0.1,
    },
    particles: [],
    screenShake: { x: 0, y: 0, intensity: 0 },
  });
  
  const stateRef = useRef(engineState);
  stateRef.current = engineState;
  
  // Deep copy level data to avoid mutating original
  const levelDataRef = useRef<Level | null>(null);
  
  const initializeLevel = useCallback((levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;
    
    // Deep copy level data
    levelDataRef.current = JSON.parse(JSON.stringify(level));
    
    setEngineState(prev => ({
      ...prev,
      player: {
        position: { ...level.startPosition },
        velocity: { x: 0, y: 0 },
        isGrounded: false,
        isJumping: false,
        isDead: false,
        facingRight: true,
        animationFrame: 0,
        animationTimer: 0,
      },
      camera: {
        x: 0,
        y: 0,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        targetX: 0,
        smoothing: 0.1,
      },
      particles: [],
      screenShake: { x: 0, y: 0, intensity: 0 },
    }));
  }, []);
  
  const startGame = useCallback(() => {
    setEngineState(prev => ({
      ...prev,
      gameState: {
        ...prev.gameState,
        isPlaying: true,
        showStartScreen: false,
        levelComplete: false,
        gameComplete: false,
      },
    }));
    initializeLevel(1);
  }, [initializeLevel]);
  
  const nextLevel = useCallback(() => {
    const currentLevel = stateRef.current.gameState.currentLevel;
    if (currentLevel >= 3) {
      setEngineState(prev => ({
        ...prev,
        gameState: {
          ...prev.gameState,
          levelComplete: false,
          gameComplete: true,
          isPlaying: false,
        },
      }));
    } else {
      setEngineState(prev => ({
        ...prev,
        gameState: {
          ...prev.gameState,
          currentLevel: currentLevel + 1,
          levelComplete: false,
        },
      }));
      initializeLevel(currentLevel + 1);
    }
  }, [initializeLevel]);
  
  const restartLevel = useCallback(() => {
    const currentLevel = stateRef.current.gameState.currentLevel;
    initializeLevel(currentLevel);
  }, [initializeLevel]);
  
  const restartGame = useCallback(() => {
    setEngineState(prev => ({
      ...prev,
      gameState: {
        currentLevel: 1,
        deaths: 0,
        isPlaying: false,
        isPaused: false,
        levelComplete: false,
        gameComplete: false,
        showStartScreen: true,
      },
    }));
  }, []);
  
  const killPlayer = useCallback(() => {
    const state = stateRef.current;
    if (state.player.isDead) return;
    
    // Create death particles
    const deathParticles = createParticles(
      state.player.position.x + PLAYER_WIDTH / 2,
      state.player.position.y + PLAYER_HEIGHT / 2,
      20,
      COLORS.death,
      5
    );
    
    setEngineState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        isDead: true,
      },
      gameState: {
        ...prev.gameState,
        deaths: prev.gameState.deaths + 1,
      },
      particles: [...prev.particles, ...deathParticles],
      screenShake: { x: 0, y: 0, intensity: 10 },
    }));
    
    // Respawn after delay
    setTimeout(() => {
      restartLevel();
    }, 1000);
  }, [restartLevel]);
  
  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      // Prevent default for game keys
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      const state = stateRef.current;
      const level = levelDataRef.current;
      
      if (state.gameState.isPlaying && !state.gameState.levelComplete && level) {
        update(deltaTime, state, level);
      }
      
      render(ctx, state, level);
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    const update = (deltaTime: number, state: GameEngineState, level: Level) => {
      if (state.player.isDead) return;
      
      const keys = keysRef.current;
      let newVelocityX = state.player.velocity.x;
      let newVelocityY = state.player.velocity.y;
      let newPosition = { ...state.player.position };
      let isGrounded = false;
      let facingRight = state.player.facingRight;
      let animationFrame = state.player.animationFrame;
      let animationTimer = state.player.animationTimer + deltaTime;
      
      // Horizontal movement
      let moveSpeed = PLAYER_SPEED;
      let isOnIce = false;
      let isInFreezeZone = false;
      
      // Check for freeze zones
      for (const trap of level.traps) {
        if (trap.type === 'freeze_zone' && trap.isActive) {
          const playerRect = { 
            x: newPosition.x, 
            y: newPosition.y, 
            width: PLAYER_WIDTH, 
            height: PLAYER_HEIGHT 
          };
          if (rectanglesIntersect(playerRect, trap)) {
            isInFreezeZone = true;
            moveSpeed = PLAYER_SPEED * 0.4;
          }
        }
      }
      
      // Apply movement
      if (keys.has('arrowleft') || keys.has('a')) {
        newVelocityX = -moveSpeed;
        facingRight = false;
      } else if (keys.has('arrowright') || keys.has('d')) {
        newVelocityX = moveSpeed;
        facingRight = true;
      } else {
        // Apply friction
        newVelocityX *= isOnIce ? ICE_FRICTION : NORMAL_FRICTION;
        if (Math.abs(newVelocityX) < 0.1) newVelocityX = 0;
      }
      
      // Apply gravity
      newVelocityY += GRAVITY;
      if (newVelocityY > MAX_FALL_SPEED) newVelocityY = MAX_FALL_SPEED;
      
      // Update position
      newPosition.x += newVelocityX;
      newPosition.y += newVelocityY;
      
      // Platform collision
      for (const platform of level.platforms) {
        // Skip collapsed or invisible platforms
        if (platform.type === 'collapsing' && platform.isCollapsing && (platform.collapseTimer || 0) > COLLAPSE_DELAY) {
          continue;
        }
        if (platform.type === 'disappearing' && platform.isVisible === false) {
          continue;
        }
        
        const playerRect = { 
          x: newPosition.x, 
          y: newPosition.y, 
          width: PLAYER_WIDTH, 
          height: PLAYER_HEIGHT 
        };
        
        // Check if on ice
        if (platform.type === 'ice') {
          isOnIce = true;
        }
        
        if (rectanglesIntersect(playerRect, platform)) {
          // Top collision (landing on platform)
          if (state.player.velocity.y >= 0 && 
              state.player.position.y + PLAYER_HEIGHT <= platform.y + 10) {
            newPosition.y = platform.y - PLAYER_HEIGHT;
            newVelocityY = 0;
            isGrounded = true;
            
            // Trigger collapsing platforms
            if (platform.type === 'collapsing' && !platform.isCollapsing) {
              platform.isCollapsing = true;
              platform.collapseTimer = 0;
            }
            
            // Trigger disappearing platforms
            if (platform.type === 'disappearing' && !platform.hasBeenTouched) {
              platform.hasBeenTouched = true;
              platform.disappearTimer = 0;
            }
          }
          // Side collisions
          else if (state.player.velocity.y < 0) {
            // Bottom collision
            newPosition.y = platform.y + platform.height;
            newVelocityY = 0;
          } else {
            // Left/right collision
            if (newVelocityX > 0) {
              newPosition.x = platform.x - PLAYER_WIDTH;
            } else {
              newPosition.x = platform.x + platform.width;
            }
            newVelocityX = 0;
          }
        }
      }
      
      // Update platform states
      for (const platform of level.platforms) {
        if (platform.type === 'collapsing' && platform.isCollapsing) {
          platform.collapseTimer = (platform.collapseTimer || 0) + deltaTime;
        }
        if (platform.type === 'disappearing' && platform.hasBeenTouched) {
          platform.disappearTimer = (platform.disappearTimer || 0) + deltaTime;
          if (platform.disappearTimer > DISAPPEAR_DELAY) {
            platform.isVisible = false;
          }
        }
        if (platform.type === 'lava') {
          // Lava platforms rise and fall
          const time = Date.now() * 0.001;
          platform.y = platform.y + Math.sin(time * 2 + platform.x * 0.01) * 0.3;
        }
      }
      
      // Jump
      if ((keys.has('arrowup') || keys.has('w') || keys.has(' ')) && isGrounded && !state.player.isJumping) {
        newVelocityY = PLAYER_JUMP_FORCE;
        isGrounded = false;
      }
      
      // Update trap states and check collisions
      for (const trap of level.traps) {
        const playerCenter = {
          x: newPosition.x + PLAYER_WIDTH / 2,
          y: newPosition.y + PLAYER_HEIGHT / 2,
        };
        const trapCenter = {
          x: trap.x + trap.width / 2,
          y: trap.y + trap.height / 2,
        };
        
        // Activate hidden traps when player is close
        if (trap.isHidden && !trap.activated) {
          const dist = distance(playerCenter, trapCenter);
          if (dist < (trap.triggerDistance || 100)) {
            trap.activated = true;
            setTimeout(() => {
              trap.isActive = true;
              trap.isHidden = false;
            }, trap.activationDelay || 200);
          }
        }
        
        // Update trap animations
        if (trap.type === 'swinging_blade') {
          trap.angle = (trap.angle || 0) + (trap.swingSpeed || 0.04);
        }
        
        if (trap.type === 'guillotine') {
          trap.timer = (trap.timer || 0) + 1;
          const cycle = trap.timer % 180;
          if (cycle < 30) {
            trap.y += trap.speed || 10;
          } else if (cycle > 150) {
            trap.y -= trap.speed || 10;
          }
        }
        
        if (trap.type === 'fire_burst') {
          trap.timer = (trap.timer || 0) + 1;
          trap.isActive = Math.floor(trap.timer / 60) % 2 === 0;
        }
        
        if (trap.type === 'falling_spike' && trap.activated && !trap.isActive) {
          trap.isActive = true;
        }
        if (trap.type === 'falling_spike' && trap.isActive) {
          trap.y += trap.speed || 8;
        }
        
        // Check trap collision
        if (trap.isActive && !trap.isHidden) {
          let trapRect = { x: trap.x, y: trap.y, width: trap.width, height: trap.height };
          
          // Adjust hitbox for swinging blades
          if (trap.type === 'swinging_blade') {
            const angle = trap.angle || 0;
            const bladeLength = trap.height;
            const bladeEndX = trap.x + Math.sin(angle) * bladeLength;
            const bladeEndY = trap.y + Math.cos(angle) * bladeLength;
            trapRect = {
              x: Math.min(trap.x, bladeEndX) - trap.width / 2,
              y: trap.y,
              width: Math.abs(bladeEndX - trap.x) + trap.width,
              height: bladeLength,
            };
          }
          
          const playerRect = { 
            x: newPosition.x, 
            y: newPosition.y, 
            width: PLAYER_WIDTH, 
            height: PLAYER_HEIGHT 
          };
          
          if (trap.type !== 'freeze_zone' && rectanglesIntersect(playerRect, trapRect)) {
            killPlayer();
            return;
          }
        }
      }
      
      // Check goal collision
      const playerRect = { 
        x: newPosition.x, 
        y: newPosition.y, 
        width: PLAYER_WIDTH, 
        height: PLAYER_HEIGHT 
      };
      if (rectanglesIntersect(playerRect, level.goalPosition)) {
        setEngineState(prev => ({
          ...prev,
          gameState: {
            ...prev.gameState,
            levelComplete: true,
          },
        }));
        return;
      }
      
      // Fall death
      if (newPosition.y > GAME_HEIGHT + 100) {
        killPlayer();
        return;
      }
      
      // Boundary checks
      newPosition.x = Math.max(0, newPosition.x);
      
      // Update camera
      const targetCameraX = newPosition.x - GAME_WIDTH / 3;
      const newCameraX = lerp(state.camera.x, targetCameraX, state.camera.smoothing);
      
      // Update animation
      if (animationTimer > 100) {
        animationFrame = (animationFrame + 1) % 4;
        animationTimer = 0;
      }
      
      // Update particles
      const updatedParticles = state.particles
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2,
          life: p.life - 1,
        }))
        .filter(p => p.life > 0);
      
      // Update screen shake
      let newShake = { ...state.screenShake };
      if (newShake.intensity > 0) {
        newShake.x = (Math.random() - 0.5) * newShake.intensity;
        newShake.y = (Math.random() - 0.5) * newShake.intensity;
        newShake.intensity *= 0.9;
        if (newShake.intensity < 0.5) {
          newShake = { x: 0, y: 0, intensity: 0 };
        }
      }
      
      setEngineState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          position: newPosition,
          velocity: { x: newVelocityX, y: newVelocityY },
          isGrounded,
          isJumping: !isGrounded && newVelocityY < 0,
          facingRight,
          animationFrame,
          animationTimer,
        },
        camera: {
          ...prev.camera,
          x: Math.max(0, newCameraX),
        },
        particles: updatedParticles,
        screenShake: newShake,
      }));
    };
    
    const render = (ctx: CanvasRenderingContext2D, state: GameEngineState, level: Level | null) => {
      // Clear canvas
      ctx.fillStyle = level?.backgroundColor || '#1a1a2e';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      if (!level) return;
      
      // Apply camera transform and screen shake
      ctx.save();
      ctx.translate(-state.camera.x + state.screenShake.x, state.screenShake.y);
      
      // Draw parallax background elements
      const theme = level.theme;
      drawBackground(ctx, theme, state.camera.x);
      
      // Draw platforms
      for (const platform of level.platforms) {
        if (platform.type === 'collapsing' && platform.isCollapsing && (platform.collapseTimer || 0) > COLLAPSE_DELAY) {
          continue;
        }
        if (platform.type === 'disappearing' && platform.isVisible === false) {
          continue;
        }
        
        let baseColor = COLORS[theme as keyof typeof COLORS] as any;
        if (!baseColor || typeof baseColor !== 'object' || !('platform' in baseColor)) {
          baseColor = { platform: '#4a4a4a', platformHighlight: '#6a6a6a' };
        }
        
        let highlightColor = baseColor.platformHighlight || '#6a6a6a';
        
        if (platform.type === 'ice') {
          baseColor = COLORS.ice.platform;
          highlightColor = COLORS.ice.platformHighlight;
        } else if (platform.type === 'lava') {
          baseColor = (COLORS.fire as any).lava || '#ff4500';
          highlightColor = (COLORS.fire as any).fire || '#ff8c00';
        }
        
        // Collapsing platform shake
        let offsetX = 0;
        if (platform.type === 'collapsing' && platform.isCollapsing) {
          offsetX = (Math.random() - 0.5) * 4;
        }
        
        // Disappearing platform fade
        let alpha = 1;
        if (platform.type === 'disappearing' && platform.hasBeenTouched) {
          alpha = 1 - ((platform.disappearTimer || 0) / DISAPPEAR_DELAY);
        }
        
        ctx.globalAlpha = alpha;
        drawPlatform(ctx, platform.x + offsetX, platform.y, platform.width, platform.height, 
          typeof baseColor === 'string' ? baseColor : '#4a4a4a', 
          typeof highlightColor === 'string' ? highlightColor : '#6a6a6a');
        ctx.globalAlpha = 1;
      }
      
      // Draw traps
      for (const trap of level.traps) {
        if (trap.isHidden) continue;
        
        if (trap.type === 'floor_spike' || trap.type === 'ceiling_spike' || trap.type === 'wall_spike' || trap.type === 'falling_spike') {
          const themeColors = COLORS[theme as keyof typeof COLORS] as any;
          const spikeColor = theme === 'fire' ? (COLORS.fire as any).accent : 
                            theme === 'ice' ? COLORS.ice.spike : 
                            COLORS.castle.spike;
          
          let direction: 'up' | 'down' | 'left' | 'right' = 'up';
          if (trap.type === 'ceiling_spike') direction = 'down';
          else if (trap.type === 'wall_spike') direction = trap.direction || 'right';
          
          drawSpike(ctx, trap.x, trap.y, trap.width, trap.height, spikeColor, direction);
        }
        
        if (trap.type === 'swinging_blade') {
          ctx.save();
          ctx.translate(trap.x, trap.y);
          ctx.rotate(trap.angle || 0);
          
          // Chain
          ctx.fillStyle = '#5c5c5c';
          ctx.fillRect(-2, 0, 4, trap.height - 20);
          
          // Blade
          ctx.fillStyle = '#c0c0c0';
          ctx.beginPath();
          ctx.moveTo(-15, trap.height - 30);
          ctx.lineTo(0, trap.height);
          ctx.lineTo(15, trap.height - 30);
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();
        }
        
        if (trap.type === 'guillotine') {
          // Chain
          ctx.fillStyle = '#5c5c5c';
          const chainTop = level.platforms.find(p => p.y < trap.y)?.y || 0;
          ctx.fillRect(trap.x + trap.width / 2 - 3, chainTop, 6, trap.y - chainTop);
          
          // Blade
          ctx.fillStyle = '#c0c0c0';
          ctx.fillRect(trap.x, trap.y, trap.width, trap.height * 0.3);
          
          // Sharp edge
          ctx.beginPath();
          ctx.moveTo(trap.x, trap.y + trap.height * 0.3);
          ctx.lineTo(trap.x + trap.width / 2, trap.y + trap.height);
          ctx.lineTo(trap.x + trap.width, trap.y + trap.height * 0.3);
          ctx.closePath();
          ctx.fill();
        }
        
        if (trap.type === 'fire_burst' && trap.isActive) {
          // Fire effect
          const gradient = ctx.createLinearGradient(trap.x, trap.y, trap.x, trap.y + trap.height);
          gradient.addColorStop(0, 'rgba(255, 100, 0, 0.9)');
          gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.7)');
          gradient.addColorStop(1, 'rgba(255, 50, 0, 0.3)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
          
          // Fire particles
          for (let i = 0; i < 5; i++) {
            const px = trap.x + Math.random() * trap.width;
            const py = trap.y + Math.random() * trap.height * 0.5;
            const size = Math.random() * 8 + 4;
            ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 0, ${Math.random() * 0.5 + 0.3})`;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        if (trap.type === 'freeze_zone') {
          ctx.fillStyle = 'rgba(150, 200, 255, 0.3)';
          ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
          
          // Ice particles
          ctx.fillStyle = 'rgba(200, 230, 255, 0.7)';
          for (let i = 0; i < 3; i++) {
            const px = trap.x + Math.random() * trap.width;
            const py = trap.y + Math.random() * trap.height;
            ctx.fillRect(px, py, 3, 3);
          }
        }
      }
      
      // Draw goal
      ctx.fillStyle = COLORS.goal;
      ctx.fillRect(level.goalPosition.x, level.goalPosition.y, level.goalPosition.width, level.goalPosition.height);
      
      // Goal flag
      ctx.fillStyle = '#8b0000';
      ctx.fillRect(level.goalPosition.x + 10, level.goalPosition.y - 60, 30, 25);
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(level.goalPosition.x + 8, level.goalPosition.y - 60, 4, 70);
      
      // Draw player
      drawPlayer(
        ctx, 
        state.player.position.x, 
        state.player.position.y, 
        PLAYER_WIDTH, 
        PLAYER_HEIGHT,
        state.player.facingRight,
        state.player.animationFrame,
        state.player.isDead
      );
      
      // Draw particles
      for (const particle of state.particles) {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      }
      ctx.globalAlpha = 1;
      
      ctx.restore();
    };
    
    const drawBackground = (ctx: CanvasRenderingContext2D, theme: string, cameraX: number) => {
      const parallaxOffset = cameraX * 0.3;
      
      if (theme === 'ice') {
        // Snowy mountains
        ctx.fillStyle = '#2a3a5a';
        for (let i = 0; i < 10; i++) {
          const x = i * 250 - parallaxOffset * 0.5;
          ctx.beginPath();
          ctx.moveTo(x, GAME_HEIGHT);
          ctx.lineTo(x + 125, GAME_HEIGHT - 200 - Math.random() * 100);
          ctx.lineTo(x + 250, GAME_HEIGHT);
          ctx.closePath();
          ctx.fill();
        }
        
        // Snow particles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
          const x = ((i * 47 + Date.now() * 0.02) % (GAME_WIDTH + 200)) - 100 + cameraX;
          const y = ((i * 31 + Date.now() * 0.05) % GAME_HEIGHT);
          ctx.fillRect(x - cameraX, y, 2, 2);
        }
      } else if (theme === 'castle') {
        // Castle walls
        ctx.fillStyle = '#2a2520';
        for (let i = 0; i < 15; i++) {
          const x = i * 180 - parallaxOffset * 0.3;
          ctx.fillRect(x, GAME_HEIGHT - 350, 60, 350);
          
          // Battlements
          for (let j = 0; j < 3; j++) {
            ctx.fillRect(x + j * 20, GAME_HEIGHT - 370, 15, 20);
          }
        }
        
        // Torches
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < 10; i++) {
          const x = i * 200 + 80 - parallaxOffset * 0.4;
          const flicker = Math.sin(Date.now() * 0.01 + i) * 3;
          ctx.beginPath();
          ctx.arc(x, GAME_HEIGHT - 280 + flicker, 8 + Math.random() * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (theme === 'fire') {
        // Volcanic rock formations
        ctx.fillStyle = '#1a0505';
        for (let i = 0; i < 12; i++) {
          const x = i * 200 - parallaxOffset * 0.4;
          ctx.beginPath();
          ctx.moveTo(x, GAME_HEIGHT);
          ctx.lineTo(x + 50, GAME_HEIGHT - 150);
          ctx.lineTo(x + 100, GAME_HEIGHT - 80);
          ctx.lineTo(x + 150, GAME_HEIGHT - 180);
          ctx.lineTo(x + 200, GAME_HEIGHT);
          ctx.closePath();
          ctx.fill();
        }
        
        // Lava glow at bottom
        const lavaGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 50, 0, GAME_HEIGHT);
        lavaGradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
        lavaGradient.addColorStop(1, 'rgba(255, 50, 0, 0.5)');
        ctx.fillStyle = lavaGradient;
        ctx.fillRect(-cameraX, GAME_HEIGHT - 50, GAME_WIDTH + cameraX * 2, 50);
        
        // Fire embers
        ctx.fillStyle = '#ff4400';
        for (let i = 0; i < 30; i++) {
          const x = ((i * 73 + Date.now() * 0.03) % (GAME_WIDTH + 400)) - 200 + cameraX;
          const y = GAME_HEIGHT - 50 - ((i * 41 + Date.now() * 0.08) % 150);
          const size = 2 + Math.random() * 3;
          ctx.globalAlpha = 0.5 + Math.random() * 0.5;
          ctx.fillRect(x - cameraX, y, size, size);
        }
        ctx.globalAlpha = 1;
      }
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [killPlayer]);
  
  return {
    canvasRef,
    engineState,
    startGame,
    nextLevel,
    restartLevel,
    restartGame,
  };
}
