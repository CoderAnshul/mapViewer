import { create } from 'zustand';

const usePlotStore = create((set, get) => ({
  // ── Layout Data ──
  plots: [],
  roads: [],
  commonAreas: [],
  treePositions: [],
  gallery: [],
  
  // ── Selection State ──
  selectedPlot: null,
  hoveredPlotId: null,

  // ── UI UI Toggles ──
  showStatus: false,
  viewMode: '3D', // '2D' | '3D'
  searchQuery: '',
  showUpload: false,
  showGallery: false,
  isLoading: false,

  // ── Camera State ──
  cameraTarget: null, // { position: [x,y,z], lookAt: [x,y,z] }
  resetCamera: false,

  // ── Actions ──
  setPlots: (plots) => set({ plots }),
  
  // Sets the entire colony layout (useful for project loading)
  setLayout: (data) => set({
    plots: data.plots || [],
    roads: data.roads || [],
    commonAreas: data.commonAreas || [],
    treePositions: data.treePositions || [],
    gallery: data.gallery || [],
  }),

  selectPlot: (plot) => {
    if (plot) {
      const cx = plot.center[0];
      const cz = plot.center[1];
      set({
        selectedPlot: plot,
        cameraTarget: {
          // A bit closer, more top-down for better centering
          position: [cx, 35, cz + 30],
          lookAt: [cx, 0, cz],
        }
      });
    } else {
      set({ selectedPlot: null, cameraTarget: null });
    }
  },

  setHoveredPlot: (id) => set({ hoveredPlotId: id }),
  toggleStatus: () => set((s) => ({ showStatus: !s.showStatus })),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setShowUpload: (v) => set({ showUpload: v }),
  setShowGallery: (v) => set({ showGallery: v }),
  setIsLoading: (v) => set({ isLoading: v }),
  
  triggerReset: () => set({ 
    selectedPlot: null, 
    cameraTarget: null,
    resetCamera: true 
  }),
  clearReset: () => set({ resetCamera: false }),
}));

export default usePlotStore;
