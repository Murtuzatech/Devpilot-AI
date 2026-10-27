import { useState, useEffect } from 'react';
import { ArrowRight, Code2, Bug, FileCheck, Terminal, Sparkles, BookOpen, Layers, Shield, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Welcome() {
  const fullText = "Welcome to DevPilot AI";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  // Typewriter effect logic
  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 75);
      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);

  const features = [
    {
      icon: <Code2 className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "AI Code Review",
      desc: "Analyze code quality, catch syntax & logic bugs, and follow modern best practices.",
      tag: "Quality"
    },
    {
      icon: <Bug className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "Bug Detective",
      desc: "Paste error stack traces and get structured root-cause solutions with step-by-step fixes.",
      tag: "Debug"
    },
    {
      icon: <FileCheck className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "Test Generator",
      desc: "Auto-generate clean unit, integration, and edge-case tests with Vitest.",
      tag: "Testing"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "DSA & Interview Prep",
      desc: "Sharpen JavaScript, React, TypeScript, and DSA concepts with AI-assisted practice.",
      tag: "Career"
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/30 via-sky-500/20 to-emerald-500/10 blur-[140px] rounded-full animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 -left-40 w-96 h-96 bg-sky-500/10 blur-[130px] rounded-full" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight block leading-none">DevPilot AI</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-2 transition rounded-xl hover:bg-slate-900"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-6 pt-14 pb-20 flex flex-col items-center text-center">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Gen Developer Workspace</span>
        </div>

        {/* Dynamic Typewriter Heading */}
        <div className="min-h-[70px] sm:min-h-[90px] flex items-center justify-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
              {displayText}
            </span>
            <span className="inline-block w-1.5 h-8 sm:h-12 bg-indigo-400 ml-1 animate-pulse align-middle" />
          </h1>
        </div>

        <p className="mt-4 text-base sm:text-lg font-medium text-slate-300 max-w-2xl">
          Your Intelligent Workspace to Plan, Code, Test & Ship.
        </p>

        {/* Workflow Pipeline */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-medium">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-indigo-400">Plan</span>
          <span className="text-slate-600">→</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-sky-400">Build</span>
          <span className="text-slate-600">→</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-rose-400">Debug</span>
          <span className="text-slate-600">→</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400">Test</span>
          <span className="text-slate-600">→</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-400">Optimize</span>
        </div>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          DevPilot AI empowers developers with smart AI-driven code reviews, instantaneous bug diagnosing, automated Vitest unit testing, and technical interview simulations.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition duration-200 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-sm font-medium px-5 py-3.5 rounded-xl transition"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Explore Modules</span>
          </a>
        </div>

        {/* Tech Highlights */}
        <div className="mt-14 w-full grid grid-cols-2 sm:grid-cols-4 gap-3 border-y border-slate-900/90 py-4 text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>React 19 + TypeScript</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Supabase Auth & RLS</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Gemini AI Engine</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <FileCheck className="w-4 h-4 text-sky-400" />
            <span>Vitest Automated Testing</span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-14 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner group-hover:border-indigo-500/30">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        DevPilot AI &bull; Built with React, TypeScript & Tailwind CSS
      </footer>
    </div>
  );
}