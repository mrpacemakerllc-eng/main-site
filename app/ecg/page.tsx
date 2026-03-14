'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ECGLandingPage() {
  const [activeRhythm, setActiveRhythm] = useState('mobitz1');

  const rhythmCategories = [
    { name: 'Sinus Rhythms', count: 6 },
    { name: 'AV Blocks', count: 5 },
    { name: 'Atrial', count: 8 },
    { name: 'Junctional', count: 4 },
    { name: 'Ventricular', count: 8 },
    { name: 'Ectopy', count: 6 },
    { name: 'Paced & Malfunctions', count: 9 },
    { name: 'Conduction', count: 3 },
  ];

  const audiences = [
    'Nursing Students',
    'Paramedics',
    'Medical Students',
    'Device Reps',
    'EP Fellows',
    'Tele Techs',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ECG Rhythm Library</h1>
            <p className="text-sm text-slate-400">by Mr Pacemaker</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-slate-400 hover:text-white text-sm">
              About
            </Link>
            <Link
              href="/rhythms"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Badge */}
      <div className="text-center pt-8">
        <span className="inline-block bg-slate-800 text-slate-300 px-4 py-1.5 rounded-full text-sm border border-slate-700">
          49 animated rhythms · 3 Free · Full access $19
        </span>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
          Learn ECG rhythms<br />
          <span className="text-emerald-400">with live strips.</span>
        </h2>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          Interactive rhythm strips at clinical speed. Quiz yourself, analyze patterns, and build confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/rhythms"
            className="bg-white text-slate-900 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-slate-100 transition"
          >
            Try free rhythms
          </Link>
          <Link
            href="/rhythms"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold text-lg transition"
          >
            Get Full Access — $19
          </Link>
        </div>
      </section>

      {/* Demo Strip */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Mobitz Type I (Wenckebach)</h3>
              <p className="text-slate-400 text-sm">Progressive PR prolongation, dropped beat</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl h-32 flex items-center justify-center border border-slate-700">
            <div className="text-slate-500 text-sm">
              [Animated ECG strip preview]
            </div>
          </div>
        </div>
      </section>

      {/* Three Modes */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-700/50">
        <h3 className="text-center text-2xl font-bold mb-12">Three modes</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">Learn</h4>
            <p className="text-slate-400">Animated strips at 25 mm/sec with clinical explanations and pacing indications.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">Quiz</h4>
            <p className="text-slate-400">Identify rhythms with multiple-choice questions and instant feedback.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">Analyze</h4>
            <p className="text-slate-400">Systematic interpretation — rate, regularity, P waves, PR interval, QRS.</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-slate-700/50">
        <h3 className="text-center text-2xl font-bold mb-8">What's included</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {rhythmCategories.map((cat) => (
            <div key={cat.name} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
              <div className="text-3xl font-bold text-emerald-400">{cat.count}</div>
              <div className="text-sm text-slate-400">{cat.name}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-500 text-sm">
          Sinus, atrial, junctional, ventricular, paced, blocks, ectopy, conduction abnormalities.
        </p>
      </section>

      {/* Built For */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-slate-700/50">
        <h3 className="text-center text-2xl font-bold mb-8">Built for</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {audiences.map((audience) => (
            <span
              key={audience}
              className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full text-sm border border-slate-700"
            >
              {audience}
            </span>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center border-t border-slate-700/50">
        <h3 className="text-3xl font-bold mb-4">Ready?</h3>
        <p className="text-slate-400 mb-8">Try 3 rhythms free. Unlock all 49 for $19.</p>
        <Link
          href="/rhythms"
          className="inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-emerald-500/25"
        >
          Launch ECG Rhythm Library
        </Link>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-700/50">
        <p className="text-center text-slate-500 text-xs">
          Disclaimer: ECG Rhythm Library is for educational purposes only. Not a substitute for professional medical education or clinical judgment. Always follow institutional protocols.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">Mr Pacemaker LLC</p>
          <p className="text-slate-600 text-xs">© 2026</p>
        </div>
      </footer>
    </div>
  );
}
