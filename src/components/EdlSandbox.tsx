/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, FileCode, Check } from 'lucide-react';

const INITIAL_EDL_JSON = `{
  "video_id": "afj-cardiff-promo-v2",
  "format_version": "2.1",
  "duration_ms": 36000,
  "segments": [
    {
      "id": "scene-1",
      "title": "Intro Pose",
      "in_ms": 0,
      "out_ms": 4500,
      "effect": "reinhard-tone-map"
    },
    {
      "id": "scene-2",
      "title": "Kupe Step",
      "in_ms": 4500,
      "out_ms": 12200,
      "effect": "reinhard-tone-map"
    },
    {
      "id": "scene-3",
      "title": "Spotlight Spin",
      "in_ms": 12200,
      "out_ms": 18000,
      "effect": "spotlight-vignette"
    },
    {
      "id": "scene-4",
      "title": "Gwara Gwara",
      "in_ms": 18000,
      "out_ms": 24500,
      "effect": "reinhard-tone-map"
    },
    {
      "id": "scene-5",
      "title": "Pilolo Sync",
      "in_ms": 24500,
      "out_ms": 31000,
      "effect": "reinhard-tone-map"
    },
    {
      "id": "scene-6",
      "title": "Outro Fade",
      "in_ms": 31000,
      "out_ms": 36000,
      "effect": "pixelate"
    }
  ]
}`;

interface ParsedEdl {
  video_id: string;
  format_version: string;
  duration_ms: number;
  segments: {
    id: string;
    title: string;
    in_ms: number;
    out_ms: number;
    effect?: string;
  }[];
}

export default function EdlSandbox() {
  const [rawJson, setRawJson] = useState(INITIAL_EDL_JSON);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEdl | null>(() => JSON.parse(INITIAL_EDL_JSON));

  const handleJsonChange = (val: string) => {
    setRawJson(val);
    try {
      const parsed = JSON.parse(val);
      if (!parsed.segments || !Array.isArray(parsed.segments)) {
        throw new Error('EDL must contain a "segments" Array attribute');
      }
      setParsedData(parsed);
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e.message || 'Invalid JSON format');
    }
  };

  const handleReset = () => {
    setRawJson(INITIAL_EDL_JSON);
    setParsedData(JSON.parse(INITIAL_EDL_JSON));
    setErrorMsg(null);
  };

  // Human read times
  const formatTimeS = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  return (
    <div className="bg-[#091a2f] text-[#fafafa] min-h-[calc(100vh-80px)] p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title block */}
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-extrabold uppercase text-[#f97316] tracking-tight">
            Interactive JSON EDL Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Treat video as database states! Edit the structured text layout on the left, and see the interactive choreography timeline map sync in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left panel: Code Editor text area */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-[#f97316]" /> Edit Timeline Manifest Code
              </span>
              <button
                onClick={handleReset}
                className="text-[10px] text-slate-400 hover:text-white uppercase font-mono flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-850 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Restore Factory
              </button>
            </div>

            <textarea
              value={rawJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={22}
              className="w-full bg-[#050e1a] border border-slate-800 text-xs font-mono text-sky-400 p-4 focus:outline-none focus:border-[#f97316] rounded-md shadow-inner leading-relaxed focus:ring-1 focus:ring-[#f97316]/50 select-all"
            />

            {errorMsg ? (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded text-red-500 font-mono text-[10.5px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Compiler Error: {errorMsg}</span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded text-emerald-500 font-mono text-[10.5px] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>EDL format syntax checked and compiled successfully.</span>
              </div>
            )}
          </div>

          {/* Right panel: Live rendered graphical timeline blocks */}
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Real-Time Visual Timeline Render
              </span>
              <span className="text-[10px] font-mono text-[#f97316] bg-[#f97316]/10 px-2 py-0.5 rounded">
                Video-as-Code Engine
              </span>
            </div>

            {parsedData && (
              <div className="bg-[#050e1a] p-6 rounded-lg border border-slate-800 space-y-6">
                
                {/* Visual Metadata particulars */}
                <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-slate-400 border-b border-slate-900 pb-4">
                  <div>
                    Project ID: <strong className="text-white">{parsedData.video_id || 'unnamed'}</strong>
                  </div>
                  <div className="text-right">
                    Total Duration: <strong className="text-white">{parsedData.duration_ms ? formatTimeS(parsedData.duration_ms) : '0s'}</strong>
                  </div>
                </div>

                {/* Horizontal ribbon bar representation */}
                <div className="space-y-2">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Chronological Film Strip Lane</div>
                  <div className="h-12 bg-slate-950 rounded flex overflow-hidden border border-slate-900 relative">
                    
                    {parsedData.segments.map((seg, i) => {
                      const totalD = parsedData.duration_ms || 36000;
                      const segmentDuration = Math.max(1, (seg.out_ms || 0) - (seg.in_ms || 0));
                      const widthPercent = (segmentDuration / totalD) * 100;
                      
                      // Alternate aesthetic segment colors
                      const colors = [
                        'bg-orange-500/10 border-orange-500/35 hover:bg-orange-500/20',
                        'bg-sky-500/10 border-sky-500/35 hover:bg-sky-500/20',
                        'bg-teal-500/10 border-teal-500/35 hover:bg-teal-500/20',
                        'bg-indigo-500/10 border-indigo-500/35 hover:bg-indigo-500/20'
                      ];
                      const choice = colors[i % colors.length];

                      return (
                        <div
                          key={seg.id || i}
                          title={`${seg.title}: ${formatTimeS(seg.in_ms)} - ${formatTimeS(seg.out_ms)}`}
                          className={`h-full border-r relative flex flex-col justify-center items-center transition-all cursor-pointer ${choice} border-collapse`}
                          style={{ width: `${widthPercent}%` }}
                        >
                          <span className="text-[9px] font-bold font-mono text-[#fafafa] truncate px-1 max-w-full">
                            {seg.title || 'Clip'}
                          </span>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Vertical Segment Stack listing */}
                <div className="space-y-3">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Interactive segment coordinates database</div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {parsedData.segments.map((seg, i) => (
                      <div 
                        key={seg.id || i}
                        className="bg-slate-955 p-3 rounded border border-slate-900 text-xs flex items-center justify-between hover:border-slate-800 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] font-bold text-[8px] text-slate-950 flex items-center justify-center font-mono">
                              {i+1}
                            </span>
                            <strong className="text-slate-100">{seg.title || 'Undeclared'}</strong>
                          </div>
                          {seg.effect && (
                            <span className="inline-block text-[9px] text-[#f97316] font-mono mt-1 bg-[#f97316]/5 px-2 py-0.2 rounded border border-[#f97316]/10">
                              FX: {seg.effect}
                            </span>
                          )}
                        </div>

                        <div className="text-right font-mono text-[10.5px]">
                          <span className="text-slate-400 font-bold">{formatTimeS(seg.in_ms || 0)}</span>
                          <span className="text-slate-600 mx-1">→</span>
                          <span className="text-[#f97316] font-bold">{formatTimeS(seg.out_ms || 0)}</span>
                          <div className="text-[8.5px] text-slate-500">
                            Duration: {formatTimeS((seg.out_ms || 0) - (seg.in_ms || 0))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
