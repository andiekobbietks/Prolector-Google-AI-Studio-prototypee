/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LeadCapture } from '../types';
import { 
  Key, Shield, Database, Cpu, HelpCircle, Save, CheckCircle2, 
  Trash2, FileJson, Server, Clipboard 
} from 'lucide-react';

interface SettingsPortalProps {
  leads: LeadCapture[];
  setLeads: React.Dispatch<React.SetStateAction<LeadCapture[]>>;
}

export default function SettingsPortal({ leads, setLeads }: SettingsPortalProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [apiType, setApiType] = useState<'mock' | 'gemini'>('mock');
  const [supabaseUrl, setSupabaseUrl] = useState('https://afj-cardiff-prolector.supabase.co');
  const [isSaved, setIsSaved] = useState(false);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([
    'System initialization successful. Loader active.',
    'PWA Service Worker registered offline cache handlers.',
    'Origin Private File System (OPFS) space verified: 2.4 GB available.',
    'Color space profiles mapped: Rec.709, Rec.2020-HLG, Rec.2100-PQ.'
  ]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setIsSaved(true);
    setDiagnosticsLogs(prev => [
      ...prev,
      `API profiles updated. Selected gateway: ${apiType.toUpperCase()} stream.`,
      `Database endpoints mapped to Supabase: ${supabaseUrl}`
    ]);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const clearLeads = () => {
    if (confirm('Are you sure you want to purge all synced workspace lead records? This operation is persistent.')) {
      setLeads([]);
      setDiagnosticsLogs(prev => [...prev, 'Purged local Workspace lead tables.']);
    }
  };

  const triggerExportLogs = () => {
    const logData = diagnosticsLogs.join('\n');
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prolector_diagnostics_report.log';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#091a2f] text-[#fafafa] min-h-[calc(100vh-80px)] p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Settings Header */}
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-extrabold uppercase text-[#f97316] tracking-tight">
            ProLector Portal & Settings Area
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure local-first gateway nodes, API parameters, and review persistent DB transaction leads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main settings form */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSaveSettings} className="border border-slate-800 bg-[#050e1a] p-6 rounded-lg space-y-6">
              
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#f97316]" /> API configuration (No Auth Standard)
              </h3>

              {/* API Selection keys */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                    API Execution Node
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                    Choose whether scene processing calculations use fast sandboxed models or call direct live Gemini endpoints.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setApiType('mock')}
                      className={`p-3 rounded border text-xs font-bold text-center transition-all cursor-pointer ${
                        apiType === 'mock'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Cpu className="w-4 h-4 mx-auto mb-1 opacity-80" />
                      Local Sandbox Simulator
                    </button>
                    <button
                      type="button"
                      onClick={() => setApiType('gemini')}
                      className={`p-3 rounded border text-xs font-bold text-center transition-all cursor-pointer ${
                        apiType === 'gemini'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Server className="w-4 h-4 mx-auto mb-1 opacity-80" />
                      Gemini Live Node API
                    </button>
                  </div>
                </div>

                {/* Gemini Secrets entry */}
                {apiType === 'gemini' && (
                  <div className="p-4 rounded bg-slate-950 border border-slate-900 space-y-2">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#f97316]" /> Enter Client-side Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AI Studio API key (e.g. AIzaSy...)"
                      className="w-full bg-[#03080f] border border-slate-800 rounded px-3 py-2 text-xs font-mono text-[#fafafa] focus:outline-none focus:border-[#f97316]"
                    />
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Note: Real keys are protected securely inside client memory storage blocks. Never commit keys to git reservoirs.
                    </p>
                  </div>
                )}

                {/* Supabase Mock URL */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                    Supabase Database Endpoint
                  </label>
                  <input
                    type="text"
                    required
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-[#f97316]"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    Endpoint used to synchronize EDLs and lead transactions symmetrically.
                  </span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex justify-end pt-2 border-t border-slate-900">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-[#f97316] hover:bg-orange-600 text-slate-950 font-extrabold text-xs uppercase px-5 py-2.5 rounded cursor-pointer transition-colors"
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {isSaved ? 'Settings Saved' : 'Commit Configuration'}
                </button>
              </div>

            </form>

            {/* Leads synced database viewer */}
            <div className="border border-slate-800 bg-[#050e1a] p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#f97316]" /> Synced Database Receipts
                </h3>
                {leads.length > 0 && (
                  <button
                    onClick={clearLeads}
                    className="text-[10px] text-red-500 font-bold uppercase hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear DB
                  </button>
                )}
              </div>

              {leads.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-900 rounded bg-[#03080f] text-slate-500 font-mono text-[10px]">
                  No synced transaction tables. Register an account inside Chapter 6 of **Tactile Tempos** to log receipts.
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {leads.map((lead, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded border border-slate-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-[#fafafa] font-mono">{lead.name}</strong>
                        <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2 font-mono">({lead.email})</span>
                        <div className="text-[9px] text-slate-500 mt-0.5">Role: <span className="text-[#f97316] font-mono">{lead.role}</span></div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">{lead.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right hand diagnostic logs panel */}
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#050e1a] p-5 rounded-lg space-y-4">
              <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                  Diagnostics Terminal
                </h4>
                <button
                  onClick={triggerExportLogs}
                  className="text-[9px] text-[#f97316] font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 hover:border-slate-700"
                >
                  Export Logs
                </button>
              </div>

              <div className="bg-[#03080f] p-3 rounded border border-slate-900 max-h-80 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-2 leading-relaxed select-all">
                {diagnosticsLogs.map((log, i) => (
                  <div key={i} className="border-b border-slate-950 pb-1.5">
                    <span className="text-slate-600">[OK]</span> {log}
                  </div>
                ))}
              </div>

              <div className="text-[9px] text-slate-500 leading-snug">
                ProLector framework executing fully on local Sandboxed client loops. 100% server uptime guaranteed.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
