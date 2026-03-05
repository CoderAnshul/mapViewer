import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseDXF } from '../utils/dxfParser';
import { generateDefaultPlots } from '../data/defaultPlots';

// ── helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function enrichPlot(plot) {
  return {
    ownerName: '',
    phone: '',
    email: '',
    notes: '',
    ...plot,
    area_sqft: plot.area_sqft ?? Math.round((plot.area_sqm ?? 0) * 10.764),
  };
}

// ── store ─────────────────────────────────────────────────────────────────────
const useAdminStore = create(
  persist(
    (set, get) => ({
      // ── state ──
      projects: [],          // [{ id, name, description, createdAt, plots, roads, trees, commonAreas }]
      activeProjectId: null, // which project the viewer is showing

      // ── project CRUD ──
      createProject: (name, description = '') => {
        const id = uid();
        const project = {
          id,
          name: name.trim(),
          description: description.trim(),
          createdAt: new Date().toISOString(),
          plots: [],
          roads: [],
          trees: [],
          commonAreas: [],
          gallery: [],
          fileSize: '0.0 MB',
          fileType: '---',
          status: 'READY'
        };
        set((s) => ({ projects: [...s.projects, project] }));
        return id;
      },

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
        })),

      setActiveProject: (id) => set({ activeProjectId: id }),

      getProject: (id) => get().projects.find((p) => p.id === id),

      // ── Gallery Management ──
      addGalleryImage: (projectId, imageData) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, gallery: [...(p.gallery || []), { id: uid(), url: imageData, createdAt: new Date().toISOString() }] }
              : p
          ),
        }));
      },

      removeGalleryImage: (projectId, imageId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, gallery: (p.gallery || []).filter((img) => img.id !== imageId) }
              : p
          ),
        }));
      },

      // ── CAD upload ──
      uploadCADToProject: async (projectId, file) => {
        const text = await file.text();
        const fileSizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        const fileTypeStr = file.name.split('.').pop().toUpperCase();
        
        try {
          const parsed = await parseDXF(text);
          set((s) => ({
            projects: s.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    plots: parsed.plots.map(enrichPlot),
                    roads: parsed.roads ?? [],
                    trees: parsed.trees ?? [],
                    commonAreas: parsed.commonAreas ?? [],
                    gallery: p.gallery ?? [],
                    fileSize: fileSizeStr,
                    fileType: fileTypeStr,
                    status: 'READY'
                  }
                : p
            ),
          }));
          return { ok: true, count: parsed.plots.length };
        } catch (err) {
          return { ok: false, error: err.message };
        }
      },

      // ── plot CRUD ──
      updatePlot: (projectId, plotId, changes) => {
        set((s) => ({
          projects: s.projects.map((proj) =>
            proj.id !== projectId
              ? proj
              : {
                  ...proj,
                  plots: proj.plots.map((pl) =>
                    pl.id !== plotId ? pl : { ...pl, ...changes }
                  ),
                }
          ),
        }));
      },
    }),
    {
      name: 'landviewer-admin',
      version: 1,
    }
  )
);

export default useAdminStore;
