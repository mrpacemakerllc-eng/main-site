'use client';

import { useState } from 'react';
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function VaultLanding() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!session) {
      window.location.href = '/vault/login';
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/vault/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/vault" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Live ECG Rhythm Library</h1>
                  <p className="text-xs text-slate-400">by Mr Pacemaker LLC</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {session ? (
                <Link
                  href="/rhythms"
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition font-medium"
                >
                  Open Vault
                </Link>
              ) : (
                <>
                  <Link href="/vault/login" className="text-slate-300 hover:text-white text-sm font-medium transition">
                    Login
                  </Link>
                  <Link
                    href="/vault/register"
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-1 rounded-full mb-6">
            Interactive ECG Training
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Master ECG Rhythms with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Live Animations
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Practice identifying cardiac rhythms with real-time scrolling ECG strips.
            Build confidence before clinical rotations, exams, or certifications.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              href="/rhythms"
              className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg shadow-emerald-500/25 font-semibold"
            >
              Try 3 Free Rhythms
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center bg-slate-700 text-white text-lg px-8 py-4 rounded-xl hover:bg-slate-600 transition font-semibold"
            >
              View Pricing
            </Link>
          </div>

          {/* ECG Preview */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl"></div>
            <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-slate-400 text-sm">Lead II | 25 mm/sec</span>
              </div>
              <div className="bg-[#fff8f8] rounded-lg p-2">
                <svg viewBox="0 0 600 120" className="w-full">
                  {/* Grid - small squares */}
                  <g stroke="#ffdddd" strokeWidth="0.3">
                    {[...Array(25)].map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 5} x2="600" y2={i * 5}/>
                    ))}
                    {[...Array(121)].map((_, i) => (
                      <line key={`v${i}`} x1={i * 5} y1="0" x2={i * 5} y2="120"/>
                    ))}
                  </g>
                  {/* Grid - large squares */}
                  <g stroke="#ffbbbb" strokeWidth="0.5">
                    {[...Array(5)].map((_, i) => (
                      <line key={`hb${i}`} x1="0" y1={(i + 1) * 25} x2="600" y2={(i + 1) * 25}/>
                    ))}
                    {[...Array(24)].map((_, i) => (
                      <line key={`vb${i}`} x1={(i + 1) * 25} y1="0" x2={(i + 1) * 25} y2="120"/>
                    ))}
                  </g>
                  {/* NSR - 6 beats, all baselines locked at y=60 */}
                  <path d="M0,60 L20,60 C23,60 25,54 28,54 C31,54 33,60 36,60 L50,60 L52,63 L54,60 L56,25 L60,70 L64,60 L76,60 C79,60 82,50 87,50 C92,50 95,60 98,60
                           L118,60 C121,60 123,54 126,54 C129,54 131,60 134,60 L148,60 L150,63 L152,60 L154,25 L158,70 L162,60 L174,60 C177,60 180,50 185,50 C190,50 193,60 196,60
                           L216,60 C219,60 221,54 224,54 C227,54 229,60 232,60 L246,60 L248,63 L250,60 L252,25 L256,70 L260,60 L272,60 C275,60 278,50 283,50 C288,50 291,60 294,60
                           L314,60 C317,60 319,54 322,54 C325,54 327,60 330,60 L344,60 L346,63 L348,60 L350,25 L354,70 L358,60 L370,60 C373,60 376,50 381,50 C386,50 389,60 392,60
                           L412,60 C415,60 417,54 420,54 C423,54 425,60 428,60 L442,60 L444,63 L446,60 L448,25 L452,70 L456,60 L468,60 C471,60 474,50 479,50 C484,50 487,60 490,60
                           L510,60 C513,60 515,54 518,54 C521,54 523,60 526,60 L540,60 L542,63 L544,60 L546,25 L550,70 L554,60 L566,60 C569,60 572,50 577,50 C582,50 585,60 588,60 L600,60"
                        fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-emerald-400 font-medium">Normal Sinus Rhythm</span>
                <span className="text-slate-400">72 bpm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Live ECG Rhythm Library?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-Time Animation</h3>
              <p className="text-slate-400">
                ECG strips scroll at clinical speed (25 mm/sec) just like real monitors. Practice in realistic conditions.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Quiz Mode</h3>
              <p className="text-slate-400">
                Test yourself with multiple choice questions. Get instant feedback and track your progress.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Clinical Explanations</h3>
              <p className="text-slate-400">
                Each rhythm includes detailed clinical info, key features, and pacing indications from real device specialists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rhythm Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">49 Essential Rhythms</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            From basic sinus rhythms to life-threatening arrhythmias - master them all
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Free Rhythms */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl p-4 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded">FREE</span>
                <span className="text-emerald-400 font-medium">Try These Free</span>
              </div>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link href="/rhythms?rhythm=nsr" className="text-slate-300 hover:text-emerald-400 transition">
                    Normal Sinus Rhythm →
                  </Link>
                </li>
                <li>
                  <Link href="/rhythms?rhythm=sinus-brady" className="text-slate-300 hover:text-emerald-400 transition">
                    Sinus Bradycardia →
                  </Link>
                </li>
                <li>
                  <Link href="/rhythms?rhythm=mobitz1" className="text-slate-300 hover:text-emerald-400 transition">
                    Mobitz I (Wenckebach) →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Premium Rhythms */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded">PRO</span>
                <span className="text-slate-300 font-medium">AV Blocks</span>
              </div>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>1st Degree AV Block</li>
                <li>Mobitz I (Wenckebach)</li>
                <li>Mobitz II</li>
                <li>Complete Heart Block</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded">PRO</span>
                <span className="text-slate-300 font-medium">Atrial</span>
              </div>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>AFib (Slow & RVR)</li>
                <li>Atrial Flutter</li>
                <li>Junctional Rhythm</li>
                <li>PACs & PVCs</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded">PRO</span>
                <span className="text-slate-300 font-medium">Ventricular</span>
              </div>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>Ventricular Tachycardia</li>
                <li>Torsades de Pointes</li>
                <li>Ventricular Fibrillation</li>
                <li>Sinus Pause</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Simple Pricing</h2>
          <p className="text-slate-400 text-center mb-12">Start free, upgrade when you're ready</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">Free</h3>
              <p className="text-slate-400 mb-6">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  3 rhythms (NSR, Brady, Wenckebach)
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Reference mode
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Clinical explanations
                </li>
                <li className="flex items-center text-slate-500">
                  <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Quiz mode
                </li>
              </ul>
              <Link
                href="/rhythms"
                className="block w-full text-center bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-600 transition"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl p-8 border border-emerald-500/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-slate-400 mb-6">Full access to all rhythms</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-slate-400 ml-2">one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All 49 rhythms unlocked
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Quiz mode with scoring
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Analyze mode
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="block w-full text-center bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-600 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Get Lifetime Access — $19'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Master ECG Rhythms?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join hundreds of healthcare professionals training with Live ECG Rhythm Library
          </p>
          <Link
            href="/rhythms"
            className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition shadow-lg shadow-emerald-500/25 font-semibold"
          >
            Try Free Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-slate-900/80 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-amber-400 font-semibold mb-2">Educational Disclaimer</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Live ECG Rhythm Library is designed exclusively for educational and practice purposes. The content provided is intended to supplement formal training and should not be used as a substitute for professional medical education, clinical judgment, or patient care decisions. This platform does not provide medical advice, diagnosis, or treatment recommendations. Always consult qualified healthcare professionals and follow institutional protocols when interpreting ECGs in clinical settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">Live ECG Rhythm Library by Mr Pacemaker LLC</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Mr Pacemaker LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
