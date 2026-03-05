import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Map, Settings, ChevronRight } from 'lucide-react';

const NAV = [
  { to: '/admin',    label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin',    label: 'Projects',  icon: FolderOpen,      exact: true },
];

export default function AdminNavbar() {
  return (
    <header
      className="h-14 flex items-center px-6 gap-6 border-b"
      style={{
        background: 'rgba(14,14,14,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <Link to="/admin" className="flex items-center gap-2.5 mr-4 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
          style={{
            background: 'linear-gradient(135deg, #C49A2A, #F0D060)',
            color: '#000',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          S
        </div>
        <div className="leading-tight">
          <div className="text-white text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            SOLACE
          </div>
          <div className="text-white/30 text-[9px] uppercase tracking-widest -mt-0.5">
            Admin Panel
          </div>
        </div>
      </Link>

      {/* Divider */}
      <div className="w-px h-5 bg-white/8" />

      {/* Nav links */}
      <Link to="/admin"
        className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
        <FolderOpen size={14} />
        Projects
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Viewer link */}
      <Link to="/"
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-blue-400 transition-colors"
        target="_blank"
      >
        <Map size={13} />
        Open Viewer
      </Link>
    </header>
  );
}
