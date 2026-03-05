import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Billboard Plot Number (Fires only for extreme zoom or context)
 */
export default function PlotLabel({ position, text, subText, color = '#1a1200', fontSize = 100, fontSizeSub = 42, opacity = 1, scale = [2, 2.2, 1] }) {
  const texture = useMemo(() => {
    const size = 256; 
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = color;
    ctx.font = `black ${fontSize}px "Outfit", "Arial", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (subText) {
      ctx.fillText(String(text), size / 2, size / 2 - 25);
      ctx.font = `bold ${fontSizeSub}px "Outfit", "Arial", sans-serif`;
      ctx.fillStyle = color + '99'; 
      ctx.fillText(String(subText), size / 2, size / 2 + 55);
    } else {
      ctx.fillText(String(text), size / 2, size / 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.anisotropy = 8;
    return tex;
  }, [text, subText, color, fontSize, fontSizeSub]);

  const [px, py, pz] = position;

  return (
    <sprite position={[px, py, pz]} scale={scale}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthTest={true}
        sizeAttenuation
      />
    </sprite>
  );
}

/**
 * SurfaceLabel: Renders text flat on the plot surface (not billboarding).
 * Matches the high-end real-estate "blueprint" look from your screenshot.
 */
export function SurfaceLabel({ position, rotation = [-Math.PI / 2, 0, 0], text, subText, extraText, color = '#201800', opacity = 0.8, scale = [4, 4, 1] }) {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);

    // Render Logic
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (extraText) {
      // TRIPLE LINE (Selected Style)
      // Line 1: Number
      ctx.font = '900 150px "Outfit", "Arial", sans-serif';
      ctx.fillText(String(text), size / 2, size / 2 - 80);
      
      // Line 2: m2
      ctx.font = 'bold 45px "Outfit", "Arial", sans-serif';
      ctx.fillStyle = color + 'aa';
      ctx.fillText(String(subText), size / 2, size / 2 + 30);
      
      // Line 3: ft2
      ctx.font = '900 55px "Outfit", "Arial", sans-serif';
      ctx.fillStyle = color;
      ctx.fillText(String(extraText), size / 2, size / 2 + 100);
    } else if (subText) {
      // DOUBLE LINE (Standard Style)
      ctx.font = '900 130px "Outfit", "Arial", sans-serif';
      ctx.fillText(String(text), size / 2, size / 2 - 40);
      
      ctx.font = 'bold 55px "Outfit", "Arial", sans-serif';
      ctx.fillStyle = color + '99'; 
      ctx.fillText(String(subText), size / 2, size / 2 + 80);
    } else {
      // SINGLE LINE
      ctx.font = '900 140px "Outfit", "Arial", sans-serif';
      ctx.fillText(String(text), size / 2, size / 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.anisotropy = 16;
    return tex;
  }, [text, subText, extraText, color]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[scale[0], scale[1]]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * FlatLabel: Horizontal labels for roads and large areas
 */
export function FlatLabel({ position, rotation = [-Math.PI / 2, 0, 0], text, color = '#777777', bgColor = null, scale = [12, 4, 1], opacity = 0.6 }) {
  const texture = useMemo(() => {
    const W = 1024;
    const H = 256;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, W, H);

    if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.roundRect(10, 10, W - 20, H - 20, 40);
      ctx.fill();
    }

    ctx.fillStyle = color;
    ctx.font = '900 70px "Outfit", "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '2px';

    const lines = text.split('\n');
    const lineH = 90;
    const startY = H / 2 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line.toUpperCase(), W / 2, startY + i * lineH);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.anisotropy = 16;
    return tex;
  }, [text, color, bgColor]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[scale[0], scale[1]]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
