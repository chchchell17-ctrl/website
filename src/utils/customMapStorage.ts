// Lightweight IndexedDB storage for an optional custom animated GIF or MP4/WebM town map
// selected directly in the browser (bypasses chat image-upload format restrictions).

const DB_NAME = 'ddw_custom_media_db';
const STORE_NAME = 'map_media';
const MEDIA_KEY = 'active_town_map';

export interface CustomMapMedia {
  url: string;
  mimeType: string;
  fileName: string;
}

interface StoredMapRecord {
  blob: Blob;
  mimeType: string;
  fileName: string;
  savedAt: number;
}

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open media storage'));
  });
}

export async function saveCustomMapFile(file: File): Promise<CustomMapMedia> {
  const db = await openMediaDb();
  const record: StoredMapRecord = {
    blob: file,
    mimeType: file.type || (file.name.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/gif'),
    fileName: file.name,
    savedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record, MEDIA_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error('Could not save map media'));
  });

  return {
    url: URL.createObjectURL(file),
    mimeType: record.mimeType,
    fileName: record.fileName,
  };
}

export async function loadCustomMapMedia(): Promise<CustomMapMedia | null> {
  try {
    const db = await openMediaDb();
    const record = await new Promise<StoredMapRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(MEDIA_KEY);
      req.onsuccess = () => resolve(req.result as StoredMapRecord | undefined);
      req.onerror = () => reject(req.error ?? new Error('Could not read map media'));
    });

    if (!record || !record.blob) return null;
    return {
      url: URL.createObjectURL(record.blob),
      mimeType: record.mimeType,
      fileName: record.fileName,
    };
  } catch {
    return null;
  }
}

export async function clearCustomMapMedia(): Promise<void> {
  try {
    const db = await openMediaDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(MEDIA_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error ?? new Error('Could not clear map media'));
    });
  } catch {
    // Ignore cleanup errors
  }
}
