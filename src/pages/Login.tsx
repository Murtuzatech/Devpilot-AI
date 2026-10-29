import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GithubAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Terminal, 
  Code2, 
  Sparkles,
  ChevronLeft
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Firestore user persistence
  const syncUserToFirestore = async (user: any) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          photoURL: user.photoURL || null,
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Firestore sync error:', err);
    }
  };

  // Email / Password Form Submit
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      await syncUserToFirestore(userCredential.user);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email address.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials provided. Please double check.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must contain at least 6 characters.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No active user found with this email.');
      } else {
        setError(err.message || 'Authentication error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserToFirestore(result.user);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google authentication could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // GitHub OAuth Handler
  const handleGithubSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const githubProvider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, githubProvider);
      await syncUserToFirestore(result.user);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('GitHub authentication could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Reset Link Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('A password reset link has been dispatched to your email.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account registered with this email.');
      } else {
        setError(err.message || 'Failed to dispatch reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 relative selection:bg-cyan-500 selection:text-black">
      {/* Background Gradients & Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 py-10">
        {/* Brand Header & Professional Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            <Terminal className="w-6 h-6 text-cyan-400" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              DevPilot<span className="text-cyan-400">.ai</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
              <Sparkles className="w-2.5 h-2.5" /> v1.0
            </span>
          </div>
          <p className="text-slate-400 text-xs tracking-wide">
            Next-Gen Autonomous Engineering Workspace
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0e131f]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Notifications */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-300 leading-relaxed">{successMsg}</p>
            </div>
          )}

          {isForgotPassword ? (
            /* Forgot Password View */
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer mb-3"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Sign In
                </button>
                <h2 className="text-lg font-semibold text-white">Reset Password</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered email address and we'll send you instructions to recover your credentials.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-slate-700/60 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-400/20"
                >
                  <span>{loading ? 'Transmitting...' : 'Send Recovery Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* Standard Sign In / Sign Up View */
            <div>
              {/* OAuth Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-2 hover:border-slate-700 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGithubSignIn}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-2 hover:border-slate-700 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <Code2 className="w-4 h-4 text-slate-300" />
                  <span>GitHub</span>
                </button>
              </div>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#0e131f] px-2.5 text-slate-500 font-medium tracking-wider">
                    Or continue with credentials
                  </span>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleAuth} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@devpilot.ai"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError(null);
                        }}
                        className="text-[11px] text-cyan-400/90 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.02] border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 text-cyan-400 focus:ring-0 cursor-pointer accent-cyan-400"
                    />
                    <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none">
                      Remember this session
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(6,182,212,0.25)]"
                >
                  <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Workspace Account' : 'Authenticate Session'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Form Bottom Switch */}
              <div className="mt-5 text-center pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isSignUp ? (
                    <>Existing engineer? <span className="text-cyan-400 font-medium ml-1">Sign in to workspace</span></>
                  ) : (
                    <>New to DevPilot? <span className="text-cyan-400 font-medium ml-1">Initialize account</span></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Footer */}
        <div className="text-center mt-6">
          <p className="text-[11px] text-slate-600">
            Protected by DevPilot Guard Architecture • End-to-End Encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;