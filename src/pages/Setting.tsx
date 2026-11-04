import React, { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Bell, 
  Shield, 
  Sliders, 
  LogOut, 
  Save, 
  Trash2, 
  Check, 
  Volume2, 
  Eye, 
  EyeOff,
  Cpu,
  Moon,
  Database
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'preferences' | 'security'>('profile');

  // Form States
  const [name, setName] = useState('Murtaza Hussain');
  const [email, setEmail] = useState('sh7597293@gmail.com');
  const [role, setRole] = useState('Frontend Developer');
  
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoRunCode, setAutoRunCode] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  const [savedStatus, setSavedStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load developer profile and preferences directly from Cloud Firestore
  useEffect(() => {
    async function fetchUserSettings() {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.displayName) setName(data.displayName);
          if (data.email) setEmail(data.email);
          if (data.role) setRole(data.role);
          if (data.customApiKey) setApiKey(data.customApiKey);
          if (data.preferredModel) setSelectedModel(data.preferredModel);
          if (typeof data.voiceEnabled === 'boolean') setVoiceEnabled(data.voiceEnabled);
          if (typeof data.autoRunCode === 'boolean') setAutoRunCode(data.autoRunCode);
          if (typeof data.analyticsConsent === 'boolean') setAnalyticsConsent(data.analyticsConsent);
        } else {
          // Pre-populate with auth metadata if Firestore doc doesn't have custom fields yet
          if (user.displayName) setName(user.displayName);
          if (user.email) setEmail(user.email);
        }
      } catch (err) {
        console.error('Failed to load user settings from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserSettings();
  }, []);

  // Save changes directly to Cloud Firestore (no localStorage)
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be signed in to save settings.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(
        userDocRef,
        {
          displayName: name,
          role: role,
          email: email,
          customApiKey: apiKey,
          preferredModel: selectedModel,
          voiceEnabled: voiceEnabled,
          autoRunCode: autoRunCode,
          analyticsConsent: analyticsConsent,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
    } catch (err) {
      console.error('Failed to update settings in Firestore:', err);
      alert('Failed to save settings to Firestore.');
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  // Reset progress directly from Cloud Firestore
  const handleClearCache = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (window.confirm("Are you sure you want to reset your solved DSA progress in Firestore?")) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          solvedProblems: [],
          recentLogs: [],
          updatedAt: new Date().toISOString()
        });
        alert("Cloud progress has been reset successfully.");
        window.location.reload();
      } catch (e) {
        console.error('Error resetting cloud progress:', e);
        alert("Failed to reset cloud progress.");
      }
    }
  };

  return (
    <div className="min-h-full font-sans text-neutral-300 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Workspace Settings & Preferences</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-medium">
              Firestore Synced
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your developer profile, custom API tokens, editor environment, and security credentials.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          {savedStatus ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedStatus ? 'Saved to Cloud!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer w-full text-left whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-[#202025]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Account</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer w-full text-left whitespace-nowrap ${
              activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-[#202025]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>AI Model & API Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer w-full text-left whitespace-nowrap ${
              activeTab === 'preferences' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-[#202025]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>IDE Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer w-full text-left whitespace-nowrap ${
              activeTab === 'security' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-[#202025]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy & Danger Zone</span>
          </button>
        </div>

        {/* Content Panels */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: Profile & Account */}
          {activeTab === 'profile' && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">Developer Identity</h2>
                <p className="text-xs text-neutral-400">Personalize your name, technical role, and dashboard identity.</p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center border border-indigo-400/30 shadow-md">
                  {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DV'}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{name}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">{role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-mono">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#121214] border border-[#27272a] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-mono">Designation / Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#121214] border border-[#27272a] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-mono">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-[#121214]/60 border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-neutral-400 font-mono focus:outline-none cursor-not-allowed"
                  />
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">Managed via Firebase Authentication</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI Model & API Keys */}
          {activeTab === 'ai' && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">AI Inference & API Key Config</h2>
                <p className="text-xs text-neutral-400">Configure your Google Gemini API token and choose model runtime engines.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-mono">
                    Custom Gemini API Key (Stored securely in Cloud Firestore)
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#121214] border border-[#27272a] focus:border-indigo-500 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none font-mono transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                    Leave blank to continue using the system default key from .env.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-mono">
                    Active AI Model Engine
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#121214] border border-[#27272a] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono transition cursor-pointer"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Active & Recommended)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (High Reasoning)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Preferences */}
          {activeTab === 'preferences' && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">Developer Workspace Preferences</h2>
                <p className="text-xs text-neutral-400">Adjust code runner settings, audio synthesis, and visual themes.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202025] border border-[#2c2c34]">
                  <div>
                    <h3 className="text-xs font-semibold text-white">Voice & Speech Synthesis</h3>
                    <p className="text-[11px] text-neutral-400">Enable audio reading of AI responses in Dev Chat AI.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202025] border border-[#2c2c34]">
                  <div>
                    <h3 className="text-xs font-semibold text-white">Auto-Run Code on Change</h3>
                    <p className="text-[11px] text-neutral-400">Automatically re-compile Playground snippets on debounce.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRunCode}
                    onChange={(e) => setAutoRunCode(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202025] border border-[#2c2c34]">
                  <div>
                    <h3 className="text-xs font-semibold text-white">Usage Analytics Telemetry</h3>
                    <p className="text-[11px] text-neutral-400">Allow DevPilot to compute daily streaks and tool counts in Firestore.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Privacy & Danger Zone */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-white mb-1">Cloud Data & Progress Management</h2>
                  <p className="text-xs text-neutral-400">Control your cloud storage data, problem completion states, and chat memory.</p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#202025] border border-[#2c2c34]">
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-200">Reset Cloud Solved Progress</h3>
                    <p className="text-[11px] text-neutral-400">Clear cached problems solved and reset telemetry counters in Firestore.</p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium transition cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Reset Cloud Data</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#18181b] border border-rose-950/40 rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-rose-400 mb-1">Account & Session Sign Out</h2>
                  <p className="text-xs text-neutral-400">Sign out of the DevPilot platform or end the current developer session.</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-xs font-semibold text-white">Active Session</div>
                    <div className="text-[11px] text-neutral-500 font-mono">Authenticated via Firebase Auth</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}