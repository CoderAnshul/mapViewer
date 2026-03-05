import { useEffect, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import Scene from './components/Scene/Scene';
import Navbar from './components/UI/Navbar';
import NorthCompass from './components/UI/NorthCompass';
import ControlPanel from './components/UI/ControlPanel';
import PlotPopup from './components/UI/PlotPopup';
import UploadPanel from './components/UI/UploadPanel';
import StatsBar from './components/UI/StatsBar';
import usePlotStore from './store/plotStore';
import useAdminStore from './store/adminStore';
import { generateDefaultPlots } from './data/defaultPlots';
import { roads as defaultRoads, commonAreas as defaultCommonAreas, treePositions as defaultTrees } from './data/defaultPlots';
import Gallery from './components/UI/Gallery';
import ProjectInfo from './components/UI/ProjectInfo';

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0e0e0e 0%, #141414 100%)' }}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, #222 0%, #111 100%)',
              border: '2px solid rgba(196,154,42,0.4)',
              boxShadow: '0 0 40px rgba(196,154,42,0.15)',
            }}
          >
            <span className="text-4xl font-black logo-gradient" style={{ fontFamily: 'Outfit, sans-serif' }}>S</span>
          </div>
          <div className="absolute inset-0 rounded-full spinner"
            style={{ border: '2px solid transparent', borderTopColor: 'rgba(196,154,42,0.6)' }} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold tracking-[0.3em] logo-gradient uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
            SOLACE
          </span>
          <span className="text-white/30 text-xs tracking-[0.25em] uppercase">Independent Green Plots</span>
        </div>
        <div className="flex items-center gap-2">
          {[0, 150, 300].map((d) => (
            <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
        <p className="text-white/20 text-xs tracking-widest uppercase">Loading 3D Scene</p>
      </div>
    </div>
  );
}

export default function App() {
  const { projectId } = useParams();
  const setLayout = usePlotStore((s) => s.setLayout);
  const showUpload = usePlotStore((s) => s.showUpload);
  const showGallery = usePlotStore((s) => s.showGallery);
  const showInfo = usePlotStore((s) => s.showInfo);
  const getProject = useAdminStore((s) => s.getProject);

  useEffect(() => {
    if (projectId) {
      // Load from admin project
      const project = getProject(projectId);
      if (project) {
        setLayout({
          plots: project.plots || [],
          roads: project.roads || [],
          commonAreas: project.commonAreas || [],
          treePositions: project.treePositions || [],
          gallery: project.gallery || [],
          info: {
            subtitle: project.subtitle,
            description: project.description,
            developerName: project.developerName,
            developerLogo: project.developerLogo,
            otherProjectName: project.otherProjectName,
            otherProjectUrl: project.otherProjectUrl,
            otherProjectImage: project.otherProjectImage
          }
        });
        return;
      }
    }
    // No specific project—start minimal
    setLayout({
      plots: [],
      roads: [],
      commonAreas: [],
      treePositions: [],
      gallery: [],
    });
  }, [projectId]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#111111' }}>
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
      </Suspense>

      <Navbar />
      <NorthCompass />
      <StatsBar />
      <ControlPanel />
      <PlotPopup />
      {showUpload && <UploadPanel />}
      {showGallery && <Gallery />}
      {showInfo && <ProjectInfo />}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%)' }}
      />
    </div>
  );
}
