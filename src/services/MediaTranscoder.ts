/**
 * MediaTranscoder Service
 * High-performance, client-side video frame extractor and WebP sequence/spritesheet compiler.
 * Utilizes HTML5 Canvas API and Promise-based HTMLVideoElement scrubbing.
 */

export interface TranscoderProgress {
  progress: number;
  currentFrame: number;
  totalFrames: number;
  statusText: string;
}

export interface TranscodeOptions {
  videoUrl: string;
  startFrame: number;
  endFrame: number;
  frameStep: number; // Capture every Nth frame (e.g. 15 frames/sec)
  quality: number; // 20 - 100
  scale: number; // 10 - 100 (percentage)
  gridCols?: number; // columns layout if compiling spritesheet
  onProgress: (progress: TranscoderProgress) => void;
}

export interface TranscodeResult {
  frames: string[]; // Sequence of WebP base64 frame links
  spritesheetUrl?: string; // Compiled high-performance single grid spritesheet
  spritesheetLayout?: {
    cols: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    totalFrames: number;
  };
}

export class MediaTranscoder {
  /**
   * Processes a video file via standard canvas context buffering to produce highly optimized WebP frames.
   */
  static async transcode(options: TranscodeOptions): Promise<TranscodeResult> {
    const {
      videoUrl,
      startFrame,
      endFrame,
      frameStep = 1,
      quality = 80,
      scale = 50,
      gridCols = 4,
      onProgress,
    } = options;

    return new Promise((resolve, reject) => {
      // Create off-screen video element
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous'; // Support CORS for remote sandbox assets

      // Define standard Remotion Studio 30 FPS boundary mapping
      const fps = 30;
      const startSec = startFrame / fps;
      const endSec = endFrame / fps;

      // Handle loading Errors
      video.onerror = (e) => {
        reject(new Error(`Failed to load raw video source for transcoding sequence: ${e}`));
      };

      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration;
          const videoWidth = video.videoWidth || 640;
          const videoHeight = video.videoHeight || 360;

          // Compute bounded start and end seconds
          const actualStartSec = Math.max(0, Math.min(startSec, duration));
          const actualEndSec = Math.max(actualStartSec, Math.min(endSec, duration));
          const totalDurationSec = actualEndSec - actualStartSec;

          // Frame calculations
          const framesToExtract: number[] = [];
          for (let f = startFrame; f <= endFrame; f += frameStep) {
            framesToExtract.push(f);
          }

          if (framesToExtract.length === 0) {
            framesToExtract.push(startFrame);
          }

          const totalFrames = framesToExtract.length;
          const extractedFrames: string[] = [];

          // Create off-screen drawing canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not instantiate 2D rendering buffer context for frame extraction.');
          }

          // Calculate scaled width and height details
          const outputWidth = Math.max(16, Math.round(videoWidth * (scale / 100)));
          const outputHeight = Math.max(16, Math.round(videoHeight * (scale / 100)));
          canvas.width = outputWidth;
          canvas.height = outputHeight;

          onProgress({
            progress: 5,
            currentFrame: 0,
            totalFrames,
            statusText: `Allocated browser buffer memory for ${totalFrames} frames [Resolution: ${outputWidth}x${outputHeight}]`,
          });

          // Process synchronous seeking loops with canvas grabs
          for (let i = 0; i < totalFrames; i++) {
            const frameNum = framesToExtract[i];
            const targetTime = frameNum / fps;

            // Perform seek operation
            await new Promise<void>((seekResolve, seekReject) => {
              const handleSeeked = () => {
                video.removeEventListener('seeked', handleSeeked);
                seekResolve();
              };
              video.addEventListener('seeked', handleSeeked);
              video.currentTime = targetTime;

              // Fallback safety timeout for stuck seeking
              setTimeout(() => {
                video.removeEventListener('seeked', handleSeeked);
                seekResolve();
              }, 600);
            });

            // Draw current seek slice onto clean canvas layer
            ctx.clearRect(0, 0, outputWidth, outputHeight);
            ctx.drawImage(video, 0, 0, outputWidth, outputHeight);

            // Compress to high-density WebP stream
            const frameWebp = canvas.toDataURL('image/webp', quality / 100);
            extractedFrames.push(frameWebp);

            const progressPct = Math.round(5 + ((i + 1) / totalFrames) * 80);
            onProgress({
              progress: progressPct,
              currentFrame: i + 1,
              totalFrames,
              statusText: `Captured frame #${frameNum} (${i + 1}/${totalFrames}) at ${outputWidth}x${outputHeight} WebP format`,
            });
          }

          // Optional Step: Merge extracted frames sequence into a singular custom Grid Spritesheet WebP asset
          let spritesheetUrl: string | undefined;
          let spritesheetLayout: any;

          if (extractedFrames.length > 0) {
            onProgress({
              progress: 90,
              currentFrame: totalFrames,
              totalFrames,
              statusText: `Consolidating frames array into composite CapCut hover-scrub canvas layout...`,
            });

            const rows = Math.ceil(totalFrames / gridCols);
            const sheetCanvas = document.createElement('canvas');
            sheetCanvas.width = outputWidth * gridCols;
            sheetCanvas.height = outputHeight * rows;
            const sheetCtx = sheetCanvas.getContext('2d');

            if (sheetCtx) {
              sheetCtx.fillStyle = 'rgba(0,0,0,0)';
              sheetCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

              // Draw each frame index into grid coords position
              for (let i = 0; i < extractedFrames.length; i++) {
                const img = new Image();
                img.src = extractedFrames[i];
                await new Promise<void>((imgResolve) => {
                  img.onload = () => {
                    const col = i % gridCols;
                    const row = Math.floor(i / gridCols);
                    sheetCtx.drawImage(
                      img,
                      col * outputWidth,
                      row * outputHeight,
                      outputWidth,
                      outputHeight
                    );
                    imgResolve();
                  };
                  img.onerror = () => imgResolve(); // continue on bad frames
                });
              }

              spritesheetUrl = sheetCanvas.toDataURL('image/webp', quality / 100);
              spritesheetLayout = {
                cols: gridCols,
                rows,
                cellWidth: outputWidth,
                cellHeight: outputHeight,
                totalFrames: extractedFrames.length,
              };
            }
          }

          onProgress({
            progress: 100,
            currentFrame: totalFrames,
            totalFrames,
            statusText: `Successfully compiled the asset in local stream memory buffers.`,
          });

          resolve({
            frames: extractedFrames,
            spritesheetUrl,
            spritesheetLayout,
          });
        } catch (err) {
          reject(err);
        }
      };
    });
  }
}
