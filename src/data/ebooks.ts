/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EbookMetadata } from '../types';

export const EBOOKS: EbookMetadata[] = [
  {
    id: 'cheat-sheet',
    title: 'Broadcast Color Space & HDR Cheat Sheet',
    format: '5-Page Technical Reference Guide (A4-Print Optimized)',
    synopsis: 'A deep-dive technical reference manual for video engineers documenting calculations, gamuts, transfer functions, and WGSL shaders to convert HDR mobile footage (Dolby Vision) to SDR standards on-device.',
    pagesCount: 5,
  },
  {
    id: 'tactile-tempos',
    title: 'Tactile Tempos: Sensorimotor Haptic Entrainment',
    format: 'Multi-Chapter Interactive Educational E-Book & Inbound Funnel',
    synopsis: 'Explains the cognitive science of somatic bypass to bypass the "reading voice" using sub-sensory haptic micro-pulses (using custom motor-interval patterns) to train a natural 140 WPM speech cadence.',
    pagesCount: 8,
  },
  {
    id: 'tech-manual',
    title: 'ProLector Technical Manual v2.0: The Kinetic Paradigm',
    format: 'Deep Technical Engineering Specification',
    synopsis: 'Programmatic specs for local joint tracking, audio-visual transient alignment, and WebGPU pacing shaders under the kinetic and rhythmic editing models.',
    pagesCount: 6,
  },
  {
    id: 'edl-guide',
    title: 'Under the Hood: Non-Destructive JSON EDLs',
    format: 'Embedded Long-Form Semantic Article',
    synopsis: 'A complete reference outlining video editing as a structured JSON database state ("Video as Code"), including exact grammar, schemas, and processing streams.',
    pagesCount: 5,
  },
  {
    id: 'genesis',
    title: 'ProLector Genesis: Naming, Architecture & The PWA Pivot',
    format: 'Section-Numbered Corporate & Technical Essay',
    synopsis: 'Details the history of the ProLector naming baptism, stack decisions (Unsloth, Gemma), local processing splits, and Progressive Web App Architectural Decision Records (ADRs).',
    pagesCount: 5,
  }
];

export const GLOSSARY_CHEAT_SHEET_P1 = [
  { term: 'Rec. 709', definition: 'The standard ITU television recommendation for high-definition television (HDTV), establishing a standard color gamut (sRGB-like) and standard 2.4 gamma transfer function.' },
  { term: 'Rec. 2020/2100', definition: 'Technical specifications for Ultra High Definition (UHD) video, defining wide color gamuts and supporting PQ and HLG transfer curves for high-powered displays.' },
  { term: 'CIE 1931', definition: 'The primary mathematical model mapping color wavelengths to human tristimulus visual sensation, represented in chromacity diagrams.' },
  { term: 'Color Gamut', definition: 'The entire coordinate space range of color wavelengths a specific display can render or a sensor can capture.' },
  { term: 'Bit Depth', definition: 'The mathematical step resolution of channel intensity. Rec 709 utilizes 8-bit increments (256 steps), while Rec 2020 mandates 10-bit or 12-bit depth (1024 to 4096 steps).' },
  { term: 'Nits (cd/m²)', definition: 'The absolute SI measurement of luminous intensity per unit area. Standard SDR screens target 100 nits, whereas modern HDR screens exceed 1000 nits.' },
  { term: 'EOTF', definition: 'Electro-Optical Transfer Function. The mathematical curve mapping non-linear digital signals into physical screen light luminance levels.' },
  { term: 'PQ (SST 2084)', definition: 'Perceptual Quantizer. An absolute EOTF curve that targets human contrast perception, scaling coordinates from 0 to 10,000 nits.' }
];

export const GLOSSARY_CHEAT_SHEET_P2 = [
  { term: 'HLG', definition: 'Hybrid Log-Gamma. A relative HDR transfer curve designed by NHK and BBC that is backwards-compatible with standard SDR televisions.' },
  { term: 'Color Space Transform (CST)', definition: 'A matrix transformation mapping coordinates from source gamuts (e.g. Rec 2020) and gamma to targeted standards (e.g. Rec 709).' },
  { term: 'WGSL', definition: 'WebGPU Shading Language. A rust-adjacent compiled shader code executed directly on local GPUs via modern browser interfaces.' },
  { term: 'Tone Mapping', definition: 'The technical compression process of squeezing high-dynamic-range luma coordinates into low-dynamic-range ranges.' },
  { term: 'OETF / OOTF', definition: 'Opto-Electronic/Optical-Electro curves modeling camera sensor capture and system rendering transfers.' },
  { term: 'IRE Scale', definition: 'An arbitrary linear percentage scale (0 to 100) established by the Institute of Radio Engineers to map video signals.' },
  { term: 'Legal vs Full Range', definition: 'Digital scaling. Legal ranges clamp values to 16-235 (in 8-bit) for broadcast safety, whereas Full uses 0-255.' },
  { term: 'Edge Deployments', definition: 'Decentralized caching architectures like Cloudflare Workers serving asset fragments to reduce network latencies.' }
];

export const JARGON_ENCYCLOPEDIA = [
  { term: 'Prosody', definition: 'The rhythm, cadence, inflection, patterns, stress, and intonation of speaking voices. Essential for natural speech delivery.' },
  { term: 'Tactile Haptics', definition: 'Non-visual, sub-sensory vibration feedback delivered directly into physical nerves to pass instructions bypassing sight.' },
  { term: 'Sensorimotor Sync', definition: 'The cognitive synchronization of motor actions matching repetitive sensory pacing cues (auditory or tactile beats).' },
  { term: 'Auditory Entrainment', definition: 'The neurological phenomenon where user brain waves or bodily cadences synchronize to acoustic pacing rhythms.' },
  { term: 'RAS (Rhythmic Auditory)', definition: 'Rhythmic Audory Stimulation. A clinical neurological therapy using repetitive beats to guide and recover steady physical motor strides.' },
  { term: '140 WPM Rubric', definition: 'The optimal standardized reading cadence for comfortable public speaking, translating to exactly 2.33 Hz or 429ms pacing intervals.' },
  { term: 'Pulsar Haptics', definition: 'Software Mansion native haptic library optimizing micro-motor vibrations for silent, non-intrusive tactile rhythm pacing.' },
  { term: 'Kokoro & MeloTTS', definition: 'Ultra-lightweight state-of-the-art TTS architectures capable of running highly expressive speech generation directly on consumer CPUs.' }
];
