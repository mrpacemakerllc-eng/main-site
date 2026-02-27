'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

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
            <Link href="/" className="text-base font-semibold tracking-tight">
              ECG Rhythm Library <span className="text-slate-500 font-normal">by Mr Pacemaker</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/rhythms" className="text-slate-400 text-sm hover:text-white transition">
                Rhythms App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {!hasPurchased ? (
        // Sales page
        <div className="max-w-3xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <span className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Digital Booklet
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              How to Read a Paced ECG
            </h1>
            <p className="text-xl text-slate-400 mb-6">
              Master paced rhythm interpretation with this comprehensive visual guide
            </p>
            <div className="text-3xl font-bold text-white mb-2">$9.99</div>
            <p className="text-slate-500 text-sm">One-time purchase · Lifetime access</p>
          </div>

          {/* Preview */}
          <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">What's Inside</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Visual guide to pacemaker spikes and capture</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>AAI, VVI, DDD pacing modes explained</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Troubleshooting pacemaker malfunctions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Real ECG examples with annotations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>30 pages of expert content</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handlePurchase}
              disabled={checkoutLoading}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-cyan-600 transition disabled:opacity-50"
            >
              {checkoutLoading ? 'Loading...' : 'Get Instant Access — $9.99'}
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
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
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
