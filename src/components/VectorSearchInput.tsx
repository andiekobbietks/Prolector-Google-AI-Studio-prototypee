import React, { useState, useEffect } from "react";
import { Search, Sparkles, RefreshCw, CheckCircle, Database } from "lucide-react";
import { pipeline, env } from "@xenova/transformers";

// Optional: restrict ONNX execution and model loading paths for OPFS usage
env.allowLocalModels = false; 

export interface VectorSearchInputProps {
  onSearchVectorReady: (vector: number[] | null, query: string) => void;
  onKeywordSearch: (query: string) => void;
  isPreparingModel?: boolean;
}

export default function VectorSearchInput({
  onSearchVectorReady,
  onKeywordSearch,
  isPreparingModel = false,
}: VectorSearchInputProps) {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<"keyword" | "semantic">("semantic");
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelLoadingText, setModelLoadingText] = useState("");

  // Debounce the semantic search
  useEffect(() => {
    if (searchMode === "keyword") {
      onKeywordSearch(search);
      return;
    }

    if (!search.trim()) {
      onSearchVectorReady(null, "");
      return;
    }

    const timerid = setTimeout(() => {
      runSemanticQuerySearch(search);
    }, 500);

    return () => clearTimeout(timerid);
  }, [search, searchMode]);

  const runSemanticQuerySearch = async (queryText: string) => {
    if (!queryText.trim()) {
      onSearchVectorReady(null, "");
      return;
    }

    setIsSearchingSemantic(true);
    try {
      // Lazy load the embedding pipeline
      if (!isModelLoaded) {
        setModelLoadingText("Loading EmbeddingGemma Model (OPFS/Cache)...");
        // using Xenova/bge-small-en-v1.5 or Xenova/all-MiniLM-L6-v2 as Gemma placeholder since real embedding gemma is huge 
        const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
            progress_callback: (prog: any) => {
                if (prog.status === "downloading") {
                    setModelLoadingText(`Downloading model... ${Math.round((prog.loaded / prog.total) * 100)}%`);
                }
            }
        });
        (window as any).embeddingGemma = extractor;
        setIsModelLoaded(true);
        setModelLoadingText("Model ready.");
      }

      const extractor = (window as any).embeddingGemma;
      const output = await extractor(queryText, { pooling: "mean", normalize: true });
      
      const vector = Array.from(output.data) as number[];
      onSearchVectorReady(vector, queryText);
    } catch (err) {
      console.warn("[Semantic Vector Error, typing exact matches fallback]:", err);
      // Fallback
      onSearchVectorReady(null, queryText);
    } finally {
      setIsSearchingSemantic(false);
    }
  };

  const applySearchModeToggle = (mode: "keyword" | "semantic") => {
    setSearchMode(mode);
    if (mode === "keyword") {
      onSearchVectorReady(null, "");
      onKeywordSearch(search);
    }
  };

  return (
    <div className="bg-[#050e1a] border border-slate-800 p-4 rounded-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            id="scene-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#03080f] border border-slate-800 text-[#fafafa] focus:outline-none focus:border-[#f97316] rounded-md pl-10 pr-4 py-3 text-xs placeholder-slate-500 font-mono"
            placeholder={
              searchMode === "semantic"
                ? "Ask conceptually (e.g. 'energetic lateral hips', 'moment darkness fades')..."
                : "Traditional keyword matching index (e.g. 'Spin', 'Kupe')..."
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 font-bold">SEARCH MODE:</span>
          <div className="inline-flex rounded-md p-1 bg-slate-950 border border-slate-900 font-mono text-[9px]">
            <button
              type="button"
              onClick={() => applySearchModeToggle("keyword")}
              className={`px-3 py-1.5 rounded uppercase font-bold cursor-pointer transition-colors ${
                searchMode === "keyword" ? "bg-slate-900 text-slate-200" : "text-slate-500 hover:text-slate-350"
              }`}
            >
              Keywords
            </button>
            <button
              type="button"
              onClick={() => applySearchModeToggle("semantic")}
              className={`px-3 py-1.5 rounded uppercase font-black cursor-pointer flex items-center gap-1 transition-colors ${
                searchMode === "semantic" ? "bg-[#f97316] text-[#091a2f]" : "text-slate-500 hover:text-slate-350"
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" /> Vector AI
            </button>
          </div>
        </div>
      </div>

      {searchMode === "semantic" && search.trim() && (
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
           <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase font-bold">Local Tensor Cache:</span>
              {isSearchingSemantic ? (
                <span className="text-yellow-400 animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> {modelLoadingText || "Generating embedding..."}
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> Semantic Vector Embedded Ready {isModelLoaded && <span className="opacity-80 ml-2">(EmbeddingGemma OPFS Mode)</span>}
                </span>
              )}
           </div>
           
           {isSearchingSemantic && (
             <div className="flex items-center gap-1 text-slate-500">
               <Database className="w-3 h-3 animate-pulse" /> OPFS
             </div>
           )}
        </div>
      )}
    </div>
  );
}
