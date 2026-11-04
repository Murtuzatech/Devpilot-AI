import React, { useState } from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  Layers, 
  Database, 
  GitFork, 
  RefreshCw, 
  Zap, 
  AlertCircle, 
  Copy, 
  Check, 
  Trash2,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { generateProjectBlueprint, type ProjectBlueprint } from '../lib/projectService';

const PROJECT_TYPES = [
  'Full-Stack Web App (React / Next.js)',
  'Mobile Application (React Native / Expo)',
  'Microservices / Backend API (Node / Go)',
  'AI / SaaS Platform',
  'E-Commerce & Payment Engine'
];

export default function Projects() {
  const [promptText, setPromptText] = useState('');
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!promptText.trim() || generating) return;

    setGenerating(true);
    setError(null);

    try {
      const data = await generateProjectBlueprint(promptText, projectType);
      setBlueprint(data);
    } catch (err: any) {
      console.error("Project Blueprint generation failed:", err);
      setError(err?.message || "Failed to generate project blueprint.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyFolder = () => {
    if (blueprint?.folderStructure) {
      navigator.clipboard.writeText(blueprint.folderStructure);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setPromptText('');
    setBlueprint(null);
    setError(null);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-12 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-2.5 shadow-sm">
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wide">AI Project Architecture & Workspace Planner</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Project Blueprint Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
            Turn app concepts into full architectural folder trees, schemas, and execution plans.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <select 
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans transition shadow-inner cursor-pointer hover:border-slate-600"
          >
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {(promptText || blueprint) && (
            <button
              onClick={handleClear}
              title="Clear all fields"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !promptText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all duration-150 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Designing Architecture...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Generate Blueprint</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Idea Prompt Input */}
        <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl p-5 min-h-[480px] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <Cpu className="w-4 h-4" />
              <span>PROJECT SPECIFICATION</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{promptText.length} chars</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Describe the app you want to build, its key features, user flows, and integrations.
          </p>

          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. Build an AI-powered fitness and meal tracker app. It needs OAuth, Supabase database, live calorie charts, food photo recognition, and weekly email reports..."
            rows={14}
            className="w-full flex-1 bg-[#161b22] border border-slate-800/90 rounded-xl p-4 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 leading-relaxed transition resize-none"
          />
        </div>

        {/* Right Side: Generated Blueprint Output */}
        <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden min-h-[480px]">
          <div className="px-4 py-2.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200 tracking-wide text-xs">Architectural Blueprint</span>
            </div>
            {blueprint && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {blueprint.title}
              </span>
            )}
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-5 max-h-[740px] scrollbar-thin scrollbar-thumb-slate-800">
            {!blueprint ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Awaiting App Specifications</p>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
                  Enter your app idea on the left. The engine will architect directory structures, schema designs, and milestones.
                </p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    System Overview
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed break-words">
                    {blueprint.summary}
                  </p>
                </div>

                {/* Tech Stack Pills */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                    Recommended Tech Stack
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Frontend</span>
                      <p className="text-slate-300 font-mono mt-0.5">{blueprint.techStack.frontend.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Backend</span>
                      <p className="text-slate-300 font-mono mt-0.5">{blueprint.techStack.backend.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Database</span>
                      <p className="text-slate-300 font-mono mt-0.5">{blueprint.techStack.database.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">DevOps / Cloud</span>
                      <p className="text-slate-300 font-mono mt-0.5">{blueprint.techStack.devops.join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* Folder Structure */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                      Folder Structure Tree
                    </span>
                    <button
                      onClick={handleCopyFolder}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-cyan-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Tree</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#000000]/60 p-4 font-mono text-[12px] text-cyan-200/90 leading-relaxed overflow-x-auto shadow-inner whitespace-pre">
                    {blueprint.folderStructure}
                  </div>
                </div>

                {/* Database Schema */}
                {blueprint.databaseSchema?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      Database & Entity Schema
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {blueprint.databaseSchema.map((schema, idx) => (
                        <li key={idx} className="flex items-start gap-2 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="leading-relaxed break-words">{schema}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Roadmap Phases */}
                {blueprint.roadmapSteps?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                      Execution Roadmap
                    </span>
                    <div className="space-y-2">
                      {blueprint.roadmapSteps.map((step, idx) => (
                        <div key={idx} className="border-l-2 border-cyan-500/40 pl-3 py-0.5">
                          <h4 className="text-xs font-semibold text-slate-200">{step.phase}</h4>
                          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed break-words">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}