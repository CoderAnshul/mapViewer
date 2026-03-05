import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Trash2, FolderOpen, ChevronRight, 
  Calendar, Layers, Search, FileCode, Clock
} from 'lucide-react';
import gsap from 'gsap';
import useAdminStore from '../../store/adminStore';

// ── Action Card Component ──────────────────────────────────────────────────
function ActionCard({ icon: Icon, title, subtitle, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-4 group hover:bg-white/[0.08] transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-[12px] font-bold text-white uppercase tracking-wider">{title}</div>
        <div className="text-[10px] text-white/30 font-medium tracking-tight">{subtitle}</div>
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-white/20">
        <ChevronRight size={16} />
      </div>
    </div>
  );
}

// ── Create Project Modal ──────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const modalRef = useRef();

  useEffect(() => {
    gsap.fromTo(modalRef.current, 
      { opacity: 0, scale: 0.95, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name, desc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
      <div ref={modalRef} className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <Plus size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>New Project</h3>
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Repository Entry</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-white/20 text-[9px] uppercase tracking-widest font-bold block">Project Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Skyline Residency"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/20 text-[9px] uppercase tracking-widest font-bold block">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Optional summary..."
              rows={2}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all resize-none font-medium"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-white/30 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
              Abort
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-500 transition-all">
              Initialize
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const projects = useAdminStore((s) => s.projects);
  const createProject = useAdminStore((s) => s.createProject);
  const deleteProject = useAdminStore((s) => s.deleteProject);
  
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  
  const containerRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".animate-item", 
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* ── Title & Intro ── */}
      <div className="flex items-end justify-between animate-item">
        <div>
          <h1 className="text-white text-2xl font-black mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>Projects</h1>
          <p className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em]">Asset Repository Management</p>
        </div>
        <div className="relative group min-w-[240px]">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..." 
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 transition-all font-medium"
          />
        </div>
      </div>

      {/* ── Top Action Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-item">
        <ActionCard 
          icon={Plus} 
          title="New Map" 
          subtitle="Generate development node" 
          color="#3b82f6" 
          onClick={() => setShowModal(true)}
        />
        <ActionCard 
          icon={Layers} 
          title="Stack" 
          subtitle="Layered processing" 
          color="#f59e0b" 
        />
        <ActionCard 
          icon={Calendar} 
          title="Archive" 
          subtitle="View history logs" 
          color="#10b981" 
        />
      </div>

      {/* ── Active Projects Grid ── */}
      <section className="animate-item">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Active Nodes</h3>
          </div>
          <span className="text-white/10 text-[9px] font-bold uppercase tracking-widest">{filtered.length} Total</span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-2xl py-12 text-center">
            <FolderOpen size={32} className="text-white/5 mx-auto mb-3" />
            <p className="text-white/20 font-bold text-[10px] uppercase tracking-widest">Repository empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((proj) => (
              <ProjectTile key={proj.id} project={proj} onDelete={() => setDeleteConfirm(proj.id)} className="animate-item" />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showModal && <CreateModal onClose={() => setShowModal(false)} onCreate={createProject} />}
      {deleteConfirm && (
        <DeleteModal 
          onClose={() => setDeleteConfirm(null)} 
          onConfirm={() => { deleteProject(deleteConfirm); setDeleteConfirm(null); }} 
        />
      )}
    </div>
  );
}

// ── Project Tile Component ──────────────────────────────────────────────────
function ProjectTile({ project, onDelete, className }) {
  const date = new Date(project.createdAt).toLocaleDateString();

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-slate-100 relative ${className}`}>
      {/* Visual Header */}
      <div className="h-28 bg-slate-50 relative flex items-center justify-center border-b border-slate-100 overflow-hidden">
        <div className="absolute top-3 right-3 bg-green-50 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-md tracking-wider border border-green-100">
          {project.status || 'READY'}
        </div>
        
        <div className="text-blue-500/10 group-hover:scale-110 group-hover:text-blue-500/20 transition-all duration-500">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M50 20L20 40L50 60L80 40L50 20Z" strokeLinejoin="round" />
            <path d="M20 55L50 75L80 55" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4">
        <h4 className="text-slate-900 font-bold text-[13px] uppercase tracking-tight mb-2 truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {project.name}
        </h4>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <FileCode size={12} />
            <span className="text-[9px] font-bold tracking-tight uppercase">{project.plots.length} Units</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-bold">
             <Clock size={12} />
             <span className="text-[9px] tracking-tight">{date}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <button 
            onClick={(e) => { e.preventDefault(); onDelete(); }}
            className="text-slate-300 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
          
          <Link 
            to={`/admin/project/${project.id}`}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            Open <ChevronRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ───────────────────────────────────────────────
function DeleteModal({ onClose, onConfirm }) {
  const modalRef = useRef();

  useEffect(() => {
    gsap.fromTo(modalRef.current, 
      { opacity: 0, scale: 0.95, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div ref={modalRef} className="bg-white rounded-2xl p-6 w-full max-w-[280px] text-center shadow-2xl border border-white">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h4 className="text-slate-900 font-bold text-base mb-1">Delete Node?</h4>
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-6 leading-relaxed">System data will be purged.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest hover:bg-slate-50 rounded-lg transition-all">Abort</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-red-500 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all">Confirm</button>
        </div>
      </div>
    </div>
  );
}
