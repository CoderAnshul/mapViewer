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
export function CADUpload({ projectId }) {
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
export function PlotListItem({ plot, active, onClick }) {
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

// ── Project Info Tab ────────────────────────────────────────────────────────
export function ProjectInfoTab({ project, onSave }) {
  const [data, setData] = useState({
    subtitle: project.subtitle || 'Where Comfort Meets Elegance',
    description: project.description || 'Welcome to Samrudhhi Solace...',
    developerName: project.developerName || 'SAMRUDDHI',
    developerLogo: project.developerLogo || '',
    otherProjectName: project.otherProjectName || 'SAMRUDDHI INDUSTRIAL PARK',
    otherProjectUrl: project.otherProjectUrl || '#',
    otherProjectImage: project.otherProjectImage || ''
  });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  return (
    <div className="flex flex-col gap-6 p-8 h-full overflow-y-auto scrollbar-hide">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 block">Project Subtitle</label>
            <input name="subtitle" value={data.subtitle} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/20" />
          </div>
          <div>
            <label className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 block">Marketing Description</label>
            <textarea name="description" value={data.description} onChange={handleChange} rows={5} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-white/70 focus:outline-none focus:border-blue-500/20 scrollbar-hide" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
             <label className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 block">Developer Name</label>
             <input name="developerName" value={data.developerName} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/20" />
          </div>
          <div>
             <label className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 block">Developer Logo URL</label>
             <input name="developerLogo" value={data.developerLogo} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white/50 focus:outline-none focus:border-blue-500/20" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">Cross-Promotion (Related Project)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
           <div>
              <label className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 block">Display Name</label>
              <input name="otherProjectName" value={data.otherProjectName} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/20" />
           </div>
           <div>
              <label className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 block">External Link</label>
              <input name="otherProjectUrl" value={data.otherProjectUrl} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white/50 focus:outline-none focus:border-blue-500/20" />
           </div>
           <div>
              <label className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 block">Card Image URL</label>
              <input name="otherProjectImage" value={data.otherProjectImage} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white/50 focus:outline-none focus:border-blue-500/20" />
           </div>
        </div>
      </div>

      <button onClick={() => onSave(data)} className="mt-auto bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all">
         Update Project Info
      </button>
    </div>
  );
}

// ── Gallery Tab ─────────────────────────────────────────────────────────────
export function ProjectGalleryTab({ project }) {
  const addImage = useAdminStore((s) => s.addGalleryImage);
  const removeImage = useAdminStore((s) => s.removeGalleryImage);
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => addImage(project.id, ev.target.result);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-white text-sm font-black uppercase tracking-tight">Project Assets</h3>
           <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">High-quality lifestyle renders.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
        >
          <PlusCircle size={14} /> Upload Images
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {project.gallery?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {project.gallery.map((img) => (
              <div key={img.id} className="aspect-video rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                <img src={img.url} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                   <button onClick={() => removeImage(project.id, img.id)} className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/10 gap-4 border border-dashed border-white/5 rounded-[32px]">
             <ImageIcon size={48} />
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Gallery Items</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getProject = useAdminStore((s) => s.getProject);
  const setActiveProject = useAdminStore((s) => s.setActiveProject);
  const updatePlot = useAdminStore((s) => s.updatePlot);
  const updateProjectInfo = useAdminStore((s) => s.updateProjectInfo);
  
  const setLayout = usePlotStore((s) => s.setLayout);
  const selectPlot = usePlotStore((s) => s.selectPlot);

  const project = useAdminStore((s) => s.projects.find(p => p.id === id));
  const [search, setSearch] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [activeTab, setActiveTab] = useState('viz');
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({ number: '', status: 'available', width: 65, depth: 32, owner: '' });
  const containerRef = useRef();

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

    gsap.fromTo("#save-btn", { scale: 1 }, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    setTimeout(() => setIsSaving(false), 2000);
  };

  const onUpdateInfo = (data) => {
    updateProjectInfo(id, data);
    // show success toast or similar
  };

  return (
    <div ref={containerRef} className="h-full flex gap-6 overflow-hidden">
      {/* ── Left Pane: Inventory ── */}
      <div className="w-[300px] flex flex-col h-full animate-pane">
        <div className="mb-6 flex items-center justify-between px-2">
            <h2 className="text-white text-lg font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Unit Manager</h2>
            <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{project.plots.length} Nodes</span>
        </div>

        <div className="relative mb-4">
           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
           <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search plots..." 
             className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/20 transition-all font-medium"
           />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-6">
           {filteredPlots.map(p => (
             <PlotListItem key={p.id} plot={p} active={selectedPlotId === p.id} onClick={() => setSelectedPlotId(p.id)} />
           ))}
        </div>
      </div>

      {/* ── Center Pane: Viewport & Editors ── */}
      <div className="flex-1 flex flex-col animate-pane overflow-hidden relative">
         <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <button onClick={() => navigate('/admin/projects')} className="bg-white/5 text-white/30 hover:text-white p-2.5 rounded-xl transition-all border border-white/5 group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <button 
                  onClick={() => setActiveTab('viz')} 
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'viz' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/20 hover:text-white/40'}`}
                >
                  Visualization
                </button>
                <button 
                  onClick={() => setActiveTab('gallery')} 
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  Assets
                </button>
                <button 
                  onClick={() => setActiveTab('info')} 
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  Info Config
                </button>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Node Engine</span>
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
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
                
                <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                  <div className="bg-blue-600/90 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 backdrop-blur-sm">
                    <Eye size={12} /> Live Render Active
                  </div>
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <button 
                     onClick={() => { setActiveProject(id); navigate(`/view/${id}`); }}
                     className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
                   >
                     Live View <ChevronRight size={12} />
                   </button>
                </div>
              </div>
            ) : activeTab === 'gallery' ? (
               <ProjectGalleryTab project={project} />
            ) : (
               <ProjectInfoTab project={project} onSave={onUpdateInfo} />
            )}
         </div>
         
         <div className="mt-4 flex items-center justify-between px-2">
            <CADUpload projectId={id} />
            <div className="text-right flex items-center gap-6">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{project.name}</span>
                   <span className="text-[8px] font-medium text-white/10 uppercase tracking-[0.2em]">{project.id}</span>
                </div>
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
                       <input type="number" value={form.width} onChange={e => setForm(f => ({...f, width: e.target.value}))} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/20" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-white/20 text-[9px] font-black uppercase tracking-widest">Width (ft)</label>
                       <input type="number" value={form.depth} onChange={e => setForm(f => ({...f, depth: e.target.value}))} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/20" />
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
                       <input type="text" value={form.owner} onChange={e => setForm(f => ({...f, owner: e.target.value}))} placeholder="Search name..." className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[12px] font-medium text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/20" />
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
