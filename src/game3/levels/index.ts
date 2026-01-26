import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { Level } from '../types';

export const levels: Level[] = [level1, level2, level3];

export function getLevel(id: number): Level | undefined {
  return levels.find(level => level.id === id);
}

export { level1, level2, level3 };
