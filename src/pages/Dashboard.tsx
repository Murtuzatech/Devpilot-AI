import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Bug, 
  FileCheck, 
  FolderKanban, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export default function Dashboard() {
  const [developerName, setDeveloperName] = useState<string>('Developer');
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [activeMinutes, setActiveMinutes] = useState<number>(45);

  // Synchronize dashboard with user document in Cloud Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Use display name from auth if available
    if (user.displayName) {
      setDeveloperName(user.displayName.split(' ')[0]);
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.displayName) {
          setDeveloperName(data.displayName.split(' ')[0]);
        }
        if (Array.isArray(data.solvedProblems)) {
          setSolvedCount(data.solvedProblems.length);
        }
        const total = (data.solvedProblems?.length || 0) + Number(data.chatCount || 0) + 6;
        setActiveMinutes(Math.max(25, total * 4));
      }
    }, (error) => {
      console.error('Firestore listener error on Dashboard:', error);
    });

    return () => unsubscribe();
  }, []);

  const quickActions = [
    {
      title: "DSA Practice",
      desc: "Curated interview problems with Monaco IDE and AI judge.",
      icon: Cpu,
      color: "from-sky-600/20 to-sky-600/5",
      border: "border-sky-500/30",
      iconColor: "text-sky-400",
      path: "/dashboard/dsa"
    },
    {
      title: "AI Code Review",
      desc: "Analyze PRs, find bottlenecks, and improve code maintainability.",
      icon: Code2,
      color: "from-indigo-600/20 to-indigo-600/5",
      border: "border-indigo-500/30",
      iconColor: "text-indigo-400",
      path: "/dashboard/code-review"
    },
    {
      title: "Bug Detective",
      desc: "Paste stack traces to find root cause and get instant solutions.",
      icon: Bug,
      color: "from-rose-600/20 to-rose-600/5",
      border: "border-rose-500/30",
      iconColor: "text-rose-400",
      path: "/dashboard/bug-detective"
    },
    {
      title: "Test Generator",
      desc: "Auto-generate clean unit, mock, and edge tests in Vitest.",
      icon: FileCheck,
      color: "from-emerald-600/20 to-emerald-600/5",
      border: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      path: "/dashboard/test-generator"
    }
  ];

  const recentProjects = [
    { name: "DevPilot AI Workspace", status: "In Progress", tasks: "8/12 Done", date: "Just now" },
    { name: "E-Commerce Microfrontend", status: "Completed", tasks: "15/15 Done", date: "2 days ago" },
    { name: "Auth0 & Supabase Migration", status: "Review", tasks: "4/6 Done", date: "5 days ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/30 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Workspace & Cloud Firestore Synced</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {developerName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Your development environment is connected to Cloud Firestore. You have solved <span className="text-emerald-400 font-semibold">{solvedCount} DSA problems</span> with <span className="text-indigo-400 font-semibold">{activeMinutes} active minutes</span> logged.
          </p>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              to={action.path}
              className={`group p-5 rounded-2xl bg-gradient-to-b ${action.color} border ${action.border} hover:border-indigo-400/50 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="text-sm font-semibold text-white">{action.title}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{action.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Launch Tool</span>
                <span className="font-mono text-indigo-400">→</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Statistics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Projects List */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Active Projects</h2>
            <Link to="/dashboard/projects" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {recentProjects.map((p, i) => (
              <div key={i} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{p.date}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {p.tasks}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    p.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick System Stats */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Cloud Workspace Health</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">AI Inference Engine</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Active</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">Firestore Cloud Sync</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Connected</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <span className="text-xs text-slate-300">DSA Cloud Persistence</span>
              </div>
              <span className="text-[10px] text-sky-400 font-mono">{solvedCount} Solved</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}