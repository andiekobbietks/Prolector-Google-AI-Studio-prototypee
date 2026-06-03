/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GripHorizontal,
  Film,
  Layers,
  Clock,
  Sparkles,
  Info,
  Trash2,
  ChevronRight,
  Eye,
  Sliders,
  Settings,
  HelpCircle,
  Database,
  Grid
} from "lucide-react";
import { Scene } from "../types";
import DanceMotionAnalyzer from "./DanceMotionAnalyzer";

interface RichScene extends Scene {
  frameUrl?: string;
  embedding?: number[];
  similarityScore?: number;
}

interface SceneStudioAssetPanelProps {
  scenes: RichScene[];
  setScenes: React.Dispatch<React.SetStateAction<RichScene[]>>;
  activePreview: RichScene | null;
  setActivePreview: (scene: RichScene | null) => void;
  droppedVideoUrl?: string | null; // Real source video url passed from SceneStudio
  addLog?: (message: string) => void; // Optional log helper
  highlightedSceneIds?: string[]; // IDs of scenes matching the active search
}

function useHoverPlay(startMs: number, endMs: number, isHovered: boolean) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [currentProgressPct, setCurrentProgressPct] = useState(0);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startSec = startMs / 1000;
    const endSec = endMs / 1000;
    const duration = endSec - startSec;

    const handleTimeUpdate = () => {
      if (duration > 0) {
        const pct = Math.min(100, Math.max(0, ((video.currentTime - startSec) / duration) * 100));
        setCurrentProgressPct(pct);
      }
      
      if (video.currentTime >= endSec || video.currentTime < startSec) {
        video.currentTime = startSec;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    if (isHovered) {
      if (video.paused) {
        video.currentTime = startSec;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    } else {
      video.pause();
      video.currentTime = startSec;
      setCurrentProgressPct(0);
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isHovered, startMs, endMs]);

  return { videoRef, currentProgressPct };
}

function ActiveVideoThumbnail({
  videoUrl,
  startMs,
  endMs,
  isHovered,
  className
}: {
  videoUrl: string;
  startMs: number;
  endMs: number;
  isHovered: boolean;
  className?: string;
}) {
  const { videoRef } = useHoverPlay(startMs, endMs, isHovered);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      muted
      loop
      playsInline
      className={className || "w-full h-full object-cover select-none pointer-events-none"}
    />
  );
}

function ActiveMetadataInspector({
  scene,
  droppedVideoUrl
}: {
  scene: RichScene;
  droppedVideoUrl: string | null;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { videoRef, currentProgressPct } = useHoverPlay(scene.startMs, scene.endMs, isHovered);

  const formatTime = (ms: number) => {
    const totalSecs = ms / 1000;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const decs = Math.floor((ms % 1000) / 10);
    return (
      mins.toString().padStart(2, "0") +
      ":" +
      secs.toString().padStart(2, "0") +
      "." +
      decs.toString().padStart(2, "0")
    );
  };

  return (
    <div 
      className="bg-[#03080f] rounded-lg border border-slate-850 p-4 grid grid-cols-1 md:grid-cols-12 gap-5 transition-colors duration-300 hover:border-emerald-500/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="md:col-span-4 rounded overflow-hidden aspect-video relative bg-slate-950 border border-slate-900 group">
        {droppedVideoUrl ? (
          <video
            ref={videoRef}
            src={droppedVideoUrl}
            muted
            loop
            playsInline
            className={`w-full h-full object-cover transition-opacity ${isHovered ? 'opacity-100' : 'opacity-80'}`}
          />
        ) : scene.frameUrl ? (
          <img
            src={scene.frameUrl}
            alt={scene.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600">
            <Film className="w-8 h-8 opacity-40" />
          </div>
        )}
        
        {droppedVideoUrl && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800 z-30">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-150"
              style={{ width: `${currentProgressPct}%` }}
            />
          </div>
        )}
        
        <div className="absolute inset-x-2 bottom-2 font-mono text-[7px] text-slate-400 bg-slate-950/90 py-0.5 px-1.5 rounded border border-slate-850 flex justify-between z-40 block">
          <span>{droppedVideoUrl ? "WEBM_NATIVE_PLAYBACK" : "WEBP_STAGED_MUTABLE"}</span>
          {isHovered && <span className="text-emerald-400">PLAYING</span>}
        </div>
      </div>

      <div className="md:col-span-8 flex flex-col justify-between font-mono text-[10px] gap-2 leading-relaxed">
        <div className="space-y-1">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
            <h4 className="text-xs font-black text-[#f97316] uppercase truncate pr-2 max-w-[200px]">
              {scene.title}
            </h4>
            <span className="text-[8.5px] bg-slate-900 px-2 py-0.5 border border-slate-850 rounded text-slate-500">
              ID: {scene.id.substring(0, 15)}
            </span>
          </div>
          <p className="text-[9px] text-slate-300 font-mono mt-2 leading-relaxed">
            <span className="text-[#f97316] font-bold">SEMANTIC ACTION:</span> {scene.description}
          </p>
          
          <DanceMotionAnalyzer
            description={scene.description}
            progressPct={currentProgressPct}
            isHovered={isHovered}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2 border-t border-slate-900/60 pt-2 text-[9px] text-slate-400">
          <div>
            <span className="text-slate-500 uppercase block font-bold text-[8px]">In / Out Codes:</span>
            <span>{formatTime(scene.startMs)} — {formatTime(scene.endMs)}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase block font-bold text-[8px]">Index Coordinates:</span>
            <span className="text-emerald-400 font-bold uppercase">768-D Space Grotesk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SceneStudioAssetPanel({
  scenes,
  setScenes,
  activePreview,
  setActivePreview,
  droppedVideoUrl = null,
  addLog = () => {},
  highlightedSceneIds = []
}: SceneStudioAssetPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredClipId, setHoveredClipId] = useState<string | null>(null);
  
  // Settings Mode
  const [magneticMode, setMagneticMode] = useState<boolean>(true);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Format Milliseconds into readable track progress e.g. 01:24.03
  const formatTime = (ms: number) => {
    const totalSecs = ms / 1000;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const decs = Math.floor((ms % 1000) / 10);
    return (
      mins.toString().padStart(2, "0") +
      ":" +
      secs.toString().padStart(2, "0") +
      "." +
      decs.toString().padStart(2, "0")
    );
  };

  // Drag-and-drop reordering logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    
    // Create a ghost image / styling bypass if needed
    const dragImg = new Image();
    dragImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(dragImg, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setHoveredIndex(index);
  };

  const handleDragLeave = () => {
    setHoveredIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setHoveredIndex(null);
      return;
    }

    const reordered = [...scenes];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    let updated = reordered;
    if (magneticMode) {
      // Re-calculate the continuous sequence timeline tracking end-to-end
      let prevEnd = 0;
      updated = reordered.map((scene) => {
        const duration = scene.endMs - scene.startMs;
        const nextStart = prevEnd;
        const nextEnd = prevEnd + duration;
        prevEnd = nextEnd;
        return {
          ...scene,
          startMs: nextStart,
          endMs: nextEnd
        };
      });
      addLog(`⚡ Magnetic Re-aligner: Moved segment #${draggedIndex + 1} to position #${targetIndex + 1} and re-timed coordinates.`);
    } else {
      addLog(`⚡ Ordered sequence updated: Moved segment #${draggedIndex + 1} to position #${targetIndex + 1} (Timeline bounds unaltered).`);
    }

    setScenes(updated);
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  // Adjust duration ripple helper
  const handleDurationChange = (sceneId: string, durationSec: number) => {
    const valueMs = Math.max(500, Math.round(durationSec * 1000));
    const reordered = scenes.map((s) => {
      if (s.id === sceneId) {
        return { ...s, endMs: s.startMs + valueMs };
      }
      return s;
    });

    let updated = reordered;
    if (magneticMode) {
      let prevEnd = 0;
      updated = reordered.map((scene) => {
        const duration = scene.endMs - scene.startMs;
        const nextStart = prevEnd;
        const nextEnd = prevEnd + duration;
        prevEnd = nextEnd;
        return {
          ...scene,
          startMs: nextStart,
          endMs: nextEnd
        };
      });
    }

    setScenes(updated);
  };

  const selectedScene = scenes.find(s => s.id === selectedAssetId) || scenes[0];

  return (
    <div id="scene-studio-asset-panel" className="bg-[#050e1a]/95 border border-slate-800 rounded-xl p-5 mb-8 animate-fade-in text-[#fafafa] font-sans">
      
      {/* Upper header controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-3.5 mb-5 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#f97316]" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider font-mono">
            Somatic Active Timeline & Transcoded Asset Panel
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Magnet Auto-Snap config switcher */}
          <div className="flex items-center gap-2 bg-[#03080f] border border-slate-850 rounded px-2.5 py-1 text-[9px] font-mono font-bold text-slate-400">
            <span>MAGNET TIMELINE (ADR-011):</span>
            <button
              onClick={() => setMagneticMode(!magneticMode)}
              className={`px-2 py-0.5 rounded font-black cursor-pointer transition-colors ${
                magneticMode ? "bg-[#f97316] text-[#050e1a]" : "bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200"
              }`}
            >
              {magneticMode ? "MAGNET ACTIVE" : "OFF (DRAFT)"}
            </button>
          </div>

          <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-1 rounded font-mono font-bold uppercase shrink-0">
            {scenes.length} Timeline segments
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-mono mb-4 leading-normal">
        💡 Grab elements in the timeline rail below to visually reorder choreography sequence tracks. Under Magnet Mode, clip durations remain strictly locked while timestamps dynamically align end-to-end.
      </p>

      {/* PRIMARY HORIZONTAL TIMELINE RAIL */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 mb-2 uppercase select-none tracking-widest font-black">
          <span>Track V1 (Visual Assets Sequence)</span>
          <span>Magnetic Target Head: {formatTime(scenes.reduce((sum, s) => sum + (s.endMs - s.startMs), 0))}</span>
        </div>

        {/* TIMELINE TRACK RAIL SCROLL BAR CONTAINER */}
        <div className="timeline-rail-scroll flex items-stretch gap-2.5 bg-slate-950/80 rounded-lg p-3.5 border border-slate-900 overflow-x-auto min-h-[120px] select-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {scenes.map((scene, index) => {
              const isDragging = draggedIndex === index;
              const isHovered = hoveredIndex === index;
              const isActive = activePreview?.id === scene.id;

              return (
                <motion.div
                  key={scene.id}
                  id={`timeline-clip-${scene.id}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  layoutId={`timeline-anim-${scene.id}`}
                  className={`relative shrink-0 flex flex-col justify-between w-48 bg-[#040c16] rounded border p-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                    isDragging
                      ? "border-orange-500 opacity-30 bg-orange-500/5 rotate-2"
                      : highlightedSceneIds.length > 0 && !highlightedSceneIds.includes(scene.id)
                      ? "opacity-20 border-slate-850 saturate-0 scale-95 pointer-events-none"
                      : highlightedSceneIds.includes(scene.id)
                      ? "border-emerald-500 bg-[#061814] shadow-emerald-500/10 shadow-lg ring-1 ring-emerald-500"
                      : isHovered
                      ? "border-orange-400 scale-[1.01] bg-[#0c1b2f] ring-2 ring-[#f97316]/20"
                      : isActive
                      ? "border-[#f97316] bg-[#08182c] shadow-lg shadow-orange-500/5"
                      : "border-slate-850 hover:border-slate-750 hover:bg-[#071325]"
                  }`}
                >
                  {/* Visual Indicator of Hover insertion coordinates */}
                  {isHovered && draggedIndex !== index && (
                    <div className="absolute inset-y-0 -left-1.5 w-1 bg-[#f97316] rounded animate-pulse z-40" />
                  )}

                  {/* Header metadata tag */}
                  <div className="flex items-center justify-between font-mono text-[8px] mb-2 text-slate-400">
                    <span className="font-extrabold truncate text-[#fafafa] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] bg-orange-500 focus:outline-none" />
                      #{index + 1}
                    </span>
                    <span className="text-slate-500 bg-[#020612] px-1 py-0.2 rounded border border-slate-900 focus:outline-none text-[7.5px]">
                      {( (scene.endMs - scene.startMs)/1000 ).toFixed(1)}s
                    </span>
                  </div>

                  {/* Tags for rapid scene recognition via Florence-2 */}
                  <div className="mb-2">
                    <DanceMotionAnalyzer description={scene.description} compact={true} />
                  </div>

                  {/* Visual thumbnail frame area */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePreview(scene);
                      setSelectedAssetId(scene.id);
                    }}
                    onMouseEnter={() => setHoveredClipId(scene.id)}
                    onMouseLeave={() => setHoveredClipId(null)}
                    className="relative w-full aspect-[16/10] rounded bg-[#01060e] overflow-hidden flex items-center justify-center cursor-pointer border border-slate-900 group"
                  >
                    {droppedVideoUrl ? (
                      <ActiveVideoThumbnail
                        videoUrl={droppedVideoUrl}
                        startMs={scene.startMs}
                        endMs={scene.endMs}
                        isHovered={hoveredClipId === scene.id}
                      />
                    ) : scene.frameUrl ? (
                      <img
                        src={scene.frameUrl}
                        alt="Segment Keyframe"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-[#f97316] group-hover:border-[#f97316]/30 transition-colors">
                        <Film className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="absolute top-1 right-1 bg-black/60 border border-slate-900 p-0.5 rounded focus:outline-none cursor-grab active:cursor-grabbing select-none hover:scale-105 transition-transform z-30">
                      <GripHorizontal className="w-2.5 h-2.5 text-slate-400" />
                    </div>

                    {/* Timeline head marker */}
                    <div className="absolute bottom-1 inset-x-1.5 text-[7px] font-mono text-slate-400 bg-slate-950/90 py-0.5 px-1 rounded border border-slate-900/60 flex items-center justify-between pointer-events-none z-30">
                      <span>STRETCH</span>
                      <span>{formatTime(scene.startMs)}</span>
                    </div>

                    <div className="absolute inset-0 bg-slate-950/70 text-[9px] uppercase font-mono font-bold tracking-wider text-[#f97316] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-20">
                      Select Segment
                    </div>
                  </div>

                  {/* Inner title label */}
                  <div className="mt-2.5 pt-2 border-t border-slate-850/60">
                    <p className="font-mono text-[9px] font-black text-[#fafafa] truncate pr-1" title={scene.title}>
                      {scene.title}
                    </p>
                    <p className="text-[7.5px] font-mono text-slate-500 leading-normal mt-0.5 truncate">
                      T: {formatTime(scene.startMs)} - {formatTime(scene.endMs)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* METADATA INSPECTOR VIEWPORT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-slate-850">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#f97316]" /> Dynamic Semantic Asset Metadata
            </span>
          </div>

          {selectedScene ? (
            <ActiveMetadataInspector scene={selectedScene} droppedVideoUrl={droppedVideoUrl} />
          ) : (
            <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center text-slate-500 font-mono text-xs">
              Select or activate a clip preview from the timeline rail to view detailed metadata coordinates.
            </div>
          )}
        </div>

        {/* Storyboard Settings Slider Panel */}
        <div className="lg:col-span-4 bg-[#03080f] rounded-lg border border-slate-850 p-4 flex flex-col justify-between">
          <div className="space-y-3 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2 text-[#f97316]">
              <Sliders className="w-3.5 h-3.5" />
              <span className="font-extrabold uppercase">TIMELINE EDITING CONTROLS</span>
            </div>

            {selectedScene ? (
              <div className="space-y-3.5 mt-2">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1 font-bold">
                    <span>CLIP DURATION STRETCH:</span>
                    <span className="text-[#fafafa] font-extrabold">
                      {( (selectedScene.endMs - selectedScene.startMs)/1000 ).toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={15.0}
                    step={0.5}
                    value={(selectedScene.endMs - selectedScene.startMs) / 1000}
                    onChange={(e) => handleDurationChange(selectedScene.id, Number(e.target.value))}
                    className="w-full accent-[#f97316] bg-slate-950 h-1 rounded cursor-pointer border border-slate-900"
                  />
                  <div className="flex justify-between text-[7.5px] text-slate-500 mt-1">
                    <span>0.5s (SNAP)</span>
                    <span>15.0s (EXTENDED)</span>
                  </div>
                </div>

                <div className="bg-[#020612] p-2.5 rounded border border-slate-900 text-[8px] text-slate-400 leading-relaxed uppercase space-y-1">
                  <div className="flex justify-between">
                    <span>ENCODING RESOLUTION:</span>
                    <span className="text-emerald-400 font-bold">480x270 PX</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STAGED MEMORY CHOSEN:</span>
                    <span className="text-sky-400 font-bold">WebP Frame Array</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ESTIMATED PAYLOAD:</span>
                    <span className="text-[#f97316] font-bold">~14.5 KB</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[9px] text-slate-500 py-3 leading-relaxed">
                Activate a clip above to adjust timing or stretch frame durations.
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4 font-mono">
            <button
              onClick={() => {
                if (selectedScene) {
                  setScenes(prev => prev.filter(s => s.id !== selectedScene.id));
                  addLog(`🗑️ Deleted asset clip track item "${selectedScene.title}"`);
                  setSelectedAssetId(null);
                }
              }}
              disabled={!selectedScene}
              className="flex-1 py-2 border border-red-900/40 hover:border-red-500 hover:text-red-400 text-red-500 bg-red-950/10 hover:bg-red-500/10 cursor-pointer text-[9px] uppercase font-bold rounded flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3 h-3" />
              Delete segment
            </button>
            <button
              onClick={() => {
                if (selectedScene) {
                  setActivePreview(selectedScene);
                  addLog(`🔎 Previewing chronological coordinates for "${selectedScene.title}"`);
                }
              }}
              disabled={!selectedScene}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 cursor-pointer text-[9px] uppercase font-bold rounded flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Eye className="w-3 h-3" />
              Focus frame
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
