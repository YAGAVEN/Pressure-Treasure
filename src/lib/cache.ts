/**
 * IndexedDB cache for offline support and better performance
 */

const DB_NAME = 'PressureTreasure';
const DB_VERSION = 1;

const STORES = {
  rooms: 'rooms',
  players: 'players',
  sessions: 'sessions',
};

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initializeDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.rooms)) {
        database.createObjectStore(STORES.rooms, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.players)) {
        database.createObjectStore(STORES.players, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.sessions)) {
        database.createObjectStore(STORES.sessions, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save data to cache
 */
export async function saveToCache<T extends { id: string }>(
  store: keyof typeof STORES,
  data: T | T[]
): Promise<void> {
  const database = await initializeDB();
  const transaction = database.transaction([STORES[store]], 'readwrite');
  const objectStore = transaction.objectStore(STORES[store]);

  const items = Array.isArray(data) ? data : [data];
  items.forEach(item => objectStore.put(item));

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Get data from cache
 */
export async function getFromCache<T>(
  store: keyof typeof STORES,
  key?: string
): Promise<T | T[] | null> {
  const database = await initializeDB();
  const transaction = database.transaction([STORES[store]], 'readonly');
  const objectStore = transaction.objectStore(STORES[store]);

  return new Promise((resolve, reject) => {
    const request = key ? objectStore.get(key) : objectStore.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Clear cache
 */
export async function clearCache(store?: keyof typeof STORES): Promise<void> {
  const database = await initializeDB();

  if (store) {
    const transaction = database.transaction([STORES[store]], 'readwrite');
    const objectStore = transaction.objectStore(STORES[store]);
    objectStore.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Clear all stores
  const stores = Object.values(STORES);
  const transaction = database.transaction(stores, 'readwrite');

  stores.forEach(storeName => {
    transaction.objectStore(storeName).clear();
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Delete specific item from cache
 */
export async function deleteFromCache(
  store: keyof typeof STORES,
  key: string
): Promise<void> {
  const database = await initializeDB();
  const transaction = database.transaction([STORES[store]], 'readwrite');
  const objectStore = transaction.objectStore(STORES[store]);
  objectStore.delete(key);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
