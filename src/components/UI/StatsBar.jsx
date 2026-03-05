import usePlotStore from '../../store/plotStore';
import { STATUS_COLORS } from '../../utils/constants';

export default function StatsBar() {
  const plots = usePlotStore((s) => s.plots);
  const showStatus = usePlotStore((s) => s.showStatus);

  if (!showStatus || plots.length === 0) return null;

  const counts = plots.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const total = plots.length;

  const items = [
    { key: 'available', label: 'Available', color: STATUS_COLORS.available },
    { key: 'booked',    label: 'Booked',    color: STATUS_COLORS.booked },
    { key: 'hold',      label: 'On Hold',   color: STATUS_COLORS.hold },
    { key: 'ninfo',     label: 'No Info',   color: STATUS_COLORS.ninfo },
  ];

  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 z-20 fade-in"
      style={{ top: 12 }}
    >
      <div className="glass rounded-2xl px-4 py-2 flex items-center gap-4">
        <span className="text-white/40 text-xs uppercase tracking-widest font-medium">
          {total} Plots
        </span>
        <div className="w-px h-4 bg-white/10" />
        {items.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
            />
            <span className="text-white/60 text-xs font-medium">{counts[key] || 0}</span>
            <span className="text-white/25 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
