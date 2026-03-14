'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { trackEvent } from '../components/Analytics';

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
  // Check URL first - if purchase=success, they paid
  const purchaseSuccess = searchParams.get('purchase') === 'success';
  const stripeSessionId = searchParams.get('session_id') || '';
  const [hasPurchased, setHasPurchased] = useState(purchaseSuccess);
  const [loading, setLoading] = useState(!purchaseSuccess);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Email lookup for returning customers
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  useEffect(() => {
    // If already confirmed via URL param, skip API check
    if (purchaseSuccess) {
      setHasPurchased(true);
      setLoading(false);
      return;
    }

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
  }, [purchaseSuccess]);

  // TEST MODE - set to false for production
  const TEST_MODE = false;

  const handlePurchase = async () => {
    // Track checkout started
    trackEvent('checkout_started', { product: 'paced_ecg_booklet', price: 19.99 });

    // Skip Stripe in test mode
    if (TEST_MODE) {
      trackEvent('checkout_completed', { product: 'paced_ecg_booklet', test: true });
      window.location.href = '/booklet?purchase=success&session_id=test_session';
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

  // Verify purchase by email (for returning customers)
  const handleEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail) return;

    setLookupLoading(true);
    setLookupError('');

    try {
      const res = await fetch('/api/verify-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: lookupEmail,
          productId: 'paced_ecg_booklet',
        }),
      });

      const data = await res.json();

      if (data.verified) {
        setVerifiedEmail(lookupEmail);
        setHasPurchased(true);
        trackEvent('returning_customer', { product: 'paced_ecg_booklet', email: lookupEmail });
      } else {
        setLookupError('No purchase found for this email. Please use the email you checked out with.');
      }
    } catch (error) {
      setLookupError('Something went wrong. Please try again.');
    } finally {
      setLookupLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-teal-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-slate-800">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="text-base font-semibold tracking-tight text-teal-700">
              Mr Pacemaker
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-500 text-sm hover:text-teal-700 transition">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {!hasPurchased ? (
        // Sales page with sneak peek
        <div className="max-w-4xl mx-auto px-5 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Digital Booklet
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-slate-900">
              How to Read a Paced ECG
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              Master paced rhythm interpretation with this comprehensive visual guide
            </p>
            <p className="text-slate-500 text-sm">by Mr Pacemaker</p>
          </div>

          {/* Cover and Table of Contents */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-start max-w-3xl mx-auto">
              {/* Cover */}
              <div className="flex-shrink-0">
                <Image
                  src="/paced-ecg-booklet-cover.png"
                  alt="How to Read a Paced ECG Booklet Cover"
                  width={200}
                  height={260}
                  className="rounded-lg shadow-lg"
                />
              </div>
              {/* Table of Contents */}
              <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">Table of Contents</h2>
                <ol className="space-y-2 text-slate-600 text-sm">
                  <li className="flex justify-between"><span>1. Introduction to Paced ECGs</span><span className="text-slate-400">3</span></li>
                  <li className="flex justify-between"><span>2. Identifying Pacing Spikes</span><span className="text-slate-400">5</span></li>
                  <li className="flex justify-between"><span>3. AAI Pacing Mode</span><span className="text-slate-400">8</span></li>
                  <li className="flex justify-between"><span>4. VVI Pacing Mode</span><span className="text-slate-400">11</span></li>
                  <li className="flex justify-between"><span>5. DDD Pacing Mode</span><span className="text-slate-400">14</span></li>
                  <li className="flex justify-between"><span>6. Capture & Sensing</span><span className="text-slate-400">18</span></li>
                  <li className="flex justify-between"><span>7. Failure to Capture</span><span className="text-slate-400">21</span></li>
                  <li className="flex justify-between"><span>8. Failure to Sense</span><span className="text-slate-400">24</span></li>
                  <li className="flex justify-between"><span>9. Clinical Examples</span><span className="text-slate-400">27</span></li>
                </ol>
              </div>
            </div>
          </div>

          {/* What's Inside */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">What You'll Learn</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  <span>Identify pacing spikes on any ECG</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  <span>Understand AAI, VVI, DDD pacing modes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  <span>Recognize capture vs. failure to capture</span>
                </li>
              </ul>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  <span>Troubleshoot common malfunctions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  <span>Interpret real clinical ECG examples</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  <span>30 pages of illustrated content</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">$19.99</div>
            <p className="text-slate-500 text-sm mb-6">One-time purchase · Lifetime access</p>
            <button
              onClick={handlePurchase}
              disabled={checkoutLoading}
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition disabled:opacity-50 shadow-lg shadow-teal-500/25"
            >
              {checkoutLoading ? 'Loading...' : 'Get Instant Access'}
            </button>
            <p className="text-slate-500 text-sm mt-4">
              Secure checkout powered by Stripe
            </p>
          </div>

          {/* Already Purchased - Email Lookup */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">
                Already purchased?
              </h3>
              <p className="text-slate-500 text-sm text-center mb-4">
                Enter the email you used at checkout to access your booklet
              </p>
              <form onSubmit={handleEmailLookup} className="space-y-3">
                <input
                  type="email"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-center"
                  required
                />
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition disabled:opacity-50"
                >
                  {lookupLoading ? 'Checking...' : 'Access My Booklet'}
                </button>
              </form>
              {lookupError && (
                <p className="text-red-500 text-sm text-center mt-3">{lookupError}</p>
              )}
            </div>
          </div>

          {/* Note about protection */}
          <div className="mt-10 text-center text-slate-500 text-xs">
            <p>This booklet is viewable online only with personalized watermark.</p>
          </div>
        </div>
      ) : (
        // Protected viewer
        <div className="max-w-4xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">How to Read a Paced ECG</h1>
            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
              Purchased
            </span>
          </div>

          <PdfViewer
            userEmail={verifiedEmail || session?.user?.email || 'Licensed User'}
            sessionId={stripeSessionId}
          />

          <div className="text-center mt-8">
            <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-teal-800 text-xl">Loading...</div>
      </div>
    }>
      <BookletContent />
    </Suspense>
  );
}
