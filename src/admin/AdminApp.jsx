import { useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, FolderOpen, UserCheck, BarChart3, LogOut, 
  Search, Bell, Settings, Map, CheckCircle, Activity
} from 'lucide-react';
import gsap from 'gsap';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

// ── Placeholder Pages ────────────────────────────────────────────────────────
const DashboardPage = () => {
  const containerRef = useRef();

  useEffect(() => {
    gsap.fromTo(containerRef.current.children, 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-white text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>Dashboard</h1>
        <p className="text-white/40 text-[13px] font-medium tracking-tight">System overview and processing metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={FolderOpen} label="Total Projects" value="12" color="blue" />
        <StatsCard icon={CheckCircle} label="Available Plots" value="482" color="green" />
        <StatsCard icon={Activity} label="System Health" value="98%" color="amber" />
      </div>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#1e293b]/30 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
    <div className={`w-10 h-10 bg-${color}-500/10 rounded-xl flex items-center justify-center text-${color}-500`}>
      <Icon size={20} />
    </div>
    <div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-white/30 text-[9px] font-black uppercase tracking-widest">{label}</div>
    </div>
  </div>
);

const UserAccessPage = () => (
  <EmptyState icon={UserCheck} title="User Access" desc="Manage permissions and node access." />
);

const AnalyticsPage = () => (
  <EmptyState icon={BarChart3} title="Analytics" desc="Traffic and conversion metrics." />
);

const EmptyState = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-center">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/10 mb-5">
      <Icon size={32} />
    </div>
    <h2 className="text-white text-lg font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h2>
    <p className="text-white/40 text-xs font-medium max-w-[200px]">{desc}</p>
  </div>
);

// ── Sidebar Link Component ──────────────────────────────────────────────────
function SidebarLink({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-white/30 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} className={active ? 'text-white' : 'text-white/30 group-hover:text-blue-500 transition-colors'} />
      <span className="font-bold text-[13px] tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1 h-3 rounded-full bg-white/50" />}
    </Link>
  );
}

// ── Layout Shell ─────────────────────────────────────────────────────────────
export default function AdminApp() {
  const location = useLocation();
  const sidebarRef = useRef();
  const headerRef = useRef();
  const mainRef = useRef();
  const rootRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(sidebarRef.current, 
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      )
      .fromTo(headerRef.current, 
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 
        "-=0.3"
      )
      .fromTo(mainRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }, 
        "-=0.2"
      );
    }, rootRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="flex h-screen w-full bg-[#0c1425] text-slate-200 overflow-hidden font-inter selection:bg-blue-500/30">
      {/* ── Left Sidebar ── */}
      <aside ref={sidebarRef} className="w-[240px] bg-[#0c1222] border-r border-white/5 flex flex-col p-6 flex-shrink-0 opacity-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Map size={18} className="text-white" />
          </div>
          <span className="text-white text-lg font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            LandViewer
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto scrollbar-hide">
          <SidebarLink to="/admin" icon={LayoutGrid} label="Dashboard" active={location.pathname === '/admin'} />
          <SidebarLink to="/admin/projects" icon={FolderOpen} label="Projects" active={location.pathname === '/admin/projects' || location.pathname.includes('/admin/project/')} />
          
          <div className="mt-8 mb-3 px-4">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-black">Management</span>
          </div>
          
          <SidebarLink to="/admin/users" icon={UserCheck} label="Team" active={location.pathname === '/admin/users'} />
          <SidebarLink to="/admin/analytics" icon={BarChart3} label="Analytics" active={location.pathname === '/admin/analytics'} />

          <div className="mt-auto pt-6 border-t border-white/5">
            <SidebarLink to="/" icon={Map} label="Live View" active={false} />
            <button className="flex items-center gap-3 px-4 py-3 w-full text-white/30 hover:text-red-400 transition-all rounded-xl hover:bg-red-500/5 mt-2 group">
              <LogOut size={18} />
              <span className="font-bold text-[13px]">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ── Main Container ── */}
      <div className="flex flex-col flex-1 min-w-0 bg-[#0c1425]">
        {/* Header */}
        <header ref={headerRef} className="h-20 flex items-center justify-between px-8 flex-shrink-0 z-10 border-b border-white/5 bg-[#0c1425]/50 backdrop-blur-md opacity-0">
          <div className="flex items-center gap-4">
             <div className="h-3 w-[2px] bg-blue-500 rounded-full" />
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                Admin Console
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <HeaderAction icon={Search} />
              <HeaderAction icon={Bell} badge />
              <HeaderAction icon={Settings} />
            </div>
            
            <div className="h-5 w-[1px] bg-white/10" />
            
            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-white leading-none">A. Engineer</div>
                <div className="text-[8px] font-black text-white/25 uppercase tracking-widest mt-1">Superuser</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-600/20 relative overflow-hidden group-hover:scale-105 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <span className="relative z-10">AE</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div ref={mainRef} className="flex flex-1 overflow-hidden opacity-0">
          <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <Routes>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="project/:id" element={<ProjectDetailPage />} />
              <Route path="users" element={<UserAccessPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Routes>
          </main>

          {/* ── Right Pipeline Sidebar ── */}
          <aside className="w-[280px] border-l border-white/5 bg-[#0c1222] flex flex-col p-6 gap-8 overflow-y-auto hidden 2xl:flex transition-all">
             <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 font-bold">Node Monitoring</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">DXF Engine</span>
                    <span className="text-[8px] font-black text-green-500 uppercase px-2 py-0.5 bg-green-500/10 rounded-md">Live</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < 10 ? 'bg-blue-500/60' : 'bg-white/5'}`} />
                    ))}
                  </div>
                  <div className="text-[9px] font-bold text-white/10 text-center uppercase tracking-widest">42ms Latency</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <MiniCounter label="Uploads" value="2" color="blue" />
                   <MiniCounter label="Parsed" value="2" color="green" />
                </div>
             </div>

             <div className="flex-1">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Activity Pipeline</div>
                <div className="space-y-6">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="flex gap-4 relative group">
                        {i < 3 && <div className="absolute left-4 top-10 bottom-[-24px] w-[1px] bg-white/5" />}
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/5 group-hover:border-green-500/30 transition-all">
                           <CheckCircle size={14} className="text-white/20 group-hover:text-green-500" />
                        </div>
                        <div className="pt-0.5">
                           <div className="text-[10px] font-black text-white/90 uppercase tracking-tight mb-1">Vector Push</div>
                           <div className="text-[11px] text-white/30 font-medium leading-normal line-clamp-2">Node {10+i} synchronized.</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


const HeaderAction = ({ icon: Icon, badge }) => (
  <button className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20 hover:bg-white/5 hover:text-white transition-all relative">
    <Icon size={18} />
    {badge && <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />}
  </button>
);

const MiniCounter = ({ label, value, color }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center transition-all hover:bg-white/[0.04]">
    <div className={`text-[8px] font-black text-${color}-500 uppercase tracking-widest mb-1`}>{label}</div>
    <div className="text-xl font-black text-white">{value}</div>
  </div>
);

