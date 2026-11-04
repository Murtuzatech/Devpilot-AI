import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  AlertCircle,
  FileCode2,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';

// PrismJS setup - specific load order prevents 'tokenizePlaceholders' undefined crash
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

import { detectAndFixBug, type BugDetectiveResult } from '../lib/gemini';

const SUPPORTED_LANGUAGES = [
  { label: 'JavaScript (ES6+)', value: 'javascript', ext: 'js', prismLang: 'javascript' },
  { label: 'TypeScript', value: 'typescript', ext: 'ts', prismLang: 'typescript' },
  { label: 'React JSX', value: 'jsx', ext: 'jsx', prismLang: 'jsx' },
  { label: 'React TSX', value: 'tsx', ext: 'tsx', prismLang: 'tsx' },
  { label: 'Python', value: 'python', ext: 'py', prismLang: 'python' },
  { label: 'Java', value: 'java', ext: 'java', prismLang: 'java' },
  { label: 'C++', value: 'cpp', ext: 'cpp', prismLang: 'cpp' },
  { label: 'C#', value: 'csharp', ext: 'cs', prismLang: 'csharp' },
  { label: 'Go (Golang)', value: 'go', ext: 'go', prismLang: 'go' },
  { label: 'Rust', value: 'rust', ext: 'rs', prismLang: 'rust' },
  { label: 'SQL', value: 'sql', ext: 'sql', prismLang: 'sql' },
  { label: 'Bash / Shell', value: 'bash', ext: 'sh', prismLang: 'bash' },
  { label: 'HTML / CSS', value: 'html', ext: 'html', prismLang: 'markup' },
];

export default function BugDetective() {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [debugging, setDebugging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<BugDetectiveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.value === language) || SUPPORTED_LANGUAGES[0];

  // Crash-proof highlight runner with microtask delay
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        try {
          Prism.highlightAll();
        } catch (highlightErr) {
          console.warn("Prism highlight warning:", highlightErr);
        }
      }, 30);

      return () => clearTimeout(timer);
    }
  }, [result, language]);

  const handleDebug = async () => {
    if (!code.trim() || debugging) return;

    setDebugging(true);
    setError(null);

    try {
      const data = await detectAndFixBug(code, errorMessage, currentLangObj.label);
      setResult(data);
    } catch (err: any) {
      console.error("Bug analysis failed:", err);
      setError(err?.message || "Failed to analyze bug. Check your connection or API key.");
    } finally {
      setDebugging(false);
    }
  };

  const handleCopy = () => {
    if (result?.fixedCode) {
      navigator.clipboard.writeText(result.fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setCode('');
    setErrorMessage('');
    setResult(null);
    setError(null);
  };

  const lineCount = Math.max(code.split('\n').length, 16);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-12 font-sans selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-2.5 shadow-sm">
            <Bug className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span className="tracking-wide">AI Stack Trace & Runtime Bug Solver</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Bug Detective
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
            Diagnose stack traces, unhandled exceptions, and generate immediate clean patches.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono transition shadow-inner cursor-pointer hover:border-slate-600"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {(code || errorMessage || result) && (
            <button
              onClick={handleClear}
              title="Clear all fields"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleDebug}
            disabled={debugging || !code.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all duration-150 cursor-pointer"
          >
            {debugging ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Debugging Codebase...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Fix My Bug</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Code & Error Inputs */}
        <div className="flex flex-col space-y-4">
          
          <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden min-h-[400px]">
            <div className="px-4 py-2.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-rose-400" />
                <span className="text-slate-300 font-medium">
                  broken-snippet.{currentLangObj.ext}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>UTF-8</span>
                <span>{code.length} chars</span>
              </div>
            </div>

            <div className="flex flex-1 relative font-mono text-xs overflow-hidden">
              <div className="select-none py-4 px-3 bg-[#0d1117] text-slate-600 text-right font-mono border-r border-slate-800/60 leading-6 text-[12px]">
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Paste broken ${currentLangObj.label} code snippet here...`}
                className="flex-1 w-full bg-transparent py-4 px-4 font-mono text-[13px] text-slate-100 placeholder-slate-600 resize-none focus:outline-none leading-6 selection:bg-rose-500/30 whitespace-pre"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                <span>Runtime Error / Stack Trace</span>
              </div>
              <span className="text-[10px] font-sans text-slate-500 uppercase tracking-wider">
                Optional
              </span>
            </div>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="e.g. TypeError: Cannot read properties of null (reading 'forEach')..."
              rows={3}
              className="w-full bg-[#161b22] border border-slate-800/90 rounded-xl p-3 font-mono text-xs text-rose-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50 leading-relaxed transition"
            />
          </div>

        </div>

        {/* Right Side: Diagnostics Output */}
        <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden min-h-[580px]">
          <div className="px-4 py-2.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200 tracking-wide text-xs">Diagnostic Solution</span>
            </div>
            {result && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                {result.errorType}
              </span>
            )}
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-5 max-h-[740px] scrollbar-thin scrollbar-thumb-slate-800">
            {!result ? (
              <div className="h-[460px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Awaiting Broken Snippet</p>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
                  Provide code and optional crash logs. Bug Detective will isolate the root cause, reconstruct the logic, and provide a patch.
                </p>
              </div>
            ) : (
              <>
                {/* Root Cause */}
                <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1.5">
                    Root Cause
                  </span>
                  <p className="text-xs text-slate-200 font-mono leading-relaxed break-words">
                    {result.rootCause}
                  </p>
                  <p className="text-xs text-slate-400 font-sans mt-2.5 leading-relaxed break-words">
                    {result.explanation}
                  </p>
                </div>

                {/* Patched Code Output */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Patched Code
                    </span>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Patch</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#000000]/60 overflow-hidden shadow-inner">
                    <pre className="!bg-transparent !m-0 !p-4 !font-mono !text-[12px] leading-relaxed overflow-x-auto">
                      <code className={`language-${currentLangObj.prismLang}`}>
                        {result.fixedCode}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Prevention Strategies */}
                {result.preventionTips?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-2.5 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                      Prevention Strategies
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {result.preventionTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                          <span className="leading-relaxed break-words font-sans">{tip}</span>
                        </li>
                      ))}
                    </ul>
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