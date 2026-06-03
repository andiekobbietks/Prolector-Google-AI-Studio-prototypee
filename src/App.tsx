/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SceneStudio from './components/SceneStudio';
import EbookReader from './components/EbookReader';
import RemotionTimelineStudio from './components/RemotionTimelineStudio';
import EdlSandbox from './components/EdlSandbox';
import SettingsPortal from './components/SettingsPortal';
import { EbookId, LeadCapture } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'library' | 'teleprompter' | 'edl-sandbox' | 'settings'>('studio');
  const [selectedEbookId, setSelectedEbookId] = useState<EbookId | null>(null);
  
  // Shared persistent leads state list
  const [leads, setLeads] = useState<LeadCapture[]>(() => {
    try {
      const stored = localStorage.getItem('prolector_leads_index');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track leads to cache storage
  useEffect(() => {
    localStorage.setItem('prolector_leads_index', JSON.stringify(leads));
  }, [leads]);

  return (
    <div className="min-h-screen bg-[#091a2f] text-[#fafafa] selection:bg-[#f97316] selection:text-slate-950 flex flex-col font-sans">
      
      {/* Dynamic Brand Navigation bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        selectedEbookId={selectedEbookId}
        setSelectedEbookId={setSelectedEbookId}
      />

      {/* Main Content Router rendering */}
      <div className="flex-1">
        {activeTab === 'studio' && (
          <SceneStudio />
        )}

        {activeTab === 'library' && (
          <EbookReader 
            selectedEbookId={selectedEbookId} 
            setSelectedEbookId={setSelectedEbookId}
            leads={leads}
            setLeads={setLeads}
          />
        )}

        {activeTab === 'teleprompter' && (
          <RemotionTimelineStudio />
        )}

        {activeTab === 'edl-sandbox' && (
          <EdlSandbox />
        )}

        {activeTab === 'settings' && (
          <SettingsPortal 
            leads={leads} 
            setLeads={setLeads}
          />
        )}
      </div>

    </div>
  );
}
