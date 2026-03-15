'use client';

import Link from 'next/link';
import { useState } from 'react';
import RhythmStrip from '../components/RhythmStrip';
import { WaveformType } from '../data/rhythms';

const previewRhythms: { waveformType: WaveformType; heartRate: number; title: string; description: string }[] = [
  {
    waveformType: 'sinus',
    heartRate: 75,
    title: 'Normal Sinus Rhythm',
    description: 'Regular rhythm, P before every QRS, rate 60-100',
  },
  {
    waveformType: 'sinus',
    heartRate: 45,
    title: 'Sinus Bradycardia',
    description: 'Regular sinus rhythm, rate < 50 bpm',
  },
  {
    waveformType: 'mobitz1',
    heartRate: 75,
    title: 'Mobitz Type I (Wenckebach)',
    description: 'Progressive PR prolongation, dropped beat',
  },
];

export default function ECGLandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? previewRhythms.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === previewRhythms.length - 1 ? 0 : prev + 1));
  };

  const currentRhythm = previewRhythms[currentSlide];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-bold text-sm sm:text-base">ECG Rhythm Library</span>
            <span className="text-slate-400 text-sm hidden sm:inline">by Mr Pacemaker</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/about" className="text-slate-400 hover:text-white text-sm hidden sm:inline">
              About
            </Link>
            <Link
              href="/rhythms"
              className="border border-slate-600 hover:border-slate-500 text-white px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Badge */}
        <div className="mb-4 sm:mb-6">
          <span className="text-emerald-400 text-xs sm:text-sm font-medium">
            49 animated rhythms · 3 Free · Full access $19
          </span>
        </div>

        {/* Hero */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
          Learn ECG rhythms<br />
          with live strips.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl">
          Interactive rhythm strips at clinical speed. Quiz yourself, analyze patterns, and build confidence.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Link
            href="/rhythms"
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-lg font-semibold transition text-center"
          >
            Try free rhythms
          </Link>
          <Link
            href="/rhythms?purchase=true"
            className="border border-slate-600 hover:border-slate-500 text-white px-6 py-3 rounded-lg font-semibold transition text-center"
          >
            Get Full Access — $19
          </Link>
        </div>

        {/* ECG Strip Preview */}
        <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-12 sm:mb-16">
          <div className="relative rounded-lg overflow-hidden">
            <RhythmStrip
              key={currentSlide}
              waveformType={currentRhythm.waveformType}
              heartRate={currentRhythm.heartRate}
              isRunning={true}
              height={200}
              width={800}
              speed={25}
              pixelsPerMm={4}
              responsive={true}
              showOverlays={false}
            />
          </div>
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-emerald-400 font-medium text-sm sm:text-base">{currentRhythm.title}</div>
              <div className="text-slate-500 text-xs sm:text-sm">{currentRhythm.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-3 sm:mt-4">
            {previewRhythms.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition ${i === currentSlide ? 'bg-emerald-400' : 'bg-slate-600 hover:bg-slate-500'}`}
              />
            ))}
          </div>
        </div>

        {/* Three Modes */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8">Three modes</h2>
          <div className="space-y-5 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Learn</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Animated strips at 25 mm/sec with clinical explanations and pacing indications.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Quiz</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Identify rhythms with multiple-choice questions and instant feedback.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Analyze</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Systematic interpretation — rate, regularity, P waves, PR interval, QRS.</p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8">What's included</h2>
          <div className="grid grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-2 sm:gap-y-3 text-xs sm:text-sm">
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
          <p className="text-slate-500 text-xs sm:text-sm mt-4 sm:mt-6">
            Sinus, atrial, junctional, ventricular, paced, blocks, ectopy, conduction abnormalities.
          </p>
        </section>

        {/* Built For */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Built for</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {['Nursing Students', 'Paramedics', 'Medical Students', 'Device Reps', 'EP Fellows', 'Tele Techs'].map((audience) => (
              <span
                key={audience}
                className="bg-slate-800 text-slate-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border border-slate-700"
              >
                {audience}
              </span>
            ))}
          </div>
        </section>

        {/* Ready CTA */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready?</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6">Try 3 rhythms free. Unlock all 49 for $19.</p>
          <Link
            href="/rhythms"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition text-sm sm:text-base"
          >
            Launch ECG Rhythm Library
          </Link>
        </section>

        {/* Disclaimer */}
        <p className="text-slate-600 text-[10px] sm:text-xs border-t border-slate-800 pt-6 sm:pt-8">
          Disclaimer: ECG Rhythm Library is for educational purposes only. Not a substitute for professional medical education or clinical judgment. Always follow institutional protocols.
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 sm:py-6 mt-6 sm:mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-500 text-xs sm:text-sm">Mr Pacemaker LLC</p>
          <p className="text-slate-600 text-[10px] sm:text-xs">© 2026</p>
        </div>
      </footer>
    </div>
  );
}
