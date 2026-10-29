import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  LayoutDashboard, 
  Code2, 
  Bug, 
  FileCheck, 
  FolderKanban, 
  BookOpen, 
  Cpu, 
  Gauge, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  Terminal
} from 'lucide-react';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Code Review', path: '/dashboard/code-review', icon: Code2 },
    { name: 'Bug Detective', path: '/dashboard/bug-detective', icon: Bug },
    { name: 'Test Generator', path: '/dashboard/test-generator', icon: FileCheck },
    { name: 'Projects', path: '/dashboard/projects', icon: FolderKanban },
    { name: 'Interview Prep', path: '/dashboard/interview', icon: BookOpen },
    { name: 'DSA Practice', path: '/dashboard/dsa', icon: Cpu },
    { name: 'Performance', path: '/dashboard/performance', icon: Gauge },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/95 p-4 justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight block">DevPilot AI</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Workspace</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              MH
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">Murtaza Hussain</p>
              <p className="text-[10px] text-slate-400 truncate">Frontend Dev</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tools, projects, bugs..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 ring-2 ring-slate-950" />
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-white">Workspace Pro</p>
              <p className="text-[10px] text-emerald-400 font-mono">● Online</p>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Inner Page View */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}