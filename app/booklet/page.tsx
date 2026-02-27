'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import PDF viewer to avoid SSR issues
const PdfViewer = dynamic(() => import('../components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="aspect-[8.5/11] bg-slate-100 rounded-xl flex items-center justify-center">
      <div className="text-slate-500">Loading viewer...</div>
    </div>
  ),
});

function BookletContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function checkPurchase() {
      try {
        const res = await fetch('/api/booklet/status');
        const data = await res.json();
        setHasPurchased(data.hasPurchased);
      } catch (error) {
        console.error('Failed to check purchase:', error);
      } finally {
        setLoading(false);
      }
    }
    checkPurchase();
  }, []);

  // Handle successful purchase redirect
  useEffect(() => {
    if (searchParams.get('purchase') === 'success') {
      setHasPurchased(true);
    }
  }, [searchParams]);

  const handlePurchase = async () => {
    if (!session) {
      window.location.href = '/vault/register?checkout=booklet';
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/booklet/purchase', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      alert('Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Disable right-click on the viewer
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.pdf-viewer')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex justify-between items-center h-14">
            <a href="https://mr-pacemaker-website.vercel.app" className="text-base font-semibold tracking-tight">
              Mr Pacemaker
            </a>
            <div className="flex items-center gap-4">
              <a href="https://mr-pacemaker-website.vercel.app" className="text-slate-400 text-sm hover:text-white transition">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      {!hasPurchased ? (
        // Sales page with sneak peek
        <div className="max-w-4xl mx-auto px-5 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Digital Booklet
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              How to Read a Paced ECG
            </h1>
            <p className="text-xl text-slate-400 mb-2">
              Master paced rhythm interpretation with this comprehensive visual guide
            </p>
            <p className="text-slate-500 text-sm">by Mr Pacemaker</p>
          </div>

          {/* Sneak Peek Section */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 text-center">Sneak Peek</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cover Preview */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="aspect-[8.5/11] bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="text-center p-6">
                    <div className="text-amber-400 text-sm font-medium mb-4">COVER</div>
                    <div className="text-2xl font-bold mb-2">How to Read a Paced ECG</div>
                    <div className="text-slate-400 text-sm">A Visual Guide</div>
                    <div className="mt-6 text-slate-500 text-xs">by Mr Pacemaker</div>
                  </div>
                </div>
                <p className="text-center text-slate-500 text-xs mt-2">Cover Page</p>
              </div>

              {/* Table of Contents Preview */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="aspect-[8.5/11] bg-white rounded-lg p-6 text-slate-900 text-sm overflow-hidden">
                  <h3 className="font-bold text-lg mb-4 text-slate-800">Table of Contents</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex justify-between border-b border-slate-200 pb-1">
                      <span>1. Pacemaker Basics</span>
                      <span className="text-slate-400">3</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-1">
                      <span>2. Identifying Pacing Spikes</span>
                      <span className="text-slate-400">5</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-1">
                      <span>3. AAI Pacing Mode</span>
                      <span className="text-slate-400">8</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-1">
                      <span>4. VVI Pacing Mode</span>
                      <span className="text-slate-400">11</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-1">
                      <span>5. DDD Pacing Mode</span>
                      <span className="text-slate-400">15</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-1">
                      <span>6. Capture & Sensing</span>
                      <span className="text-slate-400">19</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-1">
                      <span>7. Pacemaker Malfunctions</span>
                      <span className="text-slate-400">23</span>
                    </li>
                    <li className="flex justify-between pb-1">
                      <span>8. Clinical Examples</span>
                      <span className="text-slate-400">27</span>
                    </li>
                  </ul>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
                </div>
                <p className="text-center text-slate-500 text-xs mt-2">Table of Contents</p>
              </div>
            </div>
          </div>

          {/* What's Inside */}
          <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">What You'll Learn</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5">&#10003;</span>
                  <span>Identify pacing spikes on any ECG</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5">&#10003;</span>
                  <span>Understand AAI, VVI, DDD pacing modes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5">&#10003;</span>
                  <span>Recognize capture vs. failure to capture</span>
                </li>
              </ul>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5">&#10003;</span>
                  <span>Troubleshoot common malfunctions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5">&#10003;</span>
                  <span>Interpret real clinical ECG examples</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5">&#10003;</span>
                  <span>30 pages of illustrated content</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">$9.99</div>
            <p className="text-slate-500 text-sm mb-6">One-time purchase · Lifetime access</p>
            <button
              onClick={handlePurchase}
              disabled={checkoutLoading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 shadow-lg shadow-amber-500/25"
            >
              {checkoutLoading ? 'Loading...' : 'Get Instant Access'}
            </button>
            <p className="text-slate-500 text-sm mt-4">
              Secure checkout powered by Stripe
            </p>
          </div>

          {/* Note about protection */}
          <div className="mt-10 text-center text-slate-600 text-xs">
            <p>This booklet is viewable online only with personalized watermark.</p>
          </div>
        </div>
      ) : (
        // Protected viewer
        <div className="max-w-4xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">How to Read a Paced ECG</h1>
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
              Purchased
            </span>
          </div>

          <PdfViewer userEmail={session?.user?.email || ''} />
        </div>
      )}
    </div>
  );
}

export default function BookletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <BookletContent />
    </Suspense>
  );
}
