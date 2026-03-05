'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

// Animated ECG Canvas Component
function ECGCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const pixelsPerMm = 4;
    const speed = 25;
    const bpm = 72;
    const rrInterval = pixelsPerMm * (60 / bpm) * speed;

    const baselineY = height * 0.55;
    const amplitudeScale = height * 0.35;

    const pWidth = pixelsPerMm * 2.5;
    const prInterval = pixelsPerMm * 4;
    const qrsWidth = pixelsPerMm * 2.5;
    const tWidth = pixelsPerMm * 4;
    const stSegment = pixelsPerMm * 2;

    const pHeight = amplitudeScale * 0.15;
    const qDepth = amplitudeScale * 0.1;
    const rHeight = amplitudeScale * 1.0;
    const sDepth = amplitudeScale * 0.2;
    const tHeight = amplitudeScale * 0.18;

    let offset = 0;
    const scrollSpeed = pixelsPerMm * speed / 60;
    let animationId: number;

    function drawBeat(startX: number): number {
      const pStartX = startX + pixelsPerMm * 0.5;
      const pEndX = pStartX + pWidth;
      const qrsStartX = pStartX + prInterval;
      const qrsEndX = qrsStartX + qrsWidth;
      const stEndX = qrsEndX + stSegment;
      const tEndX = stEndX + tWidth;

      ctx!.lineTo(pStartX, baselineY);

      for (let t = 0; t <= 1; t += 0.1) {
        const x = pStartX + t * pWidth;
        const y = baselineY - pHeight * Math.pow(Math.sin(t * Math.PI), 1.3);
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(pEndX, baselineY);
      ctx!.lineTo(qrsStartX, baselineY);

      const qWidthPx = qrsWidth * 0.15;
      ctx!.lineTo(qrsStartX + qWidthPx * 0.5, baselineY + qDepth);

      const rPeakX = qrsStartX + qrsWidth * 0.35;
      ctx!.lineTo(rPeakX, baselineY - rHeight);

      const sX = qrsStartX + qrsWidth * 0.55;
      ctx!.lineTo(sX, baselineY + sDepth);
      ctx!.lineTo(qrsEndX, baselineY);
      ctx!.lineTo(stEndX, baselineY);

      for (let t = 0; t <= 1; t += 0.05) {
        const x = stEndX + t * tWidth;
        const y = baselineY - tHeight * Math.sin(t * Math.PI);
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(tEndX, baselineY);
      ctx!.lineTo(startX + rrInterval, baselineY);

      return startX + rrInterval;
    }

    function draw() {
      ctx!.fillStyle = '#0f172a';
      ctx!.fillRect(0, 0, width, height);

      // Grid
      ctx!.strokeStyle = 'rgba(100, 116, 139, 0.15)';
      ctx!.lineWidth = 0.5;
      for (let x = 0; x < width; x += pixelsPerMm) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
      for (let y = 0; y < height; y += pixelsPerMm) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }

      ctx!.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      for (let x = 0; x < width; x += pixelsPerMm * 5) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
      for (let y = 0; y < height; y += pixelsPerMm * 5) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }

      // ECG trace
      ctx!.beginPath();
      ctx!.strokeStyle = '#10b981';
      ctx!.lineWidth = 2;
      ctx!.lineJoin = 'round';
      ctx!.lineCap = 'round';

      const startBeat = Math.floor(offset / rrInterval) - 1;
      const numBeats = Math.ceil(width / rrInterval) + 3;

      let x = startBeat * rrInterval - offset;
      ctx!.moveTo(x, baselineY);

      for (let i = 0; i < numBeats; i++) {
        x = drawBeat(x);
      }

      ctx!.stroke();
      offset += scrollSpeed;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={200}
      className="w-full rounded-lg"
    />
  );
}

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resourceUrls: Record<string, string> = {
    'cardiac-quiz': '/quiz.html',
    'ccds-quiz': '/ccds-quiz.html',
    'ibhre-guide': '/IBHRE-CCDS-Guide.pdf',
  };

  const openResourceModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save to database
      await fetch('/api/quiz-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formEmail,
          source: modalType,
        }),
      });
    } catch (error) {
      // Continue anyway
    }

    // Get the resource URL
    const url = resourceUrls[modalType] || '/rhythms';

    // For PDFs, open in new tab; for quizzes, navigate
    if (url.endsWith('.pdf')) {
      window.open(url, '_blank');
      setShowModal(false);
      setSubmitting(false);
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex justify-between items-center">
            <a href="#" className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="Mr Pacemaker" width={56} height={56} className="rounded-full shadow-md" />
              <span className="font-bold text-xl text-gray-900">Mr Pacemaker LLC</span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="#products" className="text-gray-600 hover:text-teal-600 transition font-medium text-sm">Products</a>
              <a href="#resources" className="text-gray-600 hover:text-teal-600 transition font-medium text-sm">Free Resources</a>
              <a href="#about" className="text-gray-600 hover:text-teal-600 transition font-medium text-sm">About</a>
              <a href="#contact" className="text-gray-600 hover:text-teal-600 transition font-medium text-sm">Contact</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero + Products Combined */}
      <section id="products" className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center mb-8">
          <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            Trusted by 500+ Healthcare Professionals
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Master Cardiac Devices <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">With Confidence</span>
          </h1>
        </div>
        <div className="max-w-6xl mx-auto px-6">

          {/* 3 Product Cards - Symmetrical Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Book */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
              <div className="h-48 flex items-center justify-center mb-4">
                <a href="https://www.amazon.com/Basics-Cardiac-Devices-Visual-Pacemakers/dp/B0FDHV3DNF" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/book-cover.jpeg"
                    alt="Basics of Cardiac Devices Book"
                    width={140}
                    height={180}
                    className="rounded-lg shadow-lg hover:scale-105 transition"
                  />
                </a>
              </div>
              <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
                Amazon Best Seller
              </span>
              <h3 className="text-lg font-bold text-gray-900 h-12 mb-2">Basics of Cardiac Devices</h3>
              <p className="text-gray-600 text-sm h-16 mb-3">
                145-page illustrated guide covering device components, programming, and troubleshooting.
              </p>
              <div className="flex flex-wrap gap-2 h-8 mb-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">145 pages</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">60+ illustrations</span>
              </div>
              <a
                href="https://www.amazon.com/Basics-Cardiac-Devices-Visual-Pacemakers/dp/B0FDHV3DNF"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-amber-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-amber-600 transition mt-auto"
              >
                Buy on Amazon
              </a>
            </div>

            {/* Paced ECG Booklet */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
              <div className="h-48 flex items-center justify-center mb-4">
                <Link href="/booklet">
                  <Image
                    src="/paced-ecg-booklet-cover.png"
                    alt="How to Read a Paced ECG"
                    width={140}
                    height={180}
                    className="rounded-lg shadow-lg hover:scale-105 transition"
                  />
                </Link>
              </div>
              <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
                Digital Booklet
              </span>
              <h3 className="text-lg font-bold text-gray-900 h-12 mb-2">How to Read a Paced ECG</h3>
              <p className="text-gray-600 text-sm h-16 mb-3">
                30-page visual guide to pacing modes, capture, sensing, and troubleshooting malfunctions.
              </p>
              <div className="flex flex-wrap gap-2 h-8 mb-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">30 pages</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Instant access</span>
              </div>
              <Link
                href="/booklet"
                className="bg-teal-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-teal-700 transition mt-auto"
              >
                Get Access — $19.99
              </Link>
            </div>

            {/* ECG Rhythm Library */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
              <div className="h-48 flex items-center justify-center mb-4 overflow-hidden">
                <Link href="/rhythms" className="w-full">
                  <div className="bg-slate-900 rounded-lg p-2 relative overflow-hidden">
                    <ECGCanvas />
                    <div className="absolute top-1 right-1 text-gray-400 text-xs bg-black/50 px-2 py-0.5 rounded">
                      25 mm/sec
                    </div>
                  </div>
                </Link>
              </div>
              <span className="inline-block bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
                Web App
              </span>
              <h3 className="text-lg font-bold text-gray-900 h-12 mb-2">ECG Rhythm Library</h3>
              <p className="text-gray-600 text-sm h-16 mb-3">
                49 animated ECG rhythms at clinical speed. Learn, Quiz, and Analyze modes.
              </p>
              <div className="flex flex-wrap gap-2 h-8 mb-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">49 rhythms</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Interactive</span>
              </div>
              <Link
                href="/rhythms"
                className="bg-violet-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-violet-700 transition mt-auto"
              >
                Start Learning — $19.99
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What readers say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Fantastic introductory publication for all healthcare professionals interested in cardiac device management. A must-read resource.",
                name: "Robin Singh, MD",
                role: "Electrophysiologist"
              },
              {
                text: "Great breakdown on pacemakers and how to troubleshoot some of the issues we see. The illustrations make it so much easier.",
                name: "Jennifer",
                role: "Physician Assistant"
              },
              {
                text: "An excellent choice for anyone looking to expand their knowledge in cardiac implantable electronic devices.",
                name: "Regina",
                role: "Electrophysiology Instructor"
              }
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="text-amber-400 text-xl mb-4">★★★★★</div>
                <p className="text-gray-700 mb-6">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Resources */}
      <section id="resources" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Free Resources</h2>
          <p className="text-gray-600 text-center mb-12">Study guides and quizzes to help you prepare</p>
          <div className="grid md:grid-cols-3 gap-8">
            <button
              onClick={() => openResourceModal('cardiac-quiz')}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-left hover:shadow-xl hover:border-teal-200 transition group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2">Cardiac Device Quiz</h4>
              <p className="text-gray-600 mb-4">Test your knowledge of pacemaker and ICD fundamentals</p>
              <span className="text-teal-600 font-semibold group-hover:text-teal-700">Take Quiz →</span>
            </button>
            <button
              onClick={() => openResourceModal('ccds-quiz')}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-left hover:shadow-xl hover:border-teal-200 transition group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2">IBHRE CCDS Quiz</h4>
              <p className="text-gray-600 mb-4">Practice questions for CCDS certification exam</p>
              <span className="text-teal-600 font-semibold group-hover:text-teal-700">Take Quiz →</span>
            </button>
            <button
              onClick={() => openResourceModal('ibhre-guide')}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-left hover:shadow-xl hover:border-teal-200 transition group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2">CCDS Study Guide</h4>
              <p className="text-gray-600 mb-4">Free PDF with key concepts and exam tips</p>
              <span className="text-teal-600 font-semibold group-hover:text-teal-700">Download →</span>
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <img
              src="/eric-headshot.jpg"
              alt="Eric Singh"
              className="w-40 h-40 rounded-full shadow-xl mx-auto mb-6 object-cover"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">About Eric Singh</h2>
            <p className="text-teal-600 font-semibold mb-6">IBHRE CCDS · IBHRE CEPS · Cardiac Device Specialist</p>
            <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
              Eric Singh has 7+ years of experience in cardiac electrophysiology with a focus on patient safety. He has completed 500+ comprehensive device checks and trained hundreds of healthcare professionals on proper device management, troubleshooting, and safety protocols.
            </p>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              His passion for education led to creating visual guides that make cardiac device concepts accessible for students, nurses, physicians, and clinical teams.
            </p>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://www.instagram.com/mrpacemaker/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @mrpacemaker
              </a>
              <a
                href="mailto:mr.pacemakerllc@gmail.com"
                className="text-gray-600 hover:text-teal-600 transition"
              >
                mr.pacemakerllc@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600 mb-6">
                Questions about cardiac devices or our educational resources? Send a message and I'll get back to you.
              </p>
              <a href="mailto:mr.pacemakerllc@gmail.com" className="text-teal-600 font-semibold text-lg">
                mr.pacemakerllc@gmail.com
              </a>
            </div>
            <form
              action="https://formsubmit.co/mr.pacemakerllc@gmail.com"
              method="POST"
              className="space-y-4"
            >
              <input type="hidden" name="_subject" value="New Contact from Mr Pacemaker Website" />
              <input type="hidden" name="_captcha" value="false" />
              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
              <textarea
                name="message"
                placeholder="Your message"
                rows={4}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
              />
              <button
                type="submit"
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="Mr Pacemaker" width={40} height={40} className="rounded-full" />
              <p className="text-gray-400">Cardiac device education for healthcare professionals</p>
            </div>
            <div className="flex gap-6">
              <a href="#products" className="text-gray-400 hover:text-white transition">Products</a>
              <a href="#resources" className="text-gray-400 hover:text-white transition">Resources</a>
              <a href="#about" className="text-gray-400 hover:text-white transition">About</a>
              <a href="https://www.instagram.com/mrpacemaker/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Instagram</a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2025 Mr Pacemaker LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Free Resource</h3>
            <p className="text-gray-600 mb-6">Enter your email for instant access</p>
            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
              >
                {submitting ? 'Loading...' : 'Get Instant Access'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
