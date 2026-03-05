import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import usePlotStore from '../../store/plotStore';

export default function Gallery() {
  const showGallery = usePlotStore((s) => s.showGallery);
  const setShowGallery = usePlotStore((s) => s.setShowGallery);
  const galleryImages = usePlotStore((s) => s.gallery);

  const [selectedIdx, setSelectedIdx] = useState(null);

  // Close with Esc key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (selectedIdx !== null) setSelectedIdx(null);
        else setShowGallery(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedIdx]);

  if (!showGallery) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={() => setShowGallery(false)}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-6xl h-full flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 z-10">
          <div className="flex flex-col">
            <h2 className="text-white text-2xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Project Gallery
            </h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
              Architectural Visualizations & Amenities
            </p>
          </div>
          <button 
            onClick={() => setShowGallery(false)}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
          {galleryImages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20">
              <Maximize2 size={48} className="mb-4 opacity-50" />
              <p className="font-black text-xs uppercase tracking-widest">No images uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {galleryImages.map((img, idx) => (
                <div 
                  key={img.id}
                  onClick={() => setSelectedIdx(idx)}
                  className="group relative aspect-[16/10] bg-white/5 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all active:scale-95"
                >
                  <img 
                    src={img.url} 
                    alt={`Gallery ${idx}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">View Image</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Expanded View */}
      {selectedIdx !== null && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 animate-fade-in p-4 md:p-10"
          onClick={() => setSelectedIdx(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            onClick={() => setSelectedIdx(null)}
          >
            <X size={32} />
          </button>

          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
            onClick={handlePrev}
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
            onClick={handleNext}
          >
            <ChevronRight size={24} />
          </button>

          <div className="max-w-5xl max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
            <img 
              src={galleryImages[selectedIdx].url} 
              alt="Expanded view"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-10 inset-x-0 text-center">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                {selectedIdx + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
