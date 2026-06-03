/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EbookId } from '../types';
import { Sliders, BookOpen, Settings, Code, Film, Tv } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'library' | 'teleprompter' | 'edl-sandbox' | 'settings';
  setActiveTab: (tab: 'studio' | 'library' | 'teleprompter' | 'edl-sandbox' | 'settings') => void;
  selectedEbookId: EbookId | null;
  setSelectedEbookId: (id: EbookId | null) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedEbookId,
  setSelectedEbookId
}: NavbarProps) {
  const tabs = [
    { id: 'studio', label: 'Scene Studio', icon: Film },
    { id: 'library', label: 'E-Book Studio', icon: BookOpen },
    { id: 'teleprompter', label: 'CapCut Editor Pro', icon: Tv },
    { id: 'edl-sandbox', label: 'JSON EDL Sandbox', icon: Code },
    { id: 'settings', label: 'Settings Portal', icon: Settings }
  ] as const;

  return (
    <nav className="border-b border-slate-800 bg-[#050e1a]/95 sticky top-0 z-50 backdrop-blur-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Header */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            setActiveTab('studio');
            setSelectedEbookId(null);
          }}
        >
          <div className="w-9 h-9 rounded-md bg-[#f97316] flex items-center justify-center font-bold text-xl text-slate-950 transition-transform group-hover:scale-105">
            P
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-[#fafafa] uppercase group-hover:text-[#f97316] transition-colors">
              PROLECTOR <span className="text-[#f97316] text-xs font-mono lowercase tracking-normal">workspace</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400">AFJ Cardiff Series · v2.0</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'library') {
                    setSelectedEbookId(null);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-xs tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#f97316] text-slate-950 shadow-md shadow-orange-500/10'
                    : 'text-slate-300 hover:text-[#fafafa] hover:bg-slate-800/50 border border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
