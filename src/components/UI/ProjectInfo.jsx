import { X, ExternalLink } from 'lucide-react';
import usePlotStore from '../../store/plotStore';

export default function ProjectInfo() {
  const showInfo = usePlotStore((s) => s.showInfo);
  const setShowInfo = usePlotStore((s) => s.setShowInfo);
  const info = usePlotStore((s) => s.projectInfo);

  if (!showInfo || !info) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setShowInfo(false)}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-[32px] overflow-hidden pointer-events-auto shadow-2xl">
        {/* Header / Logo */}
        <div className="p-8 pb-0 flex flex-col items-center">
            <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            {info.developerLogo ? (
                <img src={info.developerLogo} alt="Developer Logo" className="h-12 w-auto mb-6 object-contain" />
            ) : (
                <div className="mb-6 flex flex-col items-center">
                   <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-blue-600/20">
                      <span className="text-3xl font-black text-white italic">S</span>
                   </div>
                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Developer: {info.developerName || 'SOLACE'}</div>
                </div>
            )}
            
            <h2 className="text-white text-3xl font-black tracking-tighter text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {info.subtitle || 'Where Comfort Meets Elegance'}
            </h2>
        </div>

        {/* Description */}
        <div className="p-8 pt-6">
            <p className="text-white/60 text-[13px] leading-relaxed text-center font-medium">
                {info.description || 'Welcome to Samrudhhi Solace — A premium residential address that blends modern living with serene surroundings. Thoughtfully planned spaces, lush landscapes, and refined amenities create the perfect balance of luxury and tranquility.'}
            </p>

            <div className="h-[1px] w-full bg-white/5 my-10" />

            {/* Other Project Card */}
            <div>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Other projects by same developer :</p>
                <a 
                    href={info.otherProjectUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer"
                >
                    {info.otherProjectImage ? (
                        <img src={info.otherProjectImage} className="w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 transition-all duration-700" alt="" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    
                    <div className="absolute inset-0 p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-2 backdrop-blur-md">
                            <span className="text-white font-black text-xs italic">S</span>
                        </div>
                        <div>
                            <div className="text-white text-sm font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">{info.otherProjectName || 'SAMRUDDHI INDUSTRIAL PARK'}</div>
                            <div className="text-white/30 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">INDUSTRIAL PARK</div>
                        </div>
                        <ExternalLink size={14} className="ml-auto text-white/20 group-hover:text-white transition-colors" />
                    </div>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}
