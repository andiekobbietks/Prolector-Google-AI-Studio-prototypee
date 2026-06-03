import React, { useState, useEffect } from "react";
import { Activity, Target, Zap, LayoutList } from "lucide-react";

interface DanceMotionAnalyzerProps {
  description: string;
  progressPct?: number;
  isHovered?: boolean;
  compact?: boolean;
}

export default function DanceMotionAnalyzer({ description, progressPct = 0, isHovered = false, compact = false }: DanceMotionAnalyzerProps) {
  const [tags, setTags] = useState<{ label: string; confidence: number }[]>([]);
  const [motionEnergy, setMotionEnergy] = useState(0);

  useEffect(() => {
    // Basic heuristics to generate tags based on description and progress
    const descLower = description.toLowerCase();
    
    // Some dance/action keywords to trigger on
    const keywords = ["azonto", "gwara gwara", "kupe", "pilolo", "monologue", "interview", "tutorial", "speaking", "action", "transition", "introductory"];
    
    let matchedTags: { label: string; confidence: number }[] = [];
    
    keywords.forEach(kw => {
      if (descLower.includes(kw)) {
        matchedTags.push({ label: kw, confidence: Math.floor(80 + Math.random() * 19) });
      }
    });

    if (matchedTags.length === 0) {
      if (descLower.includes("talk") || descLower.includes("speak") || descLower.includes("explaining")) {
        matchedTags.push({ label: "monologue", confidence: 92 });
      } else if (descLower.includes("dance") || descLower.includes("move") || descLower.includes("step")) {
        matchedTags.push({ label: "dance routine", confidence: 88 });
      } else {
        matchedTags.push({ label: "general action", confidence: 75 });
      }
    }
    
    // Add dynamic tags based on the current hover progress
    if (isHovered) {
      if (progressPct < 20) {
        matchedTags.push({ label: "preparation", confidence: 95 });
      } else if (progressPct > 80) {
        matchedTags.push({ label: "follow-through", confidence: 91 });
      } else {
        matchedTags.push({ label: "peak action", confidence: 97 });
      }
      
      // Simulate energy spikes
      setMotionEnergy(Math.floor(40 + Math.random() * 50));
    } else {
      setMotionEnergy(0);
    }

    setTags(matchedTags.slice(0, 3));
    
  }, [description, progressPct, isHovered]);

  if (compact) {
    return (
      <div className="flex gap-1.5 flex-wrap mt-1.5">
        {tags.map((tag, i) => (
          <div key={i} className="flex items-center bg-sky-950/20 border border-sky-900/40 rounded px-1 py-0.5 text-[6px] font-mono uppercase text-sky-400 gap-1 shadow-sm transition-colors hover:border-sky-700/50 hover:bg-sky-900/30">
            <span className="truncate max-w-[80px] font-bold">{tag.label}</span>
            <span className="text-[5.5px] text-sky-500/70">{tag.confidence}%</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#020612] border border-slate-900 rounded p-3 mt-3">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-900/50 text-[9px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider text-slate-300">
          <Activity className="w-3.5 h-3.5 text-sky-400" /> Florence-2 Vision Pipeline
        </span>
        <span className="flex items-center gap-1">
          Target Engine: <span className="text-sky-500 font-bold">florence2-vlm-quant.onnx</span>
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[8px] font-mono uppercase bg-slate-950/50 p-1.5 rounded">
          <span className="text-slate-500 flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Kinetic Energy Est.</span>
          
          <div className="flex-1 max-w-[100px] ml-3 mr-2 bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
              style={{ width: `${motionEnergy}%` }}
            />
          </div>
          <span className="text-yellow-500 font-bold w-6 text-right">{motionEnergy}%</span>
        </div>

        <div className="flex gap-2 flex-wrap mt-1">
          {tags.map((tag, i) => (
            <div key={i} className="flex items-center bg-sky-950/20 border border-sky-900/40 rounded px-2 py-1 text-[8px] font-mono uppercase text-sky-300 gap-1.5 group cursor-default shadow-sm shadow-sky-900/10 transition-colors hover:border-sky-700/50 hover:bg-sky-900/30">
              <Target className="w-2.5 h-2.5 text-sky-500 opacity-70 group-hover:opacity-100" />
              <span className="truncate max-w-[100px] font-bold">{tag.label}</span>
              <span className="text-[7px] text-sky-500/70 ml-0.5 bg-sky-950/50 px-1 rounded-sm border border-sky-900/30">{tag.confidence}%</span>
            </div>
          ))}
          {tags.length === 0 && (
            <span className="text-slate-500 text-[9px] italic">Analyzing semantics...</span>
          )}
        </div>
      </div>
    </div>
  );
}
