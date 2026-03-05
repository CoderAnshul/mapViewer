import { Search, LayoutGrid, Home, Image, Info, Navigation, X } from 'lucide-react';
import usePlotStore from '../../store/plotStore';
import StatusLegend from './StatusLegend';

// Toggle Switch
function Toggle({ checked, onChange }) {
  return (
    <div
      className="toggle-track cursor-pointer"
      style={{ background: checked ? '#60BAFF' : 'rgba(255,255,255,0.15)' }}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
    >
      <div className={`toggle-thumb ${checked ? 'active' : ''}`} />
    </div>
  );
}

export default function ControlPanel() {
  const showStatus = usePlotStore((s) => s.showStatus);
  const viewMode = usePlotStore((s) => s.viewMode);
  const searchQuery = usePlotStore((s) => s.searchQuery);
  const setShowUpload = usePlotStore((s) => s.setShowUpload);
  const setShowGallery = usePlotStore((s) => s.setShowGallery);
  const setShowInfo = usePlotStore((s) => s.setShowInfo);

  const toggleStatus = usePlotStore((s) => s.toggleStatus);
  const setViewMode = usePlotStore((s) => s.setViewMode);
  const setSearchQuery = usePlotStore((s) => s.setSearchQuery);
  const triggerReset = usePlotStore((s) => s.triggerReset);
  const selectPlot = usePlotStore((s) => s.selectPlot);
  const plots = usePlotStore((s) => s.plots);
  const gallery = usePlotStore((s) => s.gallery);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    // Auto-navigate to matching plot
    if (q.trim()) {
      const found = plots.find((p) => String(p.number) === q.trim());
      if (found) selectPlot(found);
    } else {
      selectPlot(null);
    }
  };

  // Count by status
  const counts = plots.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="absolute right-4 bottom-4 z-20 flex flex-col items-end gap-3">
      {/* Status legend */}
      <StatusLegend />

      {/* Main glass panel */}
      <div className="glass rounded-2xl p-3 flex flex-col gap-2.5 shadow-2xl" style={{ minWidth: 240 }}>

        {/* Row 1: Status toggle + icon buttons */}
        <div className="flex items-center gap-2">
          {/* Status toggle */}
          <div className="flex items-center gap-2.5 flex-1 glass-light rounded-xl px-3 py-2">
            <span className="text-white/70 text-sm font-medium">Status</span>
            <Toggle checked={showStatus} onChange={toggleStatus} />
          </div>

          {/* Upload / floorplan button */}
          <button
            className="ctrl-btn"
            title="Upload CAD File"
            onClick={() => setShowUpload(true)}
          >
            <LayoutGrid size={16} />
          </button>

          {/* 2D / 3D toggle */}
          <button
            className={`ctrl-btn font-bold text-sm ${viewMode === '3D' ? 'active' : ''}`}
            style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', width: 44, fontWeight: 700 }}
            onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
            title={`Switch to ${viewMode === '3D' ? '2D' : '3D'} view`}
          >
            {viewMode === '3D' ? '3D' : '2D'}
          </button>

          {/* Home / reset */}
          <button
            className="ctrl-btn"
            title="Reset camera"
            onClick={triggerReset}
          >
            <Home size={16} />
          </button>
        </div>

        {/* Row 2: Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none"
          />
          <input
            id="plot-search"
            type="text"
            placeholder="Search Plot"
            value={searchQuery}
            onChange={handleSearch}
            className="search-input w-full rounded-xl py-2 pl-8 pr-8 text-sm"
          />
          {searchQuery && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              onClick={() => { setSearchQuery(''); selectPlot(null); }}
            >
              <X size={12} className="text-white/40 hover:text-white/70" />
            </button>
          )}
        </div>

        {/* Row 3: Action buttons */}
        <div className="flex items-center gap-1.5">
          <button 
            className="action-btn flex-1" 
            title="Gallery"
            onClick={() => setShowGallery(true)}
          >
            <div className="relative">
              <Image size={13} />
              {gallery.length > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border border-[#111] animate-pulse" />
              )}
            </div>
            <span>Gallery</span>
          </button>
          <button 
            className="action-btn flex-1" 
            title="Info"
            onClick={() => setShowInfo(true)}
          >
            <Info size={13} />
            <span>Info</span>
          </button>
          <button className="action-btn flex-1" title="Locate">
            <Navigation size={13} />
            <span>Locate</span>
          </button>
        </div>

        {/* Status count summary (when status is on) */}
        {showStatus && (
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/5 fade-in">
            <div className="flex items-center justify-between glass-light rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-white/50 uppercase tracking-wide">Available</span>
              <span className="text-green-400 font-bold text-sm">{counts.available || 0}</span>
            </div>
            <div className="flex items-center justify-between glass-light rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-white/50 uppercase tracking-wide">Booked</span>
              <span className="text-red-400 font-bold text-sm">{counts.booked || 0}</span>
            </div>
            <div className="flex items-center justify-between glass-light rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-white/50 uppercase tracking-wide">On Hold</span>
              <span className="text-yellow-400 font-bold text-sm">{counts.hold || 0}</span>
            </div>
            <div className="flex items-center justify-between glass-light rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-white/50 uppercase tracking-wide">No Info</span>
              <span className="text-gray-400 font-bold text-sm">{counts.ninfo || 0}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
