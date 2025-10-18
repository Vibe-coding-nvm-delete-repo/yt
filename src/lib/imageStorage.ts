/**
 * Memory-efficient image storage using IndexedDB to avoid base64 data URL bloat.
 * Replaces direct localStorage usage for images with proper blob storage.
 */

import { now } from "@/utils/timeHelpers";

interface StoredImage {
  id: string;
  blob: Blob;
  url: string; // Blob URL for IMG src
  meta: {
    originalName: string;
    size: number;
    type: string;
    uploadedAt: number;
  };
}

class ImageStorage {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    try {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open("ImageToPromptImages", 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains("images")) {
            const store = db.createObjectStore("images", { keyPath: "id" });
            store.createIndex("uploadedAt", "meta.uploadedAt", {
              unique: false,
            });
            store.createIndex("size", "meta.size", { unique: false });
          }
        };
      });

      this.db = await this.dbPromise;
      return this.db;
    } catch (error) {
      console.error("Failed to initialize IndexedDB:", error);
      throw error;
    }
  }

  async storeImage(file: File, id: string): Promise<StoredImage> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["images"], "readwrite");
        const store = transaction.objectStore("images");

        const url = URL.createObjectURL(file);

        const storedImage: StoredImage = {
          id,
          blob: file,
          url,
          meta: {
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: now(),
          },
        };

        const request = store.add(storedImage);

        request.onsuccess = () => resolve(storedImage);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to store image:", error);
      throw error;
    }
  }

  async getImage(id: string): Promise<StoredImage | null> {
    try {
      const db = await this.initDB();

      return new Promise((resolve) => {
        const transaction = db.transaction(["images"], "readonly");
        const store = transaction.objectStore("images");
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error("Failed to get image:", error);
      return null;
    }
  }

  async getImageUrl(id: string): Promise<string | null> {
    try {
      const stored = await this.getImage(id);
      return stored?.url || null;
    } catch (error) {
      console.error("Failed to get image URL:", error);
      return null;
    }
  }

  async removeImage(id: string): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        // First get the stored image to revoke blob URL
        const getTransaction = db.transaction(["images"], "readonly");
        const getStore = getTransaction.objectStore("images");

        const getRequest = getStore.get(id);
        getRequest.onsuccess = () => {
          const storedImage = getRequest.result;
          if (storedImage) {
            URL.revokeObjectURL(storedImage.url);
          }

          // Then remove from IndexedDB
          const deleteTransaction = db.transaction(["images"], "readwrite");
          const deleteStore = deleteTransaction.objectStore("images");
          const deleteRequest = deleteStore.delete(id);

          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
      throw error;
    }
  }

  async listImages(): Promise<StoredImage[]> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["images"], "readonly");
        const store = transaction.objectStore("images");
        const index = store.index("uploadedAt");
        const request = index.openCursor(null, "prev"); // Most recent first

        const results: StoredImage[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to list images:", error);
      return [];
    }
  }

  async getTotalSize(): Promise<number> {
    try {
      const images = await this.listImages();
      return images.reduce((total, img) => total + img.meta.size, 0);
    } catch (error) {
      console.error("Failed to get total size:", error);
      return 0;
    }
  }

  async cleanup(maxSize: number = 50 * 1024 * 1024): Promise<void> {
    try {
      const totalSize = await this.getTotalSize();

      if (totalSize <= maxSize) return;

      const images = await this.listImages();

      // Remove oldest images until under limit
      for (const img of images.slice().reverse()) {
        if ((await this.getTotalSize()) <= maxSize) break;
        await this.removeImage(img.id);
      }
    } catch (error) {
      console.error("Failed to cleanup images:", error);
      // Don't throw - cleanup failures shouldn't block the app
    }
  }

  // Fallback for base64 data URLs (migration helper)
  static migrateBase64ToBlob(
    base64Data: string,
    filename: string,
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      fetch(base64Data)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], filename, { type: blob.type });
          resolve(file);
        })
        .catch(reject);
    });
  }

  // Memory monitoring
  getEstimatedMemoryUsage(): Promise<{ indexedDB: number; blobUrls: number }> {
    return Promise.all([this.getTotalSize(), this.listImages()]).then(
      ([dbSize, images]) => {
        // Estimate Blob URL memory (rough heuristic: ~2x blob size for V8 overhead)
        const blobUrlMemory = images.length * 1000; // Estimate 1KB per blob URL
        return {
          indexedDB: dbSize,
          blobUrls: blobUrlMemory,
        };
      },
    );
  }
}

export const imageStorage = new ImageStorage();
