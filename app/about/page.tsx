'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="text-base font-semibold tracking-tight">
              Live ECG Vault <span className="text-slate-500 font-normal">by Mr Pacemaker</span>
            </Link>
            <Link
              href="/rhythms"
              className="bg-white text-slate-900 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
            >
              Open App
            </Link>
          </div>
        </div>
      </nav>

      {/* About Content */}
      <section className="max-w-3xl mx-auto px-5 py-10">
        <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition mb-6 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-8">About</h1>

        {/* Eric Singh */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">About Eric Singh</h2>
          <p className="text-emerald-400 text-sm font-medium mb-5">
            IBHRE CCDS, IBHRE CEPS, Cardiac Device Specialist, Instructor & Engineer
          </p>

          <p className="text-slate-300 leading-relaxed mb-4">
            Eric Singh brings over 7 years of dedicated experience in cardiac electrophysiology with a focus on patient safety. He has completed 500+ comprehensive device checks and performed rigorous device testing as both an engineer and clinical specialist.
          </p>

          <p className="text-slate-300 leading-relaxed mb-6">
            As an instructor, Eric has trained hundreds of healthcare professionals and clinical specialists on proper device management, troubleshooting, and patient safety protocols. His passion for education led to the creation of comprehensive visual guides that make cardiac device concepts accessible and actionable for students, nurses, physicians, and clinical teams.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/20">
              IBHRE CCDS
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/20">
              IBHRE CEPS
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/20">
              500+ Device Checks
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/20">
              Patient Safety Expert
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-8" />

        {/* Shoutout */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">Shoutout</h2>

          <div className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-lg p-5 border border-amber-500/20">
            <h3 className="text-lg font-semibold text-white mb-1">Dr. Robin Singh, MD</h3>
            <p className="text-amber-400/70 text-sm mb-2">Electrophysiologist</p>
            <p className="text-slate-300 leading-relaxed">
              Thank you for your review and feedback on early models of ECG Vault.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-8" />

        {/* Contact / Links */}
        <div>
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Connect</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.amazon.com/Basics-Cardiac-Devices-Visual-Pacemakers/dp/B0FDHV3DNF"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 text-slate-300 text-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition"
            >
              Book on Amazon
            </a>
            <a
              href="https://www.instagram.com/mrpacemaker"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 text-slate-300 text-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition"
            >
              @mrpacemaker
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-5 mt-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <span className="text-slate-600 text-xs">Mr Pacemaker LLC</span>
          <span className="text-slate-700 text-xs">&copy; 2026</span>
        </div>
      </footer>
    </div>
  );
}
