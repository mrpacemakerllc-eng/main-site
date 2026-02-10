'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { WaveformType } from '../data/rhythms';

interface RhythmStripProps {
  waveformType: WaveformType;
  heartRate: number; // ventricular rate in bpm
  atrialRate?: number; // atrial rate if different (for AV dissociation)
  speed?: number; // mm per second (default 25)
  pixelsPerMm?: number; // canvas pixels per mm (default 4)
  height?: number; // canvas height in pixels
  width?: number; // canvas width in pixels (ignored if responsive=true)
  isRunning?: boolean;
  caliperMode?: boolean;
  leadLabel?: string; // Lead label to display (default: "Lead II")
  showOverlays?: boolean; // Show lead label and speed/rate overlays (default: true)
  responsive?: boolean; // Auto-size to fill container width (default: false)
}

// Colors matching standard ECG paper
const GRID_LIGHT = '#ffcccc';
const GRID_DARK = '#ff9999';
const WAVEFORM_COLOR = '#000000';
const BACKGROUND_COLOR = '#fff5f5';

export default function RhythmStrip({
  waveformType,
  heartRate,
  atrialRate,
  speed = 25,
  pixelsPerMm = 4,
  height: propHeight = 200,
  width: propWidth = 800,
  isRunning = true,
  caliperMode = false,
  leadLabel = 'Lead II',
  showOverlays = true,
  responsive = false,
}: RhythmStripProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const [displayRate, setDisplayRate] = useState(heartRate);
  const caliperMarkersRef = useRef<number[]>([]);
  const [caliperMarkerCount, setCaliperMarkerCount] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // High-DPI support: render canvas at native device resolution
  const [dpr, setDpr] = useState(1);
  useEffect(() => {
    const d = window.devicePixelRatio || 1;
    if (d !== 1) setDpr(d);
  }, []);

  // Responsive sizing: measure container and update width
  useEffect(() => {
    if (!responsive || !containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        if (newWidth > 0) setContainerWidth(newWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [responsive]);

  // Use container width if responsive, otherwise use prop
  const width = responsive && containerWidth ? containerWidth : propWidth;
  // Scale height proportionally when responsive
  const height = responsive && containerWidth ? Math.round(propHeight * (containerWidth / propWidth)) : propHeight;

  // Center baseline between Lead II label (top ~35px) and Mr. Pacemaker watermark (bottom ~30px)
  // Offset down from center to account for R waves being taller than S waves
  // Snap to nearest grid line so isoelectric line sits exactly on a red horizontal line
  const rawBaselineY = height / 2 + pixelsPerMm * 5;
  const baselineY = Math.round(rawBaselineY / pixelsPerMm) * pixelsPerMm;
  const amplitudeScale = height * 0.32; // Slightly reduced to ensure no overlap

  // Calculate intervals in pixels
  const ventricularIntervalPx = ((60 / heartRate) * speed) * pixelsPerMm;
  const atrialIntervalPx = atrialRate
    ? ((60 / atrialRate) * speed) * pixelsPerMm
    : ventricularIntervalPx;

  // Draw a complete PQRST complex as ONE continuous line
  // Returns the x position at the end
  const drawSinusComplex = useCallback((
    ctx: CanvasRenderingContext2D,
    startX: number,
    endX: number,
    invertedP = false,
    wideQRS = false,
    includeP = true,
    customPR?: number
  ) => {
    const totalWidth = endX - startX;

    // FIXED dimensions for P wave, PR, QRS (don't change with rate)
    const fixedPWidth = pixelsPerMm * 2.5;  // P wave ~100ms = 2.5mm (constant)
    const fixedPRInterval = customPR ?? pixelsPerMm * 4; // PR interval ~160ms = 4mm (default)
    const fixedQRSWidth = wideQRS ? pixelsPerMm * 4 : pixelsPerMm * 2.5; // QRS 80-160ms (constant)

    // RATE-DEPENDENT: ST and T shorten at faster rates (QT shortens with rate)
    // At 60bpm (totalWidth ~25mm), use full ST/T. At 120bpm (~12.5mm), shorten significantly
    const rateScaleFactor = Math.min(1.0, Math.max(0.5, totalWidth / (pixelsPerMm * 20)));
    const fixedSTLength = pixelsPerMm * 2 * rateScaleFactor;  // ST: 40-80ms
    const fixedTWidth = Math.max(pixelsPerMm * 3, pixelsPerMm * 4 * rateScaleFactor); // T wave: min 120ms

    const pHeight = amplitudeScale * 0.15 * (invertedP ? -1 : 1);
    const qDepth = amplitudeScale * 0.1;
    const rHeight = amplitudeScale * (wideQRS ? 0.9 : 1.0);
    const sDepth = amplitudeScale * (wideQRS ? 0.25 : 0.2);
    const tHeight = amplitudeScale * (wideQRS ? 0.22 : 0.18);

    // Calculate positions using fixed widths
    const pStartX = startX + pixelsPerMm * 0.5; // Small gap before P wave
    const pEndX = pStartX + fixedPWidth;
    const qrsStartX = pStartX + fixedPRInterval;
    const qrsEndX = qrsStartX + fixedQRSWidth;
    const stEndX = qrsEndX + fixedSTLength;
    const tEndX = stEndX + fixedTWidth;

    // Start from baseline
    ctx.lineTo(pStartX, baselineY);

    if (includeP) {
      // P wave - slightly peaked symmetric curve
      for (let t = 0; t <= 1; t += 0.1) {
        const x = pStartX + t * fixedPWidth;
        const y = baselineY - pHeight * Math.pow(Math.sin(t * Math.PI), 1.3);
        ctx.lineTo(x, y);
      }
      // Explicit return to baseline after P wave (avoid floating-point drift)
      ctx.lineTo(pEndX, baselineY);
    }

    // PR segment (isoelectric) - to QRS start
    ctx.lineTo(qrsStartX, baselineY);

    // QRS complex using FIXED widths
    if (wideQRS) {
      // Wide QRS - slurred morphology (~120-160ms)
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.1, baselineY + qDepth * 0.5);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.2, baselineY + qDepth);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.4, baselineY - rHeight * 0.5);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.5, baselineY - rHeight);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.6, baselineY - rHeight * 0.9);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.8, baselineY + sDepth);
      ctx.lineTo(qrsEndX, baselineY);
    } else {
      // Narrow QRS - FIXED 80-100ms width (2-2.5mm)
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.1, baselineY + qDepth * 0.4);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.2, baselineY + qDepth);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.35, baselineY - rHeight * 0.3);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.45, baselineY - rHeight * 0.85);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.5, baselineY - rHeight);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.55, baselineY - rHeight * 0.85);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.7, baselineY - rHeight * 0.1);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.8, baselineY + sDepth);
      ctx.lineTo(qrsStartX + fixedQRSWidth * 0.9, baselineY + sDepth * 0.3);
      ctx.lineTo(qrsEndX, baselineY);
    }

    // ST segment (isoelectric)
    ctx.lineTo(stEndX, baselineY);

    // T wave - asymmetric broad curve (peaks at ~40%, wider than P wave)
    for (let t = 0; t <= 1; t += 0.05) {
      const x = stEndX + t * fixedTWidth;
      const tShape = t < 0.4
        ? Math.sin(t / 0.4 * Math.PI / 2)
        : Math.cos((t - 0.4) / 0.6 * Math.PI / 2);
      const y = baselineY - tHeight * tShape;
      ctx.lineTo(x, y);
    }
    // Explicit return to baseline after T wave (avoid floating-point drift)
    ctx.lineTo(stEndX + fixedTWidth, baselineY);

    // Return to baseline for rest of interval
    ctx.lineTo(endX, baselineY);

    return endX;
  }, [baselineY, amplitudeScale, pixelsPerMm]);

  // Draw just a P wave (for CHB where P and QRS are independent)
  const drawPWaveOnly = useCallback((ctx: CanvasRenderingContext2D, startX: number) => {
    const pWidth = pixelsPerMm * 3;
    const pHeight = amplitudeScale * 0.15;

    for (let t = 0; t <= 1; t += 0.1) {
      const x = startX + t * pWidth;
      const y = baselineY - pHeight * Math.sin(t * Math.PI);
      ctx.lineTo(x, y);
    }
    // Explicit return to baseline (avoid floating-point drift)
    ctx.lineTo(startX + pWidth, baselineY);
    return startX + pWidth;
  }, [baselineY, amplitudeScale, pixelsPerMm]);

  // Draw wide QRS + T only (for CHB ventricular escape)
  const drawVentricularComplex = useCallback((ctx: CanvasRenderingContext2D, startX: number) => {
    const qrsWidth = pixelsPerMm * 4;    // ~160ms wide QRS
    const tWidth = pixelsPerMm * 5;      // ~200ms T wave (wider, blends from QRS)
    const rHeight = amplitudeScale * 0.9;
    const tDepth = amplitudeScale * 0.28; // Discordant (inverted) T wave

    // Wide QRS — ventricular origin: slurred upstroke
    ctx.lineTo(startX + qrsWidth * 0.05, baselineY);
    ctx.lineTo(startX + qrsWidth * 0.15, baselineY - rHeight * 0.15);
    ctx.lineTo(startX + qrsWidth * 0.25, baselineY - rHeight * 0.40);

    // Notch on upstroke (slurred conduction)
    ctx.lineTo(startX + qrsWidth * 0.30, baselineY - rHeight * 0.35);
    ctx.lineTo(startX + qrsWidth * 0.40, baselineY - rHeight * 0.70);

    // Broad R wave peak
    ctx.lineTo(startX + qrsWidth * 0.50, baselineY - rHeight);
    ctx.lineTo(startX + qrsWidth * 0.58, baselineY - rHeight * 0.90);

    // Downstroke blends smoothly into discordant T wave (no pointed S)
    // R wave comes down and curves directly into inverted T
    const blendStart = startX + qrsWidth * 0.65;
    ctx.lineTo(blendStart, baselineY - rHeight * 0.35);

    // Smooth curve from downstroke through inverted T wave back to baseline
    // This creates the continuous R→T blend seen in Visual Nurse
    const totalBlend = tWidth + qrsWidth * 0.35;
    for (let t = 0; t <= 1; t += 0.05) {
      const x = blendStart + t * totalBlend;
      // Curve goes: from above baseline → crosses baseline → inverted T peak → back to baseline
      const curve = t < 0.15
        ? (1 - t / 0.15) * (-rHeight * 0.35) + (t / 0.15) * (tDepth * 0.3)
        : tDepth * Math.sin((t - 0.15) / 0.85 * Math.PI);
      ctx.lineTo(x, baselineY + curve);
    }
    // Explicit return to baseline (avoid floating-point drift)
    ctx.lineTo(blendStart + totalBlend, baselineY);

    return blendStart + totalBlend;
  }, [baselineY, amplitudeScale, pixelsPerMm]);

  // Draw grid to offscreen canvas (cached)
  const getGridCanvas = useCallback(() => {
    if (gridCanvasRef.current) return gridCanvasRef.current;

    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = width * dpr;
    gridCanvas.height = height * dpr;
    const ctx = gridCanvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(dpr, dpr);

    const smallSquare = pixelsPerMm;
    const largeSquare = pixelsPerMm * 5;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = GRID_LIGHT;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= width; x += smallSquare) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += smallSquare) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.strokeStyle = GRID_DARK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += largeSquare) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += largeSquare) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    gridCanvasRef.current = gridCanvas;
    return gridCanvas;
  }, [width, height, pixelsPerMm, dpr]);

  // Draw cached grid to main canvas
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const gridCanvas = getGridCanvas();
    if (gridCanvas) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity for 1:1 pixel copy
      ctx.drawImage(gridCanvas, 0, 0);
      ctx.restore();
    }
  }, [getGridCanvas]);

  // Main waveform drawing
  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, offset: number) => {
    ctx.strokeStyle = WAVEFORM_COLOR;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (waveformType === 'sinus' || waveformType === 'sinus_tach' || waveformType === 'junctional') {
      // Regular sinus, sinus tach, or junctional rhythm - ONE continuous line
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      const firstBeatStart = startBeat * ventricularIntervalPx - offset;
      ctx.moveTo(firstBeatStart, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // Junctional: NO P waves (absent), Sinus: normal P waves
        const includeP = waveformType !== 'junctional';
        drawSinusComplex(ctx, beatStart, beatEnd, false, false, includeP);
      }

      ctx.stroke();
    } else if (waveformType === 'first_degree') {
      // First Degree AV Block - sinus rhythm with PR interval of 300ms (>200ms is prolonged)
      // 300ms at 25mm/sec = 7.5mm = 30 pixels at 4px/mm
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      // Fixed measurements for accuracy
      const prInterval = pixelsPerMm * 7.5; // 300ms = 7.5mm
      const pWaveWidth = pixelsPerMm * 2.5; // ~100ms P wave
      const qrsWidth = pixelsPerMm * 2; // ~80ms narrow QRS
      const tWaveWidth = pixelsPerMm * 4; // T wave width

      ctx.beginPath();
      const firstBeatStart = startBeat * ventricularIntervalPx - offset;
      ctx.moveTo(firstBeatStart, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        const pHeight = amplitudeScale * 0.15;
        const tHeight = amplitudeScale * 0.18;

        // P wave starts early in the beat
        const pStart = beatStart + pixelsPerMm * 2;
        ctx.lineTo(pStart, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(pStart + t * pWaveWidth, baselineY - pHeight * Math.sin(t * Math.PI));
        }

        // Long PR segment - QRS starts 300ms after P wave START
        const qrsStart = pStart + prInterval;
        ctx.lineTo(qrsStart, baselineY);

        // Narrow QRS complex
        ctx.lineTo(qrsStart + qrsWidth * 0.15, baselineY + amplitudeScale * 0.1);
        ctx.lineTo(qrsStart + qrsWidth * 0.4, baselineY - amplitudeScale);
        ctx.lineTo(qrsStart + qrsWidth * 0.65, baselineY + amplitudeScale * 0.2);
        ctx.lineTo(qrsStart + qrsWidth, baselineY);

        // ST segment
        const stEnd = qrsStart + qrsWidth + pixelsPerMm * 1.5;
        ctx.lineTo(stEnd, baselineY);

        // T wave
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(stEnd + t * tWaveWidth, baselineY - tHeight * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'mobitz1') {
      // Mobitz Type I (Wenckebach) - progressive PR prolongation, then dropped beat
      // Pattern: 4:3 conduction (3 conducted with lengthening PR, 1 dropped)
      // PR intervals: Beat 1 = 160ms (4mm), Beat 2 = 240ms (6mm), Beat 3 = 320ms (8mm)
      const cycleLength = atrialIntervalPx * 4;
      const startCycle = Math.floor(offset / cycleLength) - 1;
      const numCycles = Math.ceil(width / cycleLength) + 3;
      const prIntervals = [pixelsPerMm * 4, pixelsPerMm * 6, pixelsPerMm * 8]; // Progressive PR

      ctx.beginPath();
      ctx.moveTo(startCycle * cycleLength - offset, baselineY);

      for (let c = 0; c < numCycles; c++) {
        const cycleStart = (startCycle + c) * cycleLength - offset;

        // Beat 1 - normal PR (160ms)
        const beat1Start = cycleStart;
        const beat1End = cycleStart + atrialIntervalPx;
        drawSinusComplex(ctx, beat1Start, beat1End, false, false, true, prIntervals[0]);

        // Beat 2 - longer PR (240ms)
        const beat2Start = beat1End;
        const beat2End = beat2Start + atrialIntervalPx;
        drawSinusComplex(ctx, beat2Start, beat2End, false, false, true, prIntervals[1]);

        // Beat 3 - longest PR (320ms)
        const beat3Start = beat2End;
        const beat3End = beat3Start + atrialIntervalPx;
        drawSinusComplex(ctx, beat3Start, beat3End, false, false, true, prIntervals[2]);

        // Beat 4 - DROPPED (P wave only, no QRS)
        const beat4Start = beat3End;
        const pHeight = amplitudeScale * 0.15;
        const pWidth = pixelsPerMm * 2.5;
        ctx.lineTo(beat4Start + pixelsPerMm * 0.5, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          const x = beat4Start + pixelsPerMm * 0.5 + t * pWidth;
          ctx.lineTo(x, baselineY - pHeight * Math.pow(Math.sin(t * Math.PI), 1.3));
        }
        // Just flat baseline - the dropped beat!
        ctx.lineTo(beat4Start + atrialIntervalPx, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'vtach') {
      // Monomorphic Ventricular Tachycardia
      // Very wide QRS (>160-200ms), regular, NO P waves, rate 150-200 bpm
      // LBBB-like morphology: broad R wave with notching, discordant T wave
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;
        const totalWidth = beatEnd - beatStart;

        // Monomorphic VT - wide QRS (~200ms) with characteristic morphology
        // No isoelectric baseline before QRS - starts right away

        // Initial slurred upstroke (slow R wave rise - characteristic of VT)
        ctx.lineTo(beatStart + totalWidth * 0.02, baselineY);
        ctx.lineTo(beatStart + totalWidth * 0.06, baselineY - amplitudeScale * 0.15);
        ctx.lineTo(beatStart + totalWidth * 0.12, baselineY - amplitudeScale * 0.4);

        // Notch on upstroke (Josephson's sign - VT marker)
        ctx.lineTo(beatStart + totalWidth * 0.16, baselineY - amplitudeScale * 0.35);
        ctx.lineTo(beatStart + totalWidth * 0.20, baselineY - amplitudeScale * 0.55);

        // Peak of wide R wave
        ctx.lineTo(beatStart + totalWidth * 0.28, baselineY - amplitudeScale * 0.85);
        ctx.lineTo(beatStart + totalWidth * 0.32, baselineY - amplitudeScale * 0.88);

        // Broad downstroke
        ctx.lineTo(beatStart + totalWidth * 0.40, baselineY - amplitudeScale * 0.5);
        ctx.lineTo(beatStart + totalWidth * 0.48, baselineY - amplitudeScale * 0.1);

        // S wave dip
        ctx.lineTo(beatStart + totalWidth * 0.52, baselineY + amplitudeScale * 0.12);
        ctx.lineTo(beatStart + totalWidth * 0.56, baselineY + amplitudeScale * 0.08);

        // Discordant T wave (opposite direction to QRS - inverted since QRS is upright)
        // T wave blends with end of QRS, not a separate bump
        ctx.lineTo(beatStart + totalWidth * 0.62, baselineY + amplitudeScale * 0.15);
        ctx.lineTo(beatStart + totalWidth * 0.70, baselineY + amplitudeScale * 0.18);
        ctx.lineTo(beatStart + totalWidth * 0.78, baselineY + amplitudeScale * 0.12);
        ctx.lineTo(beatStart + totalWidth * 0.84, baselineY);

        // Brief return to baseline before next beat
        ctx.lineTo(beatEnd, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'vfib') {
      // Ventricular Fibrillation - fine, chaotic, NO identifiable QRS
      // Completely disorganized electrical activity
      ctx.beginPath();
      ctx.moveTo(0, baselineY);

      // Seeded random for consistent but chaotic pattern
      const seed = (n: number) => {
        const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
        return s - Math.floor(s);
      };

      // Fine VF - rapid, irregular, small amplitude oscillations
      for (let x = 0; x < width; x += 1) {
        const pos = x + offset;

        // Multiple high-frequency components for fine chaotic appearance
        const wave =
          Math.sin(pos * 0.25) * (0.15 + 0.1 * seed(Math.floor(pos / 4))) +
          Math.sin(pos * 0.18 + seed(Math.floor(pos / 6)) * 2) * 0.12 +
          Math.sin(pos * 0.35) * (0.08 + 0.08 * seed(Math.floor(pos / 3))) +
          Math.sin(pos * 0.42 + 1.5) * 0.06 * seed(Math.floor(pos / 5)) +
          Math.sin(pos * 0.55) * 0.05 +
          (seed(Math.floor(pos / 2)) - 0.5) * 0.15; // Random jitter

        // Variable amplitude - alternating fine and slightly coarser areas
        const ampMod = 0.4 + 0.35 * seed(Math.floor(pos / 20)) +
                       0.15 * Math.sin(pos * 0.02);

        const y = baselineY - wave * amplitudeScale * 0.45 * ampMod;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    } else if (waveformType === 'torsades') {
      // Torsades de Pointes - "twisting of the points"
      // Continuous smooth waxing/waning pattern - no sharp transitions

      const torsadesRate = 240; // 240 bpm = 4 beats per second
      const beatInterval = ((60 / torsadesRate) * speed) * pixelsPerMm;

      // Twist cycle: ~10 beats from max positive to max negative
      const twistCycleBeats = 10;
      const twistPeriod = beatInterval * twistCycleBeats * 2;

      const rapidFreq = (2 * Math.PI) / beatInterval;
      const twistFreq = (2 * Math.PI) / twistPeriod;

      const smoothOffset = Math.round(offset);

      // Move Torsades up by 1 large box (5mm) to center it better
      const torsadesBaselineY = baselineY - pixelsPerMm * 5;

      ctx.beginPath();

      for (let x = 0; x < width; x += 1) {
        const pos = x + smoothOffset;

        // Envelope controls both amplitude AND polarity smoothly (no sudden flip)
        const envelope = Math.sin(pos * twistFreq);

        // Rapid oscillation
        const wave = Math.sin(pos * rapidFreq);

        // Multiply directly - envelope smoothly transitions through zero
        // This creates continuous twist without sharp W/M points
        const waveValue = wave * envelope;
        const y = torsadesBaselineY - waveValue * amplitudeScale * 0.75;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    } else if (waveformType === 'chb') {
      // Complete Heart Block - AV dissociation
      // P waves march at atrial rate (75 bpm), QRS at ventricular escape (35 bpm)
      // VENTRICULAR ESCAPE: Wide, bizarre QRS - clearly different from conducted beats

      const pWaveWidth = pixelsPerMm * 2.5;
      const qrsWidth = pixelsPerMm * 6; // WIDE QRS for ventricular escape (~150ms)
      const stLength = pixelsPerMm * 2;
      const tWidth = pixelsPerMm * 5;

      ctx.beginPath();

      // Calculate all P and QRS positions relative to current offset
      const events: Array<{type: 'P' | 'QRS', x: number}> = [];

      // Find which P wave index is near the left edge
      const firstPIndex = Math.floor(offset / atrialIntervalPx) - 2;
      for (let i = firstPIndex; i < firstPIndex + 25; i++) {
        const pX = i * atrialIntervalPx - offset;
        if (pX > -50 && pX < width + 50) {
          events.push({ type: 'P', x: pX });
        }
      }

      // Find which QRS index is near the left edge
      const firstQRSIndex = Math.floor(offset / ventricularIntervalPx) - 2;
      for (let i = firstQRSIndex; i < firstQRSIndex + 10; i++) {
        const qrsX = i * ventricularIntervalPx - offset;
        if (qrsX > -50 && qrsX < width + 50) {
          events.push({ type: 'QRS', x: qrsX });
        }
      }

      // Sort by position
      events.sort((a, b) => a.x - b.x);

      const pHeight = amplitudeScale * 0.15;
      const rHeight = amplitudeScale * 0.8;
      const sDepth = amplitudeScale * 0.3;
      const tHeight = amplitudeScale * 0.25;

      // Start from left edge at baseline
      let currentX = 0;
      ctx.moveTo(0, baselineY);

      for (const event of events) {
        // Skip events that are behind our current position
        if (event.x < currentX) continue;

        // Draw baseline to this event (ensure smooth connection)
        ctx.lineTo(event.x, baselineY);
        currentX = event.x;

        if (event.type === 'P') {
          // P waves march independently - show them unless directly under QRS
          const qrsOverlap = events.find(e =>
            e.type === 'QRS' &&
            event.x > e.x + qrsWidth * 0.2 &&
            event.x < e.x + qrsWidth * 0.6
          );

          if (!qrsOverlap) {
            // Draw smooth P wave
            for (let t = 0; t <= 1; t += 0.05) {
              ctx.lineTo(event.x + t * pWaveWidth, baselineY - pHeight * Math.sin(t * Math.PI));
            }
            currentX = event.x + pWaveWidth;
            ctx.lineTo(currentX, baselineY);
          }
        } else {
          // VENTRICULAR ESCAPE QRS - Use drawVentricularComplex for continuous R to T wave
          // (same morphology as idioventricular rhythm)
          const x = event.x;
          ctx.lineTo(x, baselineY);

          // Draw continuous R-T ventricular complex (like IVR/AIVR)
          const complexEnd = drawVentricularComplex(ctx, x);
          currentX = complexEnd;
        }
      }

      // Extend to right edge
      ctx.lineTo(width + 20, baselineY);
      ctx.stroke();
    } else if (waveformType === 'mobitz2') {
      // Mobitz Type II - 3:2 conduction (2 conducted, 1 dropped)
      // QRS is NARROW (supraventricular origin) unless pre-existing BBB
      const fullCycleLength = atrialIntervalPx * 3;
      const startCycle = Math.floor(offset / fullCycleLength) - 1;
      const numCycles = Math.ceil(width / fullCycleLength) + 3;

      ctx.beginPath();
      const firstCycleStart = startCycle * fullCycleLength - offset;
      ctx.moveTo(firstCycleStart, baselineY);

      for (let i = 0; i < numCycles; i++) {
        const cycle = startCycle + i;
        const cycleStart = cycle * fullCycleLength - offset;

        // First beat - conducted (P + NARROW QRS + T)
        const beat1Start = cycleStart;
        const beat1End = cycleStart + atrialIntervalPx;
        drawSinusComplex(ctx, beat1Start, beat1End, false, false, true);

        // Second beat - conducted (P + NARROW QRS + T)
        const beat2Start = cycleStart + atrialIntervalPx;
        const beat2End = cycleStart + atrialIntervalPx * 2;
        drawSinusComplex(ctx, beat2Start, beat2End, false, false, true);

        // Third P wave - DROPPED (P wave only, then flat baseline - no QRS!)
        const beat3Start = cycleStart + atrialIntervalPx * 2;
        const beat3End = cycleStart + atrialIntervalPx * 3;
        const pHeight = amplitudeScale * 0.15;
        const pWidth = pixelsPerMm * 2.5;
        ctx.lineTo(beat3Start + pixelsPerMm * 0.5, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          const x = beat3Start + pixelsPerMm * 0.5 + t * pWidth;
          ctx.lineTo(x, baselineY - pHeight * Math.pow(Math.sin(t * Math.PI), 1.3));
        }
        // Rest is just baseline - the dropped beat!
        ctx.lineTo(beat3End, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'block_2to1') {
      // 2:1 AV Block - every other P wave is blocked
      // P waves at atrial rate, QRS after every other P wave
      const cycleLength = atrialIntervalPx * 2; // 2 P waves per cycle
      const startCycle = Math.floor(offset / cycleLength) - 1;
      const numCycles = Math.ceil(width / cycleLength) + 3;

      const pHeight = amplitudeScale * 0.15;
      const pWidth = pixelsPerMm * 2.5;

      ctx.beginPath();
      ctx.moveTo(startCycle * cycleLength - offset, baselineY);

      for (let i = 0; i < numCycles; i++) {
        const cycleStart = (startCycle + i) * cycleLength - offset;

        // First P wave — CONDUCTED (uses drawSinusComplex for consistent QRS)
        const beat1Start = cycleStart;
        const beat1End = cycleStart + atrialIntervalPx;
        drawSinusComplex(ctx, beat1Start, beat1End, false, false, true);

        // Second P wave — BLOCKED (P wave only, no QRS)
        const p2Start = cycleStart + atrialIntervalPx + pixelsPerMm * 0.5;
        ctx.lineTo(p2Start, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(p2Start + t * pWidth, baselineY - pHeight * Math.pow(Math.sin(t * Math.PI), 1.3));
        }

        // Flat baseline after blocked P wave — no QRS follows
        ctx.lineTo(cycleStart + cycleLength, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'afib_nvr') {
      // AFib with normal ventricular response - same as afib_slow but controlled rate 60-100
      // Thinner line for fibrillatory waves to look more abnormal
      ctx.lineWidth = 1.5;
      const irregularities = [0.85, 1.1, 0.9, 1.05, 0.95, 1.15, 0.88, 1.12];

      const cumulativeOffsets: number[] = [0];
      for (let i = 0; i < irregularities.length; i++) {
        cumulativeOffsets.push(cumulativeOffsets[i] + ventricularIntervalPx * irregularities[i]);
      }
      const patternLength = cumulativeOffsets[cumulativeOffsets.length - 1];

      const qrsW = pixelsPerMm * 2;
      const stLen = pixelsPerMm * 2;
      const tW = pixelsPerMm * 4;

      const fibWaveHeight = amplitudeScale * 0.025;
      const fibFreq = 2.5;
      const getFibY = (x: number) => {
        const pos = x + offset;
        return fibWaveHeight * (
          Math.sin(pos * fibFreq * 0.4) * 0.4 +
          Math.sin(pos * fibFreq * 0.9 + 0.8) * 0.35 +
          Math.sin(pos * fibFreq * 1.5 + 1.7) * 0.25
        );
      };

      const adjustedOffset = ((offset % patternLength) + patternLength) % patternLength;
      const patternStartX = -adjustedOffset;

      ctx.beginPath();
      ctx.moveTo(0, baselineY + getFibY(0));

      let currentPatternStart = patternStartX;

      while (currentPatternStart < width + patternLength) {
        for (let i = 0; i < irregularities.length; i++) {
          const beatX = currentPatternStart + cumulativeOffsets[i];
          const nextBeatX = i < irregularities.length - 1
            ? currentPatternStart + cumulativeOffsets[i + 1]
            : currentPatternStart + patternLength;

          if (beatX >= -30 && beatX <= width + 30) {
            for (let fx = Math.max(0, beatX - 20); fx < beatX; fx += 1) {
              ctx.lineTo(fx, baselineY + getFibY(fx));
            }
            ctx.lineTo(beatX, baselineY);

            ctx.lineTo(beatX + qrsW * 0.15, baselineY + amplitudeScale * 0.08);
            ctx.lineTo(beatX + qrsW * 0.4, baselineY - amplitudeScale * 0.95);
            ctx.lineTo(beatX + qrsW * 0.65, baselineY + amplitudeScale * 0.15);
            ctx.lineTo(beatX + qrsW, baselineY);

            const stEnd = beatX + qrsW + stLen;
            ctx.lineTo(stEnd, baselineY);

            const tHeight = amplitudeScale * 0.18;
            for (let t = 0; t <= 1; t += 0.08) {
              const x = stEnd + t * tW;
              const y = baselineY - tHeight * Math.sin(t * Math.PI);
              ctx.lineTo(x, y);
            }

            const tEnd = stEnd + tW;
            for (let fx = tEnd; fx < Math.min(nextBeatX, width + 30); fx += 1) {
              ctx.lineTo(fx, baselineY + getFibY(fx));
            }
          }
        }
        currentPatternStart += patternLength;
      }

      ctx.lineTo(width, baselineY);
      ctx.stroke();
    } else if (waveformType === 'afib_slow') {
      // AFib with slow ventricular response - ONE continuous line
      // Key features: irregularly irregular RR, no P waves, fine fibrillatory baseline
      // T waves are NORMAL in AFib (upright in Lead II) - AFib only affects atrial activity
      // Thinner line for fibrillatory waves to look more abnormal
      ctx.lineWidth = 1.5;
      const irregularities = [0.7, 1.3, 0.8, 1.1, 1.4, 0.9, 1.2, 0.75];

      // Build cumulative offsets for one complete pattern
      const cumulativeOffsets: number[] = [0];
      for (let i = 0; i < irregularities.length; i++) {
        cumulativeOffsets.push(cumulativeOffsets[i] + ventricularIntervalPx * irregularities[i]);
      }
      const patternLength = cumulativeOffsets[cumulativeOffsets.length - 1];

      // Fixed dimensions for QRS-T complex
      const qrsW = pixelsPerMm * 2; // ~80ms narrow QRS
      const stLen = pixelsPerMm * 2; // ST segment
      const tW = pixelsPerMm * 4; // T wave width

      // Fibrillatory baseline function - FINE, rapid, close together (350-600/min)
      const fibWaveHeight = amplitudeScale * 0.025; // Very subtle, fine waves
      const fibFreq = 2.5; // Much higher frequency for fine fib waves
      const getFibY = (x: number) => {
        // Multiple high-frequency sine waves for fine, irregular fibrillatory appearance
        const pos = x + offset; // Absolute position for stability
        return fibWaveHeight * (
          Math.sin(pos * fibFreq * 0.4) * 0.4 +
          Math.sin(pos * fibFreq * 0.9 + 0.8) * 0.35 +
          Math.sin(pos * fibFreq * 1.5 + 1.7) * 0.25
        );
      };

      // Calculate where in the pattern we start
      const adjustedOffset = ((offset % patternLength) + patternLength) % patternLength;
      const patternStartX = -adjustedOffset;

      ctx.beginPath();
      ctx.moveTo(0, baselineY + getFibY(0));

      // Draw patterns to cover the full width
      let currentPatternStart = patternStartX;

      while (currentPatternStart < width + patternLength) {
        for (let i = 0; i < irregularities.length; i++) {
          const beatX = currentPatternStart + cumulativeOffsets[i];
          const nextBeatX = i < irregularities.length - 1
            ? currentPatternStart + cumulativeOffsets[i + 1]
            : currentPatternStart + patternLength;

          // Only draw if on screen
          if (beatX >= -30 && beatX <= width + 30) {
            // Fine fibrillatory baseline to QRS (no P waves, fine rapid fib waves)
            for (let fx = Math.max(0, beatX - 20); fx < beatX; fx += 1) {
              ctx.lineTo(fx, baselineY + getFibY(fx));
            }
            ctx.lineTo(beatX, baselineY);

            // Narrow QRS - clean morphology
            ctx.lineTo(beatX + qrsW * 0.15, baselineY + amplitudeScale * 0.08);
            ctx.lineTo(beatX + qrsW * 0.4, baselineY - amplitudeScale * 0.95);
            ctx.lineTo(beatX + qrsW * 0.65, baselineY + amplitudeScale * 0.15);
            ctx.lineTo(beatX + qrsW, baselineY);

            // ST segment (isoelectric)
            const stEnd = beatX + qrsW + stLen;
            ctx.lineTo(stEnd, baselineY);

            // T wave - normal upright, ensure return to baseline
            const tHeight = amplitudeScale * 0.18;
            for (let t = 0; t <= 1; t += 0.08) {
              const x = stEnd + t * tW;
              const y = baselineY - tHeight * Math.sin(t * Math.PI);
              ctx.lineTo(x, y);
            }

            // Fine fibrillatory baseline after T wave
            const tEnd = stEnd + tW;
            for (let fx = tEnd; fx < Math.min(nextBeatX, width + 30); fx += 1) {
              ctx.lineTo(fx, baselineY + getFibY(fx));
            }
          }
        }
        currentPatternStart += patternLength;
      }

      // Finish with flat baseline
      ctx.lineTo(width, baselineY);

      ctx.stroke();
    } else if (waveformType === 'sinus_pause') {
      // Sinus pause: Clear NSR first, then SA node fails to fire (missing P wave)
      // Pattern: 4 normal beats, then pause (3.75 intervals), then 1 beat resumes
      // Total pattern = 8.75 intervals (4 normal + 3.75 pause + 1 normal)
      const pauseIntervals = 3.75; // Makes pause R-R show ~16 bpm
      const patternLength = ventricularIntervalPx * (5 + pauseIntervals);
      // Phase shift so strip starts with normal beats visible, not the pause
      const phaseShift = ventricularIntervalPx * (4 + pauseIntervals); // Start right after pause ends
      const adjustedOffset = offset + phaseShift;
      const startPattern = Math.floor(adjustedOffset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      const firstPatternStart = startPattern * patternLength - adjustedOffset;
      ctx.moveTo(firstPatternStart, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const pattern = startPattern + i;
        const patternStart = pattern * patternLength - adjustedOffset;

        // Beat 1 - normal PQRST
        const beat1End = patternStart + ventricularIntervalPx;
        drawSinusComplex(ctx, patternStart, beat1End, false, false, true);

        // Beat 2 - normal PQRST
        const beat2End = beat1End + ventricularIntervalPx;
        drawSinusComplex(ctx, beat1End, beat2End, false, false, true);

        // Beat 3 - normal PQRST
        const beat3End = beat2End + ventricularIntervalPx;
        drawSinusComplex(ctx, beat2End, beat3End, false, false, true);

        // Beat 4 - normal PQRST
        const beat4End = beat3End + ventricularIntervalPx;
        drawSinusComplex(ctx, beat3End, beat4End, false, false, true);

        // SINUS PAUSE - SA node fails to fire, flat isoelectric baseline
        const pauseEnd = beat4End + ventricularIntervalPx * pauseIntervals;
        ctx.lineTo(pauseEnd, baselineY);

        // Beat 5 - normal sinus resumes
        const beat5End = pauseEnd + ventricularIntervalPx;
        drawSinusComplex(ctx, pauseEnd, beat5End, false, false, true);
      }

      ctx.stroke();
    } else if (waveformType === 'sinus_arrest') {
      // Sinus ARREST: SA node fails for exactly 2 full cycles
      // arrestIntervals = 2.0 means the pause equals exactly 2× the normal R-R
      const arrestIntervals = 2.0; // Exactly 2 missed cycles
      const patternLength = ventricularIntervalPx * (3 + arrestIntervals);
      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // Beat 1 - normal sinus
        const beat1End = patternStart + ventricularIntervalPx;
        drawSinusComplex(ctx, patternStart, beat1End, false, false, true);

        // Beat 2 - normal sinus
        const beat2End = beat1End + ventricularIntervalPx;
        drawSinusComplex(ctx, beat1End, beat2End, false, false, true);

        // SINUS ARREST - exactly 2 missed cycles (2× normal R-R)
        const arrestEnd = beat2End + ventricularIntervalPx * arrestIntervals;
        ctx.lineTo(arrestEnd, baselineY);

        // Beat 3 - normal sinus resumes
        const beat3End = arrestEnd + ventricularIntervalPx;
        drawSinusComplex(ctx, arrestEnd, beat3End, false, false, true);
      }

      ctx.stroke();
    } else if (waveformType === 'nsr_pac') {
      // NSR with PAC - Simple alternating pattern: Normal (75bpm) → PAC (100bpm) → repeat
      // Pattern: 1 normal beat at 800ms, then PAC at 600ms coupling = 1.4 beat lengths total
      // This creates alternating 75 bpm and 100 bpm display

      const normalRR = ventricularIntervalPx; // ~800ms at 75bpm
      const pacCoupling = ventricularIntervalPx * 0.75; // ~600ms = 100bpm equivalent
      const compensatoryPause = ventricularIntervalPx * 0.65; // shorter pause after PAC
      const patternLength = normalRR + pacCoupling + compensatoryPause; // full cycle

      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let p = 0; p < numPatterns; p++) {
        const patternStart = (startPattern + p) * patternLength - offset;

        // Normal sinus beat
        const beat1End = patternStart + normalRR;
        drawSinusComplex(ctx, patternStart, beat1End, false, false, true);

        // PAC - comes early (shorter coupling interval)
        const pacStart = beat1End;
        ctx.lineTo(pacStart + pixelsPerMm * 0.5, baselineY);

        // Ectopic P wave - slightly different morphology (peaked)
        const pHeight = amplitudeScale * 0.17;
        const pWidth = pixelsPerMm * 2.5;
        for (let t = 0; t <= 1; t += 0.08) {
          const peakedness = Math.pow(Math.sin(t * Math.PI), 1.5);
          ctx.lineTo(pacStart + pixelsPerMm * 0.5 + t * pWidth, baselineY - pHeight * peakedness);
        }

        // PR segment
        const prEnd = pacStart + pixelsPerMm * 0.5 + pWidth + pixelsPerMm * 1.5;
        ctx.lineTo(prEnd, baselineY);

        // Narrow QRS (same as sinus - conducted normally)
        ctx.lineTo(prEnd + pixelsPerMm * 0.3, baselineY + amplitudeScale * 0.08);
        ctx.lineTo(prEnd + pixelsPerMm * 0.8, baselineY - amplitudeScale * 0.95);
        ctx.lineTo(prEnd + pixelsPerMm * 1.3, baselineY + amplitudeScale * 0.15);
        ctx.lineTo(prEnd + pixelsPerMm * 1.6, baselineY);

        // ST segment
        const stEnd = prEnd + pixelsPerMm * 2.5;
        ctx.lineTo(stEnd, baselineY);

        // T wave
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(stEnd + t * pixelsPerMm * 3, baselineY - amplitudeScale * 0.16 * Math.sin(t * Math.PI));
        }

        // Baseline to end of pattern (compensatory pause area)
        ctx.lineTo(patternStart + patternLength, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'nsr_pvc') {
      // NSR with ISOLATED PVCs - random occurrence (not a fixed pattern like bigeminy)
      // Pattern: variable NSR beats, then random PVC, then comp pause
      // Uses pseudo-random sequence: 3 NSR, PVC, 2 NSR, PVC, 4 NSR, PVC, 2 NSR, PVC = 15 beats
      const baseInterval = ventricularIntervalPx; // 75 bpm
      const pvcCoupling = baseInterval * 0.5; // 150 bpm coupling (short)
      const compPause = baseInterval * 1.15; // 65 bpm compensatory pause

      // Random-looking pattern: [NSR count before PVC]
      const nsrCounts = [3, 2, 4, 2]; // Irregular intervals between PVCs
      let patternIntervals: number[] = [];
      for (const count of nsrCounts) {
        for (let i = 0; i < count; i++) patternIntervals.push(baseInterval); // NSR beats
        patternIntervals.push(pvcCoupling); // PVC
        patternIntervals.push(compPause); // Comp pause to next NSR
      }
      const patternLength = patternIntervals.reduce((a, b) => a + b, 0);

      // Build cumulative positions
      const beatPositions: number[] = [0];
      for (let i = 0; i < patternIntervals.length; i++) {
        beatPositions.push(beatPositions[i] + patternIntervals[i]);
      }

      // Which beats are PVCs? After each nsrCount
      const pvcIndices = new Set<number>();
      let idx = 0;
      for (const count of nsrCounts) {
        idx += count;
        pvcIndices.add(idx);
        idx += 2; // PVC + comp pause beat
      }

      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 2;
      const pvcQrsWidth = pixelsPerMm * 5;
      const beatVisualWidth = baseInterval * 0.55;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let p = 0; p < numPatterns; p++) {
        const patternStart = (startPattern + p) * patternLength - offset;

        for (let b = 0; b < patternIntervals.length; b++) {
          const beatStart = patternStart + beatPositions[b];

          if (pvcIndices.has(b)) {
            // Draw PVC
            ctx.lineTo(beatStart, baselineY);

            // Wide QRS - smooth continuous curve
            for (let t = 0; t <= 1; t += 0.05) {
              const x = beatStart + t * pvcQrsWidth;
              // Smooth bell curve for QRS
              const qrsShape = Math.exp(-Math.pow((t - 0.45) * 4, 2));
              const y = baselineY - amplitudeScale * 0.9 * qrsShape;
              ctx.lineTo(x, y);
            }

            // Smooth transition to T wave
            const stEnd = beatStart + pvcQrsWidth + pixelsPerMm * 0.3;
            ctx.lineTo(stEnd, baselineY);

            // Bag-like T wave - smoother curve using cosine
            const tWidth = pixelsPerMm * 5;
            const tDepth = amplitudeScale * 0.35;
            for (let t = 0; t <= 1; t += 0.03) {
              const x = stEnd + t * tWidth;
              // Smooth bag shape using raised cosine
              const bagShape = 0.5 * (1 - Math.cos(2 * Math.PI * t)) * Math.sin(Math.PI * t);
              ctx.lineTo(x, baselineY + tDepth * bagShape);
            }
          } else if (!pvcIndices.has(b - 1)) {
            // Draw NSR (skip the beat right after PVC - that's comp pause)
            const beatEnd = beatStart + beatVisualWidth;
            drawSinusComplex(ctx, beatStart, beatEnd, false, false, true);
          }
        }
        ctx.lineTo(patternStart + patternLength, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'aflutter_svr') {
      // Atrial Flutter with SLOW ventricular response (6:1 conduction)
      // Lead II: INVERTED sawtooth flutter waves at ~300/min
      // Typical (counterclockwise) flutter = negative F waves in inferior leads
      // Pattern: gradual downslope, then sharp upstroke (inverted sawtooth)
      const flutterIntervalPx = ((60 / 300) * speed) * pixelsPerMm; // ~300/min flutter rate
      const qrsIntervalPx = flutterIntervalPx * 6; // 6:1 block = QRS every 6 flutter waves (~50 bpm)

      const startBeat = Math.floor(offset / qrsIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / qrsIntervalPx) + 3;

      // Flutter wave amplitude (inverted/negative in Lead II)
      const flutterAmp = amplitudeScale * 0.15;

      ctx.beginPath();

      // Start position
      const startX = startBeat * qrsIntervalPx - offset;
      ctx.moveTo(startX, baselineY + flutterAmp * 0.3); // Start slightly below baseline

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * qrsIntervalPx - offset;

        // Draw continuous flutter waves - NO isoelectric baseline
        // QRS occurs roughly at flutter wave 6 of each cycle (6:1 block)
        const qrsPosition = beatStart + flutterIntervalPx * 5.5; // QRS timing

        for (let f = 0; f < 6; f++) {
          const fStart = beatStart + f * flutterIntervalPx;
          const fEnd = fStart + flutterIntervalPx;

          // Check if QRS interrupts this flutter wave
          const qrsStart = qrsPosition;
          const qrsEnd = qrsPosition + pixelsPerMm * 2.5;

          if (fEnd < qrsStart || fStart > qrsEnd) {
            // Flutter wave not interrupted by QRS
            // Inverted sawtooth: gradual descent (going more negative), sharp ascent
            // Use smooth curve for more realistic appearance
            const steps = 20;
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const x = fStart + t * flutterIntervalPx;
              let y;
              if (t < 0.75) {
                // Gradual downslope (75% of cycle) - smooth curve going negative
                const descent = t / 0.75;
                y = baselineY + flutterAmp * (0.3 + 0.7 * Math.pow(descent, 0.7));
              } else {
                // Sharp upstroke (25% of cycle) - quick return
                const ascent = (t - 0.75) / 0.25;
                y = baselineY + flutterAmp * (1.0 - 0.7 * ascent);
              }
              ctx.lineTo(x, y);
            }
          } else if (fStart < qrsStart && fEnd > qrsStart) {
            // Flutter wave interrupted by QRS - draw partial flutter then QRS
            // Partial flutter descent
            const partialEnd = qrsStart - pixelsPerMm * 0.5;
            const partialDuration = (partialEnd - fStart) / flutterIntervalPx;
            for (let s = 0; s <= 5; s++) {
              const t = (s / 5) * Math.min(partialDuration, 0.75);
              const x = fStart + t * flutterIntervalPx;
              const descent = t / 0.75;
              const y = baselineY + flutterAmp * (0.3 + 0.7 * Math.pow(descent, 0.7));
              ctx.lineTo(x, y);
            }

            // QRS complex (narrow - supraventricular conduction)
            ctx.lineTo(qrsStart, baselineY + flutterAmp * 0.5);
            ctx.lineTo(qrsStart + pixelsPerMm * 0.4, baselineY + amplitudeScale * 0.1);
            ctx.lineTo(qrsStart + pixelsPerMm * 1.0, baselineY - amplitudeScale * 0.95);
            ctx.lineTo(qrsStart + pixelsPerMm * 1.6, baselineY + amplitudeScale * 0.18);
            ctx.lineTo(qrsStart + pixelsPerMm * 2.0, baselineY + flutterAmp * 0.4);

            // Resume flutter waves after QRS (no separate T wave - flutter continues)
            // Pick up where flutter pattern would be
          } else if (fStart >= qrsStart && fStart <= qrsEnd) {
            // This flutter wave starts during/after QRS - resume flutter pattern
            const resumeX = Math.max(fStart, qrsEnd);
            const remainingT = (fEnd - resumeX) / flutterIntervalPx;
            if (remainingT > 0.1) {
              // Continue with sharp upstroke portion
              ctx.lineTo(resumeX, baselineY + flutterAmp * 0.6);
              ctx.lineTo(fEnd, baselineY + flutterAmp * 0.3);
            }
          }
        }
      }

      ctx.stroke();
    } else if (waveformType === 'aflutter_rvr') {
      // Atrial Flutter with RAPID ventricular response (2:1 conduction)
      // Lead II: INVERTED sawtooth flutter waves at ~300/min
      // Pattern: 2 flutter waves per QRS (2:1 block) = ~150 bpm ventricular rate
      const flutterIntervalPx = ((60 / 300) * speed) * pixelsPerMm; // ~300/min flutter rate
      const qrsIntervalPx = flutterIntervalPx * 2; // 2:1 block = QRS every 2 flutter waves (~150 bpm)

      const startBeat = Math.floor(offset / qrsIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / qrsIntervalPx) + 3;

      // Flutter wave amplitude (inverted/negative in Lead II)
      const flutterAmp = amplitudeScale * 0.12;

      ctx.beginPath();

      // Start position
      const startX = startBeat * qrsIntervalPx - offset;
      ctx.moveTo(startX, baselineY + flutterAmp * 0.3);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * qrsIntervalPx - offset;

        // Draw 2 flutter waves per ventricular beat (2:1 block)
        // QRS occurs roughly at flutter wave 2 of each cycle
        const qrsPosition = beatStart + flutterIntervalPx * 1.5; // QRS timing

        for (let f = 0; f < 2; f++) {
          const fStart = beatStart + f * flutterIntervalPx;
          const fEnd = fStart + flutterIntervalPx;

          // Check if QRS interrupts this flutter wave
          const qrsStart = qrsPosition;
          const qrsEnd = qrsPosition + pixelsPerMm * 2.5;

          if (fEnd < qrsStart || fStart > qrsEnd) {
            // Flutter wave not interrupted by QRS
            // Inverted sawtooth: gradual descent, sharp ascent
            const steps = 8;
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const x = fStart + t * flutterIntervalPx;
              let y;
              if (t < 0.75) {
                // Gradual downslope (75% of cycle)
                const descent = t / 0.75;
                y = baselineY + flutterAmp * (0.3 + 0.7 * Math.pow(descent, 0.7));
              } else {
                // Sharp upstroke (25% of cycle)
                const ascent = (t - 0.75) / 0.25;
                y = baselineY + flutterAmp * (1.0 - 0.7 * ascent);
              }
              ctx.lineTo(x, y);
            }
          } else if (fStart < qrsStart && fEnd > qrsStart) {
            // Flutter wave interrupted by QRS - draw partial flutter then QRS
            const partialEnd = qrsStart - pixelsPerMm * 0.3;
            const partialDuration = (partialEnd - fStart) / flutterIntervalPx;
            for (let s = 0; s <= 4; s++) {
              const t = (s / 4) * Math.min(partialDuration, 0.75);
              const x = fStart + t * flutterIntervalPx;
              const descent = t / 0.75;
              const y = baselineY + flutterAmp * (0.3 + 0.7 * Math.pow(descent, 0.7));
              ctx.lineTo(x, y);
            }

            // QRS complex (narrow - supraventricular conduction)
            ctx.lineTo(qrsStart, baselineY + flutterAmp * 0.4);
            ctx.lineTo(qrsStart + pixelsPerMm * 0.4, baselineY + amplitudeScale * 0.08);
            ctx.lineTo(qrsStart + pixelsPerMm * 1.0, baselineY - amplitudeScale * 0.92);
            ctx.lineTo(qrsStart + pixelsPerMm * 1.6, baselineY + amplitudeScale * 0.15);
            ctx.lineTo(qrsStart + pixelsPerMm * 2.0, baselineY + flutterAmp * 0.3);

            // Resume flutter waves after QRS
          } else if (fStart >= qrsStart && fStart <= qrsEnd) {
            // This flutter wave starts during/after QRS - resume flutter pattern
            const resumeX = Math.max(fStart, qrsEnd);
            const remainingT = (fEnd - resumeX) / flutterIntervalPx;
            if (remainingT > 0.1) {
              ctx.lineTo(resumeX, baselineY + flutterAmp * 0.5);
              ctx.lineTo(fEnd, baselineY + flutterAmp * 0.3);
            }
          }
        }
      }

      ctx.stroke();
    } else if (waveformType === 'afib_rvr') {
      // AFib with Rapid Ventricular Response - irregularly irregular, fast rate
      // Key: varying RR intervals, no P waves, rapid overall rate ~110-160 bpm
      // Note: No fibrillatory baseline in RVR - too fast, just flat baseline
      // Thinner line for AFib to look more abnormal
      ctx.lineWidth = 1.5;
      const irregularities = [0.75, 0.95, 0.7, 0.85, 1.0, 0.72, 0.88, 0.78];
      const baseInterval = ventricularIntervalPx;

      // QRS-T complex dimensions (must fit in shortest RR)
      const qrsW = pixelsPerMm * 1.8; // ~72ms narrow QRS
      const stLen = pixelsPerMm * 1.2; // Short ST
      const tW = pixelsPerMm * 2.8; // Compact T wave

      // Build cumulative offsets for one complete pattern
      const cumulativeOffsets: number[] = [0];
      for (let i = 0; i < irregularities.length; i++) {
        cumulativeOffsets.push(cumulativeOffsets[i] + baseInterval * irregularities[i]);
      }
      const patternLength = cumulativeOffsets[cumulativeOffsets.length - 1];

      // Calculate where in the pattern we start
      const adjustedOffset = ((offset % patternLength) + patternLength) % patternLength;
      const patternStartX = -adjustedOffset;

      ctx.beginPath();
      ctx.moveTo(0, baselineY);

      // Draw patterns to cover the full width
      let currentPatternStart = patternStartX;

      while (currentPatternStart < width + patternLength) {
        for (let i = 0; i < irregularities.length; i++) {
          const beatX = currentPatternStart + cumulativeOffsets[i];
          const nextBeatX = i < irregularities.length - 1
            ? currentPatternStart + cumulativeOffsets[i + 1]
            : currentPatternStart + patternLength;

          // Only draw if on screen
          if (beatX >= -20 && beatX <= width + 20) {
            // Flat baseline to QRS (no fib waves in RVR)
            ctx.lineTo(beatX, baselineY);

            // QRS - narrow, clean
            ctx.lineTo(beatX + qrsW * 0.12, baselineY + amplitudeScale * 0.06);
            ctx.lineTo(beatX + qrsW * 0.35, baselineY - amplitudeScale * 0.92);
            ctx.lineTo(beatX + qrsW * 0.6, baselineY + amplitudeScale * 0.15);
            ctx.lineTo(beatX + qrsW, baselineY);

            // ST segment (isoelectric)
            const stEnd = beatX + qrsW + stLen;
            ctx.lineTo(stEnd, baselineY);

            // T wave - smooth upright
            for (let t = 0; t <= 1; t += 0.1) {
              ctx.lineTo(stEnd + t * tW, baselineY - amplitudeScale * 0.14 * Math.sin(t * Math.PI));
            }

            // Flat baseline after T wave (no fib waves)
            const tEnd = stEnd + tW;
            ctx.lineTo(Math.min(nextBeatX, width + 20), baselineY);
          }
        }
        currentPatternStart += patternLength;
      }

      ctx.stroke();
    }

    else if (waveformType === 'sinus_arrhythmia') {
      // Sinus Arrhythmia - subtle rate variation with respiration
      // Rate slightly faster during inspiration, slower during expiration
      // Uses a fixed pattern of RR intervals that cycle smoothly

      // Pattern of 8 beats with subtle variation (±10% max)
      const rrPattern = [0.92, 0.95, 1.0, 1.05, 1.08, 1.05, 1.0, 0.95];
      const patternLength = rrPattern.reduce((sum, m) => sum + ventricularIntervalPx * m, 0);

      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 2;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let p = 0; p < numPatterns; p++) {
        let currentX = (startPattern + p) * patternLength - offset;

        for (let i = 0; i < rrPattern.length; i++) {
          const thisInterval = ventricularIntervalPx * rrPattern[i];
          const beatEnd = currentX + thisInterval;
          drawSinusComplex(ctx, currentX, beatEnd, false, false, true);
          currentX = beatEnd;
        }
      }

      ctx.stroke();
    } else if (waveformType === 'asystole') {
      // Asystole - flat line with minor baseline wander/noise
      ctx.beginPath();
      ctx.moveTo(0, baselineY);

      for (let x = 0; x < width; x += 2) {
        const pos = x + offset;
        // Very minor baseline wander
        const noise = Math.sin(pos * 0.02) * amplitudeScale * 0.02 +
                     Math.sin(pos * 0.05) * amplitudeScale * 0.01;
        ctx.lineTo(x, baselineY + noise);
      }

      ctx.stroke();
    } else if (waveformType === 'svt') {
      // SVT - very fast, regular, narrow complex, P waves buried in T waves
      // At 180 bpm: R-R = 333ms. QRS ~80ms, ST ~30ms, T ~120ms, baseline ~100ms
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;
        const totalWidth = beatEnd - beatStart;

        // Minimal pre-QRS baseline
        ctx.lineTo(beatStart + totalWidth * 0.04, baselineY);

        // Narrow QRS (~24% = ~80ms)
        ctx.lineTo(beatStart + totalWidth * 0.07, baselineY + amplitudeScale * 0.08);
        ctx.lineTo(beatStart + totalWidth * 0.14, baselineY - amplitudeScale * 0.95);
        ctx.lineTo(beatStart + totalWidth * 0.21, baselineY + amplitudeScale * 0.15);
        ctx.lineTo(beatStart + totalWidth * 0.28, baselineY);

        // Short ST segment (~8% = ~27ms)
        ctx.lineTo(beatStart + totalWidth * 0.36, baselineY);

        // T wave with buried retrograde P (~36% = ~120ms)
        for (let t = 0; t <= 1; t += 0.08) {
          const x = beatStart + totalWidth * (0.36 + t * 0.36);
          const y = baselineY - amplitudeScale * 0.16 * Math.sin(t * Math.PI);
          ctx.lineTo(x, y);
        }

        // Baseline to next beat (~28%)
        ctx.lineTo(beatEnd, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'accel_junctional' || waveformType === 'junctional_tach') {
      // Accelerated Junctional / Junctional Tachycardia - no P waves, narrow QRS
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // No P wave (junctional origin)
        drawSinusComplex(ctx, beatStart, beatEnd, false, false, false);
      }

      ctx.stroke();
    } else if (waveformType === 'wap') {
      // Wandering Atrial Pacemaker - 3+ P wave morphologies, MORE irregular RR
      // Significant RR variation as pacemaker site shifts between SA node and atrial foci
      const pMorphologies = [1.0, 0.7, -0.5, 0.85, 0.4, -0.6, 0.95, 0.55];
      const rrVariations = [0.85, 1.18, 0.9, 1.12, 0.82, 1.2, 0.95, 1.08];

      // Build cumulative positions
      let cumulative = 0;
      const beatPositions: number[] = [];
      for (const rr of rrVariations) {
        beatPositions.push(cumulative);
        cumulative += rr * ventricularIntervalPx;
      }
      const patternLength = cumulative;

      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 2;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let p = 0; p < numPatterns; p++) {
        const patternStart = (startPattern + p) * patternLength - offset;

        for (let i = 0; i < pMorphologies.length; i++) {
          const beatStart = patternStart + beatPositions[i];
          const rrInterval = rrVariations[i] * ventricularIntervalPx;
          const pHeight = amplitudeScale * 0.15 * pMorphologies[i];

          // P wave with variable morphology
          const pStart = beatStart + pixelsPerMm * 1;
          ctx.lineTo(pStart, baselineY);
          for (let t = 0; t <= 1; t += 0.1) {
            ctx.lineTo(pStart + t * pixelsPerMm * 2.5, baselineY - pHeight * Math.sin(t * Math.PI));
          }

          // PR segment and QRS
          const prEnd = pStart + pixelsPerMm * 4;
          ctx.lineTo(prEnd, baselineY);
          ctx.lineTo(prEnd + pixelsPerMm * 0.3, baselineY + amplitudeScale * 0.08);
          ctx.lineTo(prEnd + pixelsPerMm * 0.8, baselineY - amplitudeScale * 0.95);
          ctx.lineTo(prEnd + pixelsPerMm * 1.3, baselineY + amplitudeScale * 0.15);
          ctx.lineTo(prEnd + pixelsPerMm * 1.6, baselineY);

          // ST and T
          const tStart = prEnd + pixelsPerMm * 2.5;
          ctx.lineTo(tStart, baselineY);
          for (let t = 0; t <= 1; t += 0.1) {
            ctx.lineTo(tStart + t * pixelsPerMm * 3, baselineY - amplitudeScale * 0.16 * Math.sin(t * Math.PI));
          }

          ctx.lineTo(beatStart + rrInterval, baselineY);
        }
      }

      ctx.stroke();
    } else if (waveformType === 'mat') {
      // MAT - like WAP but rate >100, more irregular
      const pMorphologies = [1.0, 0.6, -0.4, 0.85, 0.5, -0.3];
      const rrVariations = [0.95, 1.1, 0.85, 1.0, 0.9, 1.05];
      const patternLength = rrVariations.reduce((a, b) => a + b, 0) * ventricularIntervalPx;

      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      let currentX = startPattern * patternLength - offset;
      ctx.moveTo(currentX, baselineY);

      for (let p = 0; p < numPatterns; p++) {
        for (let i = 0; i < pMorphologies.length; i++) {
          const rrInterval = ventricularIntervalPx * rrVariations[i];
          const pHeight = amplitudeScale * 0.14 * pMorphologies[i];
          const beatEnd = currentX + rrInterval;

          if (currentX > -50 && currentX < width + 50) {
            const pStart = currentX + rrInterval * 0.06;
            ctx.lineTo(pStart, baselineY);
            for (let t = 0; t <= 1; t += 0.1) {
              ctx.lineTo(pStart + t * pixelsPerMm * 2, baselineY - pHeight * Math.sin(t * Math.PI));
            }

            const prEnd = pStart + pixelsPerMm * 3.5;
            ctx.lineTo(prEnd, baselineY);

            ctx.lineTo(prEnd + pixelsPerMm * 0.3, baselineY + amplitudeScale * 0.08);
            ctx.lineTo(prEnd + pixelsPerMm * 0.8, baselineY - amplitudeScale * 0.92);
            ctx.lineTo(prEnd + pixelsPerMm * 1.3, baselineY + amplitudeScale * 0.14);
            ctx.lineTo(prEnd + pixelsPerMm * 1.5, baselineY);

            const tStart = prEnd + pixelsPerMm * 2;
            ctx.lineTo(tStart, baselineY);
            for (let t = 0; t <= 1; t += 0.1) {
              ctx.lineTo(tStart + t * pixelsPerMm * 2.5, baselineY - amplitudeScale * 0.14 * Math.sin(t * Math.PI));
            }

            ctx.lineTo(beatEnd, baselineY);
          }

          currentX = beatEnd;
        }
      }

      ctx.stroke();
    } else if (waveformType === 'atrial_tach') {
      // Atrial Tachycardia - fast, regular, abnormal P waves with NORMAL PR interval (120-200ms)
      // Key distinction from junctional: PR interval >= 120ms
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // At 150 bpm, beat interval is 400ms
        // P wave starts early, PR interval ~140ms (normal-ish for fast rate)
        // P wave: 0-80ms, PR segment: 80-140ms, QRS starts at 140ms

        // Abnormal P wave (peaked/pointed - ectopic atrial focus)
        const pStart = beatStart + pixelsPerMm * 0.5; // Start ~20ms in
        ctx.lineTo(pStart, baselineY);
        const pHeight = amplitudeScale * 0.18; // Slightly taller, peaked P
        const pWidth = pixelsPerMm * 2; // ~80ms P wave duration
        for (let t = 0; t <= 1; t += 0.08) {
          // More peaked P wave shape (ectopic)
          const pShape = Math.sin(t * Math.PI) * (1 - 0.3 * Math.abs(t - 0.5));
          ctx.lineTo(pStart + t * pWidth, baselineY - pHeight * pShape);
        }
        ctx.lineTo(pStart + pWidth, baselineY);

        // PR segment - flat isoelectric line (PR interval ~140ms total from P start)
        const prEnd = beatStart + pixelsPerMm * 3.5; // ~140ms from beat start
        ctx.lineTo(prEnd, baselineY);

        // Narrow QRS (normal conduction)
        const qrsWidth = pixelsPerMm * 2; // ~80ms narrow QRS
        ctx.lineTo(prEnd + qrsWidth * 0.1, baselineY + amplitudeScale * 0.08); // small q
        ctx.lineTo(prEnd + qrsWidth * 0.35, baselineY - amplitudeScale * 0.95); // tall R
        ctx.lineTo(prEnd + qrsWidth * 0.6, baselineY + amplitudeScale * 0.15); // small s
        ctx.lineTo(prEnd + qrsWidth * 0.75, baselineY);

        // ST segment
        const stEnd = prEnd + qrsWidth + pixelsPerMm * 1;
        ctx.lineTo(stEnd, baselineY);

        // T wave
        const tWidth = pixelsPerMm * 3;
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(stEnd + t * tWidth, baselineY - amplitudeScale * 0.18 * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'ivr') {
      // Idioventricular Rhythm - very slow, wide QRS, no P waves
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // Long flat baseline (slow rate)
        ctx.lineTo(beatStart + pixelsPerMm * 5, baselineY);

        // Wide ventricular QRS
        drawVentricularComplex(ctx, beatStart + pixelsPerMm * 5);

        ctx.lineTo(beatEnd, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'aivr') {
      // AIVR - moderate rate, wide QRS, no P waves
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        ctx.lineTo(beatStart + pixelsPerMm * 2, baselineY);
        drawVentricularComplex(ctx, beatStart + pixelsPerMm * 2);
        ctx.lineTo(beatEnd, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'v_bigeminy') {
      // NSR with Bigeminal PVCs - PVC starts 200ms after sinus T wave end
      const baseInterval = ventricularIntervalPx; // 75 bpm base
      const pvcQrsWidth = pixelsPerMm * 5;
      const pvcGap = pixelsPerMm * 5; // 200ms = 5mm after T wave

      // Calculate sinus T wave end (relative to beat start) using full-interval rate scaling
      const rateScale = Math.min(1.0, Math.max(0.5, baseInterval / (pixelsPerMm * 20)));
      const sinusTEnd = pixelsPerMm * 0.5                         // pre-P gap
        + pixelsPerMm * 4                                         // PR interval
        + pixelsPerMm * 2.5                                       // QRS width
        + pixelsPerMm * 2 * rateScale                             // ST segment
        + Math.max(pixelsPerMm * 3, pixelsPerMm * 4 * rateScale); // T wave

      // PVC starts 200ms after T wave end
      const pvcStart = sinusTEnd + pvcGap;
      const pvcVisualLen = pvcQrsWidth + pixelsPerMm * 0.3 + pixelsPerMm * 5; // QRS + ST + T
      const patternLength = pvcStart + pvcVisualLen + pixelsPerMm * 6; // comp pause padding

      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // NSR beat — endX at PVC start so flat baseline fills the 200ms gap
        drawSinusComplex(ctx, patternStart, patternStart + pvcStart, false, false, true);

        // PVC at 200ms after T wave
        const pvcPos = patternStart + pvcStart;

        // Wide PVC QRS - smooth continuous curve
        for (let t = 0; t <= 1; t += 0.05) {
          const x = pvcPos + t * pvcQrsWidth;
          const qrsShape = Math.exp(-Math.pow((t - 0.45) * 4, 2));
          ctx.lineTo(x, baselineY - amplitudeScale * 0.9 * qrsShape);
        }

        // ST segment at baseline
        const stEnd = pvcPos + pvcQrsWidth + pixelsPerMm * 0.3;
        ctx.lineTo(stEnd, baselineY);

        // Bag-like T wave - smoother curve
        const tWidth = pixelsPerMm * 5;
        const tDepth = amplitudeScale * 0.35;
        for (let t = 0; t <= 1; t += 0.03) {
          const x = stEnd + t * tWidth;
          const bagShape = 0.5 * (1 - Math.cos(2 * Math.PI * t)) * Math.sin(Math.PI * t);
          ctx.lineTo(x, baselineY + tDepth * bagShape);
        }

        // Compensatory pause to end of pattern
        ctx.lineTo(patternStart + patternLength, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'v_trigeminy') {
      // NSR with Trigeminal PVCs - Pattern: NSR → NSR → PVC (200ms after T wave) → comp pause
      const baseInterval = ventricularIntervalPx; // 75 bpm base
      const pvcQrsWidth = pixelsPerMm * 5;
      const pvcGap = pixelsPerMm * 5; // 200ms = 5mm after T wave

      // Calculate sinus T wave end (relative to each NSR start) using full-interval rate scaling
      const rateScale = Math.min(1.0, Math.max(0.5, baseInterval / (pixelsPerMm * 20)));
      const sinusTEnd = pixelsPerMm * 0.5                         // pre-P gap
        + pixelsPerMm * 4                                         // PR interval
        + pixelsPerMm * 2.5                                       // QRS width
        + pixelsPerMm * 2 * rateScale                             // ST segment
        + Math.max(pixelsPerMm * 3, pixelsPerMm * 4 * rateScale); // T wave

      // NSR #2 starts at baseInterval from pattern start
      // PVC starts 200ms after NSR #2's T wave end
      const nsr2TEnd = baseInterval + sinusTEnd;
      const pvcStart = nsr2TEnd + pvcGap;
      const pvcVisualLen = pvcQrsWidth + pixelsPerMm * 0.3 + pixelsPerMm * 5; // QRS + ST + T
      const patternLength = pvcStart + pvcVisualLen + pixelsPerMm * 6; // comp pause padding

      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // NSR #1 at position 0 — endX at NSR #2 start so baseline fills gap
        const nsr1EndX = patternStart + baseInterval;
        drawSinusComplex(ctx, patternStart, nsr1EndX, false, false, true);

        // NSR #2 at baseInterval — endX at PVC start so baseline fills 200ms gap
        const nsr2Start = patternStart + baseInterval;
        drawSinusComplex(ctx, nsr2Start, patternStart + pvcStart, false, false, true);

        // PVC at 200ms after NSR #2's T wave
        const pvcPos = patternStart + pvcStart;

        // Wide PVC QRS - smooth continuous curve
        for (let t = 0; t <= 1; t += 0.05) {
          const x = pvcPos + t * pvcQrsWidth;
          const qrsShape = Math.exp(-Math.pow((t - 0.45) * 4, 2));
          ctx.lineTo(x, baselineY - amplitudeScale * 0.9 * qrsShape);
        }

        // ST segment at baseline
        const stEnd = pvcPos + pvcQrsWidth + pixelsPerMm * 0.3;
        ctx.lineTo(stEnd, baselineY);

        // Bag-like T wave - smoother curve
        const tWidth = pixelsPerMm * 5;
        const tDepth = amplitudeScale * 0.35;
        for (let t = 0; t <= 1; t += 0.03) {
          const x = stEnd + t * tWidth;
          const bagShape = 0.5 * (1 - Math.cos(2 * Math.PI * t)) * Math.sin(Math.PI * t);
          ctx.lineTo(x, baselineY + tDepth * bagShape);
        }

        // Compensatory pause to end of pattern
        ctx.lineTo(patternStart + patternLength, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'paced_aai') {
      // AAI Pacing - atrial spike, then native QRS
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // Atrial pacing spike
        const spikeX = beatStart + pixelsPerMm * 2;
        ctx.lineTo(spikeX, baselineY);
        ctx.lineTo(spikeX, baselineY - amplitudeScale * 0.4);
        ctx.lineTo(spikeX + 1, baselineY - amplitudeScale * 0.4);
        ctx.lineTo(spikeX + 1, baselineY);

        // Paced P wave
        const pHeight = amplitudeScale * 0.12;
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(spikeX + 1 + t * pixelsPerMm * 2.5, baselineY - pHeight * Math.sin(t * Math.PI));
        }

        // PR interval
        const prEnd = spikeX + pixelsPerMm * 5;
        ctx.lineTo(prEnd, baselineY);

        // Native narrow QRS (conducted normally)
        ctx.lineTo(prEnd + pixelsPerMm * 0.3, baselineY + amplitudeScale * 0.08);
        ctx.lineTo(prEnd + pixelsPerMm * 0.8, baselineY - amplitudeScale * 0.95);
        ctx.lineTo(prEnd + pixelsPerMm * 1.3, baselineY + amplitudeScale * 0.15);
        ctx.lineTo(prEnd + pixelsPerMm * 1.6, baselineY);

        // T wave
        const tStart = prEnd + pixelsPerMm * 2.5;
        ctx.lineTo(tStart, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(tStart + t * pixelsPerMm * 3, baselineY - amplitudeScale * 0.16 * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'paced_vvi') {
      // VVI Pacing — ventricular spike followed by wide paced QRS
      // Move baseline up by 1 big square (5mm) to avoid deep S wave overlapping Mr. Pacemaker
      const vviBaselineY = baselineY - pixelsPerMm * 5;
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, vviBaselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // Flat baseline to spike
        const spikeX = beatStart + pixelsPerMm * 2;
        ctx.lineTo(spikeX, vviBaselineY);

        // Ventricular pacing spike (thin vertical artifact)
        ctx.lineTo(spikeX, vviBaselineY - amplitudeScale * 0.5);
        ctx.lineTo(spikeX + 1, vviBaselineY - amplitudeScale * 0.5);
        ctx.lineTo(spikeX + 1, vviBaselineY);

        // Paced QRS - RV apical pacing in lead II: predominantly NEGATIVE deflection
        // Depolarization travels superiorly, away from inferior leads
        const qrsWidth = pixelsPerMm * 4; // ~160ms wide
        const rHeight = amplitudeScale * 0.15; // Small initial r wave
        const sDepth = amplitudeScale * 0.85; // Deep S wave (main deflection)
        const tHeight = amplitudeScale * 0.20; // Discordant upright T wave

        // Small initial r wave
        ctx.lineTo(spikeX + 1 + qrsWidth * 0.05, vviBaselineY);
        ctx.lineTo(spikeX + 1 + qrsWidth * 0.12, vviBaselineY - rHeight); // small r peak

        // Sharp downstroke into deep S wave
        ctx.lineTo(spikeX + 1 + qrsWidth * 0.20, vviBaselineY);
        ctx.lineTo(spikeX + 1 + qrsWidth * 0.35, vviBaselineY + sDepth * 0.7);
        ctx.lineTo(spikeX + 1 + qrsWidth * 0.45, vviBaselineY + sDepth); // S nadir (deep)

        // S wave recovery
        ctx.lineTo(spikeX + 1 + qrsWidth * 0.55, vviBaselineY + sDepth * 0.7);
        ctx.lineTo(spikeX + 1 + qrsWidth * 0.70, vviBaselineY + sDepth * 0.15);

        // Discordant upright T wave (opposite to negative QRS)
        const tStart = spikeX + 1 + qrsWidth * 0.75;
        const tWidth = pixelsPerMm * 3.5;
        for (let t = 0; t <= 1; t += 0.1) {
          const x = tStart + t * tWidth;
          ctx.lineTo(x, vviBaselineY - tHeight * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, vviBaselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'paced_ddd') {
      // DDD Pacing - atrial spike, AV delay, ventricular spike
      // Move baseline up by 1 big square (5mm) to avoid deep S wave overlapping Mr. Pacemaker
      const dddBaselineY = baselineY - pixelsPerMm * 5;
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, dddBaselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // Atrial pacing spike
        const aSpikeX = beatStart + pixelsPerMm * 2;
        ctx.lineTo(aSpikeX, dddBaselineY);
        ctx.lineTo(aSpikeX, dddBaselineY - amplitudeScale * 0.35);
        ctx.lineTo(aSpikeX + 1, dddBaselineY - amplitudeScale * 0.35);
        ctx.lineTo(aSpikeX + 1, dddBaselineY);

        // Small paced P wave
        const pHeight = amplitudeScale * 0.10;
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(aSpikeX + 1 + t * pixelsPerMm * 2, dddBaselineY - pHeight * Math.sin(t * Math.PI));
        }

        // AV delay (programmed PR)
        const avDelay = pixelsPerMm * 5; // ~200ms AV delay
        const vSpikeX = aSpikeX + avDelay;
        ctx.lineTo(vSpikeX, dddBaselineY);

        // Ventricular pacing spike
        ctx.lineTo(vSpikeX, dddBaselineY - amplitudeScale * 0.5);
        ctx.lineTo(vSpikeX + 1, dddBaselineY - amplitudeScale * 0.5);
        ctx.lineTo(vSpikeX + 1, dddBaselineY);

        // Paced QRS - RV apical pacing in lead II: predominantly NEGATIVE deflection
        const qrsWidth = pixelsPerMm * 4; // ~160ms wide
        const rHeight = amplitudeScale * 0.15; // Small initial r wave
        const sDepth = amplitudeScale * 0.85; // Deep S wave (main deflection)
        const tHeight = amplitudeScale * 0.20; // Discordant upright T wave

        // Small initial r wave
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.05, dddBaselineY);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.12, dddBaselineY - rHeight); // small r peak

        // Sharp downstroke into deep S wave
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.20, dddBaselineY);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.35, dddBaselineY + sDepth * 0.7);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.45, dddBaselineY + sDepth); // S nadir (deep)

        // S wave recovery
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.55, dddBaselineY + sDepth * 0.7);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.70, dddBaselineY + sDepth * 0.15);

        // Discordant upright T wave (opposite to negative QRS)
        const tStart = vSpikeX + 1 + qrsWidth * 0.75;
        const tWidth = pixelsPerMm * 3.5;
        for (let t = 0; t <= 1; t += 0.1) {
          const x = tStart + t * tWidth;
          ctx.lineTo(x, dddBaselineY - tHeight * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, dddBaselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'failure_capture_v') {
      // Ventricular Failure to Capture - V spikes without QRS, very slow escape (~13 bpm)
      // 13 bpm = 60/13 = 4.6 sec = ~115mm per escape beat
      const escapeInterval = pixelsPerMm * 115;
      const patternLength = escapeInterval;
      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // Multiple failed spikes before escape
        for (let s = 0; s < 4; s++) {
          const spikeX = patternStart + pixelsPerMm * 20 * (s + 1);
          if (spikeX < patternStart + escapeInterval - pixelsPerMm * 20) {
            ctx.lineTo(spikeX, baselineY);
            ctx.lineTo(spikeX, baselineY - amplitudeScale * 0.5);
            ctx.lineTo(spikeX + 1, baselineY - amplitudeScale * 0.5);
            ctx.lineTo(spikeX + 1, baselineY);
          }
        }

        // Escape beat eventually (wide QRS) near end of pattern
        const escapeX = patternStart + escapeInterval - pixelsPerMm * 15;
        ctx.lineTo(escapeX, baselineY);
        drawVentricularComplex(ctx, escapeX);

        ctx.lineTo(patternStart + patternLength, baselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'failure_capture_a') {
      // Atrial Failure to Capture - A spikes without P waves, ventricular pacing intact
      // Move baseline up by 1 big square (5mm) to avoid deep S wave overlapping Mr. Pacemaker
      const aFailBaselineY = baselineY - pixelsPerMm * 5;
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, aFailBaselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // Atrial spike that fails to capture - no P wave follows
        const aSpikeX = beatStart + pixelsPerMm * 2;
        ctx.lineTo(aSpikeX, aFailBaselineY);
        ctx.lineTo(aSpikeX, aFailBaselineY - amplitudeScale * 0.35);
        ctx.lineTo(aSpikeX + 1, aFailBaselineY - amplitudeScale * 0.35);
        ctx.lineTo(aSpikeX + 1, aFailBaselineY);
        // NO P wave - just flat line to V spike

        // AV delay
        const avDelay = pixelsPerMm * 5;
        const vSpikeX = aSpikeX + avDelay;
        ctx.lineTo(vSpikeX, aFailBaselineY);

        // Ventricular spike - captures normally
        ctx.lineTo(vSpikeX, aFailBaselineY - amplitudeScale * 0.5);
        ctx.lineTo(vSpikeX + 1, aFailBaselineY - amplitudeScale * 0.5);
        ctx.lineTo(vSpikeX + 1, aFailBaselineY);

        // Paced QRS (RV apical - negative in lead II)
        const qrsWidth = pixelsPerMm * 4;
        const sDepth = amplitudeScale * 0.85;
        const tHeight = amplitudeScale * 0.20;

        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.05, aFailBaselineY);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.12, aFailBaselineY - amplitudeScale * 0.15);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.20, aFailBaselineY);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.35, aFailBaselineY + sDepth * 0.7);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.45, aFailBaselineY + sDepth);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.55, aFailBaselineY + sDepth * 0.7);
        ctx.lineTo(vSpikeX + 1 + qrsWidth * 0.70, aFailBaselineY + sDepth * 0.15);

        // Discordant upright T wave
        const tStart = vSpikeX + 1 + qrsWidth * 0.75;
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(tStart + t * pixelsPerMm * 3.5, aFailBaselineY - tHeight * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, aFailBaselineY);
      }

      ctx.stroke();
    } else if (waveformType === 'undersensing_a') {
      // Atrial Undersensing — atrial lead fails to sense native P waves
      // Spike appears ON the P wave (pacemaker didn't sense it)
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      // Draw continuous native sinus rhythm (P waves and QRS - all native)
      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;
        drawSinusComplex(ctx, beatStart, beatEnd, false, false, true);
        ctx.lineTo(beatEnd, baselineY);
      }
      ctx.stroke();

      // Overlay inappropriate ATRIAL pacing spikes ON the P waves
      // Spike lands on the P wave because pacemaker didn't sense it
      ctx.beginPath();
      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;

        // P wave is at beatStart + pixelsPerMm * 2, spike ON the P wave
        const pWaveX = beatStart + pixelsPerMm * 3;

        // Atrial pacing spike on the P wave
        ctx.moveTo(pWaveX, baselineY);
        ctx.lineTo(pWaveX, baselineY - amplitudeScale * 0.35);
        ctx.lineTo(pWaveX + 1, baselineY - amplitudeScale * 0.35);
        ctx.lineTo(pWaveX + 1, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'undersensing_v') {
      // Ventricular Undersensing — ventricular lead fails to sense native QRS
      // Spike appears ON the R wave (pacemaker didn't sense the QRS)
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      // Draw continuous native sinus rhythm
      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;
        drawSinusComplex(ctx, beatStart, beatEnd, false, false, true);
        ctx.lineTo(beatEnd, baselineY);
      }
      ctx.stroke();

      // Overlay ventricular pacing spikes ON the R waves (undersensing)
      // Spike lands on the R wave because pacemaker didn't sense it
      ctx.beginPath();
      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;

        // QRS starts around beatStart + 7mm (after P wave and PR interval)
        // R wave peak is about 1mm into the QRS
        const rWaveX = beatStart + pixelsPerMm * 8;

        // Ventricular pacing spike on the R wave
        ctx.moveTo(rWaveX, baselineY);
        ctx.lineTo(rWaveX, baselineY - amplitudeScale * 0.5);
        ctx.lineTo(rWaveX + 1, baselineY - amplitudeScale * 0.5);
        ctx.lineTo(rWaveX + 1, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'oversensing_a') {
      // Atrial Oversensing — leads to underpacing, junctional rhythm escape
      // Pattern: normal paced beat at 72 bpm, then junctional escape at 55 bpm
      const normalInterval = pixelsPerMm * (60 / 72) * speed; // 72 bpm paced
      const junctionalInterval = pixelsPerMm * (60 / 55) * speed; // 55 bpm junctional
      const patternLength = normalInterval + junctionalInterval * 2;
      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;
        let currentX = patternStart;

        // Move to pattern start
        ctx.moveTo(currentX, baselineY);

        // ---- BEAT 1: Normal atrial paced beat at 72 bpm ----
        // Atrial spike
        const aSpikeX = currentX + pixelsPerMm * 2;
        ctx.lineTo(aSpikeX, baselineY);
        ctx.lineTo(aSpikeX, baselineY - amplitudeScale * 0.35);
        ctx.lineTo(aSpikeX + 1, baselineY - amplitudeScale * 0.35);
        ctx.lineTo(aSpikeX + 1, baselineY);

        // Paced P wave
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(aSpikeX + 1 + t * pixelsPerMm * 2, baselineY - amplitudeScale * 0.10 * Math.sin(t * Math.PI));
        }

        // PR interval to QRS
        const qrs1Start = aSpikeX + pixelsPerMm * 6;
        ctx.lineTo(qrs1Start, baselineY);

        // QRS complex (narrow, normal)
        ctx.lineTo(qrs1Start + pixelsPerMm * 0.5, baselineY - amplitudeScale * 0.08);
        ctx.lineTo(qrs1Start + pixelsPerMm * 1, baselineY - amplitudeScale * 0.65);
        ctx.lineTo(qrs1Start + pixelsPerMm * 1.5, baselineY + amplitudeScale * 0.15);
        ctx.lineTo(qrs1Start + pixelsPerMm * 2, baselineY);

        // ST segment and T wave
        const t1Start = qrs1Start + pixelsPerMm * 4;
        ctx.lineTo(t1Start, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(t1Start + t * pixelsPerMm * 3, baselineY - amplitudeScale * 0.12 * Math.sin(t * Math.PI));
        }
        currentX = patternStart + normalInterval;
        ctx.lineTo(currentX, baselineY);

        // ---- PAUSE (oversensing inhibits atrial pacing) ----
        currentX += pixelsPerMm * 3;
        ctx.lineTo(currentX, baselineY);

        // ---- BEAT 2: Junctional escape at 55 bpm ----
        // Small inverted P (retrograde)
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(currentX + t * pixelsPerMm * 1.5, baselineY + amplitudeScale * 0.06 * Math.sin(t * Math.PI));
        }
        currentX += pixelsPerMm * 2;

        // Narrow QRS (junctional)
        ctx.lineTo(currentX, baselineY);
        ctx.lineTo(currentX + pixelsPerMm * 0.5, baselineY - amplitudeScale * 0.08);
        ctx.lineTo(currentX + pixelsPerMm * 1, baselineY - amplitudeScale * 0.60);
        ctx.lineTo(currentX + pixelsPerMm * 1.5, baselineY + amplitudeScale * 0.12);
        ctx.lineTo(currentX + pixelsPerMm * 2, baselineY);

        // T wave
        const t2Start = currentX + pixelsPerMm * 4;
        ctx.lineTo(t2Start, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(t2Start + t * pixelsPerMm * 3, baselineY - amplitudeScale * 0.10 * Math.sin(t * Math.PI));
        }
        currentX = patternStart + normalInterval + junctionalInterval;
        ctx.lineTo(currentX, baselineY);

        // ---- BEAT 3: Another junctional escape at 55 bpm ----
        currentX += pixelsPerMm * 3;
        ctx.lineTo(currentX, baselineY);

        // Small inverted P (retrograde)
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(currentX + t * pixelsPerMm * 1.5, baselineY + amplitudeScale * 0.06 * Math.sin(t * Math.PI));
        }
        currentX += pixelsPerMm * 2;

        // Narrow QRS
        ctx.lineTo(currentX, baselineY);
        ctx.lineTo(currentX + pixelsPerMm * 0.5, baselineY - amplitudeScale * 0.08);
        ctx.lineTo(currentX + pixelsPerMm * 1, baselineY - amplitudeScale * 0.60);
        ctx.lineTo(currentX + pixelsPerMm * 1.5, baselineY + amplitudeScale * 0.12);
        ctx.lineTo(currentX + pixelsPerMm * 2, baselineY);

        // T wave
        const t3Start = currentX + pixelsPerMm * 4;
        ctx.lineTo(t3Start, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(t3Start + t * pixelsPerMm * 3, baselineY - amplitudeScale * 0.10 * Math.sin(t * Math.PI));
        }
        ctx.lineTo(patternStart + patternLength, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'oversensing_v') {
      // Ventricular Oversensing — ventricular lead sees non-R signals (T waves, noise)
      // Shows pauses in paced rhythm where pacing should occur
      const patternLength = ventricularIntervalPx * 3;
      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // First beat - normal paced beat
        const spike1X = patternStart + pixelsPerMm * 2;
        ctx.lineTo(spike1X, baselineY);
        ctx.lineTo(spike1X, baselineY - amplitudeScale * 0.5);
        ctx.lineTo(spike1X + 1, baselineY - amplitudeScale * 0.5);
        ctx.lineTo(spike1X + 1, baselineY);

        // Paced QRS (RV apical) - less deep, moved up on y axis
        const qrsWidth = pixelsPerMm * 4;
        const sDepth = amplitudeScale * 0.50; // Less deep
        const tHeight = amplitudeScale * 0.20;

        ctx.lineTo(spike1X + 1 + qrsWidth * 0.05, baselineY);
        ctx.lineTo(spike1X + 1 + qrsWidth * 0.12, baselineY - amplitudeScale * 0.20);
        ctx.lineTo(spike1X + 1 + qrsWidth * 0.20, baselineY);
        ctx.lineTo(spike1X + 1 + qrsWidth * 0.35, baselineY + sDepth * 0.6);
        ctx.lineTo(spike1X + 1 + qrsWidth * 0.45, baselineY + sDepth);
        ctx.lineTo(spike1X + 1 + qrsWidth * 0.55, baselineY + sDepth * 0.6);
        ctx.lineTo(spike1X + 1 + qrsWidth * 0.70, baselineY + sDepth * 0.1);

        // T wave (discordant - upright)
        const tStart1 = spike1X + 1 + qrsWidth * 0.75;
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(tStart1 + t * pixelsPerMm * 3.5, baselineY - tHeight * Math.sin(t * Math.PI));
        }

        // PAUSE - no spike due to oversensing (T wave sensed as R wave)
        ctx.lineTo(patternStart + ventricularIntervalPx * 1.8, baselineY);

        // Second beat - normal paced beat after pause
        const spike2X = patternStart + ventricularIntervalPx * 1.8 + pixelsPerMm * 2;
        ctx.lineTo(spike2X, baselineY);
        ctx.lineTo(spike2X, baselineY - amplitudeScale * 0.5);
        ctx.lineTo(spike2X + 1, baselineY - amplitudeScale * 0.5);
        ctx.lineTo(spike2X + 1, baselineY);

        // Second paced QRS - same as first, less deep
        ctx.lineTo(spike2X + 1 + qrsWidth * 0.05, baselineY);
        ctx.lineTo(spike2X + 1 + qrsWidth * 0.12, baselineY - amplitudeScale * 0.20);
        ctx.lineTo(spike2X + 1 + qrsWidth * 0.20, baselineY);
        ctx.lineTo(spike2X + 1 + qrsWidth * 0.35, baselineY + sDepth * 0.6);
        ctx.lineTo(spike2X + 1 + qrsWidth * 0.45, baselineY + sDepth);
        ctx.lineTo(spike2X + 1 + qrsWidth * 0.55, baselineY + sDepth * 0.6);
        ctx.lineTo(spike2X + 1 + qrsWidth * 0.70, baselineY + sDepth * 0.1);

        const tStart2 = spike2X + 1 + qrsWidth * 0.75;
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(tStart2 + t * pixelsPerMm * 3.5, baselineY - tHeight * Math.sin(t * Math.PI));
        }

        ctx.lineTo(patternStart + patternLength, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'couplet') {
      // Ventricular Couplet - sinus rhythm with 2 consecutive PVCs
      // 80ms gap between PVCs, compensatory pause ~55 bpm feel
      // Shorten compensatory pause (was 27mm, now 7mm = 4 boxes shorter)
      const pauseInterval = pixelsPerMm * 7; // Shorter compensatory pause
      const patternLength = ventricularIntervalPx * 2 + pixelsPerMm * 30 + pauseInterval; // 2 sinus + couplet width + pause
      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // First normal sinus beat
        const beat1Start = patternStart;
        const beat1End = patternStart + ventricularIntervalPx;
        drawSinusComplex(ctx, beat1Start, beat1End, false, false, true);
        ctx.lineTo(beat1End, baselineY);

        // Second normal sinus beat - only draw up to where PVC will start
        // Sinus T wave ends around startX + 13mm, PVC starts ~2mm after that
        const beat2Start = beat1End;
        const beat2TEnd = beat2Start + pixelsPerMm * 13; // Approximate T wave end
        const pvc1Start = beat2TEnd + pixelsPerMm * 2; // Small gap after T wave

        // Draw beat2 only up to where PVC starts (prevents flat line overlap)
        drawSinusComplex(ctx, beat2Start, pvc1Start, false, false, true);

        // First PVC
        const pvc1End = drawVentricularComplex(ctx, pvc1Start);

        // Second PVC - 80ms (2mm) after first PVC's T wave ends
        const pvc2Start = pvc1End + pixelsPerMm * 2; // 80ms gap after T wave
        const pvc2End = drawVentricularComplex(ctx, pvc2Start);

        // Compensatory pause - ~55 bpm feel to next sinus beat
        ctx.lineTo(pvc2End, baselineY);
        ctx.lineTo(patternStart + patternLength, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'nsvt') {
      // Non-sustained VT: 3 sinus beats at 72 bpm, then 8 VT beats, then sinus resumes
      const nsrInterval = pixelsPerMm * (60 / 72) * speed; // 72 bpm = 20.83mm
      const pvcGap = pixelsPerMm * 1; // 40ms = 1mm gap between PVCs
      const vtBeats = 8; // 8 VT beats
      const nsrBeatsAfter = 2;

      // PVC complex is ~9mm wide, plus 1mm gap = 10mm per PVC
      const pvcTotalWidth = pixelsPerMm * 10;
      const vtRunLength = pvcTotalWidth * vtBeats;
      const patternLength = nsrInterval * 3 + vtRunLength + nsrInterval * nsrBeatsAfter;
      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // 3 normal sinus beats at 72 bpm
        let currentX = patternStart;
        for (let s = 0; s < 3; s++) {
          const beatEnd = currentX + nsrInterval;
          // For beat 3 (s=2), don't draw full interval - PVCs will start
          if (s < 2) {
            drawSinusComplex(ctx, currentX, beatEnd, false, false, true);
            currentX = beatEnd;
          } else {
            // Last sinus before VT run - draw without trailing baseline
            drawSinusComplex(ctx, currentX, currentX + nsrInterval * 0.7, false, false, true);
            currentX = currentX + nsrInterval * 0.75; // Position for first PVC
          }
        }

        // Run of 4 PVCs with 40ms (1mm) gap between each
        ctx.lineTo(currentX, baselineY);
        for (let v = 0; v < vtBeats; v++) {
          const pvcEnd = drawVentricularComplex(ctx, currentX);
          currentX = pvcEnd + pvcGap; // 40ms gap after each PVC
        }

        // Compensatory pause then 2 more sinus beats
        ctx.lineTo(currentX + pixelsPerMm * 4, baselineY);
        currentX = currentX + pixelsPerMm * 4;

        for (let s = 0; s < nsrBeatsAfter; s++) {
          const beatEnd = currentX + nsrInterval;
          drawSinusComplex(ctx, currentX, beatEnd, false, false, true);
          currentX = beatEnd;
        }
      }
      ctx.stroke();
    } else if (waveformType === 'wpw') {
      // WPW Pattern: short PR, delta wave (slurred QRS upstroke), wide QRS
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // P wave (normal)
        const pStart = beatStart + pixelsPerMm * 2;
        const pHeight = amplitudeScale * 0.12;
        const pWidth = pixelsPerMm * 2.5;
        ctx.lineTo(pStart, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(pStart + t * pWidth, baselineY - pHeight * Math.sin(t * Math.PI));
        }

        // SHORT PR interval (< 120ms = < 3mm at 25mm/s)
        // WPW has PR < 120ms, we show ~100ms (2.5mm) - visibly short but present
        const shortPR = pixelsPerMm * 2.5;
        const qrsStart = pStart + pWidth + shortPR;
        ctx.lineTo(qrsStart, baselineY);

        // Delta wave + wide QRS
        const qrsWidth = pixelsPerMm * 4; // Wide (~160ms)
        const rHeight = amplitudeScale * 0.85;

        // Delta wave - slurred upstroke (pre-excitation) - gradual slope
        ctx.lineTo(qrsStart + qrsWidth * 0.05, baselineY - rHeight * 0.03);
        ctx.lineTo(qrsStart + qrsWidth * 0.10, baselineY - rHeight * 0.08);
        ctx.lineTo(qrsStart + qrsWidth * 0.15, baselineY - rHeight * 0.15);
        ctx.lineTo(qrsStart + qrsWidth * 0.20, baselineY - rHeight * 0.25);
        ctx.lineTo(qrsStart + qrsWidth * 0.26, baselineY - rHeight * 0.40);
        ctx.lineTo(qrsStart + qrsWidth * 0.32, baselineY - rHeight * 0.58);
        ctx.lineTo(qrsStart + qrsWidth * 0.38, baselineY - rHeight * 0.78);

        // R wave peak
        ctx.lineTo(qrsStart + qrsWidth * 0.45, baselineY - rHeight);

        // Downstroke
        ctx.lineTo(qrsStart + qrsWidth * 0.55, baselineY - rHeight * 0.6);
        ctx.lineTo(qrsStart + qrsWidth * 0.65, baselineY + rHeight * 0.1);
        ctx.lineTo(qrsStart + qrsWidth * 0.75, baselineY + rHeight * 0.15);
        ctx.lineTo(qrsStart + qrsWidth * 0.85, baselineY);

        // T wave - upright in lead II (can be variable in WPW)
        const tStart = qrsStart + qrsWidth + pixelsPerMm * 1.5;
        const tHeight = amplitudeScale * 0.18;
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(tStart + t * pixelsPerMm * 4, baselineY - tHeight * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'nsr_pjc') {
      // NSR with PJC - early narrow QRS, inverted P wave (retrograde) or absent P
      // Pattern: 2 normal beats, then early PJC, then normal beat resumes
      const patternLength = ventricularIntervalPx * 4;
      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // Beat 1: Normal sinus at 72 bpm
        const beat1End = patternStart + ventricularIntervalPx;
        drawSinusComplex(ctx, patternStart, beat1End, false, false, true);

        // Beat 2: Normal sinus - but PJC will interrupt early
        // Draw beat 2 with shortened interval so PJC R-R is ~90 bpm (667ms vs 833ms for 72 bpm)
        // 90 bpm interval is ~80% of 72 bpm interval
        const pjcIntervalRatio = 72 / 90;  // ~0.8
        const beat2ShortenedEnd = beat1End + ventricularIntervalPx * pjcIntervalRatio;
        drawSinusComplex(ctx, beat1End, beat2ShortenedEnd, false, false, true);

        // PJC occurs early - immediately after beat 2's shortened complex
        const pjcStart = beat2ShortenedEnd + pixelsPerMm * 1;
        ctx.lineTo(pjcStart, baselineY);

        // Small inverted P wave (retrograde conduction) - goes DOWN below baseline
        const retroPHeight = amplitudeScale * 0.1;
        const retroPWidth = pixelsPerMm * 2.5;  // Wider P wave
        // Draw inverted P starting from baseline, going down, returning to baseline
        for (let t = 0; t <= 1; t += 0.1) {
          const x = pjcStart + t * retroPWidth;
          const y = baselineY + retroPHeight * Math.pow(Math.sin(t * Math.PI), 1.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(pjcStart + retroPWidth, baselineY);

        // Short PR interval (junctional origin)
        const qrsStart = pjcStart + retroPWidth + pixelsPerMm * 2;  // Wider PR segment
        ctx.lineTo(qrsStart, baselineY);

        // Narrow QRS - SAME as sinus (uses normal His-Purkinje conduction)
        const qDepth = amplitudeScale * 0.1;
        const rHeight = amplitudeScale * 1.0;
        const sDepth = amplitudeScale * 0.2;
        const qrsWidth = pixelsPerMm * 2.5;

        ctx.lineTo(qrsStart + qrsWidth * 0.1, baselineY + qDepth * 0.4);
        ctx.lineTo(qrsStart + qrsWidth * 0.2, baselineY + qDepth);
        ctx.lineTo(qrsStart + qrsWidth * 0.35, baselineY - rHeight * 0.3);
        ctx.lineTo(qrsStart + qrsWidth * 0.45, baselineY - rHeight * 0.85);
        ctx.lineTo(qrsStart + qrsWidth * 0.5, baselineY - rHeight);
        ctx.lineTo(qrsStart + qrsWidth * 0.55, baselineY - rHeight * 0.85);
        ctx.lineTo(qrsStart + qrsWidth * 0.7, baselineY - rHeight * 0.1);
        ctx.lineTo(qrsStart + qrsWidth * 0.8, baselineY + sDepth);
        ctx.lineTo(qrsStart + qrsWidth * 0.9, baselineY + sDepth * 0.3);
        ctx.lineTo(qrsStart + qrsWidth, baselineY);

        // ST segment - same as sinus
        const stEnd = qrsStart + qrsWidth + pixelsPerMm * 2.5;  // Wider ST segment
        ctx.lineTo(stEnd, baselineY);

        // T wave - same as sinus (asymmetric, peaks at 40%)
        const tHeight = amplitudeScale * 0.18;
        const tWidth = pixelsPerMm * 4.5;  // Wider T wave
        for (let t = 0; t <= 1; t += 0.05) {
          const x = stEnd + t * tWidth;
          const tShape = t < 0.4
            ? Math.sin(t / 0.4 * Math.PI / 2)
            : Math.cos((t - 0.4) / 0.6 * Math.PI / 2);
          ctx.lineTo(x, baselineY - tHeight * tShape);
        }
        ctx.lineTo(stEnd + tWidth, baselineY);

        // Pause until beat 4
        const beat4Start = patternStart + ventricularIntervalPx * 3;
        ctx.lineTo(beat4Start, baselineY);

        // Beat 4: Normal sinus resumes
        drawSinusComplex(ctx, beat4Start, patternStart + patternLength, false, false, true);
        ctx.lineTo(patternStart + patternLength, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'blocked_pac') {
      // Blocked PAC - P wave without QRS (PAC too early, AV node refractory)
      // Pattern: 2 normal beats, blocked P wave (no QRS), long pause, then normal beat resumes
      const patternLength = ventricularIntervalPx * 4.5;  // Extended for longer pause
      const startPattern = Math.floor(offset / patternLength) - 1;
      const numPatterns = Math.ceil(width / patternLength) + 3;

      ctx.beginPath();
      ctx.moveTo(startPattern * patternLength - offset, baselineY);

      for (let i = 0; i < numPatterns; i++) {
        const patternStart = (startPattern + i) * patternLength - offset;

        // Beat 1: Normal sinus beat
        const beat1End = patternStart + ventricularIntervalPx;
        drawSinusComplex(ctx, patternStart, beat1End, false, false, true);

        // Beat 2: Normal sinus beat
        const beat2End = patternStart + ventricularIntervalPx * 2;
        drawSinusComplex(ctx, beat1End, beat2End, false, false, true);

        // After beat 2: Blocked PAC P wave occurs (early, no QRS follows)
        // 40ms gap after T wave (1mm at 25mm/sec), then the abnormal P
        const pacPStart = beat2End + pixelsPerMm * 1;
        ctx.lineTo(pacPStart, baselineY);

        // P wave - same height as NSR P wave
        const pacPHeight = amplitudeScale * 0.15;  // Same as normal sinus P wave
        const pacPWidth = pixelsPerMm * 2.5;
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(pacPStart + t * pacPWidth, baselineY - pacPHeight * Math.pow(Math.sin(t * Math.PI), 1.3));
        }
        // Explicit return to baseline after P wave
        ctx.lineTo(pacPStart + pacPWidth, baselineY);

        // Long pause - NO QRS follows (R-R from beat 2 to beat 4 = ~1800-2000ms = 30-33 bpm)
        const beat4Start = patternStart + ventricularIntervalPx * 3.5;  // Extended pause
        ctx.lineTo(beat4Start, baselineY);

        // Beat 4: Normal sinus resumes
        drawSinusComplex(ctx, beat4Start, patternStart + patternLength, false, false, true);
        ctx.lineTo(patternStart + patternLength, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'lbbb') {
      // LBBB: Wide QRS with W in V1 (deep S), M in lateral leads (notched R)
      // For lead II, LBBB typically shows broad R wave with notching
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // Normal P wave
        const pStart = beatStart + pixelsPerMm * 2;
        const pHeight = amplitudeScale * 0.12;
        const pWidth = pixelsPerMm * 2.5;
        ctx.lineTo(pStart, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(pStart + t * pWidth, baselineY - pHeight * Math.sin(t * Math.PI));
        }

        // Normal PR interval
        const qrsStart = pStart + pWidth + pixelsPerMm * 3;
        ctx.lineTo(qrsStart, baselineY);

        // Wide QRS - LBBB V6 pattern (M-shaped with notched R wave)
        const qrsWidth = pixelsPerMm * 5; // Wide ≥120ms, more spacing
        const rHeight = amplitudeScale * 0.80;

        // No q wave in V6 with LBBB
        ctx.lineTo(qrsStart + qrsWidth * 0.05, baselineY);

        // M-shaped R wave - first peak
        ctx.lineTo(qrsStart + qrsWidth * 0.18, baselineY - rHeight * 0.70);

        // Notch (clear dip between peaks, stays above baseline)
        ctx.lineTo(qrsStart + qrsWidth * 0.30, baselineY - rHeight * 0.45);

        // Second peak (slightly taller)
        ctx.lineTo(qrsStart + qrsWidth * 0.45, baselineY - rHeight);
        ctx.lineTo(qrsStart + qrsWidth * 0.55, baselineY - rHeight * 0.85);

        // Smooth descent back to baseline
        ctx.lineTo(qrsStart + qrsWidth * 0.70, baselineY - rHeight * 0.3);
        ctx.lineTo(qrsStart + qrsWidth * 0.85, baselineY);

        // T wave in V6 for LBBB - upright (concordant in lateral leads)
        const tStart = qrsStart + qrsWidth + pixelsPerMm * 1;
        const tHeight = amplitudeScale * 0.18; // Upright T wave
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(tStart + t * pixelsPerMm * 4, baselineY - tHeight * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, baselineY);
      }
      ctx.stroke();
    } else if (waveformType === 'rbbb') {
      // RBBB: RSR' pattern in V1 (M-shaped "rabbit ears")
      // Classic V1 appearance: R, small S, then tall R'
      const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
      const numBeatsVisible = Math.ceil(width / ventricularIntervalPx) + 3;

      ctx.beginPath();
      ctx.moveTo(startBeat * ventricularIntervalPx - offset, baselineY);

      for (let i = 0; i < numBeatsVisible; i++) {
        const beat = startBeat + i;
        const beatStart = beat * ventricularIntervalPx - offset;
        const beatEnd = (beat + 1) * ventricularIntervalPx - offset;

        // Normal P wave
        const pStart = beatStart + pixelsPerMm * 2;
        const pHeight = amplitudeScale * 0.12;
        const pWidth = pixelsPerMm * 2.5;
        ctx.lineTo(pStart, baselineY);
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(pStart + t * pWidth, baselineY - pHeight * Math.sin(t * Math.PI));
        }

        // Normal PR interval
        const qrsStart = pStart + pWidth + pixelsPerMm * 3;
        ctx.lineTo(qrsStart, baselineY);

        // Wide QRS - RBBB RSR' pattern in V1
        // Classic M-shaped: R up, S down below baseline, R' up (taller)
        const qrsWidth = pixelsPerMm * 5; // Wide ≥120ms
        const rHeight = amplitudeScale * 0.45; // Initial R
        const sDepth = amplitudeScale * 0.20; // S wave goes below baseline
        const rPrimeHeight = amplitudeScale * 0.70; // Tall R' (the "prime")

        // Initial R wave
        ctx.lineTo(qrsStart + qrsWidth * 0.05, baselineY);
        ctx.lineTo(qrsStart + qrsWidth * 0.18, baselineY - rHeight);

        // S wave - smooth dip below baseline
        ctx.lineTo(qrsStart + qrsWidth * 0.30, baselineY + sDepth);

        // R' wave (second peak - taller, smooth curve up)
        ctx.lineTo(qrsStart + qrsWidth * 0.50, baselineY - rPrimeHeight);
        ctx.lineTo(qrsStart + qrsWidth * 0.62, baselineY - rPrimeHeight * 0.5);
        ctx.lineTo(qrsStart + qrsWidth * 0.75, baselineY);

        // ST segment (slight depression in V1)
        ctx.lineTo(qrsStart + qrsWidth + pixelsPerMm * 0.5, baselineY + amplitudeScale * 0.03);

        // T wave inverted in V1 (appropriate discordance) - smooth curve
        const tStart = qrsStart + qrsWidth + pixelsPerMm * 1.5;
        const tDepth = amplitudeScale * 0.12; // Inverted
        for (let t = 0; t <= 1; t += 0.1) {
          ctx.lineTo(tStart + t * pixelsPerMm * 3.5, baselineY + tDepth * Math.sin(t * Math.PI));
        }

        ctx.lineTo(beatEnd, baselineY);
      }
      ctx.stroke();
    }

    // Draw watermark - prominent branding for screenshots
    ctx.font = 'bold 16px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Mr. Pacemaker', width - 12, height - 10);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }, [
    waveformType, ventricularIntervalPx, atrialIntervalPx, baselineY, pixelsPerMm, width,
    drawSinusComplex, drawPWaveOnly, drawVentricularComplex, heartRate, atrialRate, amplitudeScale, speed
  ]);

  // Track QRS crossings and calculate rate from RR interval
  const lastQrsRef = useRef<number | null>(null);
  const detectionPoint = width * 0.3; // QRS detection point (30% from left)

  // Get which QRS beat number is at a given position for this waveform
  const getQrsBeatAtPosition = useCallback((offset: number): { beatNum: number, rrInterval: number } => {
    if (waveformType === 'nsr_pvc') {
      // Random PVC pattern: 3 NSR, PVC, 2 NSR, PVC, 4 NSR, PVC, 2 NSR, PVC
      const normalRR = ventricularIntervalPx;
      const pvcCoupling = ventricularIntervalPx * 0.5; // 150 bpm
      const compPause = ventricularIntervalPx * 1.15; // 65 bpm

      // Build the pattern intervals and RR values
      const nsrCounts = [3, 2, 4, 2];
      const intervals: number[] = [];
      const rrValues: number[] = [];
      for (const count of nsrCounts) {
        for (let i = 0; i < count; i++) {
          intervals.push(normalRR);
          rrValues.push(normalRR); // 75 bpm
        }
        intervals.push(pvcCoupling);
        rrValues.push(pvcCoupling); // 100 bpm (PVC)
        intervals.push(compPause);
        rrValues.push(compPause); // 60 bpm (comp pause)
      }

      const patternLength = intervals.reduce((a, b) => a + b, 0);
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      let cumulative = 0;
      for (let i = 0; i < intervals.length; i++) {
        cumulative += intervals[i];
        if (posInPattern < cumulative) {
          return { beatNum: i, rrInterval: rrValues[i] };
        }
      }
      return { beatNum: 0, rrInterval: normalRR };
    }
    else if (waveformType === 'nsr_pac') {
      // Pattern: Normal beat (1.0 RR) → PAC (0.75 RR) → pause (0.65 RR) = 2.4 total
      const normalRR = ventricularIntervalPx;
      const pacCoupling = ventricularIntervalPx * 0.75;
      const compensatoryPause = ventricularIntervalPx * 0.65;
      const patternLength = normalRR + pacCoupling + compensatoryPause;

      const patternNum = Math.floor(offset / patternLength);
      const posInPattern = offset % patternLength;

      // Beat 0: Normal sinus at position 0, RR = normal (75 bpm)
      // Beat 1: PAC at position normalRR, RR = pacCoupling (100 bpm)
      if (posInPattern >= normalRR) {
        // We're past the PAC - return PAC's shorter RR interval
        return { beatNum: patternNum * 2 + 1, rrInterval: pacCoupling };
      }
      // We're in the normal beat
      return { beatNum: patternNum * 2, rrInterval: normalRR };
    }
    else if (waveformType === 'afib_rvr' || waveformType === 'afib_slow' || waveformType === 'afib_nvr') {
      const irregularities = waveformType === 'afib_rvr'
        ? [0.75, 0.95, 0.7, 0.85, 1.0, 0.72, 0.88, 0.78]
        : waveformType === 'afib_nvr'
        ? [0.85, 1.1, 0.9, 1.05, 0.95, 1.15, 0.88, 1.12]
        : [0.7, 1.3, 0.8, 1.1, 1.4, 0.9, 1.2, 0.75];
      const patternLength = irregularities.reduce((a, b) => a + b, 0) * ventricularIntervalPx;
      const posInPattern = offset % patternLength;

      let cumulative = 0;
      for (let i = 0; i < irregularities.length; i++) {
        const nextPos = cumulative + irregularities[i] * ventricularIntervalPx;
        if (posInPattern < nextPos) {
          return { beatNum: i, rrInterval: irregularities[i] * ventricularIntervalPx };
        }
        cumulative = nextPos;
      }
      return { beatNum: 0, rrInterval: ventricularIntervalPx };
    }
    else if (waveformType === 'sinus_pause') {
      // Sinus pause: 4 normal beats, then pause (3.75× interval), then 1 beat resumes
      const pauseIntervals = 3.75;
      const patternLength = ventricularIntervalPx * (5 + pauseIntervals);
      // Same phase shift as drawing code so rate display matches visual
      const phaseShift = ventricularIntervalPx * (4 + pauseIntervals);
      const adjustedOffset = offset + phaseShift;
      const patternNum = Math.floor(adjustedOffset / patternLength);
      const posInPattern = adjustedOffset % patternLength;

      // beat1 at 0, beat2 at 1.0, beat3 at 2.0, beat4 at 3.0, pause at 4.0, beat5 at 4.0 + 3.75
      const beatPositions = [0, 1.0, 2.0, 3.0, 4.0, 4.0 + pauseIntervals];
      const rrIntervals = [1.0, 1.0, 1.0, 1.0, pauseIntervals, 1.0]; // 4 normal, pause, 1 normal

      for (let i = beatPositions.length - 1; i >= 0; i--) {
        if (posInPattern >= beatPositions[i] * ventricularIntervalPx) {
          return { beatNum: patternNum * 6 + i, rrInterval: rrIntervals[i] * ventricularIntervalPx };
        }
      }
      return { beatNum: patternNum * 6, rrInterval: ventricularIntervalPx };
    }
    else if (waveformType === 'sinus_arrest') {
      // Sinus arrest: exactly 2 missed cycles (2× normal R-R)
      const arrestIntervals = 2.0;
      const patternLength = ventricularIntervalPx * (3 + arrestIntervals);
      const patternNum = Math.floor(offset / patternLength);
      const posInPattern = offset % patternLength;

      // beat1 at 0, beat2 at 1.0, arrest starts at 2.0, beat3 at 2.0 + 2.0
      const beatPositions = [0, 1.0, 2.0, 2.0 + arrestIntervals];
      const rrIntervals = [1.0, 1.0, arrestIntervals, 1.0]; // Shows 55, 55, 27.5, 55 bpm

      for (let i = beatPositions.length - 1; i >= 0; i--) {
        if (posInPattern >= beatPositions[i] * ventricularIntervalPx) {
          return { beatNum: patternNum * 4 + i, rrInterval: rrIntervals[i] * ventricularIntervalPx };
        }
      }
      return { beatNum: patternNum * 4, rrInterval: ventricularIntervalPx };
    }
    else if (waveformType === 'sinus_arrhythmia') {
      // Pattern of 8 beats with subtle RR variation (shows rate like 68, 75, 82, etc.)
      const rrPattern = [0.92, 0.95, 1.0, 1.05, 1.08, 1.05, 1.0, 0.95]; // ±10% variation
      const cumulativeRR: number[] = [0];
      for (let i = 0; i < rrPattern.length; i++) {
        cumulativeRR.push(cumulativeRR[i] + rrPattern[i] * ventricularIntervalPx);
      }
      const patternLength = cumulativeRR[cumulativeRR.length - 1];

      const patternNum = Math.floor(offset / patternLength);
      const posInPattern = offset % patternLength;

      for (let i = rrPattern.length - 1; i >= 0; i--) {
        if (posInPattern >= cumulativeRR[i]) {
          return { beatNum: patternNum * 8 + i, rrInterval: rrPattern[i] * ventricularIntervalPx };
        }
      }
      return { beatNum: patternNum * 8, rrInterval: rrPattern[0] * ventricularIntervalPx };
    }
    else if (waveformType === 'v_bigeminy') {
      // Bigeminy: NSR → PVC (200ms after T wave) → comp pause
      // Pattern: 72 bpm (NSR), 144 bpm (PVC comes early), repeat
      const baseInterval = ventricularIntervalPx;
      const pvcQrsWidth = pixelsPerMm * 5;
      const pvcGap = pixelsPerMm * 5; // 200ms
      const rateScale = Math.min(1.0, Math.max(0.5, baseInterval / (pixelsPerMm * 20)));
      const sinusTEnd = pixelsPerMm * 0.5 + pixelsPerMm * 4 + pixelsPerMm * 2.5
        + pixelsPerMm * 2 * rateScale
        + Math.max(pixelsPerMm * 3, pixelsPerMm * 4 * rateScale);
      const pvcStart = sinusTEnd + pvcGap;
      const pvcVisualLen = pvcQrsWidth + pixelsPerMm * 0.3 + pixelsPerMm * 5;
      const patternLength = pvcStart + pvcVisualLen + pixelsPerMm * 6;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      if (posInPattern >= pvcStart) {
        return { beatNum: 1, rrInterval: baseInterval * 0.5 }; // 144 bpm for PVC
      }
      return { beatNum: 0, rrInterval: baseInterval }; // 72 bpm for NSR
    }
    else if (waveformType === 'v_trigeminy') {
      // Trigeminy: NSR → NSR → PVC (200ms after NSR #2 T wave) → comp pause
      // Pattern: 72 bpm (NSR), 72 bpm (NSR), 144 bpm (PVC), repeat
      const baseInterval = ventricularIntervalPx;
      const pvcQrsWidth = pixelsPerMm * 5;
      const pvcGap = pixelsPerMm * 5; // 200ms
      const rateScale = Math.min(1.0, Math.max(0.5, baseInterval / (pixelsPerMm * 20)));
      const sinusTEnd = pixelsPerMm * 0.5 + pixelsPerMm * 4 + pixelsPerMm * 2.5
        + pixelsPerMm * 2 * rateScale
        + Math.max(pixelsPerMm * 3, pixelsPerMm * 4 * rateScale);
      const nsr2TEnd = baseInterval + sinusTEnd;
      const pvcStart = nsr2TEnd + pvcGap;
      const pvcVisualLen = pvcQrsWidth + pixelsPerMm * 0.3 + pixelsPerMm * 5;
      const patternLength = pvcStart + pvcVisualLen + pixelsPerMm * 6;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      if (posInPattern >= pvcStart) {
        return { beatNum: 2, rrInterval: baseInterval * 0.5 }; // 144 bpm for PVC
      } else if (posInPattern >= baseInterval) {
        return { beatNum: 1, rrInterval: baseInterval }; // 72 bpm for NSR
      }
      return { beatNum: 0, rrInterval: baseInterval }; // 72 bpm for NSR
    }
    else if (waveformType === 'mobitz1') {
      // Mobitz I (Wenckebach): Progressive PR prolongation, then dropped beat
      // 4:3 pattern - 75 bpm for conducted beats, 35 bpm for dropped beat
      const cycleLength = atrialIntervalPx * 4;
      const posInCycle = ((offset % cycleLength) + cycleLength) % cycleLength;

      // Show 75 bpm for conducted beats, 35 bpm for dropped beat
      // 35 bpm = 75 bpm * (75/35) ratio = 2.14x longer interval
      if (posInCycle >= atrialIntervalPx * 3) {
        return { beatNum: 3, rrInterval: atrialIntervalPx * 2.14 }; // Dropped beat - 35 bpm
      }
      // All conducted beats show 75 bpm
      return { beatNum: Math.floor(posInCycle / atrialIntervalPx), rrInterval: atrialIntervalPx };
    }
    else if (waveformType === 'mobitz2') {
      // Mobitz II: 3:2 conduction - show ~70s for conducted, ~35 for dropped
      const cycleLength = atrialIntervalPx * 3;
      const posInCycle = ((offset % cycleLength) + cycleLength) % cycleLength;

      // During dropped beat (3rd P wave area) - show pause rate
      if (posInCycle >= atrialIntervalPx * 2) {
        return { beatNum: 2, rrInterval: atrialIntervalPx * 2 }; // ~35 bpm pause
      }
      // Conducted beats show underlying atrial rate (~70 bpm)
      return { beatNum: Math.floor(posInCycle / atrialIntervalPx), rrInterval: atrialIntervalPx };
    }
    else if (waveformType === 'block_2to1') {
      // 2:1 block: QRS every 2 atrial intervals
      // With atrial rate ~85 bpm, ventricular rate ~42 bpm
      const cycleLength = atrialIntervalPx * 2;
      const beatNum = Math.floor(offset / cycleLength);
      return { beatNum, rrInterval: cycleLength }; // Shows ~42 bpm with 85 bpm atrial rate
    }
    else if (waveformType === 'wap') {
      // WAP: Irregular rhythm with varying R-R intervals (~65-80 bpm range)
      const rrVariations = [0.92, 1.08, 0.95, 1.05, 0.88, 1.1];
      const patternLength = rrVariations.reduce((a, b) => a + b, 0) * ventricularIntervalPx;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      let cumulative = 0;
      for (let i = 0; i < rrVariations.length; i++) {
        const nextPos = cumulative + rrVariations[i] * ventricularIntervalPx;
        if (posInPattern < nextPos) {
          return { beatNum: i, rrInterval: rrVariations[i] * ventricularIntervalPx };
        }
        cumulative = nextPos;
      }
      return { beatNum: 0, rrInterval: ventricularIntervalPx };
    }
    else if (waveformType === 'mat') {
      // MAT: Irregularly irregular with R-R variation (~105-125 bpm range)
      const rrVariations = [0.95, 1.1, 0.85, 1.0, 0.9, 1.05];
      const patternLength = rrVariations.reduce((a, b) => a + b, 0) * ventricularIntervalPx;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      let cumulative = 0;
      for (let i = 0; i < rrVariations.length; i++) {
        const nextPos = cumulative + rrVariations[i] * ventricularIntervalPx;
        if (posInPattern < nextPos) {
          return { beatNum: i, rrInterval: rrVariations[i] * ventricularIntervalPx };
        }
        cumulative = nextPos;
      }
      return { beatNum: 0, rrInterval: ventricularIntervalPx };
    }
    else if (waveformType === 'nsr_pjc') {
      // NSR with PJC: Pattern = beat1 (72 bpm), beat2 shortened, PJC (90 bpm R-R), pause, beat4
      // Pattern: 1.0 + 0.8 + 0.8 + 1.0 + 1.0 = 4.6 intervals
      const pjcRatio = 72 / 90;  // ~0.8
      const patternLength = ventricularIntervalPx * 4;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      // Beat positions in pattern
      const beat1End = ventricularIntervalPx;
      const pjcEnd = beat1End + ventricularIntervalPx * pjcRatio + ventricularIntervalPx * 0.6;
      const beat4Start = ventricularIntervalPx * 3;

      if (posInPattern >= beat4Start) {
        return { beatNum: 3, rrInterval: ventricularIntervalPx };  // 72 bpm
      } else if (posInPattern >= pjcEnd - ventricularIntervalPx * 0.5) {
        return { beatNum: 2, rrInterval: ventricularIntervalPx * pjcRatio };  // 90 bpm (PJC)
      } else if (posInPattern >= beat1End) {
        return { beatNum: 1, rrInterval: ventricularIntervalPx };  // 72 bpm
      }
      return { beatNum: 0, rrInterval: ventricularIntervalPx };  // 72 bpm
    }
    else if (waveformType === 'blocked_pac') {
      // Blocked PAC: 2 normal beats, blocked P (no QRS), long pause, beat 4
      // Pattern: 1.0 + 1.0 + 2.5 = 4.5 intervals (extended pause gives ~30 bpm R-R)
      const patternLength = ventricularIntervalPx * 4.5;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      const beat1End = ventricularIntervalPx;
      const beat2End = ventricularIntervalPx * 2;
      const beat4Start = ventricularIntervalPx * 3.5;

      if (posInPattern >= beat4Start) {
        return { beatNum: 3, rrInterval: ventricularIntervalPx };  // 75 bpm (normal)
      } else if (posInPattern >= beat2End) {
        // During the pause - R-R from beat 2 to beat 4 = 2.5 intervals = ~30 bpm
        return { beatNum: 2, rrInterval: ventricularIntervalPx * 2.5 };  // 30 bpm
      } else if (posInPattern >= beat1End) {
        return { beatNum: 1, rrInterval: ventricularIntervalPx };  // 75 bpm
      }
      return { beatNum: 0, rrInterval: ventricularIntervalPx };  // 75 bpm
    }
    else if (waveformType === 'couplet') {
      // Ventricular Couplet: NSR, NSR, PVC, PVC (short coupling), then pause
      const normalRR = ventricularIntervalPx;
      const pvcCoupling = ventricularIntervalPx * 0.5;  // ~150 bpm between PVCs
      const patternLength = normalRR * 2 + pvcCoupling * 2 + normalRR * 0.5;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      if (posInPattern >= normalRR * 2 + pvcCoupling) {
        return { beatNum: 3, rrInterval: pvcCoupling };  // 2nd PVC - fast
      } else if (posInPattern >= normalRR * 2) {
        return { beatNum: 2, rrInterval: pvcCoupling };  // 1st PVC - fast
      } else if (posInPattern >= normalRR) {
        return { beatNum: 1, rrInterval: normalRR };  // Normal
      }
      return { beatNum: 0, rrInterval: normalRR };  // Normal
    }
    else if (waveformType === 'nsvt') {
      // NSVT: 3 NSR at 72 bpm, then 8 VT beats at 220 bpm, then 2 NSR
      // 72 bpm = 20.83mm, 220 bpm = 6.8mm at 25mm/s
      const nsrRR = pixelsPerMm * (60 / 72) * speed;  // 72 bpm
      const vtRR = pixelsPerMm * (60 / 220) * speed;   // 220 bpm
      const patternLength = nsrRR * 3 + vtRR * 8 + pixelsPerMm * 2 + nsrRR * 2;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      const vtStart = nsrRR * 3;
      const vtEnd = vtStart + vtRR * 8;
      const postPause = vtEnd + pixelsPerMm * 2;

      if (posInPattern >= postPause) {
        return { beatNum: 7, rrInterval: nsrRR };  // Back to NSR (72 bpm)
      } else if (posInPattern >= vtStart) {
        return { beatNum: 3 + Math.floor((posInPattern - vtStart) / vtRR), rrInterval: vtRR };  // VT (220 bpm)
      } else if (posInPattern >= nsrRR * 2) {
        return { beatNum: 2, rrInterval: nsrRR };  // NSR (72 bpm)
      } else if (posInPattern >= nsrRR) {
        return { beatNum: 1, rrInterval: nsrRR };  // NSR (72 bpm)
      }
      return { beatNum: 0, rrInterval: nsrRR };  // NSR (72 bpm)
    }
    else if (waveformType === 'vfib') {
      // VFib: Chaotic, irregular ~250-350 bpm range
      // Use pseudo-random variation based on position for dynamic display
      const baseRR = pixelsPerMm * 5;  // ~300 bpm base
      const beatNum = Math.floor(offset / baseRR);
      // Vary between 250-350 bpm (4.3mm to 6mm)
      const variation = 0.85 + 0.3 * Math.sin(offset * 0.1);
      const dynamicRR = baseRR * variation;
      return { beatNum, rrInterval: dynamicRR };
    }
    else if (waveformType === 'torsades') {
      // Torsades: Polymorphic VT, ~240 bpm (4 beats per second)
      const baseRR = pixelsPerMm * (60 / 240) * speed;  // 240 bpm base
      const beatNum = Math.floor(offset / baseRR);
      // Slight variation 200-250 bpm
      const variation = 0.9 + 0.2 * Math.sin(offset * 0.03);
      const dynamicRR = baseRR * variation;
      return { beatNum, rrInterval: dynamicRR };
    }
    else if (waveformType === 'asystole') {
      // Asystole: No beats, show 0 bpm
      return { beatNum: 0, rrInterval: ventricularIntervalPx * 100 };  // Very long = ~0 bpm
    }
    else if (waveformType === 'chb') {
      // Complete Heart Block: Ventricular escape rhythm at 30-40 bpm
      // P waves march through independently, but QRS rate is what we show
      const escapeRR = atrialIntervalPx ? atrialIntervalPx * 2.5 : ventricularIntervalPx * 2;  // ~30-35 bpm
      const beatNum = Math.floor(offset / escapeRR);
      return { beatNum, rrInterval: escapeRR };
    }
    else if (waveformType === 'failure_capture_v') {
      // V failure to capture: Failed spikes with long pause to escape - 13 bpm
      // 13 bpm = 60/13 = 4.6 sec = 115mm at 25mm/s
      const escapeRR = pixelsPerMm * 115;  // ~13 bpm
      const beatNum = Math.floor(offset / escapeRR);
      return { beatNum, rrInterval: escapeRR };
    }
    else if (waveformType === 'failure_capture_a') {
      // A failure to capture: A spikes fail but V pacing intact
      const beatNum = Math.floor(offset / ventricularIntervalPx);
      return { beatNum, rrInterval: ventricularIntervalPx };
    }
    else if (waveformType === 'undersensing_v' || waveformType === 'undersensing_a') {
      // Undersensing: Pacemaker fires too soon (doesn't see native beat)
      const patternLength = ventricularIntervalPx * 3;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      if (posInPattern >= ventricularIntervalPx * 2) {
        return { beatNum: 2, rrInterval: ventricularIntervalPx * 0.7 };  // Short interval (undersensed)
      } else if (posInPattern >= ventricularIntervalPx) {
        return { beatNum: 1, rrInterval: ventricularIntervalPx };
      }
      return { beatNum: 0, rrInterval: ventricularIntervalPx };
    }
    else if (waveformType === 'oversensing_a') {
      // A Oversensing: Normal paced at 72 bpm, then junctional escape at ~55 bpm
      const normalRR = pixelsPerMm * (60 / 72) * speed;  // 72 bpm
      const junctionalRR = pixelsPerMm * (60 / 55) * speed;  // 55 bpm junctional escape
      const patternLength = normalRR + junctionalRR * 2; // 1 normal + 2 junctional
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;
      const beatNum = Math.floor(offset / junctionalRR);
      if (posInPattern < normalRR) {
        return { beatNum, rrInterval: normalRR };  // Normal paced (72 bpm)
      }
      return { beatNum, rrInterval: junctionalRR };  // Junctional escape (55 bpm)
    }
    else if (waveformType === 'oversensing_v') {
      // V Oversensing: Pauses due to T wave oversensing
      const patternLength = ventricularIntervalPx * 4;
      const posInPattern = ((offset % patternLength) + patternLength) % patternLength;

      if (posInPattern >= ventricularIntervalPx * 3) {
        return { beatNum: 2, rrInterval: ventricularIntervalPx };
      } else if (posInPattern >= ventricularIntervalPx) {
        return { beatNum: 1, rrInterval: ventricularIntervalPx * 2 };  // Long pause (inhibited)
      }
      return { beatNum: 0, rrInterval: ventricularIntervalPx };
    }
    // Regular rhythms
    const beatNum = Math.floor(offset / ventricularIntervalPx);
    return { beatNum, rrInterval: ventricularIntervalPx };
  }, [waveformType, ventricularIntervalPx, atrialIntervalPx]);

  // Calculate HR from RR interval in pixels
  const rrToHR = useCallback((rrPx: number): number => {
    const rrSeconds = rrPx / (speed * pixelsPerMm);
    return rrSeconds > 0 ? Math.round(60 / rrSeconds) : 0;
  }, [speed, pixelsPerMm]);

  // Draw caliper markers on the canvas
  const drawCalipers = useCallback((ctx: CanvasRenderingContext2D) => {
    const markers = caliperMarkersRef.current;
    if (!caliperMode || markers.length === 0) return;

    ctx.save();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    for (const x of markers) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    if (markers.length === 2) {
      const x1 = Math.min(markers[0], markers[1]);
      const x2 = Math.max(markers[0], markers[1]);
      const midX = (x1 + x2) / 2;

      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, 24);
      ctx.lineTo(x2, 24);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x1, 16);
      ctx.lineTo(x1, 32);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, 16);
      ctx.lineTo(x2, 32);
      ctx.stroke();

      const distPx = x2 - x1;
      const distMm = distPx / pixelsPerMm;
      const distSec = distMm / speed;
      const ms = Math.round(distSec * 1000);
      const bpm = distSec > 0 ? Math.round(60 / distSec) : 0;

      const text = `${ms} ms  |  ${bpm} bpm`;
      ctx.font = 'bold 13px monospace';
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(midX - tw / 2 - 8, 6, tw + 16, 22);

      ctx.fillStyle = '#00e5ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, midX, 17);
    }

    ctx.restore();
  }, [caliperMode, height, pixelsPerMm, speed]);

  // Handle caliper click on canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!caliperMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;

    if (caliperMarkersRef.current.length >= 2) {
      caliperMarkersRef.current = [x];
    } else {
      caliperMarkersRef.current = [...caliperMarkersRef.current, x];
    }
    setCaliperMarkerCount(caliperMarkersRef.current.length);

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawGrid(ctx);
      drawWaveform(ctx, offsetRef.current);
      drawCalipers(ctx);
    }
  }, [caliperMode, width, drawGrid, drawWaveform, drawCalipers, dpr]);

  // Reset calipers when rhythm or caliper mode changes
  useEffect(() => {
    caliperMarkersRef.current = [];
    setCaliperMarkerCount(0);
  }, [waveformType, caliperMode]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    const pixelsPerMs = (speed * pixelsPerMm) / 1000;
    offsetRef.current += delta * pixelsPerMs;

    // Check if a new QRS has crossed the detection point
    const qrsAtDetection = getQrsBeatAtPosition(offsetRef.current + detectionPoint);
    if (lastQrsRef.current !== qrsAtDetection.beatNum) {
      // New QRS crossed - update HR based on RR interval
      lastQrsRef.current = qrsAtDetection.beatNum;
      setDisplayRate(rrToHR(qrsAtDetection.rrInterval));
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGrid(ctx);
    drawWaveform(ctx, offsetRef.current);
    drawCalipers(ctx);

    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [speed, pixelsPerMm, drawGrid, drawWaveform, drawCalipers, isRunning, getQrsBeatAtPosition, rrToHR, detectionPoint, dpr]);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, animate]);

  // Clear grid cache when dimensions or DPI change
  useEffect(() => {
    gridCanvasRef.current = null;
  }, [width, height, pixelsPerMm, dpr]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGrid(ctx);
    drawWaveform(ctx, offsetRef.current);
    drawCalipers(ctx);
  }, [drawGrid, drawWaveform, drawCalipers, dpr]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        width={width * dpr}
        height={height * dpr}
        className="border border-gray-300 rounded-lg shadow-md"
        style={{ width: responsive ? '100%' : `${width}px`, maxWidth: '100%', height: 'auto', cursor: caliperMode ? 'crosshair' : 'default' }}
        onClick={handleCanvasClick}
      />
      {showOverlays && (
        <>
          <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {leadLabel}
          </div>
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {speed} mm/sec | <span className="font-mono">{displayRate}</span> bpm
          </div>
        </>
      )}
    </div>
  );
}
