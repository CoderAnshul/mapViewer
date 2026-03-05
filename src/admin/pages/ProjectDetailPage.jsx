import { useState, useRef, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, Search, X, Eye, 
  CheckCircle, AlertCircle, Loader,
  ChevronRight, MapPin, Layers, LayoutGrid, FileCode,
  Image as ImageIcon, Trash2, PlusCircle, User, Square
} from 'lucide-react';
import gsap from 'gsap';
import useAdminStore from '../../store/adminStore';
import usePlotStore from '../../store/plotStore';
import Scene from '../../components/Scene/Scene';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  available: { label: 'AVAILABLE', color: '#10b981', bg: 'bg-[#10b981]' },
  booked:    { label: 'BOOKED',    color: '#ef4444', bg: 'bg-[#1e293b]' },
};

// ── CAD Upload Hub ───────────────────────────────────────────────────────────
function CADUpload({ projectId }) {
  const uploadCAD = useAdminStore((s) => s.uploadCADToProject);
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    const ext = file.name.toLowerCase().split('.').pop();
    const supported = ['dxf', 'dwg', 'geojson', 'json'];
    
    if (!file || !supported.includes(ext)) {
      setMsg('Use DXF or DWG (convert for best results)');
      setState('error');
      return;
    }
    setState('loading');
    const res = await uploadCAD(projectId, file);
    if (res.ok) {
      setMsg(`${res.count} parsed`);
      setState('done');
    } else {
      setMsg(res.error || 'Failed');
      setState('error');
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer bg-white/5 border border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all hover:bg-white/[0.08] group ${dragging ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'}`}
    >
      <input ref={inputRef} type="file" accept=".dxf,.dwg,.geojson,.json" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      {state === 'loading' ? (
        <><Loader size={18} className="text-blue-500 animate-spin mb-2" /><span className="text-white/30 text-[9px] font-black uppercase tracking-widest">Parsing...</span></>
      ) : state === 'done' ? (
        <><CheckCircle size={18} className="text-green-500 mb-2" /><span className="text-green-500 text-[9px] font-black uppercase tracking-widest">{msg}</span></>
      ) : state === 'error' ? (
        <><AlertCircle size={18} className="text-red-500 mb-2" /><span className="text-red-500 text-[9px] font-black uppercase tracking-widest">{msg}</span></>
      ) : (
        <div className="flex items-center gap-3">
            <Upload size={16} className="text-white/20 group-hover:text-blue-500 transition-colors" />
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Manifest Drop</div>
        </div>
      )}
    </div>
  );
}

// ── Plot List Item ────────────────────────────────────────────────────────────
function PlotListItem({ plot, active, onClick }) {
  const isBooked = plot.status === 'booked';
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all group text-left mb-1.5 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
          : 'bg-white/5 hover:bg-white/[0.08] text-white/60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isBooked ? 'bg-[#ef4444]' : 'bg-[#10b981]'} ${active ? 'bg-white' : ''}`} />
        <span className={`text-[12px] font-bold uppercase tracking-widest`}>
          Plot {plot.number}
        </span>
      </div>
      <ChevronRight size={14} className={active ? 'text-white' : 'text-white/10 group-hover:text-white/30'} />
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getProject = useAdminStore((s) => s.getProject);
  const setActiveProject = useAdminStore((s) => s.setActiveProject);
  const updatePlot = useAdminStore((s) => s.updatePlot);
  
  const setLayout = usePlotStore((s) => s.setLayout);
  const selectPlot = usePlotStore((s) => s.selectPlot);

  const project = useAdminStore((s) => s.projects.find(p => p.id === id));
  const [search, setSearch] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [activeTab, setActiveTab] = useState('viz');
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({ number: '', status: 'available', width: 65, depth: 32, owner: '' });
  const containerRef = useRef();

  // Load layout into plotStore for the embedded 3D scene
  useEffect(() => {
    if (project) {
      setLayout({
        plots: project.plots || [],
        roads: project.roads || [],
        commonAreas: project.commonAreas || [],
        treePositions: project.treePositions || [],
        gallery: project.gallery || [],
      });
    }
  }, [id, project, setLayout]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".animate-pane", 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const selectedPlot = project?.plots.find(p => p.id === selectedPlotId);

  useEffect(() => {
    if (selectedPlot) {
      setForm({
        number: selectedPlot.number || '',
        status: selectedPlot.status || 'available',
        width: selectedPlot.width || 65,
        depth: selectedPlot.depth || 32,
        owner: selectedPlot.ownerName || ''
      });
      // Important: Sync the 3D scene selection!
      selectPlot(selectedPlot);
    } else {
      selectPlot(null);
    }
  }, [selectedPlotId, selectedPlot, selectPlot]);

  if (!project) return null;

  const filteredPlots = project.plots.filter(p => search.trim() === '' || String(p.number).includes(search.trim()));

  const handleSave = () => {
    if (!selectedPlotId) return;
    setIsSaving(true);
    
    updatePlot(id, selectedPlotId, {
      number: isNaN(parseInt(form.number)) ? form.number : parseInt(form.number),
      status: form.status,
      width: parseFloat(form.width),
      depth: parseFloat(form.depth),
      area_sqm: Math.round(form.width * form.depth * 0.0929),
      area_sqft: form.width * form.depth,
      ownerName: form.owner.trim()
    });

    // Visual feedback
    gsap.fromTo("#save-btn", { scale: 1 }, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    
    setTimeout(() => {
      setIsSaving(false);
    }, 2000);
  };

  return (
    <div ref={containerRef} className="h-full flex gap-6 overflow-hidden">
      {/* ── Left Pane: Inventory ── */}
      <div className="w-[300px] flex flex-col h-full animate-pane">
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-white text-lg font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Inventory</h2>
            <span className="text-[9px] font-black text-white/20 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{project.plots.length} Nodes</span>
        </div>

        <div className="relative mb-4">
           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
           <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search plots..." 
             className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/20 transition-all font-medium"
           />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-6">
           {filteredPlots.map(p => (
             <PlotListItem key={p.id} plot={p} active={selectedPlotId === p.id} onClick={() => setSelectedPlotId(p.id)} />
           ))}
        </div>
      </div>

      {/* ── Center Pane: Viewport ── */}
      <div className="flex-1 flex flex-col animate-pane overflow-hidden relative">
         <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <button onClick={() => navigate('/admin/projects')} className="bg-white/5 text-white/30 hover:text-white p-2.5 rounded-xl transition-all border border-white/5">
               <ArrowLeft size={16} />
            </button>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <button 
                  onClick={() => setActiveTab('viz')} 
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'viz' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/20'}`}
                >
                  Visualization
                </button>
                <button 
                  onClick={() => setActiveTab('asset')} 
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'asset' ? 'bg-white/10 text-white' : 'text-white/20'}`}
                >
                  Assets
                </button>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Pipeline v2.1</span>
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
         </div>

         <div className="flex-1 bg-black/40 border border-white/5 rounded-[32px] relative overflow-hidden group">
            {activeTab === 'viz' ? (
              <div className="absolute inset-0 z-0">
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                    <Loader className="text-blue-500 animate-spin" />
                  </div>
                }>
                  <Scene />
                </Suspense>
                
                {/* Overlay UI for Scene */}
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-0.5">Perspective</p>
                    <h4 className="text-white text-xs font-bold tracking-tight">Active Node Engine</h4>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                  <div className="bg-blue-600/90 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Eye size={12} /> Live Render Active
                  </div>
                </div>

                {/* External Link Overlay */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <button 
                     onClick={() => { setActiveProject(id); navigate(`/view/${id}`); }}
                     className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
                   >
                     Full Screen <ChevronRight size={12} />
                   </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02] text-white/10 flex-col gap-4">
                 <ImageIcon size={48} />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Assets Attached</p>
              </div>
            )}
         </div>
         
         <div className="mt-4 flex items-center justify-between px-2">
            <CADUpload projectId={id} />
            <div className="text-right">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Built with SoloNode Architecture</span>
            </div>
         </div>
      </div>

      {/* ── Right Pane: Specs Manager ── */}
      <div className="w-[320px] flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 overflow-y-auto scrollbar-hide animate-pane">
         {!selectedPlot ? (
           <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
              <Square size={32} className="mb-4" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed text-white">SELECT PLOT <br/> TO DEFINE SPECS</p>
           </div>
         ) : (
           <div className="flex flex-col gap-8">
              <div className="bg-blue-600 rounded-xl p-5 text-white relative overflow-hidden">
                 <button onClick={() => setSelectedPlotId(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                    <X size={16} />
                 </button>
                 <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-40">Active Unit</div>
                 <input 
                    type="text" 
                    value={form.number} 
                    onChange={e => setForm(f => ({...f, number: e.target.value}))} 
                    className="bg-transparent text-xl font-black w-full border-b border-white/20 focus:border-white focus:outline-none py-1"
                 />
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-3 block">Booking Status</label>
                    <div className="flex gap-2">
                       <button onClick={() => setForm(f => ({...f, status: 'available'}))} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${form.status === 'available' ? 'bg-[#10b981] text-white border-[#10b981]' : 'bg-transparent text-white/20 border-white/5 hover:bg-white/5'}`}>AVAILABLE</button>
                       <button onClick={() => setForm(f => ({...f, status: 'booked'}))} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${form.status === 'booked' ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-transparent text-white/20 border-white/5 hover:bg-white/5'}`}>BOOKED</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-white/20 text-[9px] font-black uppercase tracking-widest">Length (ft)</label>
                       <input type="number" value={form.width} onChange={e => setForm(f => ({...f, width: e.target.value}))} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/30" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-white/20 text-[9px] font-black uppercase tracking-widest">Width (ft)</label>
                       <input type="number" value={form.depth} onChange={e => setForm(f => ({...f, depth: e.target.value}))} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/30" />
                    </div>
                 </div>

                 <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/5">
                    <p className="text-white/10 text-[9px] font-black uppercase tracking-widest mb-2">Calculated Area</p>
                    <div className="text-2xl font-black text-white mb-0.5">{(form.width * form.depth).toLocaleString()} <span className="text-[10px] text-white/20">FT²</span></div>
                    <p className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">{Math.round(form.width * form.depth * 0.0929).toLocaleString()} M²</p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-white/20 text-[9px] font-black uppercase tracking-widest">Owner / Buyer Name</label>
                    <div className="relative">
                       <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" />
                       <input type="text" value={form.owner} onChange={e => setForm(f => ({...f, owner: e.target.value}))} placeholder="Search name..." className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[12px] font-medium text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/30" />
                    </div>
                 </div>

                  <button 
                    id="save-btn" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all mt-4 ${
                      isSaving 
                        ? 'bg-[#10b981] text-white shadow-[#10b981]/10' 
                        : 'bg-blue-600 text-white shadow-blue-600/10 hover:bg-blue-500 active:scale-95'
                    }`}
                  >
                    {isSaving ? 'Changes Saved!' : 'Confirm Changes'}
                  </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
