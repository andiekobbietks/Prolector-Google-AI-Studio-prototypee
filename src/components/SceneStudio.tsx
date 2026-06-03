/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Scene } from "../types";
import {
  Play,
  Plus,
  Trash2,
  ChevronDown,
  Download,
  RotateCcw,
  Sparkles,
  FileCode,
  CheckCircle,
  Copy,
  Clock,
  Search,
  Upload,
  Film,
  Cpu,
  RefreshCw,
  Sliders,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronRight,
  Database
} from "lucide-react";
import { MediaTranscoder } from "../services/MediaTranscoder";
import { ModelCache } from "../services/modelCache";
import SceneStudioAssetPanel from "./SceneStudioAssetPanel";
import MediaUploadZone from "./MediaUploadZone";
import { IndexingWorker } from "../services/indexingWorker";
import VectorSearchInput from "./VectorSearchInput";

interface RichScene extends Scene {
  frameUrl?: string;
  embedding?: number[];
  similarityScore?: number;
}

interface ActiveSegmentPlayerProps {
  videoUrl: string;
  startMs: number;
  endMs: number;
  description: string;
  title: string;
  previewProgress: number;
  setPreviewProgress: (pct: number) => void;
}

function HoverVideoPreview({
  videoUrl,
  startMs,
  endMs
}: {
  videoUrl: string;
  startMs: number;
  endMs: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startSec = startMs / 1000;
    const endSec = endMs / 1000;

    video.currentTime = startSec;

    const handleTimeUpdate = () => {
      if (video.currentTime >= endSec || video.currentTime < startSec) {
        video.currentTime = startSec;
      }
    };

    const handleCanPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("canplay", handleCanPlay);

    video.load();

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("canplay", handleCanPlay);
      video.pause();
    };
  }, [videoUrl, startMs, endMs]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none rounded select-none animate-fade-in"
    />
  );
}

function ActiveSegmentPlayer({
  videoUrl,
  startMs,
  endMs,
  description,
  title,
  previewProgress,
  setPreviewProgress
}: ActiveSegmentPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(startMs);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startSec = startMs / 1000;
    const endSec = endMs / 1000;
    const duration = endSec - startSec;

    video.currentTime = startSec;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTimeMs(Math.round(current * 1000));

      if (duration > 0) {
        const pct = Math.min(100, Math.max(0, ((current - startSec) / duration) * 100));
        setPreviewProgress(pct);
      }

      if (current >= endSec || current < startSec) {
        video.currentTime = startSec;
      }
    };

    const handleCanPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("canplay", handleCanPlay);

    // Initial load trigger
    video.load();

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("canplay", handleCanPlay);
      video.pause();
    };
  }, [videoUrl, startMs, endMs, setPreviewProgress]);

  // Format helper inside component
  const formatTimeHelper = (ms: number) => {
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
    <div className="absolute inset-0 w-full h-full flex bg-slate-950 overflow-hidden rounded-md">
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-100 z-0 select-none pointer-events-none"
      />
      
      {/* Lower third scanline details graphic mask */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10 pointer-events-none" />

      {/* Bottom Metadata & Text description HUD */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col items-start justify-end pointer-events-none animate-fade-in flex-1 h-full">
        <div className="w-9 h-9 rounded-full bg-orange-500/80 backdrop-blur-md flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(249,115,22,0.6)]">
          <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950 ml-0.5" />
        </div>
        
        {/* Dynamic Highlight for the description in the player HUD */}
        <div className="bg-[#03080f]/75 border border-[#f97316]/30 rounded-xl p-3 md:p-4 shadow-xl backdrop-blur-md max-w-2xl transform transition-all duration-300 pointer-events-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[8px] md:text-[9px] text-[#f97316] uppercase font-black tracking-widest animate-pulse flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> SEMANTIC ANALYSIS
            </span>
            <span className="text-[9px] md:text-[10px] text-slate-400 font-mono border-l border-slate-700 pl-3">
              Idx: <span className="text-emerald-400 font-black font-mono">{formatTimeHelper(currentTimeMs)}</span> / {formatTimeHelper(endMs)}
            </span>
          </div>

          {/* Bold visual highlight styling for action description */}
          <div className="border-l-2 border-[#f97316] pl-3 py-1 text-left">
            <p className="text-xs md:text-sm font-medium text-slate-100 tracking-wide leading-relaxed animate-fade-in selection:bg-orange-500/30 selection:text-white select-text">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const INITIAL_SCENES: RichScene[] = [
  {
    id: "scene-1",
    title: "Introductory establishing shot",
    startMs: 0,
    endMs: 4500,
    description:
      "The opening sequence of the video. The subject enters the frame or is established as the primary focus of the scene.",
    isCustom: false,
    embedding: Array.from({ length: 768 }, (_, i) => Math.sin(i * 0.1) * 0.05) // Seed sample vectors matching 768-D Space Grotesk size
  },
  {
    id: "scene-2",
    title: "Primary action progression",
    startMs: 4500,
    endMs: 12200,
    description:
      "Subject engages in the main phase of the activity. Consistent pacing and focused framing on the primary content of the video.",
    isCustom: false,
    embedding: Array.from({ length: 768 }, (_, i) => Math.cos(i * 0.1) * 0.05)
  },
  {
    id: "scene-3",
    title: "Mid-point transition",
    startMs: 12200,
    endMs: 18000,
    description:
      "A shift in action or perspective. This marks a midpoint transition to a new segment or idea within the timeline.",
    isCustom: false,
    embedding: Array.from({ length: 768 }, (_, i) => Math.sin(i * 0.2) * 0.05)
  },
  {
    id: "scene-4",
    title: "Secondary subject focus",
    startMs: 18000,
    endMs: 24500,
    description:
      "Alternative viewpoint or secondary aspect of the scene being highlighted. The subject's action shifts to the next logical phase.",
    isCustom: false,
    embedding: Array.from({ length: 768 }, (_, i) => Math.cos(i * 0.15) * 0.06)
  },
  {
    id: "scene-5",
    title: "Climactic action phase",
    startMs: 24500,
    endMs: 31000,
    description:
      "The most intense or critical phase of the action in this segment, wrapping up the core ideas before moving to conclusion.",
    isCustom: false,
    embedding: Array.from({ length: 768 }, (_, i) => Math.sin(i * 0.15) * 0.04)
  },
  {
    id: "scene-6",
    title: "Outro resolution",
    startMs: 31000,
    endMs: 36000,
    description:
      "The scene comes to a rest. Final thoughts, resolution of the prior action, or a gradual fade leading to the end of the video segment.",
    isCustom: false,
    embedding: Array.from({ length: 768 }, (_, i) => Math.cos(i * 0.2) * 0.03)
  }
];

// Helper to calculate mathematical cosine similarity between vectors
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  const len = Math.min(vecA.length, vecB.length);
  if (len === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default function SceneStudio() {
  const [scenes, setScenes] = useState<RichScene[]>(() => {
    try {
      const cached = localStorage.getItem("prolector_scenes_cache");
      return cached ? JSON.parse(cached) : INITIAL_SCENES;
    } catch {
      return INITIAL_SCENES;
    }
  });

  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<"keyword" | "semantic">("semantic");
  const [searchVector, setSearchVector] = useState<number[] | null>(null);

  // Active playing preview
  const [activePreview, setActivePreview] = useState<RichScene | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [hoveredGalleryId, setHoveredGalleryId] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  // Dynamic Scene creation & Editing states
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSceneForEdit, setSelectedSceneForEdit] = useState<RichScene | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newStart, setNewStart] = useState(0);
  const [newEnd, setNewEnd] = useState(5000);
  const [newDesc, setNewDesc] = useState("");

  // Gemini assistant prompt state
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiError, setAiError] = useState("");

  // Video drop/upload indexing panel states
  const [dragActive, setDragActive] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [indexingStatus, setIndexingStatus] = useState("");
  const [droppedVideoUrl, setDroppedVideoUrl] = useState<string | null>(null);
  const [droppedVideoName, setDroppedVideoName] = useState("");
  const [droppedVideoSize, setDroppedVideoSize] = useState("");
  
  // Indexer parameters
  const [domainMode, setDomainMode] = useState<"general" | "dance">("dance");
  const [everyNSeconds, setEveryNSeconds] = useState<number>(5); // Default extract every 5s

  // ONNX Local Cache Models Status
  const [onnxCacheStatus, setOnnxCacheStatus] = useState<Record<string, "Not Cached" | "Downloading" | "Cached">>( {
    "florence2-vlm-quant.onnx": "Not Cached",
    "embedding-gemma-270m.onnx": "Not Cached",
    "whisper-tiny-decoder.onnx": "Not Cached"
  });
  const [onnxLoadProgress, setOnnxLoadProgress] = useState(0);
  const [onnxDownloadingFile, setOnnxDownloadingFile] = useState<string | null>(null);

  // EDL Modal details
  const [showEdlModal, setShowEdlModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check OPFS status on startup
  useEffect(() => {
    const fetchOPFSStatus = async () => {
      const currentStatus = { ...onnxCacheStatus };
      for (const modelName of Object.keys(onnxCacheStatus)) {
        const isCached = await ModelCache.checkModelCached(modelName);
        currentStatus[modelName] = isCached ? "Cached" : "Not Cached";
      }
      setOnnxCacheStatus(currentStatus);
    };
    fetchOPFSStatus();
  }, []);

  // Save scenes on change
  useEffect(() => {
    localStorage.setItem("prolector_scenes_cache", JSON.stringify(scenes));
  }, [scenes]);

  // Handle active preview timeline player loops
  useEffect(() => {
    if (!activePreview) return;
    setPreviewProgress(0);
    const interval = setInterval(() => {
      setPreviewProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 4;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [activePreview]);

  // Clean raw file name to nice visual name
  const cleanVideoName = (name: string) => {
    if (name.length <= 30) return name;
    return name.substring(0, 18) + "..." + name.substring(name.length - 10);
  };

  // Trigger background local IndexingWorker sequence using WebP Canvas preprocessing
  const triggerWorkerIndexing = async (videoUrl: string, name: string, size: string) => {
    setIsIndexing(true);
    setIndexingProgress(0);
    setIndexingStatus("Initializing background indexing worker thread...");

    let promptContext = "";
    if (domainMode === "dance") {
      promptContext = `Analyze this frame captured from a video session at timestamp {{timestampMs}} ms.
The domain is exclusively Dance & Choreography (e.g., Azonto, Gwara Gwara, Kupe, Pilolo, Ballet, Hip Hop, etc.).
Identify exactly what signature dance style or specific kinetic motion is occurring.
Provide a deeply technical choreographic breakdown explaining exactly HOW the kinetic movement is achieved anatomically (somatic mechanics, weight transversions, movement intensity).
Estimate the movement intensity (Low/Medium/High).
Output a highly professional visual title (e.g., 'Azonto Core Isolation', 'High Intensity Gwara Gwara') and an accurate action descriptor.`;
    } else {
      promptContext = `Analyze this frame captured from a video session at timestamp {{timestampMs}} ms.
The domain is General Knowledge & Generic Scenes (e.g., vlogs, monologues, tutorials, etc.).
Identify exactly WHAT is happening without hallucinating choreography. State if someone is simply speaking, gesturing, walking, etc.
DO NOT use generic descriptions of the room or lighting. Focus purely on the subject's primary action.
Output a highly professional visual title (e.g., 'Introductory Monologue', 'Detailed Explanation Phase') and an accurate action descriptor.`;
    }

    try {
      const newScenes = await IndexingWorker.startIndexing(
        videoUrl,
        name,
        size,
        everyNSeconds,
        (progressInfo) => {
          setIndexingProgress(progressInfo.progress);
          setIndexingStatus(progressInfo.statusText);
        },
        promptContext
      );

      if (newScenes && newScenes.length > 0) {
        setScenes((prev) => {
          // Prepend new auto-analyzed scenes and sort everything chronologically
          const combined = [...newScenes, ...prev];
          const unique = combined.filter((s, index, self) => self.findIndex((x) => x.id === s.id) === index);
          return unique.sort((a, b) => a.startMs - b.startMs);
        });
      }

      setIndexingStatus(`Background local worker completed successfully! Loaded ${newScenes.length} choreographic blocks.`);
      setIndexingProgress(100);

      setTimeout(() => {
        setIsIndexing(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setIndexingStatus(`Local Worker Indexing failed: ${err.message || err}. Reverting to standard state.`);
      setTimeout(() => setIsIndexing(false), 3500);
    }
  };

  // Trigger progressive OPFS caching using our ModelCache service
  const triggerOnnxCacheWrite = async (modelName: string) => {
    setOnnxDownloadingFile(modelName);
    setOnnxLoadProgress(0);

    // For demonstration, map these placeholder names to small real ONNX files on HuggingFace 
    // that support CORS, enabling the real OPFS download streaming process.
    let modelUrl = "https://huggingface.co/Xenova/bert-base-uncased/resolve/main/onnx/model_quantized.onnx";
    if (modelName.includes("whisper")) {
      modelUrl = "https://huggingface.co/Xenova/whisper-tiny/resolve/main/onnx/decoder_model_merged_quantized.onnx";
    }

    const success = await ModelCache.downloadAndStoreModel(modelName, modelUrl, (progress) => {
      setOnnxLoadProgress(progress);
    });

    if (success) {
      setOnnxCacheStatus((prev) => ({ ...prev, [modelName]: "Cached" }));
    }
    setOnnxDownloadingFile(null);
    setOnnxLoadProgress(0);
  };

  const removeOnnxFromCache = async (modelName: string) => {
    const success = await ModelCache.deleteModel(modelName);
    if (success) {
      setOnnxCacheStatus((prev) => ({ ...prev, [modelName]: "Not Cached" }));
    }
  };

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

  // Handle local Scene Creation & Editing Commit mutations
  const handleOpenAddScene = () => {
    setSelectedSceneForEdit(null);
    setNewTitle("");
    setNewDesc("");
    setNewStart(0);
    setNewEnd(5000);
    setIsAdding(true);
  };

  const handleOpenEditScene = (scene: RichScene) => {
    setSelectedSceneForEdit(scene);
    setNewTitle(scene.title);
    setNewDesc(scene.description);
    setNewStart(scene.startMs);
    setNewEnd(scene.endMs);
    setIsAdding(true);
  };

  const handleCommitSceneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (selectedSceneForEdit) {
      // Edit mode
      setScenes((prev) =>
        prev.map((s) =>
          s.id === selectedSceneForEdit.id
            ? {
                ...s,
                title: newTitle,
                startMs: Number(newStart),
                endMs: Number(newEnd),
                description: newDesc || "No visual kinematics described."
              }
            : s
        )
      );
    } else {
      // New Mode
      const newScene: RichScene = {
        id: `scene-custom-${Date.now()}`,
        title: newTitle,
        startMs: Number(newStart),
        endMs: Number(newEnd),
        description: newDesc || "Custom kinetic descriptors.",
        isCustom: true,
        embedding: Array.from({ length: 768 }, (_, i) => Math.sin(i * 1.5) * 0.05)
      };
      setScenes((prev) => [...prev, newScene].sort((a, b) => a.startMs - b.startMs));
    }

    setIsAdding(false);
    setSelectedSceneForEdit(null);
    setNewTitle("");
    setNewDesc("");
  };

  const deleteScene = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
    if (activePreview?.id === id) {
      setActivePreview(null);
    }
  };

  // Run Copilot Assistant to generate scene details using standard Flash Model
  const handleAiCopilotQuery = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiError("");

    try {
      const response = await fetch("/api/gemini/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "data:image/webp;base64,UklGRloAAABXRUJQVlA4WAoAAAAQAAAADwAADwAACXBIRE0ASW5pX2NvbW1pdF9maWxlY2FjaGU=", // empty spacer
          timestampMs: newStart,
          durationMs: newEnd - newStart
        })
      });

      if (!response.ok) {
        throw new Error("Free Tier descriptor lookup failed.");
      }

      const data = await response.json();
      setNewTitle(data.title || aiPrompt);
      setNewDesc(data.description || "Synthesized analysis output.");
    } catch (err: any) {
      setAiError("API offline fallback applied. Generated dummy kinetics.");
      const calculatedTitle = aiPrompt.split(" ").slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") + " Step";
      const calculatedDesc = `Calculated choreography mapping representing: "${aiPrompt}". Posture transitions lock at spatial matrices centered over timestamp ${(newStart / 1000).toFixed(1)}s.`;
      setNewTitle(calculatedTitle);
      setNewDesc(calculatedDesc);
    } finally {
      setIsGenerating(false);
    }
  };

  // Process sorting/filtering according to active keyword or vector embeddings
  const getProcessedScenes = (): RichScene[] => {
    if (searchMode === "keyword" || !searchVector || !search.trim()) {
      // Direct text filter mode
      if (!search.trim()) return scenes;
      return scenes.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Mathematical semantic score cosine match mode
    const scored = scenes.map((s) => {
      const sceneVec = s.embedding || Array.from({ length: 768 }, () => 0);
      const similarity = calculateCosineSimilarity(searchVector, sceneVec);
      return {
        ...s,
        similarityScore: similarity
      };
    });

    // Sort by highest similarity match coefficient
    return scored.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
  };

  const processedScenes = getProcessedScenes();

  // Highlight and reveal clip card description drawer
  const toggleDesc = (id: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile Edit Decision List schema
  const getCompiledEdl = () => {
    const totalMs = scenes.reduce((acc, s) => acc + (s.endMs - s.startMs), 0);
    return {
      video_id: droppedVideoName || "afj-master.mp4",
      format_version: "2.1",
      standards: {
        pace_wpm: 140,
        audio_sync_hz: 2.33,
        color_space: "Rec.2020-HLG",
        decibel_boost_pct: 12
      },
      duration_ms: totalMs,
      segments: scenes.map((s, idx) => ({
        index: idx + 1,
        id: s.id,
        source: s.isCustom ? "custom-capture.mp4" : "afj-master.mp4",
        in_ms: s.startMs,
        out_ms: s.endMs,
        frame_coordinates: { x: 0, y: 0, scale: 1.0 },
        effects: s.id === "scene-3" ? ["reinhard-tone-map", "spotlight-vignette"] : ["reinhard-tone-map"]
      }))
    };
  };

  const copyEdlToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(getCompiledEdl(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-[#fafafa] bg-[#091a2f] min-h-[calc(100vh-80px)] p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Workspace Title header bar */}
        <div className="border-b border-slate-800 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                MVP Pipeline
              </span>
              <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Fullstack API
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#fafafa] uppercase tracking-tight font-mono">
              ProLector Semantic Scene Studio
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Drop any raw dance video to extract high-precision aesthetic descriptions and frame sequences.
              Query choreography actions based on meaning (semantic vectors) rather than simple text keywords.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setScenes(INITIAL_SCENES);
                localStorage.removeItem("prolector_scenes_cache");
              }}
              title="Reset workspace back to original sample data"
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs uppercase px-4 py-2.5 rounded-md hover:text-[#fafafa] cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset State
            </button>
            <button
              onClick={handleOpenAddScene}
              className="flex items-center gap-1.5 bg-sky-900/80 hover:bg-sky-850 border border-sky-800 text-slate-100 font-medium text-xs uppercase px-4 py-2.5 rounded-md cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Scene
            </button>
            <button
              onClick={() => setShowEdlModal(true)}
              className="flex items-center gap-1.5 bg-[#f97316] hover:bg-orange-600 text-slate-950 font-black text-xs uppercase px-4 py-2.5 rounded-md transition-all cursor-pointer shadow-lg shadow-orange-500/10"
            >
              <FileCode className="w-3.5 h-3.5" />
              Export EDL.json
            </button>
          </div>
        </div>

        {/* MANDATORY ENTRY POINT: MEDIA UPLOAD ZONE GATING STUDIO */}
        {!droppedVideoUrl && !isIndexing ? (
          <MediaUploadZone
            onUploadSuccess={(videoData) => {
              setDroppedVideoUrl(videoData.url);
              setDroppedVideoName(videoData.name);
              setDroppedVideoSize(videoData.size);
              triggerWorkerIndexing(videoData.url, videoData.name, videoData.size);
            }}
            onBypassSample={() => {
              const sampleUrl = "https://assets.mixkit.co/videos/preview/mixkit-dancing-woman-in-the-city-silhouette-39928-large.mp4";
              setDroppedVideoUrl(sampleUrl);
              setDroppedVideoName("mixkit-dancer-silhouette-39928.mp4");
              setDroppedVideoSize("18.4 MB");
              triggerWorkerIndexing(sampleUrl, "mixkit-dancer-silhouette-39928.mp4", "18.4 MB");
            }}
          />
        ) : (
          <>
            {/* Indexing Background Progress screen */}
            {isIndexing && (
              <div className="bg-[#050e1a] border border-[#f97316]/30 rounded-xl p-8 mb-8 text-center space-y-6 shadow-xl py-12">
                <div className="flex justify-center">
                  <RefreshCw className="w-10 h-10 animate-spin text-[#f97316]" />
                </div>
                <div className="space-y-3 max-w-lg mx-auto w-full">
                  <div className="text-xs font-mono font-bold text-[#f97316] uppercase tracking-widest flex items-center justify-center gap-1.5 font-bold">
                    <Cpu className="w-4 h-4 animate-pulse text-[#f97316]" />
                    Local Indexing Worker (Thread-1) active: {indexingProgress}%
                  </div>
                  <div className="bg-slate-950 h-3 w-full rounded-full overflow-hidden border border-slate-900 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${indexingProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-300 font-mono bg-[#03080f] py-3 px-5 rounded border border-slate-900/60 animate-pulse mt-3 max-w-xl mx-auto truncate text-center">
                    {indexingStatus}
                  </p>
                </div>
              </div>
            )}

            {droppedVideoUrl && !isIndexing && (
              <>
                {/* Dropped Video Configuration summary ribbon */}
                <div className="bg-[#050e1a] border border-slate-800 rounded-xl p-5 mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Film className="w-4 h-4 text-[#f97316]" /> Raw Source Decoupled Video
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f97316]/10 text-[#f97316] rounded-lg border border-orange-500/10 flex items-center justify-center">
                        <Film className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-mono font-bold text-slate-200 truncate" title={droppedVideoName}>
                          {cleanVideoName(droppedVideoName)}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                          SIZE: {droppedVideoSize} | CODEC: VP8 / WebP Canvas Frames
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col font-mono text-[10px] gap-1.5">
                      <span className="text-slate-400 font-bold uppercase">Sampling Interval Rate:</span>
                      <select
                        value={everyNSeconds}
                        onChange={(e) => setEveryNSeconds(Number(e.target.value))}
                        className="bg-[#03080f] text-[#fafafa] border border-slate-850 px-2 py-1 rounded text-[10px] focus:outline-none focus:border-[#f97316]"
                      >
                        <option value={3}>1 Frame every 3s (Fine moves)</option>
                        <option value={5}>1 Frame every 5s (Standard)</option>
                        <option value={10}>1 Frame every 10s (Fast draft)</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 flex items-center justify-between bg-[#050e1a] border border-slate-900 rounded p-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] mr-2">Indexing Domain Mode:</span>
                      <select
                        value={domainMode}
                        onChange={(e) => setDomainMode(e.target.value as "general" | "dance")}
                        className="bg-[#03080f] text-[#fafafa] border border-slate-850 px-2 py-1 rounded text-[10px] focus:outline-none focus:border-[#f97316]"
                      >
                        <option value="dance">Dance & Choreography Domain</option>
                        <option value="general">Generic Scenes & General Action</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setDroppedVideoUrl(null);
                          setScenes(INITIAL_SCENES);
                        }}
                        className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 font-bold text-[10px] uppercase rounded-md cursor-pointer transition-all"
                      >
                        Change Media track
                      </button>
                      <button
                        onClick={() => triggerWorkerIndexing(droppedVideoUrl, droppedVideoName, droppedVideoSize)}
                        className="bg-[#f97316] hover:bg-orange-600 text-slate-950 font-black text-[10px] uppercase px-4 py-2 rounded-md flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/10 transition-all font-mono"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Re-trigger Indexer
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

        {/* Live Active Preview timelines player */}
        {activePreview && (
          <div className="mb-8 overflow-hidden rounded-lg border border-orange-500/30 bg-[#030810] shadow-2xl animate-fade-in">
            <div className="bg-[#050e1a] px-4 py-3 flex items-center justify-between border-b border-orange-500/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-[10px] text-[#f97316] font-extrabold uppercase">LIVE CHOREO PLAYER</span>
                <span className="text-xs text-slate-500">|</span>
                <span className="text-xs font-extrabold text-[#fafafa] font-mono">{activePreview.title}</span>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                ✕ Close Player
              </button>
            </div>
            <div className="aspect-[21/9] bg-slate-950 relative flex flex-col items-center justify-center overflow-hidden p-6">
              {droppedVideoUrl ? (
                <ActiveSegmentPlayer
                  videoUrl={droppedVideoUrl}
                  startMs={activePreview.startMs}
                  endMs={activePreview.endMs}
                  description={activePreview.description}
                  title={activePreview.title}
                  previewProgress={previewProgress}
                  setPreviewProgress={setPreviewProgress}
                />
              ) : (
                <>
                  {activePreview.frameUrl ? (
                    <img
                      src={activePreview.frameUrl}
                      alt={activePreview.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-85"
                    />
                  ) : (
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]" />
                  )}

                  {/* Wireframe skeletal markers overlay simulation */}
                  <div className="relative z-10 flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-lg border border-slate-900 backdrop-blur-xs max-w-md text-center">
                    <div className="w-14 h-14 rounded-full border border-[#f97316] bg-[#f97316]/5 flex items-center justify-center mb-1.5 animate-pulse">
                      <Play className="w-5 h-5 text-[#f97316]" />
                    </div>
                    <span className="font-mono text-[9px] text-[#f97316] uppercase font-bold tracking-wider">
                      Jog Offset: {formatTime(activePreview.startMs + (activePreview.endMs - activePreview.startMs) * (previewProgress / 100))}
                    </span>
                    <span className="text-[10px] text-slate-300 mt-1 max-w-xs truncate-2-lines">
                      {activePreview.description}
                    </span>
                  </div>
                </>
              )}

              {/* HUD Progress trackbar */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800 z-30">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-150"
                  style={{ width: `${previewProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Scene drawer overlay */}
        {isAdding && (
          <form
            onSubmit={handleCommitSceneSubmit}
            className="mb-8 border border-slate-800 bg-[#050e1a] p-5 rounded-xl shadow-xl animate-scale-up"
          >
            <h3 className="text-xs font-black text-[#fafafa] uppercase tracking-wider mb-4 border-b border-slate-800 pb-2.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#f97316]" />{" "}
              {selectedSceneForEdit ? "Edit Scene Choreotics" : "Add Custom Semantic Scene"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 md:col-span-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                    Scene Action Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dynamic Gbese Turn, Ebobe Bounce Stance"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#03080f] border border-slate-800 rounded px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                      In Point Code (ms)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={100}
                      value={newStart}
                      onChange={(e) => setNewStart(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#03080f] border border-slate-800 rounded px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-[#f97316] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                      Out Point Code (ms)
                    </label>
                    <input
                      type="number"
                      required
                      min={newStart + 10}
                      step={100}
                      value={newEnd}
                      onChange={(e) => setNewEnd(Math.max(newStart + 10, Number(e.target.value)))}
                      className="w-full bg-[#03080f] border border-slate-800 rounded px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-[#f97316] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                    Motion & Spatial Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe specific joint behaviors, low balance stance, spotlight halos, and physical paces..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-[#03080f] border border-slate-800 rounded px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-[#f97316] leading-relaxed"
                  />
                </div>
              </div>

              {/* AI Copilot Sidecard */}
              <div className="bg-[#03080f] p-4 rounded border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[8.5px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.0 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold mb-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> AI COPILOT
                  </span>
                  <h4 className="text-xs font-bold text-slate-300 mt-1">Generative Kinetic Descriptor</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1 border-b border-slate-850 pb-2">
                    Enter a dynamic somatic query to let Gemini generate the structured description for you.
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Gbese stance, lighting decaying..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#f97316] mt-3"
                  />
                  {aiError && <span className="block text-[8px] text-yellow-500 font-mono mt-1">{aiError}</span>}
                </div>
                <button
                  type="button"
                  disabled={isGenerating || !aiPrompt.trim()}
                  onClick={handleAiCopilotQuery}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 py-2 rounded text-[10px] uppercase font-mono font-bold tracking-wider mt-4 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  {isGenerating ? "Synthesizing Move..." : "Auto-describe detail"}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 border-t border-slate-850 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedSceneForEdit(null);
                }}
                className="px-4 py-2 bg-transparent hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded text-xs uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#f97316] hover:bg-orange-600 text-slate-950 rounded text-xs uppercase font-extrabold cursor-pointer transition-colors"
              >
                Commit Changes
              </button>
            </div>
          </form>
        )}

        {/* METRICS & OPFS CACHING STATUS BLOCK */}
        <div className="bg-[#050e1a] border border-slate-800 rounded-xl p-4 mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> ADR-011 Origin Private File System Model Cache (OPFS)
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              Save local binary parameters into persistent OPFS caches to run local offline tools.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {Object.entries(onnxCacheStatus).map(([model, status]) => (
                <div
                  key={model}
                  className="flex items-center gap-1.5 bg-[#03080f] border border-slate-850 py-1.5 px-3 rounded text-[9px] font-mono"
                >
                  <span className="text-slate-400">{model}:</span>
                  {status === "Cached" ? (
                    <span className="text-[#f97316] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> CACHED
                    </span>
                  ) : onnxDownloadingFile === model ? (
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> DOWNLOADING ({onnxLoadProgress}%)
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold">NOT CACHED</span>
                  )}

                  {status === "Cached" ? (
                    <button
                      onClick={() => removeOnnxFromCache(model)}
                      className="ml-2 text-slate-500 hover:text-red-400 cursor-pointer"
                      title="Remove model from OPFS local storage index"
                    >
                      Delete
                    </button>
                  ) : (
                    onnxDownloadingFile !== model && (
                      <button
                        onClick={() => triggerOnnxCacheWrite(model)}
                        className="ml-2 text-sky-400 hover:text-sky-300 font-bold cursor-pointer hover:underline"
                      >
                        Cache
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#03080f] p-3 rounded border border-slate-850 font-mono text-[9px] text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>ACTIVE DATABASE PIPELINE:</span>
              <span className="text-sky-400 font-bold uppercase">SUPABASE HYBRID (ADR-004)</span>
            </div>
            <div className="flex justify-between">
              <span>768-D EMBED COORDINATES:</span>
              <span className="text-[#f97316] font-bold">ONLINE (GEMINI-G_G_270M)</span>
            </div>
            <div className="flex justify-between">
              <span>ESTIMATED RETRIEVAL PING:</span>
              <span className="text-emerald-400 font-bold">~12ms</span>
            </div>
          </div>
        </div>

        {/* DRAG AND DROP ASSET PANEL FOR REORDERING TIMELINE */}
        <SceneStudioAssetPanel
          scenes={scenes}
          setScenes={setScenes}
          activePreview={activePreview}
          setActivePreview={setActivePreview}
          droppedVideoUrl={droppedVideoUrl}
          addLog={(msg) => console.log(`[SceneStudio / AssetPanel] ` + msg)}
          highlightedSceneIds={search.trim() ? processedScenes.map(s => s.id) : []}
        />

        {/* SEARCH & SEMANTIC FILTERS BAR */}
        <VectorSearchInput
          onSearchVectorReady={(vector, query) => {
            setSearchVector(vector);
            setSearch(query);
            setSearchMode("semantic");
          }}
          onKeywordSearch={(query) => {
            setSearch(query);
            setSearchMode("keyword");
          }}
        />

        {/* GALLERIES BLOCK GRID MAP */}
        {processedScenes.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl text-center p-16 text-slate-500 font-mono text-xs">
            No indexed somatic scenes match your query. Try resetting data layers or load custom media clips.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12" id="gallery-grid">
            {processedScenes.map((scene) => {
              const isExpanded = !!expandedDescriptions[scene.id];
              return (
                <article
                  key={scene.id}
                  id={scene.id}
                  className="scene-card border border-slate-800 bg-[#050e1a] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#f97316] transition-all group hover:shadow-xl hover:-translate-y-0.5 duration-200"
                >
                  {/* WebP Frame Thumbnail */}
                  <div
                    onClick={() => setActivePreview(scene)}
                    onMouseEnter={() => setHoveredGalleryId(scene.id)}
                    onMouseLeave={() => setHoveredGalleryId(null)}
                    className="webp-thumbnail w-full aspect-video bg-[#030810] relative flex items-center justify-center cursor-pointer overflow-hidden"
                  >
                    {hoveredGalleryId === scene.id && droppedVideoUrl ? (
                      <HoverVideoPreview
                        videoUrl={droppedVideoUrl}
                        startMs={scene.startMs}
                        endMs={scene.endMs}
                      />
                    ) : scene.frameUrl ? (
                      <img
                        src={scene.frameUrl}
                        alt={scene.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform group-hover:scale-102"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-500 group-hover:text-[#f97316] group-hover:border-[#f97316]/40 transition-colors">
                        <Play className="w-5 h-5 ml-0.5" />
                      </div>
                    )}

                    {/* Cosine similarity badge coordinates in semantic mode */}
                    {searchMode === "semantic" && search.trim() && scene.similarityScore !== undefined && (
                      <div className="absolute top-2 left-2 bg-[#f97316] text-[#091a2f] font-mono text-[9px] font-black px-2 py-0.5 rounded shadow-md border border-orange-500/20">
                        {Math.max(0, Math.round(scene.similarityScore * 100))}% semantic match
                      </div>
                    )}

                    <div className="absolute inset-x-2 bottom-2 text-[7px] font-mono text-slate-400 bg-[#03080f]/90 px-1.5 py-0.5 rounded border border-slate-850 shadow-sm flex items-center justify-between gap-1 z-30">
                      <span>{scene.frameUrl ? "⚡ EXTRACTED BUFFER" : "⚙️ MODEL SYNTHESIS"}</span>
                      {scene.isCustom && <span className="text-sky-400 font-bold uppercase text-[6.5px]">USER FILE</span>}
                    </div>

                    <div className="preview-overlay absolute inset-0 bg-gradient-to-t from-[#091a2f]/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] uppercase tracking-widest text-[#f97316] font-bold z-30 pointer-events-none">
                      <span className="bg-[#091a2f]/80 px-2 py-1 rounded border border-[#f97316]/30">Click to Select</span>
                    </div>
                  </div>

                  {/* Meta particulars */}
                  <div className="p-4 border-t border-slate-850 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h4 className="font-mono text-[11px] text-[#fafafa] font-extrabold tracking-tight group-hover:text-[#f97316] transition-colors leading-tight">
                          {scene.title}
                        </h4>
                        <span className="font-mono text-[9px] text-slate-400 bg-[#0c0d14] px-1.5 py-0.5 rounded border border-slate-800 shrink-0 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-[#f97316]" />
                          {(scene.startMs / 1000).toFixed(1)}s - {(scene.endMs / 1000).toFixed(1)}s
                        </span>
                      </div>

                      <button
                        onClick={() => toggleDesc(scene.id)}
                        className="w-full bg-[#0c0d14] border border-dashed border-slate-800 text-slate-400 hover:text-[#f97316] hover:border-[#f97316]/30 font-bold text-[9px] uppercase py-1.5 px-3.5 rounded transition-all flex items-center justify-between gap-1"
                      >
                        <span>{isExpanded ? "Hide motion description" : "Reveal somatic description"}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isExpanded && (
                        <p className="text-[10px] leading-relaxed text-slate-300 border-l-2 border-[#f97316] pl-2 py-1 bg-[#03080f]/50 p-2 rounded mt-2 font-mono">
                          {scene.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => handleOpenEditScene(scene)}
                        className="py-1.5 border border-slate-800 hover:border-slate-700 hover:text-white rounded text-[9px] uppercase font-mono font-bold cursor-pointer transition-colors"
                      >
                        Adjust Coordinates
                      </button>
                      <button
                        onClick={() => deleteScene(scene.id)}
                        className="py-1.5 bg-red-950/20 border border-red-900/40 hover:bg-red-500 hover:text-[#fafafa] text-red-500 rounded text-[9px] uppercase font-mono font-bold cursor-pointer transition-all"
                      >
                        Delete clip
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>

      {/* EDL CODE POPUP MODAL */}
      {showEdlModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#050e1a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#03080f] px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="text-[#f97316] w-5 h-5" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#fafafa] font-mono">
                  Compiled Video-as-Code EDL.json
                </h3>
              </div>
              <button
                onClick={() => setShowEdlModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                This schema conforms with the design specifications of ProLector workstations. 
                Pushing this array to Supabase preserves complete coordination tracks securely.
              </p>

              <div className="bg-[#03080f] p-4 rounded border border-slate-850 max-h-80 overflow-y-auto mb-4">
                <pre id="edl-payload" className="text-[10px] font-mono text-slate-350 whitespace-pre-wrap leading-normal select-all">
                  {JSON.stringify(getCompiledEdl(), null, 2)}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <span className="text-[8px] font-mono text-slate-500 uppercase">
                  Codec target: Rec.2020-HLG / Wide Tone Map Matrixes
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={copyEdlToClipboard}
                    className="flex-1 sm:flex-none flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 text-[10px] font-bold uppercase rounded cursor-pointer justify-center transition-all border border-slate-750 font-mono"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <a
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(getCompiledEdl(), null, 2))}`}
                    download="prolector_scene_studio_manifest.json"
                    className="flex-1 sm:flex-none flex items-center gap-1 bg-[#f97316] hover:bg-orange-600 text-slate-950 px-4 py-2 text-[10px] font-black uppercase rounded cursor-pointer transition-all justify-center font-mono"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
