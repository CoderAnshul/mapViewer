import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import usePlotStore from '../../store/plotStore';

export default function StatusLegend() {
  const showStatus = usePlotStore((s) => s.showStatus);

  if (!showStatus) return null;

  const items = [
    { key: 'hold', label: STATUS_LABELS.hold },
    { key: 'booked', label: STATUS_LABELS.booked },
    { key: 'available', label: STATUS_LABELS.available },
    { key: 'ninfo', label: STATUS_LABELS.ninfo },
  ];

  return (
    <div className="glass rounded-2xl p-3 fade-in">
      <div className="flex flex-col gap-1.5">
        {items.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
              style={{ background: STATUS_COLORS[key], boxShadow: `0 0 6px ${STATUS_COLORS[key]}60` }}
            />
            <span className="text-white/70 text-xs font-medium whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
