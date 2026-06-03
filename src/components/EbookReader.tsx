/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { EbookId, LeadCapture } from '../types';
import { EBOOKS } from '../data/ebooks';
import { compileCheatSheetToPdf } from './PdfCompiler';
import { 
  Download, BookOpen, AlertCircle, FileText, CheckCircle2, ChevronRight, 
  Play, Pause, RefreshCw, Send, HelpCircle, Gamepad2, Search 
} from 'lucide-react';

interface EbookReaderProps {
  selectedEbookId: EbookId | null;
  setSelectedEbookId: (id: EbookId | null) => void;
  leads: LeadCapture[];
  setLeads: React.Dispatch<React.SetStateAction<LeadCapture[]>>;
}

export default function EbookReader({
  selectedEbookId,
  setSelectedEbookId,
  leads,
  setLeads
}: EbookReaderProps) {
  // If no ebook is specifically selected, display list overview
  const activeEbook = EBOOKS.find(b => b.id === selectedEbookId) || null;

  // Chapter state for multi-chapter ebooks
  const [activeChapter, setActiveChapter] = useState(1);

  // Lead capture inputs
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadRole, setLeadRole] = useState('Creator');
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Rhythm Lane game parameters
  const [gamePlaySpeed, setGamePlaySpeed] = useState<100 | 140 | 180>(140);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameWords, setGameWords] = useState<{ id: string; text: string; x: number; matched?: boolean }[]>([]);
  const [gameScore, setGameScore] = useState(0);
  const [gameStreak, setGameStreak] = useState(0);
  const [gameFeedback, setGameFeedback] = useState('TAP SPACE ON CUE');
  const [avgOffset, setAvgOffset] = useState<number[]>([]);

  // Jargon Glossary search state
  const [jargonQuery, setJargonQuery] = useState('');

  // Sample sentences for speech rhythm trainer
  const pacingSentences = [
    "Welcome", "to", "ProLector", "the", "first", "local", "first", "video", "and", "speech", "workspace", "engineered", "for", "professional", "media", "artists", "around", "the", "world", "who", "need", "kinetic", "coordination"
  ];

  // Rhythm Simulator Word Loop Animation
  useEffect(() => {
    if (!isGameRunning) {
      setGameWords([]);
      return;
    }

    // Interval to spawn new words according to requested WPM cadence
    // 140 WPM is approx 429ms interval. 100 WPM is 600ms. 180 WPM is 333ms.
    const spawnMs = gamePlaySpeed === 140 ? 430 : gamePlaySpeed === 100 ? 600 : 330;
    let wordIndex = 0;

    const spawnInterval = setInterval(() => {
      setGameWords(prev => {
        const nextWord = pacingSentences[wordIndex % pacingSentences.length];
        wordIndex++;
        // Add new word at x=100% position
        return [...prev, { id: `${Date.now()}-${wordIndex}`, text: nextWord, x: 100 }];
      });
    }, spawnMs);

    // Frame update interval (move words from right to left)
    const frameInterval = setInterval(() => {
      setGameWords(prev => {
        return prev
          .map(w => ({ ...w, x: w.x - (gamePlaySpeed / 60) })) // scroll speed relative to WPM
          .filter(w => w.x > -20); // remove when scrolled past
      });
    }, 30);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(frameInterval);
    };
  }, [isGameRunning, gamePlaySpeed]);

  // Handle user speech-pacing tap triggers (Space bar or button)
  const handlePacingTap = () => {
    if (!isGameRunning) {
      setIsGameRunning(true);
      setGameScore(0);
      setGameStreak(0);
      setGameFeedback('GAME BUILT! TAP FOR WORDS');
      setAvgOffset([]);
      return;
    }

    // Find the word closest to the Strike Line (Target target is around x = 20)
    const targetX = 20;
    const candidates = gameWords.filter(w => !w.matched && w.x > 0);
    if (candidates.length === 0) {
      setGameFeedback('WAIT FOR THE SIGNAL');
      return;
    }

    // Closest word
    const closest = candidates.reduce((prev, curr) => {
      return Math.abs(curr.x - targetX) < Math.abs(prev.x - targetX) ? curr : prev;
    });

    const distance = closest.x - targetX;
    const absDist = Math.abs(distance);

    let points = 0;
    let textFeedback = '';
    let offsetMs = Math.round(distance * 8); // approximate conversion to milliseconds

    if (absDist < 4) {
      points = 100;
      textFeedback = `PERFECT! (${offsetMs > 0 ? '+' : ''}${offsetMs}ms)`;
      setGameStreak(prev => prev + 1);
    } else if (absDist < 10) {
      points = 50;
      textFeedback = `GOOD (${offsetMs > 0 ? '+' : ''}${offsetMs}ms)';`;
      setGameStreak(prev => prev + 1);
    } else {
      points = 10;
      textFeedback = offsetMs > 0 ? 'TOO SLOW' : 'TOO FAST';
      setGameStreak(0);
    }

    setGameScore(prev => prev + points);
    setGameFeedback(textFeedback);
    setAvgOffset(prev => [...prev, Math.abs(offsetMs)]);

    // Mark matched to prevent multi-scoring
    setGameWords(prev => prev.map(w => w.id === closest.id ? { ...w, matched: true } : w));
  };

  // Keyboard binding for spacing haptic game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isGameRunning) {
        e.preventDefault();
        handlePacingTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameRunning, gameWords]);

  // Lead Generation Submit
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) return;

    const newLead: LeadCapture = {
      name: leadName,
      email: leadEmail,
      role: leadRole,
      timestamp: new Date().toLocaleString()
    };

    setLeads(prev => [newLead, ...prev]);
    setLeadSuccess(true);
    setLeadName('');
    setLeadEmail('');
  };

  return (
    <div className="bg-[#091a2f] text-[#fafafa] min-h-[calc(100vh-80px)] px-6 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Hand: Book Catalog sidebar index */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-[#050e1a] border border-slate-800 rounded-lg p-4">
            <h3 className="text-xs font-extrabold text-[#f97316] uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> ProLector E-Book Repository
            </h3>
            <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
              Explore interactive media treatises, academic studies, and hardware blueprints created on the ProLector SDK.
            </p>

            <div className="space-y-2">
              {EBOOKS.map((book) => {
                const isSelected = selectedEbookId === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedEbookId(book.id);
                      setActiveChapter(1);
                      setLeadSuccess(false);
                    }}
                    className={`w-full text-left p-3 rounded border text-xs transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'border-[#f97316] bg-[#f97316]/5 text-[#fafafa]'
                        : 'border-slate-800 bg-[#03080f] hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="font-bold leading-snug">{book.title}</span>
                    <span className="text-[9px] text-[#f97316] font-mono">{book.format}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 p-4 rounded-lg text-[10px] text-slate-400 leading-relaxed space-y-2">
            <h4 className="font-bold text-xs text-slate-300">💡 Compiling Notes</h4>
            <p>
              When viewing the **Broadcast Color Space & HDR Cheat Sheet**, click **"Compile A4 Print PDF"** to trigger client-side ReportLab-styled rendering. It generates a vector-graphic PDF locally.
            </p>
          </div>
        </aside>

        {/* Right Hand: Active Book Reader workspace */}
        <main className="lg:col-span-3">
          
          {!activeEbook ? (
            /* DEFAULT LANDING: CATALOG SPEC PRESENTATIONS */
            <div className="bg-[#050e1a] rounded-lg border border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#f97316]/10 border border-[#f97316]/30 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[#f97316] animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight uppercase text-[#fafafa]">
                  ProLector Somatic & Engineering Library
                </h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
                  Select any manual, academic pamphlet, or technical cheat sheet from the catalog sidebar to access full reading views, interactive speech simulators, and local PDF downloads.
                </p>
              </div>

              {/* Grid of Books */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-6">
                {EBOOKS.map((b) => (
                  <div 
                    key={b.id}
                    onClick={() => {
                      setSelectedEbookId(b.id);
                      setActiveChapter(1);
                    }}
                    className="p-4 border border-slate-800/80 bg-[#03080f] rounded-lg text-left hover:border-orange-500/50 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-[#fafafa] mb-1">{b.title}</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{b.synopsis}</p>
                    </div>
                    <span className="text-[9px] font-mono text-[#f97316] uppercase mt-auto flex items-center gap-1">
                      Load Treaty <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* RENDER THE SELECTION TREATY */
            <div className="space-y-6">
              
              {/* Ebook Metadata Banner */}
              <div className="bg-[#050e1a] border border-slate-800 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[9px] font-mono text-[#f97316] uppercase tracking-wider bg-[#f97316]/10 px-2.5 py-0.5 rounded border border-[#f97316]/20">
                    {activeEbook.format}
                  </span>
                  <h2 className="text-lg font-extrabold text-[#fafafa] uppercase tracking-tight mt-1">
                    {activeEbook.title}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xl">{activeEbook.synopsis}</p>
                </div>
                
                {/* PDF Compilation Button for Ebook 1 */}
                {activeEbook.id === 'cheat-sheet' && (
                  <button
                    onClick={compileCheatSheetToPdf}
                    className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-slate-950 font-extrabold text-xs uppercase px-5 py-3 rounded-md shadow-lg shadow-orange-500/10 cursor-pointer transition-all shrink-0 select-none self-end sm:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    Compile A4 PDF
                  </button>
                )}
              </div>

              {/* BOOK 1 SPECIFIC IMPLEMENTATION: BROADCAST COLOR SCAPE CHEAT SHEET RENDERER */}
              {activeEbook.id === 'cheat-sheet' && (
                <div className="space-y-8">
                  
                  {/* Page 1 Cover visual */}
                  <div className="border border-slate-800 bg-[#03080f] rounded-lg p-8 relative">
                    <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">PAGE 01</div>
                    <h3 className="text-xs font-mono font-bold text-[#f97316] mb-1">PROLECTOR BROADCAST COMPASS</h3>
                    <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tight">
                      Broadcast Color Space & HDR Tone Mapping
                    </h2>
                    <p className="text-xs text-slate-400 mt-3 max-w-xl leading-relaxed">
                      This treatise defines modern display engineering frameworks. Perfect for deployment over edge CDNs and local OPFS layers to decode and tone-map video dynamically on browser canvas hardware, eliminating recurring render-farm costs.
                    </p>
                    {/* Visual Waves Vector decoration */}
                    <div className="flex gap-1.5 mt-8 h-10 items-center overflow-hidden opacity-45">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 bg-[#f97316] rounded" 
                          style={{ height: `${20 + Math.sin(i * 0.4) * 20}px` }} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Page 2 Standards comparisons table */}
                  <div className="border border-slate-800 bg-[#03080f] rounded-lg p-6 relative">
                    <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">PAGE 02</div>
                    <h3 className="text-xs font-extrabold text-white mb-3 uppercase tracking-wider">
                      1. Color Gamut Standards Comparison
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300 font-mono">
                        <thead>
                          <tr className="bg-slate-900 text-[#f97316] border-b border-slate-800">
                            <th className="p-3">Parameter</th>
                            <th className="p-3">Rec. 709 Standard (SDR)</th>
                            <th className="p-3">Rec. 2020 Standard (HDR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          <tr className="hover:bg-slate-900/40">
                            <td className="p-3 font-semibold text-[#fafafa]">Gamut Coverage</td>
                            <td className="p-3">35.9% of CIE 1931 space</td>
                            <td className="p-3 text-orange-400">75.8% of CIE 1931 space</td>
                          </tr>
                          <tr className="hover:bg-slate-900/40">
                            <td className="p-3 font-semibold text-[#fafafa]">Bit Depth Res</td>
                            <td className="p-3">8-bit coordinates (256 segments)</td>
                            <td className="p-3 text-orange-400">10-bit or 12-bit (1024 / 4096 segments)</td>
                          </tr>
                          <tr className="hover:bg-slate-900/40">
                            <td className="p-3 font-semibold text-[#fafafa]">Target White Peak</td>
                            <td className="p-3">100 nits (cd/m²)</td>
                            <td className="p-3 text-orange-400">1,000 to 10,000 nits maximum curves</td>
                          </tr>
                          <tr className="hover:bg-slate-900/40">
                            <td className="p-3 font-semibold text-[#fafafa]">Transfer Functions</td>
                            <td className="p-3">Gamma 2.4 EOTF/OETF standard</td>
                            <td className="p-3 text-orange-400">PQ ST 2084 or Hybrid Log-Gamma curves</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Twin comparison boxes for PQ and HLG */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="border border-[#f97316]/30 bg-slate-950 p-4 rounded-md">
                        <h4 className="text-xs font-bold text-[#fafafa] border-b border-slate-900 pb-2 mb-2">
                          Perceptual Quantizer (PQ / ST 2084)
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Modes on absolute luminance grids. Standardized colorimeter targets on dynamic Dolby Vision Handshakes. Excellent for dark environments.
                        </p>
                      </div>
                      <div className="border border-slate-800 bg-slate-950 p-4 rounded-md">
                        <h4 className="text-xs font-bold text-[#fafafa] border-b border-slate-900 pb-2 mb-2">
                          Hybrid Log-Gamma (HLG Relative)
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Co-developed by NHK and BBC to ensure television backward compatibility. Transitions smoothly into standard SDR television gamuts.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Page 3 WebGPU WGSL shader code */}
                  <div className="border border-slate-800 bg-[#03080f] rounded-lg p-6 relative">
                    <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">PAGE 03</div>
                    <h3 className="text-xs font-extrabold text-[#fafafa] mb-2 uppercase tracking-wider">
                      2. Matrix Multiplication Mat & WebGPU WGSL Shader
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Executing Reinhard-based HLG coordinates to standard depth ranges directly inside local browser storage pipelines:
                    </p>

                    <div className="bg-[#050e1a] border border-slate-850 rounded p-4 font-mono text-[10.5px] text-sky-400 leading-relaxed overflow-x-auto">
                      <code>
                        {`// WebGPU WGSL Reinhard mapping formulation
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;
    var pixel = inputPixels[index].rgb;
    
    // Matrix transform coordinate maps
    let r = pixel.r * 1.6605 - pixel.g * 0.5876 - pixel.b * 0.0729;
    let g = -pixel.r * 0.1246 + pixel.g * 1.2524 - pixel.b * 0.1278;
    let b = -pixel.r * 0.0182 - pixel.g * 0.1006 + pixel.b * 1.1189;
    
    // Reinhard scaling algorithm
    let mapped = vec3<f32>(r, g, b) / (vec3<f32>(1.0) + vec3<f32>(r, g, b));
    outputPixels[index] = vec4<f32>(pow(mapped, vec3<f32>(1.0 / 2.2)), 1.0);
}`}
                      </code>
                    </div>
                  </div>

                  {/* Page 4 & 5 Index Dictionary Cards */}
                  <div className="border border-slate-800 bg-[#03080f] rounded-lg p-6 relative">
                    <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">PAGES 04-05</div>
                    <h3 className="text-xs font-extrabold text-white mb-4 uppercase tracking-wider">
                      3. Engineering Encyclopedia & Glossary Indexes
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { term: 'Rec. 709 Standard', def: 'The standard television specs for HD, mapping coordinated primaries within limited luminance targets.' },
                        { term: 'PQ / ST 2084 curve', def: 'Absolute quantization mapping formulas modeling human ocular brightness receptors.' },
                        { term: 'HLG backwards-compat', def: 'Relative logarithmic ranges displaying HDR imagery without clipping on normal SDR receivers.' },
                        { term: 'Color Space matrix', def: 'A 3x3 transformation matching Rec 2020 sensor values into sRGB rendering tubes.' }
                      ].map((item, idx) => (
                        <div key={idx} className="border border-slate-850 bg-slate-950/65 p-3.5 rounded border-l-2 border-l-[#f97316]">
                          <span className="block font-bold text-xs text-[#fafafa] mb-1 font-mono">{item.term}</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.def}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* BOOK 2 SPECIFIC IMPLEMENTATION: TACTILE TEMPOS WITH CUSTOM INTERACTIVE SIMULATOR */}
              {activeEbook.id === 'tactile-tempos' && (
                <div className="space-y-6">
                  
                  {/* Chapter Navigation Tabs */}
                  <div className="flex border-b border-slate-800 overflow-x-auto gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setActiveChapter(num);
                          setIsGameRunning(false);
                        }}
                        className={`px-4 py-2 text-xs font-bold font-mono tracking-tight shrink-0 transition-colors cursor-pointer border-b-2 ${
                          activeChapter === num
                            ? 'border-[#f97316] text-[#f97316]'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        CH 0{num}
                      </button>
                    ))}
                  </div>

                  {/* Render dynamic chapter contents */}
                  <div className="border border-slate-800 bg-[#03080f] rounded-lg p-6">
                    
                    {activeChapter === 1 && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono text-[#f97316]">PAGE 01 • CHAPTER 1</span>
                        <h3 className="text-base font-extrabold uppercase text-white tracking-tight">
                          The Presentation Paradox
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Why do polished executives, anchors, and candidates lock up when speaking behind high-end teleprompters? The paradox is the **reading voice**.
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          When tracking eyes scan a rolling visually intense field to capture words, the visual cortex experiences tracking fatigue. To compensate, cognitive resources are locked into decoding letters. Speech cadences drop into a clinical, dry reading rhythm, losing warmth, inflection, and natural phrasing. Bypass systems must reside in alternative sensory paths.
                        </p>
                      </div>
                    )}

                    {activeChapter === 2 && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono text-[#f97316]">PAGE 02 • CHAPTER 2</span>
                        <h3 className="text-base font-extrabold uppercase text-white tracking-tight">
                          Sensorimotor Entrainment & SMS Science
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Humans have native synchronization pathways known as **Sensorimotor Synchronization (SMS)**.
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Just as drummers synchronize patterns to auditory headphone clicks or clinical speech-gait physical therapists guide stroke recovery paths via acoustic beats, the somatosensory system can decode rhythmic instruction. Re-indexing auditory click beats into non-audible physical skin micro-pulses allows the brain to subconsciously track cadence without visual clutter, leaving the visual cortex completely optimized to connect with the audience.
                        </p>
                      </div>
                    )}

                    {activeChapter === 3 && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono text-[#f97316]">PAGE 03 • CHAPTER 3</span>
                        <h3 className="text-base font-extrabold uppercase text-white tracking-tight">
                          The Silent Conductor (140 WPM Rubric)
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          The absolute metric scale for engaging public speaking is exactly **140 words per minute**.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded border border-slate-850 font-mono text-center">
                          <div className="p-2">
                            <span className="block text-[#f97316] text-sm font-bold">140 WPM</span>
                            <span className="text-[9px] text-slate-500">Cadence Standard</span>
                          </div>
                          <div className="border-t sm:border-t-0 sm:border-x border-slate-900 p-2">
                            <span className="block text-[#ffafaf] text-sm font-bold">2.33 Hz</span>
                            <span className="text-[9px] text-slate-500">Motor Freq Cycle</span>
                          </div>
                          <div className="p-2">
                            <span className="block text-[#ffafaf] text-sm font-bold">429 ms</span>
                            <span className="text-[9px] text-slate-500">Cycle Duration</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#fafafa]/80 leading-relaxed">
                          By calling haptic controllers like Pulsar to trigger short somatic pulses at exactly **429-millisecond intervals**, speakers automatically internalize the velocity loop behind hand muscles, rendering heavy teleprompter displays redundant.
                        </p>
                      </div>
                    )}

                    {activeChapter === 4 && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono text-[#f97316]">PAGE 04 • CHAPTER 4</span>
                        <h3 className="text-base font-extrabold uppercase text-white tracking-tight">
                          The Tri-Sensory Loop & VAD Automation
                        </h3>
                        <p className="text-xs text-[#fafafa]/80 leading-relaxed">
                          To make speech rhythm entrainment fully natural, we harmonize three sensory feedback loops:
                        </p>
                        <div className="space-y-2 text-xs">
                          <div className="border border-slate-850 p-3 rounded bg-slate-950 flex items-start gap-3">
                            <span className="bg-[#f97316] text-slate-950 rounded-full w-5 h-5 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">1</span>
                            <div>
                              <strong className="text-white block">Auditory Pacing (Voice Mirror)</strong>
                              <span className="text-slate-400 text-[11px]">Real-time decibel pitch adjustments that echo minor sub-notes back into open earpieces.</span>
                            </div>
                          </div>
                          <div className="border border-slate-850 p-3 rounded bg-slate-950 flex items-start gap-3">
                            <span className="bg-[#f97316] text-slate-950 rounded-full w-5 h-5 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">2</span>
                            <div>
                              <strong className="text-white block">Visual Pacing (Rhythm Lane)</strong>
                              <span className="text-slate-400 text-[11px]">A streaming visual path that signals upcoming word beats synchronously with slide prompts.</span>
                            </div>
                          </div>
                          <div className="border border-slate-850 p-3 rounded bg-slate-950 flex items-start gap-3">
                            <span className="bg-[#f97316] text-slate-950 rounded-full w-5 h-5 flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">3</span>
                            <div>
                              <strong className="text-white block">Tactile Pacing (Pulsar Haptics)</strong>
                              <span className="text-slate-400 text-[11px]">Physical tactile micro-pulses executing silent hand feedback loops.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CHAPTER 5 INTERACTIVE GAME WORKSPACE: THE RHYTHM LANE WIDGET */}
                    {activeChapter === 5 && (
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] font-mono text-[#f97316]">PAGE 05 • CHAPTER 5</span>
                          <h3 className="text-base font-extrabold uppercase text-white tracking-tight">
                            Live Rhythm Lane (Speech Pacing Simulator)
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1">
                            An interactive simulator showing how visual sliding targets train natural speech tempos. Choose your cadence target, tap the **SPACEBAR** (or the visual Tap Key) exactly when the words cross the **ORANGE LINE**!
                          </p>
                        </div>

                        {/* Interactive Widget Game Screen */}
                        <div className="bg-slate-950 rounded-lg p-5 border border-slate-800 relative select-none">
                          
                          {/* Speed Selectors */}
                          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Target Speeds:</span>
                            <div className="flex gap-2">
                              {([100, 140, 180] as const).map((spd) => (
                                <button
                                  key={spd}
                                  onClick={() => {
                                    setGamePlaySpeed(spd);
                                    setIsGameRunning(false);
                                  }}
                                  className={`px-3 py-1 text-[10px] font-bold font-mono rounded cursor-pointer ${
                                    gamePlaySpeed === spd
                                      ? 'bg-orange-500 text-slate-950'
                                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {spd} WPM
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Words Scrolling Canal */}
                          <div className="h-20 bg-[#03080f] rounded border border-slate-900 relative overflow-hidden flex items-center">
                            
                            {/* Static Target Alignment Strike Line */}
                            <div className="absolute left-[20%] inset-y-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600 z-20 shadow-lg shadow-orange-500/20" />
                            <span className="absolute left-[20%] top-1 -translate-x-1/2 bg-orange-500 text-[6.5px] font-bold font-mono text-slate-950 px-1 py-0.2 rounded z-20">STRIKE</span>

                            {/* Sliding Word Cards */}
                            {!isGameRunning ? (
                              <div className="text-center w-full text-[11px] text-slate-500 font-mono">
                                Press "Start Metronome" to launch rhythm simulation.
                              </div>
                            ) : (
                              gameWords.map((word) => (
                                <div
                                  key={word.id}
                                  className={`absolute py-1 px-3.5 rounded font-bold font-mono text-xs transition-opacity duration-150 transform -translate-y-1/2 top-1/2 ${
                                    word.matched 
                                      ? 'bg-slate-800/80 text-slate-600 line-through scale-90' 
                                      : 'bg-slate-900 text-slate-200 border border-slate-755'
                                  }`}
                                  style={{ left: `${word.x}%` }}
                                >
                                  {word.text}
                                </div>
                              ))
                            )}

                          </div>

                          {/* Stats Dashboard */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 font-mono text-center">
                            <div className="p-3 bg-slate-900/50 rounded border border-slate-900">
                              <span className="text-[10px] text-slate-500 uppercase block">Total Points</span>
                              <span className="text-sm font-bold text-white">{gameScore}</span>
                            </div>
                            <div className="p-3 bg-slate-900/50 rounded border border-slate-900">
                              <span className="text-[10px] text-slate-500 uppercase block">Active Streak</span>
                              <span className="text-sm font-bold text-orange-400">{gameStreak} 🔥</span>
                            </div>
                            <div className="p-3 bg-slate-900/50 rounded border border-slate-900">
                              <span className="text-[10px] text-slate-500 uppercase block">Pacing Score</span>
                              <span className="text-xs font-bold text-white uppercase">{gameFeedback}</span>
                            </div>
                            <div className="p-3 bg-slate-900/50 rounded border border-slate-900">
                              <span className="text-[10px] text-slate-500 uppercase block">Avg Offset</span>
                              <span className="text-xs font-bold text-emerald-400">
                                {avgOffset.length ? `${Math.round(avgOffset.reduce((a,b)=>a+b,0)/avgOffset.length)}ms` : '0ms'}
                              </span>
                            </div>
                          </div>

                          {/* Controls Row */}
                          <div className="flex gap-2 mt-5">
                            <button
                              onClick={() => setIsGameRunning(!isGameRunning)}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-md font-bold text-xs uppercase cursor-pointer transition-colors ${
                                isGameRunning
                                  ? 'bg-red-900 hover:bg-red-850 text-white'
                                  : 'bg-emerald-900 hover:bg-emerald-850 text-emerald-100'
                              }`}
                            >
                              {isGameRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              {isGameRunning ? 'Silence Rhythm' : 'Start Metronome'}
                            </button>
                            <button
                              onClick={handlePacingTap}
                              disabled={!isGameRunning}
                              className="px-8 bg-[#f97316] hover:bg-orange-650 text-slate-950 font-bold text-xs uppercase rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-orange-500/15 disabled:opacity-40"
                            >
                              <Gamepad2 className="w-4 h-4" />
                              TAP ACTION KEY (or SPACEBAR)
                            </button>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* CHAPTER 6 LEAD CAPTURE FORM INTEGRATION */}
                    {activeChapter === 6 && (
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] font-mono text-[#f97316]">PAGE 06 • CHAPTER 6</span>
                          <h3 className="text-base font-extrabold uppercase text-white tracking-tight">
                            Unlock Workspace Integration
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1">
                            Lock in your free ProLector active account and synchronize your custom e-book progress directly with your Supabase credentials!
                          </p>
                        </div>

                        {leadSuccess ? (
                          <div className="bg-emerald-950/20 border border-emerald-800/40 p-6 rounded-md text-center max-w-md mx-auto space-y-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-100 uppercase font-mono">Workspace Synced Successfully!</h4>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Check the **Settings Portal** to view database receipts, or load additional chapters immediately.
                              </p>
                            </div>
                            <button
                              onClick={() => setLeadSuccess(false)}
                              className="text-xs text-[#f97316] font-bold font-mono underline hover:text-orange-400 cursor-pointer"
                            >
                              Register alternative account
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleLeadSubmit} className="max-w-md mx-auto border border-slate-800/80 bg-slate-950 p-6 rounded-md space-y-4">
                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Your Full Name</label>
                              <input
                                type="text"
                                required
                                value={leadName}
                                onChange={(e) => setLeadName(e.target.value)}
                                placeholder="e.g. Ade Cardiff"
                                className="w-full bg-[#03080f] border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f97316]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Business Electronic Mail</label>
                              <input
                                type="email"
                                required
                                value={leadEmail}
                                onChange={(e) => setLeadEmail(e.target.value)}
                                placeholder="e.g. ade@afjcardiff.com"
                                className="w-full bg-[#03080f] border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f97316]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Professional Role</label>
                              <select
                                value={leadRole}
                                onChange={(e) => setLeadRole(e.target.value)}
                                className="w-full bg-[#03080f] border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f97316]"
                              >
                                <option value="Creator">Digital Video Producer</option>
                                <option value="Video Engineer">Broadcast & Color Engineer</option>
                                <option value="Developer">Local-First Frontend Architect</option>
                                <option value="Designer">Kinetic Somatic Coach</option>
                              </select>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 bg-[#f97316] hover:bg-orange-600 text-slate-950 font-extrabold text-xs uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" /> Commit Supabase Workspace
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* CHAPTER 7 JARGON ENCYCLOPEDIA DEEP DATABASE SELECTION */}
                    {activeChapter === 7 && (
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] font-mono text-[#f97316]">PAGE 07 • CHAPTER 7</span>
                          <h3 className="text-base font-extrabold uppercase text-white tracking-tight">
                            Glossary & Jargon Encyclopedia
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1">
                            An interactive searchable repository containing all specialized nomenclature, auditory pacing mechanisms, and somatic haptic formulas.
                          </p>
                        </div>

                        {/* Search glossary */}
                        <div className="relative">
                          <input
                            type="text"
                            value={jargonQuery}
                            onChange={(e) => setJargonQuery(e.target.value)}
                            placeholder="Filter terminology (e.g. 'Sync', 'Haptic', 'TTS')..."
                            className="w-full bg-slate-950 text-xs border border-slate-800 rounded-md px-3 py-2 pl-9 focus:outline-none focus:border-[#f97316]"
                          />
                          <div className="absolute left-3 top-2.5">
                            <Search className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { term: 'Prosody', definition: 'The speech cadence, melodic inflection, and rhythmic stress pattern of natural speaker voices.' },
                            { term: 'Tactile Somatic Bypass', definition: 'Triggering micro haptic controllers to instruct physical nerves bypassing visual display screens.' },
                            { term: 'Sensorimotor Synchronization', definition: 'Clamping skeletal velocity loops synchronously to precise rhythmic metronomes.' },
                            { term: 'Rhythmic Auditory Stimulation', definition: 'Clinical neurological protocol using repetitive sound patterns to guide walking gait indices.' },
                            { term: '140 WPM Rubric', definition: 'The optimal spoken cadence translating to exactly 2.33 Hz or 429ms cycle intervals.' },
                            { term: 'Pulsar Haptics', definition: 'Somatic haptic micro-driver library created for non-intrusive public speaking feedback.' }
                          ]
                            .filter(term => term.term.toLowerCase().includes(jargonQuery.toLowerCase()) || term.definition.toLowerCase().includes(jargonQuery.toLowerCase()))
                            .map((item, idx) => (
                              <div key={idx} className="bg-slate-950 p-4 border border-slate-850 rounded">
                                <strong className="text-slate-100 block text-xs mb-1 font-mono">{item.term}</strong>
                                <p className="text-[11.5px] text-slate-400 leading-relaxed">{item.definition}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* BOOK 3 SPECIFIC: TECHNICAL SPECIFICATION PARADIGM v2.0 */}
              {activeEbook.id === 'tech-manual' && (
                <div className="border border-slate-800 bg-[#03080f] rounded-lg p-6 space-y-6">
                  <div className="flex border-b border-slate-850 pb-2 overflow-x-auto gap-4 font-mono text-[11px]">
                    {['Exec Summary', 'Specs', 'Mathematics', 'Code Spec', 'WebGPU', 'Pipeline'].map((label, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveChapter(i + 1)}
                        className={`pb-2 ${activeChapter === i + 1 ? 'text-[#f97316] font-bold border-b-2 border-[#f97316]' : 'text-slate-400'}`}
                      >
                        Section {i + 1}. {label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed">
                    {activeChapter === 1 && (
                      <>
                        <h4 className="font-extrabold text-white text-sm">SECTION 1: EXECUTIVE SUMMARY & PARADIGM SHIFT</h4>
                        <p className="text-slate-300">
                          Traditional Non-Linear Editors (NLEs) act on file timelines. ProLector establishes the A-NLE model where editing occurs as structural coordinate streams synced directly to sub-audible speech rhythms.
                        </p>
                        <p className="text-slate-400">
                          By leveraging WebGPU shaders on local-first consumer hardware, spatial joint velocities can be extracted locally inside browser frame caches. Combined with pgvector embeddings, video transitions are mapped as vectors.
                        </p>
                      </>
                    )}

                    {activeChapter === 2 && (
                      <>
                        <h4 className="font-extrabold text-white text-sm">SECTION 2: KINETIC & RHYTHMIC DESCRIPTOR SPECIFICATIONS</h4>
                        <p className="text-slate-300">
                          Visual edits must map to temporal skeletons. The JSON Schema details coordinate joints $J_i = (x,y,z)$, velocity rates $v_i = \delta J / \delta t$, and audio transients.
                        </p>
                        <div className="bg-slate-950 p-3 rounded font-mono text-[10px] text-emerald-400">
                          {`{
  "scene_id": "kupe-step",
  "optical_flow_magnitude": 12.45,
  "joint_accelerations": [0.45, -1.22, 0.44], 
  "tempo_marker_hz": 2.33
}`}
                        </div>
                      </>
                    )}

                    {activeChapter === 3 && (
                      <>
                        <h4 className="font-extrabold text-white text-sm">SECTION 3: MATHEMATICAL FOUNDATIONS OF KINETIC TRACKING</h4>
                        <p className="text-slate-300">
                          Translational joint velocity tracking applies standard Euclidean distance matrices on concurrent frames.
                        </p>
                        <p className="text-slate-350">
                          {"$$ R_{xy}(\\tau) = \\lim_{T \\to \\infty} \\frac{1}{T} \\int_{0}^{T} x(t) y(t + \\tau) dt $$"}
                        </p>
                        <p className="text-slate-400">
                          We execute mathematical cross-correlation matching visual optical flow peaks against audio speech cadence frequency peaks, establishing automatic transition alignments.
                        </p>
                      </>
                    )}

                    {activeChapter === 4 && (
                      <>
                        <h4 className="font-extrabold text-white text-sm">SECTION 4: BROWSER-FIRST FEATURE EXTRACTION VIA WEB WORKERS</h4>
                        <p className="text-slate-300">
                          To minimize CPU rendering, raw frames are decoded using **WebCodecs VideoDecoderAPI** and calculated in parallelized web threading workers, streaming results to central cache memory.
                        </p>
                      </>
                    )}

                    {activeChapter === 5 && (
                      <>
                        <h4 className="font-extrabold text-white text-sm">SECTION 5: WEBGPU DYNAMIC PACING SHADERS</h4>
                        <p className="text-slate-300">
                          WGSL compute shaders apply tone compression scale matrices on visual blocks locally at 60fps, feeding clean pixel maps to client HTML canvas targets.
                        </p>
                      </>
                    )}

                    {activeChapter === 6 && (
                      <>
                        <h4 className="font-extrabold text-white text-sm">SECTION 6: SERVER-SIDE ANALYTICS PIPELINE</h4>
                        <p className="text-slate-350">
                          Our lightweight python pipelines parse audio channels through Librosa schemas and F5-TTS templates, pushing semantic vectors to Supabase databases via pooled secure bridges.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* BOOK 4: UNDER THE HOOD: NON-DESTRUCTIVE EDLs */}
              {activeEbook.id === 'edl-guide' && (
                <div className="border border-slate-800 bg-[#03080f] rounded-lg p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-[#f97316] uppercase tracking-wider font-mono">
                    Non-Destructive JSON Timeline specification
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    By formatting edited video states as dynamic JSON database attributes (what we call **Video as Code**), we bypass binary media rendering overhead. Learn the underlying schema grammar:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] text-slate-400 font-mono divide-y divide-slate-800 border border-slate-850">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-2.5">Key Attribute</th>
                          <th className="p-2.5">Data Type</th>
                          <th className="p-2.5">Defaults</th>
                          <th className="p-2.5">Constraint Limits</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        <tr className="hover:bg-slate-950">
                          <td className="p-2.5 text-orange-400 font-bold">video_id</td>
                          <td className="p-2.5">String</td>
                          <td className="p-2.5">null</td>
                          <td className="p-2.5">Must match database project index</td>
                        </tr>
                        <tr className="hover:bg-slate-950">
                          <td className="p-2.5 text-orange-400 font-bold">in_ms</td>
                          <td className="p-2.5">Integer</td>
                          <td className="p-2.5">0</td>
                          <td className="p-2.5">Greater than or equal to 0</td>
                        </tr>
                        <tr className="hover:bg-slate-950">
                          <td className="p-2.5 text-orange-400 font-bold">out_ms</td>
                          <td className="p-2.5">Integer</td>
                          <td className="p-2.5">Source maximum</td>
                          <td className="p-2.5">Must exceed in_ms value</td>
                        </tr>
                        <tr className="hover:bg-slate-950">
                          <td className="p-2.5 text-orange-400 font-bold">effects[]</td>
                          <td className="p-2.5">Array[String]</td>
                          <td className="p-2.5">[]</td>
                          <td className="p-2.5">Supported GPU web filters</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                    Because this metadata is plain structured text, multiple collaborators can execute concurrent edits, creating git-like visual branching trees across edge nodes.
                  </p>
                </div>
              )}

              {/* BOOK 5: PROLECTOR GENESIS NARRATIVE */}
              {activeEbook.id === 'genesis' && (
                <div className="border border-slate-800 bg-[#03080f] rounded-lg p-6 space-y-5 text-xs text-slate-300 leading-relaxed">
                  <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#f97316]">EDITORIAL TREATMENT</span>
                    <span className="font-mono text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-white">5-PART CHRONICLE</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-[#fafafa] uppercase tracking-tight text-xs mb-1">
                        Part 1: The Naming Baptism
                      </h4>
                      <p className="text-slate-400">
                        Derived from the Latin root **lector** (reader, conductor of books). ProLector aligns branding alongside high-end workspaces like DaVinci Resolve or Pro Tools, setting clear semantic distance between casual editing toys and precision-engineered somatic video simulators.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#fafafa] uppercase tracking-tight text-xs mb-1">
                        Part 2: The Core Workspace Stack
                      </h4>
                      <p className="text-slate-400">
                        By integrating lightweight local models (Kokoro-82M) inside web app boundaries, we bypass heavy server execution costs, utilizing WebGPU, Gemma-2B embeddings, and Oracle JSON schemas to handle local-first user flows.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#fafafa] uppercase tracking-tight text-xs mb-1">
                        Part 3: Dual-Core SyllabusMirror splits
                      </h4>
                      <p className="text-slate-400">
                        The architecture executes dual pipelines. Generative speech replicates via edge clone nodes (F5-TTS), while local CPU modules (Kokoro) analyze pacing vectors on real-time, zero-network workloads.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#fafafa] uppercase tracking-tight text-xs mb-1">
                        Part 4: The Progressive Web App (PWA) Decision
                      </h4>
                      <p className="text-slate-400">
                        *ADR-008* rejects bloated Electron wraps to choose native browser APIs. *ADR-010* institutes the **Origin Private File System (OPFS)** protocol to cache raw 10-bit Dolby Vision master videos directly on disk safely, generating offline sub-proxies inside background layers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>

      </div>
    </div>
  );
}
