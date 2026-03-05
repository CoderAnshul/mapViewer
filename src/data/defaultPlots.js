// ─────────────────────────────────────────────────────────────────────────────
// Clean default plot dataset — L-shaped colony layout
// Coordinate system: Three.js X/Z plane (Y is up)
// Units roughly: 1 unit ≈ 1 meter
// ─────────────────────────────────────────────────────────────────────────────

const STATUSES = ['available', 'available', 'available', 'booked', 'booked', 'hold', 'ninfo'];

function seededRand(n) {
  // LCG — deterministic pseudo-random based on plot number
  return (((n * 1664525 + 1013904223) >>> 0) * 2.3283064365386963e-10);
}

function plotStatus(n) {
  return STATUSES[Math.floor(seededRand(n) * STATUSES.length)];
}

function makePlot(num, x, z, w, d) {
  const cx = x + w / 2;
  const cz = z + d / 2;
  return {
    id: `plot-${num}`,
    number: num,
    area_sqm: Math.round(w * d * (0.5 + seededRand(num + 500) * 0.3)),
    area_sqft: Math.round(w * d * (0.5 + seededRand(num + 500) * 0.3) * 10.764),
    status: plotStatus(num),
    vertices: [
      [x,     z    ],
      [x + w, z    ],
      [x + w, z + d],
      [x,     z + d],
    ],
    center: [cx, cz],
    width: w,
    depth: d,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
const PW = 5.5;   // plot width
const PD = 7.0;   // plot depth
const GAP = 0.7;  // gap between plots (road boundary drawn elsewhere)
const ROAD_W = 8; // road width between sections

// ─────────────────────────────────────────────────────────────────────────────
export function generateDefaultPlots() {
  const plots = [];
  let n = 1; // global plot counter

  // ── ZONE 1: TOP HORIZONTAL STRIP ──────────────────────────────────────────
  // Far top row — 25 plots going left→right
  // Starts at X=-68, Z=-100
  const TOP_Z = -104;
  const TOP_X0 = -68;
  for (let i = 0; i < 25; i++) {
    plots.push(makePlot(n++, TOP_X0 + i * (PW + GAP), TOP_Z, PW, 6));
  }

  // ── ZONE 2: UPPER-LEFT BLOCK (6 cols × 7 rows) ────────────────────────────
  // Left block, rows going south (increasing Z), cols going east
  const UL_X0 = -68;
  const UL_Z0 = -96;
  const UL_COLS = 6;
  const UL_ROWS = 7;
  for (let row = 0; row < UL_ROWS; row++) {
    for (let col = 0; col < UL_COLS; col++) {
      plots.push(makePlot(n++, UL_X0 + col * (PW + GAP), UL_Z0 + row * (PD + GAP), PW, PD));
    }
  }

  // ── ZONE 3: UPPER-MIDDLE BLOCK (6 cols × 5 rows) ─────────────────────────
  // Separated from Zone 2 by a road
  const UM_X0 = UL_X0 + UL_COLS * (PW + GAP) + ROAD_W;
  const UM_Z0 = -96;
  const UM_COLS = 6;
  const UM_ROWS = 5;
  for (let row = 0; row < UM_ROWS; row++) {
    for (let col = 0; col < UM_COLS; col++) {
      plots.push(makePlot(n++, UM_X0 + col * (PW + GAP), UM_Z0 + row * (PD + GAP), PW, PD));
    }
  }

  // ── ZONE 4: UPPER-RIGHT BLOCK (6 cols × 7 rows) ───────────────────────────
  const UR_X0 = UM_X0 + UM_COLS * (PW + GAP) + ROAD_W + 20; // skip common area
  const UR_Z0 = -96;
  const UR_COLS = 6;
  const UR_ROWS = 7;
  for (let row = 0; row < UR_ROWS; row++) {
    for (let col = 0; col < UR_COLS; col++) {
      plots.push(makePlot(n++, UR_X0 + col * (PW + GAP), UR_Z0 + row * (PD + GAP), PW, PD));
    }
  }

  // ── ZONE 5: FAR RIGHT COLUMN (3 cols × 8 rows) ────────────────────────────
  const FR_X0 = UR_X0 + UR_COLS * (PW + GAP) + ROAD_W;
  const FR_Z0 = -96;
  const FR_COLS = 3;
  const FR_ROWS = 8;
  for (let row = 0; row < FR_ROWS; row++) {
    for (let col = 0; col < FR_COLS; col++) {
      plots.push(makePlot(n++, FR_X0 + col * (PW + GAP), FR_Z0 + row * (PD + GAP), PW, PD));
    }
  }

  // ── ROAD GAP (Z ≈ −20 to −12) — 9 Meter Road spans here ──────────────────
  const ROAD1_Z = UL_Z0 + UL_ROWS * (PD + GAP); // bottom of upper blocks
  const LOWER_Z0 = ROAD1_Z + ROAD_W + 1;

  // ── ZONE 6: LOWER-LEFT MAIN BLOCK (10 cols × 5 rows) ─────────────────────
  const LL_X0 = -68;
  const LL_COLS = 10;
  const LL_ROWS = 5;
  for (let row = 0; row < LL_ROWS; row++) {
    for (let col = 0; col < LL_COLS; col++) {
      plots.push(makePlot(n++, LL_X0 + col * (PW + GAP), LOWER_Z0 + row * (PD + GAP), PW, PD));
    }
  }

  // ── ZONE 7: LOWER-RIGHT BLOCK (8 cols × 4 rows) ───────────────────────────
  const LR_X0 = LL_X0 + LL_COLS * (PW + GAP) + ROAD_W;
  const LR_COLS = 8;
  const LR_ROWS = 4;
  for (let row = 0; row < LR_ROWS; row++) {
    for (let col = 0; col < LR_COLS; col++) {
      plots.push(makePlot(n++, LR_X0 + col * (PW + GAP), LOWER_Z0 + row * (PD + GAP), PW, PD));
    }
  }

  // ── ZONE 8: FAR RIGHT LOWER (3 cols × 5 rows) ─────────────────────────────
  const FRL_X0 = LR_X0 + LR_COLS * (PW + GAP) + ROAD_W;
  const FRL_COLS = 3;
  const FRL_ROWS = 5;
  for (let row = 0; row < FRL_ROWS; row++) {
    for (let col = 0; col < FRL_COLS; col++) {
      plots.push(makePlot(n++, FRL_X0 + col * (PW + GAP), LOWER_Z0 + row * (PD + GAP), PW, PD));
    }
  }

  // ── ROAD GAP 2 ─────────────────────────────────────────────────────────────
  const ROAD2_Z = LOWER_Z0 + LL_ROWS * (PD + GAP);
  const BOTTOM_Z0 = ROAD2_Z + ROAD_W + 1;

  // ── ZONE 9: BOTTOM ROW (22 plots) ─────────────────────────────────────────
  const BOT_X0 = -28;
  for (let i = 0; i < 22; i++) {
    plots.push(makePlot(n++, BOT_X0 + i * (PW + GAP), BOTTOM_Z0, PW, 6.5));
  }

  // ── ZONE 10: LEFT SIDE COLUMN (1 col × 6 rows) ────────────────────────────
  // Thin vertical strip on far left going down
  const LSC_Z0 = LOWER_Z0;
  for (let row = 0; row < 6; row++) {
    plots.push(makePlot(n++, LL_X0 - (PW + GAP) - ROAD_W, LSC_Z0 + row * (PD + GAP), PW, PD));
  }

  return plots;
}

// ─────────────────────────────────────────────────────────────────────────────
// Roads
export const roads = [
  // ── Horizontal Roads ──
  {
    id: 'road-top',
    label: '',
    x: -72, z: -100, width: 200, depth: 3,
  },
  {
    id: 'road-mid1',
    label: '9 Meter Road',
    // dynamically computed based on zone — approximate
    x: -72, z: -21, width: 205, depth: ROAD_W,
  },
  {
    id: 'road-mid2',
    label: '6 Meter Road',
    x: -72, z: 44, width: 155, depth: ROAD_W - 1,
  },
  {
    id: 'road-bottom',
    label: '6 Meter Road',
    x: -31, z: 53, width: 132, depth: 6,
  },

  // ── Vertical Roads ──
  { id: 'road-v1', label: '', x: -76, z: -100, width: 5, depth: 170, },
  { id: 'road-v2', label: '', x: -20, z: -96, width: ROAD_W, depth: 70, },
  { id: 'road-v3', label: '', x: 62, z: -96, width: ROAD_W, depth: 66, },
  { id: 'road-v4', label: '', x: 97, z: -96, width: ROAD_W, depth: 80, },
  { id: 'road-v5', label: '', x: 119, z: -96, width: ROAD_W, depth: 56, },
];

// ─────────────────────────────────────────────────────────────────────────────
// Common Areas
// The gap between Zone 3 and Zone 4 is X: [22.4, 42.4], Z: [-96, -43]
// Center of gap: X ≈ 32, available width ≈ 18
export const commonAreas = [
  {
    // Main green base — fills the inter-zone gap
    id: 'green-park',
    type: 'green',
    label: '',
    color: '#3a7d34',
    position: [32, 0, -69],
    width: 18,
    depth: 48,
    height: 0.2,
  },
  {
    // Clubhouse building — positioned in upper portion of green
    id: 'clubhouse',
    type: 'building',
    label: 'Clubhouse',
    color: '#9e9e9e',
    position: [31, 0, -82],
    width: 11,
    depth: 9,
    height: 4.5,
  },
  {
    // Pool — lower-right of green
    id: 'pool',
    type: 'water',
    label: 'Pool',
    color: '#29B6F6',
    position: [35, 0, -65],
    width: 6,
    depth: 5,
    height: 0.6,
  },
  {
    // Party lawn — lower portion
    id: 'party-lawn',
    type: 'green',
    label: 'PARTY LAWN',
    color: '#4a7c3f',
    position: [30, 0, -54],
    width: 15,
    depth: 9,
    height: 0.25,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Trees — all placed within the green gap X:[23,41], Z:[-95,-44]
export const treePositions = [
  [25, -90], [31, -90], [37, -90],
  [24, -80], [38, -80],
  [25, -72], [38, -72],
  [25, -62], [38, -62],
  [26, -52], [32, -52], [38, -52],
  [27, -48], [36, -48],
];

export default generateDefaultPlots;
