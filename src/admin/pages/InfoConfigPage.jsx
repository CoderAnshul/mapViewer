import { useState } from 'react';
import { Info, ChevronRight, Search } from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import { ProjectInfoTab } from './ProjectDetailPage';

export default function InfoConfigPage() {
  const projects = useAdminStore((s) => s.projects);
  const updateInfo = useAdminStore((s) => s.updateProjectInfo);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [search, setSearch] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (selectedProjectId && selectedProject) {
    return (
      <div className="h-full flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 transition-all"
          >
            ← Back to Selection
          </button>
          <h1 className="text-white text-xl font-black italic">Project Info Configuration: {selectedProject.name}</h1>
        </div>
        <div className="flex-1 bg-[#111]/30 border border-white/5 rounded-[32px] overflow-hidden">
          <ProjectInfoTab 
            project={selectedProject} 
            onSave={(data) => {
              updateInfo(selectedProject.id, data);
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-white text-3xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Project Marketing Info</h1>
        <p className="text-white/40 text-sm font-medium">Configure the story and branding for each map node.</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input 
          type="text" 
          placeholder="Filter projects..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-blue-500/30 transition-all shadow-2xl"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredProjects.map(proj => (
          <button 
            key={proj.id}
            onClick={() => setSelectedProjectId(proj.id)}
            className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-amber-600 hover:border-amber-500 transition-all group shadow-xl"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white/10 group-hover:text-white transition-all">
                <Info size={24} />
              </div>
              <div>
                <div className="text-white font-black text-lg group-hover:translate-x-1 transition-transform">{proj.name}</div>
                <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest group-hover:text-white/40">Status: {proj.status || 'READY'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-white/10 uppercase group-hover:text-white/40">Edit Config</span>
               <ChevronRight className="text-white/10 group-hover:text-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
