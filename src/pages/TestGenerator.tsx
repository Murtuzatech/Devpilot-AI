import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  AlertCircle, 
  FileCode2, 
  CheckCircle2, 
  Trash2, 
  Layers 
} from 'lucide-react';

import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';

import { generateTestCases, type TestGeneratorResult } from '../lib/testService';

const TEST_FRAMEWORKS = [
  { label: 'Jest (JS/TS)', value: 'Jest', lang: 'typescript', ext: 'test.ts' },
  { label: 'Vitest (Vite/React)', value: 'Vitest', lang: 'typescript', ext: 'test.ts' },
  { label: 'React Testing Library', value: 'React Testing Library', lang: 'tsx', ext: 'test.tsx' },
  { label: 'PyTest (Python)', value: 'PyTest', lang: 'python', ext: 'test_app.py' },
  { label: 'Mocha + Chai', value: 'Mocha/Chai', lang: 'javascript', ext: 'spec.js' },
  { label: 'Cypress (E2E / Component)', value: 'Cypress', lang: 'javascript', ext: 'cy.js' },
];

export default function TestGenerator() {
  const [code, setCode] = useState('');
  const [framework, setFramework] = useState('Vitest');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<TestGeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentFrameworkObj = TEST_FRAMEWORKS.find(f => f.value === framework) || TEST_FRAMEWORKS[0];

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        try {
          Prism.highlightAll();
        } catch (e) {
          console.warn("Prism highlight error:", e);
        }
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleGenerate = async () => {
    if (!code.trim() || generating) return;

    setGenerating(true);
    setError(null);

    try {
      const data = await generateTestCases(code, framework, currentFrameworkObj.lang);
      setResult(data);
    } catch (err: any) {
      console.error("Test generation failed:", err);
      setError(err?.message || "Failed to generate tests. Check connection.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result?.testCode) {
      navigator.clipboard.writeText(result.testCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
    setError(null);
  };

  const lineCount = Math.max(code.split('\n').length, 16);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-12 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2.5 shadow-sm">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide">AI Automated Unit & Integration Suite</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Test Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
            Generate bulletproof test suites, edge-case validations, and mocks in seconds.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <select 
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono transition shadow-inner cursor-pointer hover:border-slate-600"
          >
            {TEST_FRAMEWORKS.map((fw) => (
              <option key={fw.value} value={fw.value}>
                {fw.label}
              </option>
            ))}
          </select>

          {(code || result) && (
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
            disabled={generating || !code.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all duration-150 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Writing Test Suite...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Generate Tests</span>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Code Input */}
        <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden min-h-[520px]">
          <div className="px-4 py-2.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">source-code.{currentFrameworkObj.ext.replace('test.', '')}</span>
            </div>
            <span className="text-[11px] text-slate-500">{code.length} chars</span>
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
              placeholder="// Paste function, hook, or component to generate unit tests..."
              className="flex-1 w-full bg-transparent py-4 px-4 font-mono text-[13px] text-slate-100 placeholder-slate-600 resize-none focus:outline-none leading-6 selection:bg-emerald-500/30 whitespace-pre"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Side: Generated Tests Output */}
        <div className="flex flex-col rounded-2xl bg-[#0d1117] border border-slate-800 shadow-2xl overflow-hidden min-h-[520px]">
          <div className="px-4 py-2.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200 tracking-wide text-xs">Generated Suite</span>
            </div>
            {result && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {result.framework}
              </span>
            )}
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-5 max-h-[740px] scrollbar-thin scrollbar-thumb-slate-800">
            {!result ? (
              <div className="h-[440px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Awaiting Target Code</p>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
                  Paste your logic on the left and select your framework to generate complete unit tests with full edge-case coverage.
                </p>
              </div>
            ) : (
              <>
                {/* Test Cases Covered */}
                {result.testCasesCovered?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Edge Cases & Behaviors Tested
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {result.testCasesCovered.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="leading-relaxed break-words font-sans">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Generated Code Block */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      {currentFrameworkObj.ext}
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
                          <span>Copy Suite</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#000000]/60 overflow-hidden shadow-inner">
                    <pre className="!bg-transparent !m-0 !p-4 !font-mono !text-[12px] leading-relaxed overflow-x-auto">
                      <code className={`language-${currentFrameworkObj.lang}`}>
                        {result.testCode}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Mocking / Setup notes */}
                {result.mockingNotes && (
                  <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                      Mocking & Execution Details
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans break-words">
                      {result.mockingNotes}
                    </p>
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