'use client';

import { useState } from 'react';
import Link from "next/link"
import RhythmStrip from './components/RhythmStrip';

const PREVIEW_RHYTHMS = [
  { name: 'Normal Sinus Rhythm', waveform: 'sinus' as const, rate: 72, description: 'Regular rhythm, 60-100 bpm' },
  { name: 'Sinus Bradycardia', waveform: 'sinus' as const, rate: 45, description: 'Regular rhythm, < 60 bpm' },
  { name: 'Mobitz Type I (Wenckebach)', waveform: 'mobitz1' as const, rate: 55, atrialRate: 75, description: 'Progressive PR prolongation, dropped beat' },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const rhythm = PREVIEW_RHYTHMS[currentSlide];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5">
          <div className="flex justify-between items-center h-14">
            <span className="text-base font-semibold tracking-tight">Live ECG Vault <span className="text-slate-500 font-normal">by Mr Pacemaker</span></span>
            <div className="flex items-center gap-4">
              <Link
                href="/about"
                className="text-slate-400 text-sm hover:text-white transition"
              >
                About
              </Link>
              <Link
                href="/rhythms"
                className="bg-white text-slate-900 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
              >
                Open App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero — left-aligned, compact */}
      <section className="max-w-3xl mx-auto px-5 pt-6 pb-6">
        <p className="text-emerald-400 text-sm font-medium mb-2">49 animated rhythms &middot; Free</p>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] mb-3">
          Learn ECG rhythms<br />
          with live strips.
        </h1>

        <p className="text-slate-400 text-base leading-relaxed mb-5 max-w-md">
          Interactive rhythm strips at clinical speed. Quiz yourself, analyze patterns, and build confidence.
        </p>

        <Link
          href="/rhythms"
          className="inline-block bg-emerald-500 text-white text-base px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25"
        >
          Start practicing
        </Link>
      </section>

      {/* ECG Carousel */}
      <section className="max-w-3xl mx-auto px-5 pb-8">
        <div className="bg-slate-800 rounded-xl border border-white/5 p-4">
          <div className="rounded-lg overflow-hidden">
            <RhythmStrip
              key={currentSlide}
              waveformType={rhythm.waveform}
              heartRate={rhythm.rate}
              atrialRate={rhythm.atrialRate}
              height={150}
              width={600}
              speed={25}
              pixelsPerMm={4}
              showOverlays={false}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-emerald-400 text-xs font-medium">{rhythm.name} &middot; {rhythm.rate} bpm &middot; 25 mm/sec</p>
              <p className="text-slate-500 text-xs mt-0.5">{rhythm.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + PREVIEW_RHYTHMS.length) % PREVIEW_RHYTHMS.length)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Previous rhythm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % PREVIEW_RHYTHMS.length)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Next rhythm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {PREVIEW_RHYTHMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-1.5 h-1.5 rounded-full transition ${i === currentSlide ? 'bg-emerald-400' : 'bg-white/15'}`}
                aria-label={`Go to rhythm ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* What you get — stacked list, not grid */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <h2 className="text-lg font-semibold mb-5 text-slate-300">Three modes</h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Learn</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Animated strips at 25 mm/sec with clinical explanations and pacing indications.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Quiz</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Identify rhythms with multiple-choice questions and instant feedback.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Analyze</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Systematic interpretation — rate, regularity, P waves, PR interval, QRS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Rhythm count — simple two-column list */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <h2 className="text-lg font-semibold mb-5 text-slate-300">What&apos;s included</h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {[
            ['Sinus Rhythms', '6'],
            ['AV Blocks', '5'],
            ['Atrial', '8'],
            ['Junctional', '4'],
            ['Ventricular', '8'],
            ['Ectopy', '6'],
            ['Paced & Malfunctions', '9'],
            ['Conduction', '3'],
          ].map(([name, count]) => (
            <div key={name} className="flex justify-between items-baseline">
              <span className="text-slate-300">{name}</span>
              <span className="text-slate-600 font-mono text-xs">{count}</span>
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs mt-6">Sinus, atrial, junctional, ventricular, paced, blocks, ectopy, conduction abnormalities.</p>
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Audience */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-300">Built for</h2>
        <div className="flex flex-wrap gap-2">
          {['Nursing Students', 'Paramedics', 'Medical Students', 'Device Reps', 'EP Fellows', 'Tele Techs'].map((role) => (
            <span key={role} className="bg-white/5 text-slate-400 text-sm px-3 py-1.5 rounded-lg border border-white/5">
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-bold mb-3">Ready?</h2>
        <p className="text-slate-400 text-sm mb-6">No account needed. Just open and start.</p>
        <Link
          href="/rhythms"
          className="inline-block bg-white text-slate-900 text-base px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition"
        >
          Launch ECG Vault
        </Link>
      </section>

      {/* Disclaimer */}
      <div className="border-t border-white/5" />
      <section className="max-w-3xl mx-auto px-5 py-6">
        <p className="text-slate-600 text-xs leading-relaxed">
          <span className="text-amber-500/80 font-medium">Disclaimer:</span> Live ECG Vault is for educational purposes only. Not a substitute for professional medical education or clinical judgment. Always follow institutional protocols.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-5">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <span className="text-slate-600 text-xs">Mr Pacemaker LLC</span>
          <span className="text-slate-700 text-xs">&copy; 2026</span>
        </div>
      </footer>
    </div>
  )
}
