'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// Animated ECG Strip Component
function ECGStrip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const pixelsPerMm = 3;
    const speed = 25;
    const bpm = 72;
    const rrInterval = pixelsPerMm * (60 / bpm) * speed;

    const baselineY = height * 0.55;
    const amplitudeScale = height * 0.35;

    const pWidth = pixelsPerMm * 2.5;
    const prInterval = pixelsPerMm * 4;
    const qrsWidth = pixelsPerMm * 2.5;
    const tWidth = pixelsPerMm * 4;
    const stSegment = pixelsPerMm * 2;

    const pHeight = amplitudeScale * 0.15;
    const qDepth = amplitudeScale * 0.1;
    const rHeight = amplitudeScale * 1.0;
    const sDepth = amplitudeScale * 0.2;
    const tHeight = amplitudeScale * 0.18;

    let offset = 0;
    const scrollSpeed = pixelsPerMm * speed / 60;
    let animationId: number;

    function drawBeat(startX: number, prLengthening: number = 0): number {
      const adjustedPrInterval = prInterval + prLengthening;
      const pStartX = startX + pixelsPerMm * 0.5;
      const pEndX = pStartX + pWidth;
      const qrsStartX = pStartX + adjustedPrInterval;
      const qrsEndX = qrsStartX + qrsWidth;
      const stEndX = qrsEndX + stSegment;
      const tEndX = stEndX + tWidth;

      ctx!.lineTo(pStartX, baselineY);

      for (let t = 0; t <= 1; t += 0.1) {
        const x = pStartX + t * pWidth;
        const y = baselineY - pHeight * Math.pow(Math.sin(t * Math.PI), 1.3);
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(pEndX, baselineY);
      ctx!.lineTo(qrsStartX, baselineY);

      const qWidthPx = qrsWidth * 0.15;
      ctx!.lineTo(qrsStartX + qWidthPx * 0.5, baselineY + qDepth);

      const rPeakX = qrsStartX + qrsWidth * 0.35;
      ctx!.lineTo(rPeakX, baselineY - rHeight);

      const sX = qrsStartX + qrsWidth * 0.55;
      ctx!.lineTo(sX, baselineY + sDepth);
      ctx!.lineTo(qrsEndX, baselineY);
      ctx!.lineTo(stEndX, baselineY);

      for (let t = 0; t <= 1; t += 0.05) {
        const x = stEndX + t * tWidth;
        const y = baselineY - tHeight * Math.sin(t * Math.PI);
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(tEndX, baselineY);
      ctx!.lineTo(startX + rrInterval, baselineY);

      return startX + rrInterval;
    }

    function draw() {
      ctx!.fillStyle = '#fdf2f2';
      ctx!.fillRect(0, 0, width, height);

      // Grid
      ctx!.strokeStyle = 'rgba(252, 165, 165, 0.3)';
      ctx!.lineWidth = 0.5;
      for (let x = 0; x < width; x += pixelsPerMm) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
      for (let y = 0; y < height; y += pixelsPerMm) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }

      // Bold grid every 5mm
      ctx!.strokeStyle = 'rgba(252, 165, 165, 0.5)';
      ctx!.lineWidth = 1;
      for (let x = 0; x < width; x += pixelsPerMm * 5) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
      for (let y = 0; y < height; y += pixelsPerMm * 5) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }

      // ECG trace - Wenckebach pattern
      ctx!.strokeStyle = '#1e293b';
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.moveTo(0 - offset, baselineY);

      let x = -offset;
      let beatCount = 0;
      const prLengthenings = [0, 8, 16, 24]; // Progressive PR lengthening

      while (x < width + rrInterval * 2) {
        const cyclePosition = beatCount % 5;
        if (cyclePosition < 4) {
          x = drawBeat(x, prLengthenings[cyclePosition]);
        } else {
          // Dropped beat - just P wave, no QRS
          const pStartX = x + pixelsPerMm * 0.5;
          ctx!.lineTo(pStartX, baselineY);
          for (let t = 0; t <= 1; t += 0.1) {
            const px = pStartX + t * pWidth;
            const py = baselineY - pHeight * Math.pow(Math.sin(t * Math.PI), 1.3);
            ctx!.lineTo(px, py);
          }
          ctx!.lineTo(pStartX + pWidth, baselineY);
          ctx!.lineTo(x + rrInterval, baselineY);
          x += rrInterval;
        }
        beatCount++;
      }
      ctx!.stroke();

      offset += scrollSpeed;
      if (offset > rrInterval * 5) offset -= rrInterval * 5;

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={150}
      className="w-full rounded-lg"
    />
  );
}

export default function ECGLandingPage() {
  const [currentSlide, setCurrentSlide] = useState(2);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">ECG Rhythm Library</span>
            <span className="text-slate-400">by Mr Pacemaker</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-slate-400 hover:text-white text-sm">
              About
            </Link>
            <Link
              href="/rhythms"
              className="border border-slate-600 hover:border-slate-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Badge */}
        <div className="mb-6">
          <span className="text-emerald-400 text-sm font-medium">
            49 animated rhythms · 3 Free · Full access $19
          </span>
        </div>

        {/* Hero */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
          Learn ECG rhythms<br />
          with live strips.
        </h1>
        <p className="text-slate-400 text-lg mb-8 max-w-xl">
          Interactive rhythm strips at clinical speed. Quiz yourself, analyze patterns, and build confidence.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-12">
          <Link
            href="/rhythms"
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Try free rhythms
          </Link>
          <Link
            href="/rhythms"
            className="border border-slate-600 hover:border-slate-500 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Subscribe $9.99/mo
          </Link>
        </div>

        {/* ECG Strip Preview */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-16">
          <div className="relative">
            <ECGStrip />
            <div className="absolute bottom-2 right-3 text-slate-400 text-sm">
              Mr. Pacemaker
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-emerald-400 font-medium">Mobitz Type I (Wenckebach)</div>
              <div className="text-slate-500 text-sm">Progressive PR prolongation, dropped beat</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentSlide ? 'bg-emerald-400' : 'bg-slate-600'}`}
              />
            ))}
          </div>
        </div>

        {/* Three Modes */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-8">Three modes</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Learn</h3>
                <p className="text-slate-400 text-sm">Animated strips at 25 mm/sec with clinical explanations and pacing indications.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Quiz</h3>
                <p className="text-slate-400 text-sm">Identify rhythms with multiple-choice questions and instant feedback.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Analyze</h3>
                <p className="text-slate-400 text-sm">Systematic interpretation — rate, regularity, P waves, PR interval, QRS.</p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-8">What's included</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            <div className="flex justify-between">
              <span>Sinus Rhythms</span>
              <span className="text-slate-500">6</span>
            </div>
            <div className="flex justify-between">
              <span>AV Blocks</span>
              <span className="text-slate-500">5</span>
            </div>
            <div className="flex justify-between">
              <span>Atrial</span>
              <span className="text-slate-500">8</span>
            </div>
            <div className="flex justify-between">
              <span>Junctional</span>
              <span className="text-slate-500">4</span>
            </div>
            <div className="flex justify-between">
              <span>Ventricular</span>
              <span className="text-slate-500">8</span>
            </div>
            <div className="flex justify-between">
              <span>Ectopy</span>
              <span className="text-slate-500">6</span>
            </div>
            <div className="flex justify-between">
              <span>Paced & Malfunctions</span>
              <span className="text-slate-500">9</span>
            </div>
            <div className="flex justify-between">
              <span>Conduction</span>
              <span className="text-slate-500">3</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            Sinus, atrial, junctional, ventricular, paced, blocks, ectopy, conduction abnormalities.
          </p>
        </section>

        {/* Built For */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Built for</h2>
          <div className="flex flex-wrap gap-3">
            {['Nursing Students', 'Paramedics', 'Medical Students', 'Device Reps', 'EP Fellows', 'Tele Techs'].map((audience) => (
              <span
                key={audience}
                className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full text-sm border border-slate-700"
              >
                {audience}
              </span>
            ))}
          </div>
        </section>

        {/* Ready CTA */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Ready?</h2>
          <p className="text-slate-400 mb-6">Try 3 rhythms free. Unlock all 49 for $19.</p>
          <Link
            href="/rhythms"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Launch ECG Rhythm Library
          </Link>
        </section>

        {/* Disclaimer */}
        <p className="text-slate-600 text-xs border-t border-slate-800 pt-8">
          Disclaimer: ECG Rhythm Library is for educational purposes only. Not a substitute for professional medical education or clinical judgment. Always follow institutional protocols.
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">Mr Pacemaker LLC</p>
          <p className="text-slate-600 text-xs">© 2026</p>
        </div>
      </footer>
    </div>
  );
}
