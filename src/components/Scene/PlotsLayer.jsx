import PlotMesh from './PlotMesh';
import usePlotStore from '../../store/plotStore';

export default function PlotsLayer() {
  const plots = usePlotStore((s) => s.plots);
  const searchQuery = usePlotStore((s) => s.searchQuery);

  const filteredPlots = plots.filter((p) => {
    if (!searchQuery) return true;
    return String(p.number).includes(searchQuery.trim());
  });

  return (
    <group>
      {filteredPlots.map((plot) => (
        <PlotMesh key={plot.id} plot={plot} />
      ))}
    </group>
  );
}
