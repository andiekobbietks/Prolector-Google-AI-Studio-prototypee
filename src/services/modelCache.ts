/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ModelCache Service
 * Manages Origin Private File System (OPFS) checks, writes, downloads, and deletions
 * of ONNX models (e.g. Florence-2, EmbeddingGemma, Whisper-Tiny) for offline/local runtimes.
 */
export class ModelCache {
  /**
   * Check if a given model file is physically cached inside the OPFS directory.
   */
  static async checkModelCached(fileName: string): Promise<boolean> {
    try {
      if (!navigator.storage || !navigator.storage.getDirectory) {
        console.warn("[ModelCache] Origin Private File System is not supported in this frame context.");
        return false;
      }
      const root = await navigator.storage.getDirectory();
      // attempt to get the file handle to check existence
      await root.getFileHandle(fileName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a cached model file from the OPFS workspace.
   */
  static async deleteModel(fileName: string): Promise<boolean> {
    try {
      if (!navigator.storage || !navigator.storage.getDirectory) {
        return false;
      }
      const root = await navigator.storage.getDirectory();
      await root.removeEntry(fileName);
      console.log(`[ModelCache] Deleted cached model: ${fileName}`);
      return true;
    } catch (err) {
      console.error(`[ModelCache] Failed to delete cached model ${fileName}:`, err);
      return false;
    }
  }

  /**
   * Fetches a cached model's binary data if exists.
   */
  static async getModelData(fileName: string): Promise<ArrayBuffer | null> {
    try {
      if (!navigator.storage || !navigator.storage.getDirectory) {
        return null;
      }
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const data = await file.arrayBuffer();
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Downloads deep learning parameters from an external HTTP endpoint
   * progressively reporting percentages to the onProgress callback, and registers the binary inside OPFS.
   */
  static async downloadAndStoreModel(
    fileName: string,
    url: string,
    onProgress: (progress: number) => void
  ): Promise<boolean> {
    try {
      if (!navigator.storage || !navigator.storage.getDirectory) {
        throw new Error("Origin Private File System is not supported.");
      }

      if (await this.checkModelCached(fileName)) {
        console.log(`[ModelCache] Model ${fileName} is already cached. Skipping download.`);
        onProgress(100);
        return true;
      }

      console.log(`[ModelCache] Initializing persistent OPFS download stream for ${fileName} from ${url}...`);

      const response = await fetch(url);
      if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch model from ${url}: ${response.statusText}`);
      }

      const contentLength = Number(response.headers.get('Content-Length')) || 0;
      const reader = response.body.getReader();
      
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();

      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        await writable.write(value);
        receivedLength += value.length;
        
        if (contentLength > 0) {
          const progress = Math.round((receivedLength / contentLength) * 100);
          onProgress(progress);
        } else {
          // If we don't know the full length, just report a generic progressing number
          onProgress(99); 
        }
      }

      await writable.close();
      onProgress(100);

      console.log(`[ModelCache] Stored model ${fileName} inside persistent OPFS directory successfully.`);
      return true;
    } catch (err) {
      console.error(`[ModelCache] Failed to download or write model ${fileName}:`, err);
      // Attempt to clean up partial file
      await this.deleteModel(fileName).catch(() => {});
      return false;
    }
  }

  /**
   * Inspect the caching status of multiple models in one clean batch call.
   */
  static async getCacheStatuses(modelNames: string[]): Promise<Record<string, "Cached" | "Not Cached">> {
    const statuses: Record<string, "Cached" | "Not Cached"> = {};
    for (const name of modelNames) {
      const isCached = await this.checkModelCached(name);
      statuses[name] = isCached ? "Cached" : "Not Cached";
    }
    return statuses;
  }
}
