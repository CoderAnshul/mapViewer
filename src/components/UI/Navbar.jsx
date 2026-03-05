import { Share2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pointer-events-none">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2.5 pointer-events-auto" style={{ minWidth: 220 }}>
        <div className="relative flex items-center justify-center w-9 h-9">
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid rgba(212,175,55,0.3)' }} />
          <svg width="22" height="22" viewBox="0 0 22 22" className="relative z-10">
            <circle cx="11" cy="11" r="10" fill="none" stroke="#C49A2A" strokeWidth="1.5" />
            <text x="11" y="15" textAnchor="middle" fill="#D4AF37" fontSize="12" fontWeight="800"
              fontFamily="Outfit, sans-serif">S</text>
          </svg>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-wider logo-gradient"
              style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.12em' }}>
              SOLACE
            </span>
          </div>
          <div className="text-[9px] text-white/40 tracking-[0.22em] uppercase -mt-0.5">
            Independent Green Plots
          </div>
        </div>
      </div>

      {/* Right: Admin + Share */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <Link to="/admin"
          className="glass rounded-2xl px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all duration-200 group"
          title="Admin Panel"
        >
          <Settings size={15} className="text-white/50 group-hover:text-white transition-colors" />
          <span className="text-white/50 group-hover:text-white text-xs font-medium transition-colors">Admin</span>
        </Link>
        <div className="glass rounded-2xl p-2.5 cursor-pointer hover:bg-white/10 transition-all duration-200 group" title="Share">
          <Share2 size={18} className="text-white/60 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
}
