import { useState, useCallback } from 'react';
import { X, User, Phone, Mail, FileText, Save, CheckCircle, AlertCircle } from 'lucide-react';
import useAdminStore from '../../store/adminStore';

const STATUS_OPTS = [
  { key: 'available', label: 'Available', color: '#4CAF50', bg: '#4CAF5022' },
  { key: 'booked',    label: 'Booked',    color: '#F44336', bg: '#F4433622' },
  { key: 'hold',      label: 'On Hold',   color: '#FF9800', bg: '#FF980022' },
  { key: 'ninfo',     label: 'No Info',   color: '#9E9E9E', bg: '#9E9E9E22' },
];

export default function PlotEditor({ projectId, plot, onClose }) {
  const updatePlot = useAdminStore((s) => s.updatePlot);

  const [status, setStatus]     = useState(plot.status ?? 'available');
  const [width,  setWidth]      = useState(plot.width  ?? plot.depth ?? 5.5);
  const [depth,  setDepth]      = useState(plot.depth  ?? 7.0);
  const [owner,  setOwner]      = useState(plot.ownerName ?? '');
  const [phone,  setPhone]      = useState(plot.phone  ?? '');
  const [email,  setEmail]      = useState(plot.email  ?? '');
  const [notes,  setNotes]      = useState(plot.notes  ?? '');
  const [saved,  setSaved]      = useState(false);

  const areaSqft = Math.round(width * depth * 10.764);
  const areaSqm  = Math.round(width * depth);

  const handleSave = () => {
    updatePlot(projectId, plot.id, {
      status,
      width:     parseFloat(width),
      depth:     parseFloat(depth),
      area_sqm:  areaSqm,
      area_sqft: areaSqft,
      ownerName: owner.trim(),
      phone:     phone.trim(),
      email:     email.trim(),
      notes:     notes.trim(),
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const activeStatus = STATUS_OPTS.find((s) => s.key === status) ?? STATUS_OPTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl slide-up"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: activeStatus.color + '22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded border-2 flex-shrink-0"
              style={{ borderColor: activeStatus.color }}
            />
            <div>
              <div className="text-white font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                PLOT {plot.number}
              </div>
              <div className="text-white/40 text-[10px] uppercase tracking-widest">
                Specifications Manager
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <X size={16} className="text-white/50" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

          {/* Booking Status */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-widest mb-2 block">
              Booking Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatus(opt.key)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: status === opt.key ? opt.color : 'rgba(255,255,255,0.05)',
                    color: status === opt.key ? '#fff' : 'rgba(255,255,255,0.35)',
                    border: status === opt.key ? `1px solid ${opt.color}` : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {status === opt.key && <CheckCircle size={13} />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-widest mb-2 block">
              Dimensions (meters)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-white/30 text-xs mb-1">Width</div>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  step="0.5"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#60BAFF]/50"
                />
              </div>
              <div>
                <div className="text-white/30 text-xs mb-1">Depth</div>
                <input
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  step="0.5"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#60BAFF]/50"
                />
              </div>
            </div>
          </div>

          {/* Total area */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">
              Total Surface Area
            </div>
            <div className="text-white text-3xl font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {areaSqft.toLocaleString()}
              <span className="text-lg font-medium ml-1 text-white/60">ft²</span>
            </div>
            <div className="text-blue-400 text-sm mt-0.5">{areaSqm.toLocaleString()} m²</div>
          </div>

          {/* Owner */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-widest mb-2 block">
              Owner / Buyer
            </label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)}
                  placeholder="Full name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#60BAFF]/50" />
              </div>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#60BAFF]/50" />
              </div>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#60BAFF]/50" />
              </div>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-white/25 pointer-events-none" />
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes / remarks..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#60BAFF]/50 resize-none" />
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all"
            style={{
              background: saved ? '#4CAF50' : '#3B7FF5',
              color: '#fff',
            }}
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Confirm Specifications'}
          </button>
        </div>
      </div>
    </div>
  );
}
