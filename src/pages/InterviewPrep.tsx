import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  AlertCircle, 
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  Code
} from 'lucide-react';

import { generateInterviewPrep, type InterviewPrepResult } from '../lib/interviewService';

const ROLES = [
  'Frontend Developer (React / Next.js)',
  'Backend Developer (Node.js / Express)',
  'Full-Stack Developer (MERN / PERN)',
  'Mobile App Developer (React Native)',
  'Software Engineer (General / Core CS)'
];

const EXPERIENCE_LEVELS = [
  'Junior / Fresher (0-1 Years)',
  'Mid-Level (2-4 Years)',
  'Senior / Lead (5+ Years)'
];

export default function InterviewPrep() {
  const [role, setRole] = useState(ROLES[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_LEVELS[0]);
  const [focusTopics, setFocusTopics] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const handleGenerate = async () => {
    if (generating) return;

    setGenerating(true);
    setError(null);

    try {
      const data = await generateInterviewPrep(role, experienceLevel, focusTopics);
      setResult(data);
      if (data.questions.length > 0) {
        setExpandedId(data.questions[0].id);
      }
    } catch (err: any) {
      console.error("Interview prep failed:", err);
      setError(err?.message || "Failed to generate interview questions.");
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = () => {
    setFocusTopics('');
    setResult(null);
    setError(null);
    setExpandedId(null);
  };

  const toggleAccordion = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-12 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-2.5 shadow-sm">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span className="tracking-wide">AI Technical Mock Interview & Question Bank</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Interview Prep
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
            Generate role-specific interview questions, ideal answers, code demonstrations, and bar-raiser tips.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {(focusTopics || result) && (
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
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all duration-150 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Interviewer...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Generate Questions</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Setup Panel (1 Col) */}
        <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl p-5 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider block">
              Candidate Profile
            </span>
            <p className="text-xs text-slate-500 mt-1">Configure your target job role and focus areas.</p>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase">Target Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#161b22] border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500/60 font-sans cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-[#161b22] border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500/60 font-sans cursor-pointer"
            >
              {EXPERIENCE_LEVELS.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>

          {/* Optional Focus Topics */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Specific Focus Areas</label>
              <span className="text-[10px] text-slate-600">Optional</span>
            </div>
            <textarea
              value={focusTopics}
              onChange={(e) => setFocusTopics(e.target.value)}
              placeholder="e.g. React hooks lifecycle, Redux vs Context, Tailwind CSS, REST vs GraphQL, web performance optimization..."
              rows={4}
              className="w-full bg-[#161b22] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right Side: Generated Interview Bank (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden min-h-[520px]">
          <div className="px-4 py-3 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200 tracking-wide text-xs">Technical Question Bank</span>
            </div>
            {result && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {result.questions.length} Questions
              </span>
            )}
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[740px] scrollbar-thin scrollbar-thumb-slate-800">
            {!result ? (
              <div className="h-[420px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Awaiting Interview Configuration</p>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-sans">
                  Select your role and experience level on the left, then click Generate Questions to access curated technical challenges.
                </p>
              </div>
            ) : (
              <>
                {/* Overview Note */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                    Interviewer Expectation
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {result.overview}
                  </p>
                </div>

                {/* Questions Accordion List */}
                <div className="space-y-3 pt-1">
                  {result.questions.map((q) => {
                    const isOpen = expandedId === q.id;
                    return (
                      <div 
                        key={q.id}
                        className="rounded-xl border border-slate-800 bg-[#161b22] overflow-hidden transition"
                      >
                        {/* Question Header */}
                        <button
                          onClick={() => toggleAccordion(q.id)}
                          className="w-full p-4 flex items-start justify-between text-left gap-3 hover:bg-slate-800/40 transition cursor-pointer"
                        >
                          <div className="space-y-1">
                            <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              {q.topic}
                            </span>
                            <h3 className="text-xs font-semibold text-slate-100 leading-snug">
                              Q{q.id}. {q.question}
                            </h3>
                          </div>
                          <div className="text-slate-400 pt-1 shrink-0">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Collapsible Answer Body */}
                        {isOpen && (
                          <div className="p-4 pt-1 border-t border-slate-800/80 space-y-3 font-sans">
                            {/* Ideal Answer */}
                            <div className="space-y-1">
                              <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Model Candidate Response
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-line bg-[#0d1117] p-3 rounded-lg border border-slate-800/60">
                                {q.idealAnswer}
                              </p>
                            </div>

                            {/* Optional Code Example */}
                            {q.codeExample && q.codeExample.trim() !== '' && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                                  <Code className="w-3.5 h-3.5 text-blue-400" />
                                  Code Demonstration
                                </span>
                                <div className="rounded-lg border border-slate-800 bg-[#000000]/60 p-3 font-mono text-[11px] text-cyan-200 leading-relaxed overflow-x-auto whitespace-pre">
                                  {q.codeExample}
                                </div>
                              </div>
                            )}

                            {/* Interviewer Tip */}
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[11px] font-bold text-amber-300 block mb-0.5">
                                  Bar-Raiser Tip
                                </span>
                                <p className="text-xs text-amber-200/90 leading-relaxed">
                                  {q.interviewerTip}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}