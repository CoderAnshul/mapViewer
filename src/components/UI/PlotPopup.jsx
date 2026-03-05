import { X, MapPin } from 'lucide-react';
import usePlotStore from '../../store/plotStore';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

export default function PlotPopup() {
  const selectedPlot = usePlotStore((s) => s.selectedPlot);
  const selectPlot = usePlotStore((s) => s.selectPlot);

  if (!selectedPlot) return null;

  const color = STATUS_COLORS[selectedPlot.status] || STATUS_COLORS.ninfo;
  const label = STATUS_LABELS[selectedPlot.status] || 'No Info';

  return (
    /* Fixed bottom-left — sits in the empty dark space, never covers the 3D plot tiles */
    <div
      className="fixed bottom-4 left-4 z-30 slide-up"
      style={{ minWidth: 250, maxWidth: 300 }}
    >
      <div className="glass rounded-2xl overflow-hidden shadow-2xl">

        {/* Coloured status bar at top */}
        <div className="h-1.5" style={{ background: color }} />

        <div className="p-4">

          {/* Header: plot number + close */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] block mb-0.5">
                Plot Number
              </span>
              <span
                className="text-white text-4xl font-black"
                style={{ fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}
              >
                {selectedPlot.number}
              </span>
            </div>
            <button
              onClick={() => selectPlot(null)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X size={14} className="text-white/50" />
            </button>
          </div>

          {/* Area info grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="glass-light rounded-xl p-2.5 text-center">
              <div className="text-white/35 text-[10px] uppercase tracking-wider mb-0.5">
                sq. meters
              </div>
              <div className="text-white font-bold text-sm">
                {selectedPlot.area_sqm.toLocaleString()} m²
              </div>
            </div>
            <div className="glass-light rounded-xl p-2.5 text-center">
              <div className="text-white/35 text-[10px] uppercase tracking-wider mb-0.5">
                sq. feet
              </div>
              <div className="text-white font-bold text-sm">
                {selectedPlot.area_sqft.toLocaleString()} ft²
              </div>
            </div>
          </div>
          
          {/* Owner info if booked */}
          {selectedPlot.ownerName && (
            <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <span className="text-[10px] font-black">{selectedPlot.ownerName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="overflow-hidden">
                <span className="text-white/20 text-[8px] font-black uppercase tracking-widest block mb-0.5">Owner</span>
                <span className="text-white text-[11px] font-bold block truncate">{selectedPlot.ownerName}</span>
              </div>
            </div>
          )}

          {/* Status row */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/8">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
              <span className="text-white/80 text-sm font-medium">{label}</span>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/65 transition-colors">
              <MapPin size={12} />
              <span>Locate</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
