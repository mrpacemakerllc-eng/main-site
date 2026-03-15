'use client';

import Link from 'next/link';
import { useState } from 'react';
import RhythmStrip from '../components/RhythmStrip';

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
            Get Full Access — $19
          </Link>
        </div>

        {/* ECG Strip Preview */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-16">
          <div className="relative rounded-lg overflow-hidden">
            <RhythmStrip
              waveformType="mobitz1"
              heartRate={75}
              isRunning={true}
              height={180}
              width={700}
              responsive={true}
              showOverlays={false}
            />
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
