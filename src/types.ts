/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Scene {
  id: string;
  title: string;
  startMs: number;
  endMs: number;
  description: string;
  thumbnailUrl?: string;
  isCustom?: boolean;
}

export type EbookId = 'cheat-sheet' | 'tactile-tempos' | 'tech-manual' | 'edl-guide' | 'genesis';

export interface EbookMetadata {
  id: EbookId;
  title: string;
  format: string;
  synopsis: string;
  pagesCount: number;
}

export interface LeadCapture {
  email: string;
  name: string;
  role: string;
  timestamp: string;
}
