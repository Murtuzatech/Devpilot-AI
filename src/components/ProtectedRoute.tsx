import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Sparkles } from 'lucide-react';

export default function ProtectedRoute() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0d0e12] flex flex-col items-center justify-center font-mono text-neutral-400">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse mb-3">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <p className="text-xs">Verifying DevPilot session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}