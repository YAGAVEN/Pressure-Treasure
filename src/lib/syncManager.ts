/**
 * Sync manager for handling offline-to-online data reconciliation
 */

import { Room, Player } from '@/types/game';

interface PendingChange {
  id: string;
  type: 'room' | 'player';
  action: 'create' | 'update' | 'delete';
  data: Room | Player;
  timestamp: number;
}

const PENDING_CHANGES_KEY = 'pending_changes';

export class SyncManager {
  private pendingChanges: PendingChange[] = [];

  constructor() {
    this.loadPendingChanges();
  }

  /**
   * Add a pending change
   */
  addPendingChange(
    type: 'room' | 'player',
    action: 'create' | 'update' | 'delete',
    data: Room | Player
  ) {
    const change: PendingChange = {
      id: `${type}_${action}_${Date.now()}`,
      type,
      action,
      data,
      timestamp: Date.now(),
    };

    this.pendingChanges.push(change);
    this.savePendingChanges();
  }

  /**
   * Get all pending changes
   */
  getPendingChanges(): PendingChange[] {
    return [...this.pendingChanges];
  }

  /**
   * Remove a pending change after successful sync
   */
  removePendingChange(id: string) {
    this.pendingChanges = this.pendingChanges.filter(c => c.id !== id);
    this.savePendingChanges();
  }

  /**
   * Clear all pending changes
   */
  clearPendingChanges() {
    this.pendingChanges = [];
    localStorage.removeItem(PENDING_CHANGES_KEY);
  }

  /**
   * Check if there are pending changes
   */
  hasPendingChanges(): boolean {
    return this.pendingChanges.length > 0;
  }

  /**
   * Get pending changes by type
   */
  getPendingChangesByType(type: 'room' | 'player'): PendingChange[] {
    return this.pendingChanges.filter(c => c.type === type);
  }

  /**
   * Save pending changes to storage
   */
  private savePendingChanges() {
    try {
      localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(this.pendingChanges));
    } catch (err) {
      console.error('Failed to save pending changes:', err);
    }
  }

  /**
   * Load pending changes from storage
   */
  private loadPendingChanges() {
    try {
      const stored = localStorage.getItem(PENDING_CHANGES_KEY);
      if (stored) {
        this.pendingChanges = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load pending changes:', err);
    }
  }
}

export const syncManager = new SyncManager();
