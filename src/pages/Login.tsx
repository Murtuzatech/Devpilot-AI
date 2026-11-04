import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard/dsa');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard/dsa');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col justify-center items-center p-4 selection:bg-indigo-500/30">
      
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white text-lg font-bold tracking-tight">DevPilot AI</span>
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
            Workspace
          </span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm bg-[#16171d] border border-[#262730] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isSignUp ? 'Get started with intelligent developer copilots' : 'Sign in to access your projects and analytics'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-mono">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#202129] hover:bg-[#282a35] border border-[#2f313d] text-xs font-semibold text-white transition cursor-pointer mb-4 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#262730] w-full" />
          <span className="bg-[#16171d] px-2 text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
            Or with email
          </span>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1 font-mono">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@example.com"
                className="w-full bg-[#101115] border border-[#262730] focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1 font-mono">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#101115] border border-[#262730] focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50 mt-1"
          >
            <span>{loading ? 'Authenticating...' : isSignUp ? 'Sign Up' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-neutral-400 hover:text-white transition cursor-pointer"
          >
            {isSignUp ? (
              <span>Already registered? <strong className="text-indigo-400">Sign In</strong></span>
            ) : (
              <span>Don't have an account? <strong className="text-indigo-400">Sign Up</strong></span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 font-mono mt-6">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Secured via Google Firebase Auth</span>
      </div>
    </div>
  );
}