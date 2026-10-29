import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap,
  AlertCircle,
  FileCode2,
  Terminal,
  Cpu
} from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

import { analyzeCodeWithGemini, type ReviewResult } from '../lib/gemini';

export default function CodeReview() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trigger Prism syntax highlighting whenever output changes
  useEffect(() => {
    Prism.highlightAll();
  }, [result]);

  const handleAnalyze = async () => {
    if (!code.trim() || analyzing) return;

    setAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeCodeWithGemini(code, language);
      setResult(data);
    } catch (err: any) {
      console.error("Analysis execution failed:", err);
      setError(err?.message || "Failed to analyze code. Please verify your connection.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (result?.refactoredCode) {
      navigator.clipboard.writeText(result.refactoredCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper for live line numbers
  const lineCount = Math.max(code.split('\n').length, 18);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-12 font-sans">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2.5 shadow-sm">
            <Cpu className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span className="tracking-wide">AI Static Engine & Security Inspector</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            AI Code Review
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
            Production-grade AST analysis and security vulnerability auditing.
          </p>
        </div>

        {/* Control Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition shadow-inner cursor-pointer"
            >
              <option value="javascript">JavaScript (ES6+)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="react">React JSX/TSX</option>
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !code.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all duration-150 cursor-pointer"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing Codebase...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Analyze Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Dual Panel Editor & Audit View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Code Editor with Line Numbers */}
        <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden min-h-[580px]">
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300 font-medium">buffer.{language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>UTF-8</span>
              <span>{code.length} chars</span>
            </div>
          </div>

          {/* Line Numbers + Textarea Container */}
          <div className="flex flex-1 relative font-mono text-xs overflow-hidden">
            {/* Gutter (Line Numbers) */}
            <div className="select-none py-4 px-3 bg-[#0d1117] text-slate-600 text-right font-mono border-r border-slate-800/60 leading-6 text-[12px]">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editor Input Area */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your production code snippet here..."
              className="flex-1 w-full bg-transparent py-4 px-4 font-mono text-[13px] text-slate-100 placeholder-slate-600 resize-none focus:outline-none leading-6 selection:bg-indigo-500/30 whitespace-pre"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Right Side: Audit Diagnostics Output */}
        <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden min-h-[580px]">
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200 tracking-wide text-xs">Audit Diagnostics</span>
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wide border ${
                  result.score >= 80 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : result.score >= 50 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  Health: {result.score}/100
                </span>
              </div>
            )}
          </div>

          {/* Diagnostics Body */}
          <div className="p-5 flex-1 overflow-y-auto space-y-5 max-h-[700px] scrollbar-thin scrollbar-thumb-slate-800">
            {!result ? (
              <div className="h-[460px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Ready for Static Analysis</p>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Provide code in the input buffer and trigger analysis to review security, patterns, and refactored implementation.
                </p>
              </div>
            ) : (
              <>
                {/* Executive Summary Card */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1.5">
                    Executive Summary
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {result.summary}
                  </p>
                </div>

                {/* Detected Vulnerabilities & Issues */}
                {result.issues?.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Vulnerabilities & Bottlenecks ({result.issues.length})
                    </span>
                    <div className="space-y-2">
                      {result.issues.map((issue, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#161b22]/90 border border-slate-800/90 flex items-start gap-3 hover:border-slate-700 transition">
                          {issue.type === 'critical' ? (
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : issue.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-slate-200 tracking-wide font-sans">{issue.title}</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{issue.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Engineering Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Engineering Recommendations
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {result.suggestions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-400 font-bold select-none">•</span>
                          <span className="leading-relaxed font-sans text-slate-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Refactored Code with Full Syntax Highlighting */}
                {result.refactoredCode && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Production Refactored Output
                      </span>
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Refactored</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Colorized Code Block */}
                    <div className="rounded-xl border border-slate-800 bg-[#000000]/60 overflow-hidden shadow-inner">
                      <pre className="!bg-transparent !m-0 !p-4 !font-mono !text-[12px] leading-relaxed overflow-x-auto">
                        <code className={`language-${language}`}>
                          {result.refactoredCode}
                        </code>
                      </pre>
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