'use client';

import Link from "next/link"
import { useState, useEffect } from "react"

// Preview rhythms data
const previewRhythms = [
  {
    id: 'nsr',
    name: 'Normal Sinus Rhythm',
    shortName: 'NSR',
    rate: 75,
  },
  {
    id: 'sinus-brady',
    name: 'Sinus Bradycardia',
    shortName: 'Sinus Brady',
    rate: 48,
  },
  {
    id: 'mobitz1',
    name: 'Mobitz Type I (Wenckebach)',
    shortName: 'Wenckebach',
    rate: 60,
  },
];

// ECG Grid component - standard ECG paper grid
const ECGGrid = () => (
  <g>
    {/* Small squares (1mm = 0.04s) - light pink */}
    <g stroke="#ffdddd" strokeWidth="0.3">
      {[...Array(24)].map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 5} x2="400" y2={i * 5}/>
      ))}
      {[...Array(80)].map((_, i) => (
        <line key={`v${i}`} x1={i * 5} y1="0" x2={i * 5} y2="120"/>
      ))}
    </g>
    {/* Large squares (5mm = 0.2s) - darker pink */}
    <g stroke="#ffbbbb" strokeWidth="0.5">
      {[...Array(5)].map((_, i) => (
        <line key={`hb${i}`} x1="0" y1={(i + 1) * 25} x2="400" y2={(i + 1) * 25}/>
      ))}
      {[...Array(16)].map((_, i) => (
        <line key={`vb${i}`} x1={(i + 1) * 25} y1="0" x2={(i + 1) * 25} y2="120"/>
      ))}
    </g>
  </g>
);

// NSR Waveform - 75 bpm, RR ~800ms, regular P-QRS-T
// Using cubic beziers (C) with explicit y=60 endpoints to prevent baseline drift
const NSRWaveform = () => (
  <g>
    {/* Beat 1 - starts at x=5 */}
    <path d="M5,60 L20,60 C23,60 25,52 28,52 C31,52 33,60 36,60 L50,60 L52,63 L54,60 L56,22 L60,72 L64,60 L78,60 C81,60 84,48 89,48 C94,48 97,60 100,60 L125,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Beat 2 - starts at x=125 */}
    <path d="M125,60 L140,60 C143,60 145,52 148,52 C151,52 153,60 156,60 L170,60 L172,63 L174,60 L176,22 L180,72 L184,60 L198,60 C201,60 204,48 209,48 C214,48 217,60 220,60 L245,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Beat 3 - starts at x=245 */}
    <path d="M245,60 L260,60 C263,60 265,52 268,52 C271,52 273,60 276,60 L290,60 L292,63 L294,60 L296,22 L300,72 L304,60 L318,60 C321,60 324,48 329,48 C334,48 337,60 340,60 L400,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
);

// Sinus Bradycardia - 48 bpm, RR ~1250ms, same morphology wider spacing
// Using cubic beziers (C) with explicit y=60 endpoints to prevent baseline drift
const SinusBradyWaveform = () => (
  <g>
    {/* Beat 1 */}
    <path d="M5,60 L20,60 C23,60 25,52 28,52 C31,52 33,60 36,60 L50,60 L52,63 L54,60 L56,22 L60,72 L64,60 L85,60 C88,60 91,48 96,48 C101,48 104,60 107,60 L190,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Beat 2 */}
    <path d="M190,60 L205,60 C208,60 210,52 213,52 C216,52 218,60 221,60 L235,60 L237,63 L239,60 L241,22 L245,72 L249,60 L270,60 C273,60 276,48 281,48 C286,48 289,60 292,60 L400,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
);

// Mobitz Type I (Wenckebach) - Progressive PR prolongation, then dropped beat
// P-P interval constant (~95px), PR gets longer each beat until QRS drops
// Using cubic beziers (C) with explicit y=60 endpoints to prevent baseline drift
const WenckebachWaveform = () => (
  <g>
    {/* Beat 1 - PR normal */}
    <path d="M5,60 L10,60 C13,60 15,52 18,52 C21,52 23,60 26,60 L36,60 L38,63 L40,60 L42,22 L46,72 L50,60 L64,60 C67,60 70,48 75,48 C80,48 83,60 86,60 L95,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Beat 2 - PR longer */}
    <path d="M95,60 L100,60 C103,60 105,52 108,52 C111,52 113,60 116,60 L131,60 L133,63 L135,60 L137,22 L141,72 L145,60 L159,60 C162,60 165,48 170,48 C175,48 178,60 181,60 L190,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Beat 3 - PR even longer */}
    <path d="M190,60 L195,60 C198,60 200,52 203,52 C206,52 208,60 211,60 L231,60 L233,63 L235,60 L237,22 L241,72 L245,60 L259,60 C262,60 265,48 270,48 C275,48 278,60 281,60 L290,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Beat 4 - P wave only (dropped QRS!) */}
    <path d="M290,60 L295,60 C298,60 300,52 303,52 C306,52 308,60 311,60 L380,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Beat 5 - Cycle restarts */}
    <path d="M380,60 L382,60 C385,60 387,52 390,52 C393,52 395,60 398,60 L400,60"
        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
);

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRhythm, setSelectedRhythm] = useState(0);

  // Auto-carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedRhythm((prev) => (prev + 1) % previewRhythms.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const emails = JSON.parse(localStorage.getItem('ecg-vault-signups') || '[]');
    emails.push({ email, timestamp: new Date().toISOString() });
    localStorage.setItem('ecg-vault-signups', JSON.stringify(emails));

    setLoading(false);
    setSubmitted(true);
  };

  const currentRhythm = previewRhythms[selectedRhythm];

  const renderWaveform = () => {
    switch (currentRhythm.id) {
      case 'nsr':
        return <NSRWaveform />;
      case 'sinus-brady':
        return <SinusBradyWaveform />;
      case 'mobitz1':
        return <WenckebachWaveform />;
      default:
        return <NSRWaveform />;
    }
  };

  const goToPrev = () => {
    setSelectedRhythm((prev) => (prev - 1 + previewRhythms.length) % previewRhythms.length);
  };

  const goToNext = () => {
    setSelectedRhythm((prev) => (prev + 1) % previewRhythms.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Live ECG Vault</h1>
                <p className="text-xs text-slate-400">by Mr Pacemaker LLC</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/rhythms"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition font-medium shadow-lg shadow-emerald-500/25"
              >
                Try It Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <span className="inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold px-4 py-1 rounded-full mb-6">
                46 Animated ECG Rhythms
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Master ECG Rhythms with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Real-Time Animation</span>
              </h2>
              <p className="text-lg text-slate-300 mb-6">
                Interactive, scrolling rhythm strips at clinical speed. Quiz yourself, analyze patterns, and learn with detailed explanations.
              </p>

              {/* 3 Learning Modes Feature */}
              <div className="flex gap-3 mb-8">
                <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600">
                  <span className="text-emerald-400 text-lg">📖</span>
                  <span className="text-white text-sm font-medium">Learn</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600">
                  <span className="text-cyan-400 text-lg">❓</span>
                  <span className="text-white text-sm font-medium">Quiz</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600">
                  <span className="text-purple-400 text-lg">🔍</span>
                  <span className="text-white text-sm font-medium">Analyze</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/rhythms"
                  className="inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg px-8 py-4 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg shadow-emerald-500/30 font-semibold text-center"
                >
                  Start Practicing Free
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold text-emerald-400">46</p>
                  <p className="text-slate-400 text-sm">ECG Rhythms</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400">3</p>
                  <p className="text-slate-400 text-sm">Learning Modes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400">100%</p>
                  <p className="text-slate-400 text-sm">Free Access</p>
                </div>
              </div>
            </div>

            {/* Right: ECG Carousel */}
            <div className="flex flex-col items-center">
              {/* ECG Display with arrows */}
              <div className="relative w-full max-w-md">
                {/* Left Arrow */}
                <button
                  onClick={goToPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* ECG Card */}
                <div className="bg-white rounded-xl p-4 shadow-2xl shadow-black/50">
                  <div className="flex justify-between text-xs text-slate-500 mb-2 px-1">
                    <span>Lead II</span>
                    <span>25 mm/sec</span>
                  </div>
                  <svg viewBox="0 0 400 120" className="w-full rounded-lg bg-red-50">
                    <rect fill="#fff8f8" width="400" height="120"/>
                    <ECGGrid />
                    {renderWaveform()}
                  </svg>
                  <div className="flex justify-between pt-3 px-1">
                    <span className="text-emerald-600 font-semibold text-sm">{currentRhythm.name}</span>
                    <span className="text-slate-500 text-sm">{currentRhythm.rate} bpm</span>
                  </div>
                </div>

                {/* Right Arrow */}
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Dot indicators */}
              <div className="flex gap-2 mt-4">
                {previewRhythms.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedRhythm(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      selectedRhythm === index
                        ? 'bg-emerald-500 w-6'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              <p className="text-slate-500 text-sm mt-3">Auto-advances every 4 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">What's Inside</h2>
          <p className="text-center text-slate-400 mb-12 text-lg max-w-3xl mx-auto">
            Comprehensive rhythm library with categories designed for rapid recognition
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
              <h3 className="font-bold text-white mb-3">Sinus Rhythms</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Normal Sinus Rhythm</li>
                <li>Sinus Tachycardia</li>
                <li>Sinus Bradycardia</li>
                <li>Sinus Arrhythmia</li>
                <li>Sinus Pause</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
              <h3 className="font-bold text-white mb-3">AV Blocks</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>First Degree Block</li>
                <li>Mobitz Type I (Wenckebach)</li>
                <li>Mobitz Type II</li>
                <li>Complete Heart Block</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
              <h3 className="font-bold text-white mb-3">Atrial Arrhythmias</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>AFib (Slow & RVR)</li>
                <li>Atrial Flutter</li>
                <li>MAT</li>
                <li>Atrial Tachycardia</li>
                <li>SVT</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
              <h3 className="font-bold text-white mb-3">Ventricular</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Ventricular Tachycardia</li>
                <li>Ventricular Fibrillation</li>
                <li>Torsades de Pointes</li>
                <li>Idioventricular Rhythm</li>
                <li>Asystole</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
              <h3 className="font-bold text-white mb-3">Paced Rhythms</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>AAI Pacing</li>
                <li>VVI Pacing</li>
                <li>DDD Pacing</li>
                <li>Failure to Capture</li>
                <li>Undersensing</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
              <h3 className="font-bold text-white mb-3">Junctional</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Junctional Escape</li>
                <li>Accelerated Junctional</li>
                <li>Junctional Tachycardia</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
              <h3 className="font-bold text-white mb-3">Ectopy</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>PACs</li>
                <li>PVCs</li>
                <li>Bigeminy</li>
                <li>Trigeminy</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
              <h3 className="font-bold text-white mb-3">3 Learning Modes</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Learn Mode</li>
                <li>Quiz Mode</li>
                <li>Analyze Mode</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Get Updates & New Rhythms</h2>
          <p className="text-emerald-100 mb-8">
            Join our list to get notified when we add new rhythms, features, and learning tools.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="px-4 py-3 rounded-lg text-gray-900 w-full sm:w-80 focus:ring-2 focus:ring-emerald-300 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <div className="bg-white/20 rounded-lg p-6">
              <p className="text-white text-xl font-semibold">Thanks for signing up!</p>
              <p className="text-emerald-100 mt-2">We'll keep you updated on new features.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Practice?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Jump into the Live ECG Vault and start mastering cardiac rhythms today.
          </p>
          <Link
            href="/rhythms"
            className="inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-2xl px-10 py-5 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg shadow-emerald-500/30 font-bold"
          >
            Launch ECG Vault
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-xl font-bold text-white mb-2">Mr Pacemaker LLC</h3>
          <p className="text-slate-500 text-sm mb-4">
            ECG education tools for healthcare professionals
          </p>
          <p className="text-slate-600 text-xs">© 2025 Mr Pacemaker LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
