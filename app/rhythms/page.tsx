'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import RhythmStrip from '../components/RhythmStrip';
import { Rhythm, rhythms, getQuizOptions, FREE_RHYTHM_IDS } from '../data/rhythms';

type Mode = 'learn' | 'quiz' | 'analyze';

// Analysis answers for each rhythm
const rhythmAnalysis: Record<string, {
  rate: string;
  regularity: string;
  pWaves: string;
  prInterval: string;
  qrsComplex: string;
}> = {
  'nsr': { rate: '60-100', regularity: 'Regular', pWaves: 'Normal, upright', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-tach': { rate: '>100', regularity: 'Regular', pWaves: 'Normal, upright', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-brady': { rate: '<60', regularity: 'Regular', pWaves: 'Normal, upright', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-arrhythmia': { rate: '60-100', regularity: 'Irregular (varies with breathing)', pWaves: 'Normal, upright', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-pause': { rate: 'Variable', regularity: 'Irregular (pause)', pWaves: 'Normal when present', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-arrest': { rate: 'Variable', regularity: 'Irregular (arrest = 2× P-P)', pWaves: 'Normal when present', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'nsr-pac': { rate: '60-100', regularity: 'Irregular (early beats)', pWaves: 'Abnormal before PAC', prInterval: 'Variable', qrsComplex: 'Narrow (<0.12 sec)' },
  'nsr-pvc': { rate: '60-100', regularity: 'Irregular (early beats)', pWaves: 'None before PVC', prInterval: 'None before PVC', qrsComplex: 'Wide (>0.12 sec) for PVC' },
  'v-bigeminy': { rate: '60-100', regularity: 'Regular pattern (N-PVC-N-PVC)', pWaves: 'Present before normal beats', prInterval: 'Normal before sinus beats', qrsComplex: 'Alternating narrow/wide' },
  'v-trigeminy': { rate: '60-100', regularity: 'Regular pattern (N-N-PVC)', pWaves: 'Present before normal beats', prInterval: 'Normal before sinus beats', qrsComplex: 'Every 3rd beat wide' },
  'first-degree': { rate: '60-100', regularity: 'Regular', pWaves: 'Normal, upright', prInterval: '>0.20 sec (prolonged)', qrsComplex: 'Narrow (<0.12 sec)' },
  'mobitz1': { rate: '60-100', regularity: 'Irregular (grouped)', pWaves: 'More P than QRS', prInterval: 'Progressive lengthening', qrsComplex: 'Narrow (<0.12 sec)' },
  'mobitz2': { rate: '60-100', regularity: 'Irregular (dropped)', pWaves: 'More P than QRS', prInterval: 'Constant', qrsComplex: 'Often wide' },
  'block-2to1': { rate: '~38 (half atrial rate)', regularity: 'Regular', pWaves: '2 P waves per QRS', prInterval: 'Constant in conducted beats', qrsComplex: 'Narrow or Wide (determines type)' },
  'chb': { rate: '30-40', regularity: 'Regular (P and QRS independent)', pWaves: 'Present, dissociated', prInterval: 'Variable (no relationship)', qrsComplex: 'Wide (escape rhythm)' },
  'wap': { rate: '60-100', regularity: 'Irregular', pWaves: '3+ different morphologies', prInterval: 'Variable', qrsComplex: 'Narrow (<0.12 sec)' },
  'mat': { rate: '>100', regularity: 'Irregularly irregular', pWaves: '3+ different morphologies', prInterval: 'Variable', qrsComplex: 'Narrow (<0.12 sec)' },
  'atrial-tach': { rate: '100-250', regularity: 'Regular', pWaves: 'Abnormal morphology', prInterval: 'Variable', qrsComplex: 'Narrow (<0.12 sec)' },
  'junctional': { rate: '40-60', regularity: 'Regular', pWaves: 'Absent or inverted', prInterval: 'Short or absent', qrsComplex: 'Narrow (<0.12 sec)' },
  'accel-junctional': { rate: '60-100', regularity: 'Regular', pWaves: 'Absent or inverted', prInterval: 'Short or absent', qrsComplex: 'Narrow (<0.12 sec)' },
  'junctional-tach': { rate: '>100', regularity: 'Regular', pWaves: 'Absent or inverted', prInterval: 'Short or absent', qrsComplex: 'Narrow (<0.12 sec)' },
  'svt': { rate: '150-250', regularity: 'Regular', pWaves: 'Hidden in QRS/T', prInterval: 'Not measurable', qrsComplex: 'Narrow (<0.12 sec)' },
  'afib-slow': { rate: '<60', regularity: 'Irregularly irregular', pWaves: 'Absent (fibrillatory)', prInterval: 'None', qrsComplex: 'Narrow (<0.12 sec)' },
  'afib-rvr': { rate: '>100', regularity: 'Irregularly irregular', pWaves: 'Absent (fibrillatory)', prInterval: 'None', qrsComplex: 'Narrow (<0.12 sec)' },
  'aflutter-svr': { rate: '~50 (controlled)', regularity: 'Regular or irregular', pWaves: 'Flutter waves (sawtooth)', prInterval: 'None', qrsComplex: 'Narrow (<0.12 sec)' },
  'aflutter-rvr': { rate: '~150 (2:1 block)', regularity: 'Regular', pWaves: 'Flutter waves (sawtooth)', prInterval: 'None', qrsComplex: 'Narrow (<0.12 sec)' },
  'ivr': { rate: '20-40', regularity: 'Regular', pWaves: 'Absent', prInterval: 'None', qrsComplex: 'Wide (>0.12 sec)' },
  'aivr': { rate: '40-100', regularity: 'Regular', pWaves: 'Absent', prInterval: 'None', qrsComplex: 'Wide (>0.12 sec)' },
  'vtach': { rate: '150-250', regularity: 'Regular', pWaves: 'Absent or dissociated', prInterval: 'None', qrsComplex: 'Wide (>0.12 sec)' },
  'torsades': { rate: '150-250', regularity: 'Regular (twisting)', pWaves: 'Absent', prInterval: 'None', qrsComplex: 'Wide, twisting axis' },
  'vfib': { rate: 'Indeterminate', regularity: 'Chaotic', pWaves: 'Absent', prInterval: 'None', qrsComplex: 'None identifiable' },
  'asystole': { rate: '0', regularity: 'None (flat line)', pWaves: 'Absent', prInterval: 'None', qrsComplex: 'Absent' },
  'paced-aai': { rate: 'Programmed LRL', regularity: 'Regular', pWaves: 'Pacing spike + P wave', prInterval: 'Native (normal)', qrsComplex: 'Narrow (native conduction)' },
  'paced-vvi': { rate: 'Programmed LRL', regularity: 'Regular', pWaves: 'Absent (no tracking)', prInterval: 'None', qrsComplex: 'Wide (paced LBBB pattern)' },
  'paced-ddd': { rate: 'Programmed LRL', regularity: 'Regular', pWaves: 'A-spike + P wave', prInterval: 'Programmed AV delay', qrsComplex: 'Wide (paced LBBB pattern)' },
  'failure-capture-atrial': { rate: 'Variable', regularity: 'Irregular', pWaves: 'Atrial spikes without P wave', prInterval: 'N/A', qrsComplex: 'Narrow (native)' },
  'failure-capture-ventricular': { rate: 'Variable', regularity: 'Irregular', pWaves: 'Present (native or paced)', prInterval: 'Variable', qrsComplex: 'V-spike without QRS' },
  'undersensing-atrial': { rate: 'Variable', regularity: 'Irregular', pWaves: 'A-spikes during native P', prInterval: 'Variable', qrsComplex: 'Narrow (native)' },
  'undersensing-ventricular': { rate: 'Variable', regularity: 'Irregular', pWaves: 'Present', prInterval: 'Variable', qrsComplex: 'V-spikes during native QRS' },
  'oversensing-atrial': { rate: 'Variable', regularity: 'Irregular (pauses)', pWaves: 'Absent when inhibited', prInterval: 'N/A', qrsComplex: 'Absent (inhibited)' },
  'oversensing-ventricular': { rate: 'Variable', regularity: 'Irregular (pauses)', pWaves: 'Present (native)', prInterval: 'Normal', qrsComplex: 'Absent (inhibited)' },
  'nsvt': { rate: '150-200', regularity: 'Regular (short run)', pWaves: 'Absent', prInterval: 'None', qrsComplex: 'Wide (>0.12 sec)' },
  'v-couplet': { rate: '60-100', regularity: 'Irregular (paired PVCs)', pWaves: 'None before PVCs', prInterval: 'None before PVCs', qrsComplex: 'Wide for PVCs' },
  'wpw': { rate: '60-100', regularity: 'Regular', pWaves: 'Normal', prInterval: 'Short (<0.12 sec)', qrsComplex: 'Wide with delta wave' },
  'nsr-pjc': { rate: '60-100', regularity: 'Irregular (early beats)', pWaves: 'Absent or inverted before PJC', prInterval: 'Short or absent', qrsComplex: 'Narrow (<0.12 sec)' },
  'blocked-pac': { rate: '60-100', regularity: 'Irregular (pause after early P)', pWaves: 'Early abnormal P without QRS', prInterval: 'N/A (blocked)', qrsComplex: 'Absent after early P' },
  'lbbb': { rate: '60-100', regularity: 'Regular', pWaves: 'Normal', prInterval: '0.12-0.20 sec', qrsComplex: 'Wide (>0.12 sec), WiLLiaM' },
  'rbbb': { rate: '60-100', regularity: 'Regular', pWaves: 'Normal', prInterval: '0.12-0.20 sec', qrsComplex: 'Wide (>0.12 sec), MaRRoW' },
};

export default function RhythmReferencePage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('learn');
  const [selectedRhythm, setSelectedRhythm] = useState<Rhythm>(rhythms[0]);
  const [isRunning, setIsRunning] = useState(true);
  const [caliperMode, setCaliperMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Subscription state - fetched from API
  const [isPro, setIsPro] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Handle rhythm query parameter
  useEffect(() => {
    const rhythmId = searchParams.get('rhythm');
    if (rhythmId) {
      const rhythm = rhythms.find(r => r.id === rhythmId);
      if (rhythm) {
        setSelectedRhythm(rhythm);
        setQuizOptions(getQuizOptions(rhythm.name));
      }
    }
  }, [searchParams]);

  // Fetch subscription status on mount
  useEffect(() => {
    async function checkSubscription() {
      try {
        const res = await fetch('/api/vault/status');
        const data = await res.json();
        setIsPro(data.isPro);
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setIsPro(false);
      } finally {
        setSubscriptionLoading(false);
      }
    }
    checkSubscription();
  }, []);

  // Check if a rhythm is accessible
  const isRhythmLocked = (rhythm: Rhythm) => !isPro && rhythm.premium;

  // Quiz state
  const [quizOptions, setQuizOptions] = useState<string[]>(() => getQuizOptions(rhythms[0].name));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Analysis state
  const [analysisAnswers, setAnalysisAnswers] = useState({
    rhythm: '',
    rate: '',
    regularity: '',
    pWaves: '',
    prInterval: '',
    qrsComplex: '',
  });
  const [showAnalysisFeedback, setShowAnalysisFeedback] = useState(false);

  // Keyboard navigation for rhythms (↑/↓ or ←/→ to switch, Space to play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentIdx = rhythms.findIndex(r => r.id === selectedRhythm.id);

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        // Find next accessible rhythm
        for (let i = 1; i <= rhythms.length; i++) {
          const nextIdx = (currentIdx + i) % rhythms.length;
          const nextRhythm = rhythms[nextIdx];
          if (isPro || !nextRhythm.premium) {
            setSelectedRhythm(nextRhythm);
            setQuizOptions(getQuizOptions(nextRhythm.name));
            setSelectedAnswer(null);
            setShowFeedback(false);
            setIsCorrect(false);
            setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
            setShowAnalysisFeedback(false);
            break;
          }
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        // Find previous accessible rhythm
        for (let i = 1; i <= rhythms.length; i++) {
          const prevIdx = (currentIdx - i + rhythms.length) % rhythms.length;
          const prevRhythm = rhythms[prevIdx];
          if (isPro || !prevRhythm.premium) {
            setSelectedRhythm(prevRhythm);
            setQuizOptions(getQuizOptions(prevRhythm.name));
            setSelectedAnswer(null);
            setShowFeedback(false);
            setIsCorrect(false);
            setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
            setShowAnalysisFeedback(false);
            break;
          }
        }
      } else if (e.key === ' ') {
        // Spacebar toggles play/pause
        e.preventDefault();
        setIsRunning(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRhythm, isPro]);

  // Categories for dropdown grouping
  const categories = useMemo(() => {
    return {
      'Sinus Rhythms': rhythms.filter(r =>
        ['nsr', 'sinus-tach', 'sinus-brady', 'sinus-arrhythmia', 'sinus-pause', 'sinus-arrest'].includes(r.id)
      ),
      'Ectopy': rhythms.filter(r =>
        ['nsr-pac', 'nsr-pvc', 'nsr-pjc', 'blocked-pac', 'v-couplet', 'v-bigeminy', 'v-trigeminy'].includes(r.id)
      ),
      'AV Blocks': rhythms.filter(r =>
        ['first-degree', 'mobitz1', 'mobitz2', 'block-2to1', 'chb'].includes(r.id)
      ),
      'Atrial Arrhythmias': rhythms.filter(r =>
        ['wap', 'mat', 'atrial-tach', 'afib-slow', 'afib-rvr', 'aflutter-svr', 'aflutter-rvr'].includes(r.id)
      ),
      'Junctional Rhythms': rhythms.filter(r =>
        ['junctional', 'accel-junctional', 'junctional-tach', 'svt', 'wpw'].includes(r.id)
      ),
      'Ventricular Arrhythmias': rhythms.filter(r =>
        ['ivr', 'aivr', 'vtach', 'nsvt', 'torsades', 'vfib', 'asystole'].includes(r.id)
      ),
      'Bundle Branch Blocks': rhythms.filter(r =>
        ['lbbb', 'rbbb'].includes(r.id)
      ),
      'Paced Rhythms': rhythms.filter(r =>
        ['paced-aai', 'paced-vvi', 'paced-ddd'].includes(r.id)
      ),
      'Pacemaker Malfunctions': rhythms.filter(r =>
        ['failure-capture-atrial', 'failure-capture-ventricular', 'undersensing-atrial', 'undersensing-ventricular', 'oversensing-atrial', 'oversensing-ventricular'].includes(r.id)
      ),
    };
  }, []);

  const handleRhythmChange = (rhythmId: string) => {
    const rhythm = rhythms.find(r => r.id === rhythmId);
    if (rhythm) {
      // Check if rhythm is locked
      if (isRhythmLocked(rhythm)) {
        setShowUpgradeModal(true);
        return;
      }
      setSelectedRhythm(rhythm);
      setQuizOptions(getQuizOptions(rhythm.name));
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
      setShowAnalysisFeedback(false);
      setCaliperMode(false);
      setIsRunning(true);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    const correct = answer === selectedRhythm.name;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNextRandom = () => {
    // Only pick from accessible rhythms
    const accessibleRhythms = rhythms.filter(r => r.id !== selectedRhythm.id && !isRhythmLocked(r));
    if (accessibleRhythms.length === 0) {
      setShowUpgradeModal(true);
      return;
    }
    const randomRhythm = accessibleRhythms[Math.floor(Math.random() * accessibleRhythms.length)];
    setSelectedRhythm(randomRhythm);
    setQuizOptions(getQuizOptions(randomRhythm.name));
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
    setShowAnalysisFeedback(false);
    setIsRunning(true);
  };

  const handleTryAgain = () => {
    setQuizOptions(getQuizOptions(selectedRhythm.name));
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
    setShowAnalysisFeedback(false);
  };

  const handleSubmitAnalysis = () => {
    setShowAnalysisFeedback(true);
  };

  const correctAnalysis = rhythmAnalysis[selectedRhythm.id] || rhythmAnalysis['nsr'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-white">Live ECG Vault</h1>
                <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">FREE</span>
              </Link>
            </div>
            <span className="text-sm text-slate-400">by Mr Pacemaker LLC</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Controls Row */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Mode:</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-600">
                <button
                  onClick={() => setMode('learn')}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    mode === 'learn' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Learn
                </button>
                <button
                  onClick={() => { setMode('quiz'); handleTryAgain(); }}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    mode === 'quiz' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Quiz
                </button>
                <button
                  onClick={() => { setMode('analyze'); handleTryAgain(); }}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    mode === 'analyze' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Analyze
                </button>
              </div>
            </div>

            {/* Rhythm Dropdown - hidden in quiz/analyze mode until answered */}
            {(mode === 'learn' || showFeedback || showAnalysisFeedback) ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-slate-400">Rhythm:</span>
                <select
                  value={selectedRhythm.id}
                  onChange={(e) => handleRhythmChange(e.target.value)}
                  className="flex-1 max-w-md px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-700 text-white"
                >
                  {Object.entries(categories).map(([category, categoryRhythms]) => (
                    <optgroup key={category} label={category}>
                      {categoryRhythms.map((rhythm) => (
                        <option
                          key={rhythm.id}
                          value={rhythm.id}
                        >
                          {isRhythmLocked(rhythm) ? `🔒 ${rhythm.name}` : rhythm.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex-1 text-center">
                <span className="text-slate-400 italic">Complete the {mode} to reveal the rhythm</span>
              </div>
            )}

            {/* Random */}
            <button onClick={handleNextRandom} className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-medium hover:bg-purple-500/30 border border-purple-500/30">
              Random
            </button>
          </div>
          {/* Keyboard hint */}
          <div className="mt-3 pt-3 border-t border-slate-700 text-center">
            <span className="text-xs text-slate-500">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 font-mono ml-1">↓</kbd>
              <span className="mx-2">switch rhythms</span>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 font-mono">Space</kbd>
              <span className="ml-2">play/pause</span>
            </span>
          </div>
        </div>

        {/* Rhythm Title (reference mode or after answering) */}
        {(mode === 'learn' || showFeedback || showAnalysisFeedback) && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">{selectedRhythm.name}</h1>
              {selectedRhythm.pacingIndication && (
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  PACING INDICATION
                </span>
              )}
            </div>
            <p className="text-slate-300">{selectedRhythm.description}</p>
          </div>
        )}

        {/* Quiz/Analyze Prompt */}
        {(mode === 'quiz' || mode === 'analyze') && !showFeedback && !showAnalysisFeedback && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-emerald-400">
              {mode === 'quiz' ? 'What rhythm is this?' : 'Analyze this rhythm'}
            </h2>
            <p className="text-emerald-300/70 mt-1">
              {mode === 'quiz' ? 'Select your answer below' : 'Fill in the analysis below'}
            </p>
          </div>
        )}

        {/* ECG Strip */}
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="overflow-x-auto">
            <RhythmStrip
              waveformType={selectedRhythm.waveform}
              heartRate={selectedRhythm.rate}
              atrialRate={selectedRhythm.atrialRate}
              speed={25}
              pixelsPerMm={4}
              height={200}
              width={800}
              isRunning={isRunning}
              caliperMode={caliperMode}
            />
          </div>
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={() => {
                const newRunning = !isRunning;
                setIsRunning(newRunning);
                if (newRunning) setCaliperMode(false);
              }}
              className={`px-6 py-2 rounded-lg font-medium ${isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
            >
              {isRunning ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => {
                const newMode = !caliperMode;
                setCaliperMode(newMode);
                if (newMode) setIsRunning(false);
              }}
              className={`px-6 py-2 rounded-lg font-medium ${caliperMode ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'}`}
            >
              {caliperMode ? 'Calipers On' : 'Calipers'}
            </button>
          </div>
          {/* Next/Previous buttons */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={() => {
                const idx = rhythms.findIndex(r => r.id === selectedRhythm.id);
                if (idx > 0) handleRhythmChange(rhythms[idx - 1].id);
              }}
              disabled={rhythms.findIndex(r => r.id === selectedRhythm.id) === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              ← Previous
            </button>
            <button
              onClick={() => {
                const idx = rhythms.findIndex(r => r.id === selectedRhythm.id);
                if (idx < rhythms.length - 1) handleRhythmChange(rhythms[idx + 1].id);
              }}
              disabled={rhythms.findIndex(r => r.id === selectedRhythm.id) === rhythms.length - 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
          {caliperMode && (
            <p className="text-center text-sm text-cyan-600 mt-2">
              Click two points on the strip to measure interval — click again to reset
            </p>
          )}
        </div>

        {/* Quiz Mode - Multiple Choice */}
        {mode === 'quiz' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Select your answer:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {quizOptions.map((option, index) => {
                const letter = String.fromCharCode(65 + index);
                let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition font-medium ';
                if (!showFeedback) {
                  buttonClass += selectedAnswer === option
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-600 bg-slate-700 hover:border-emerald-500/50 hover:bg-slate-600 text-slate-200';
                } else if (option === selectedRhythm.name) {
                  buttonClass += 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
                } else if (selectedAnswer === option && !isCorrect) {
                  buttonClass += 'border-red-500 bg-red-500/20 text-red-300';
                } else {
                  buttonClass += 'border-slate-700 bg-slate-800 text-slate-500';
                }
                return (
                  <button key={option} onClick={() => handleAnswerSelect(option)} disabled={showFeedback} className={buttonClass}>
                    <span className="flex items-center justify-between">
                      <span><strong className="mr-2">{letter}.</strong>{option}</span>
                      {showFeedback && option === selectedRhythm.name && <span className="text-emerald-400 font-bold">✓</span>}
                      {showFeedback && selectedAnswer === option && option !== selectedRhythm.name && <span className="text-red-400 font-bold">✗</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {showFeedback && (
              <div className="flex gap-3">
                <button onClick={handleTryAgain} className="flex-1 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500">Try Again</button>
                <button onClick={handleNextRandom} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600">Next Random</button>
              </div>
            )}
          </div>
        )}

        {/* Analyze Mode - Fill in the blanks */}
        {mode === 'analyze' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fill in your analysis:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Rhythm Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rhythm</label>
                <input
                  type="text"
                  value={analysisAnswers.rhythm}
                  onChange={(e) => setAnalysisAnswers({...analysisAnswers, rhythm: e.target.value})}
                  disabled={showAnalysisFeedback}
                  placeholder="e.g., Normal Sinus Rhythm"
                  className={`w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 ${showAnalysisFeedback ? 'opacity-60' : ''}`}
                />
                {showAnalysisFeedback && (
                  <p className="text-sm mt-1 text-emerald-400">Answer: {selectedRhythm.name}</p>
                )}
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rate</label>
                <input
                  type="text"
                  value={analysisAnswers.rate}
                  onChange={(e) => setAnalysisAnswers({...analysisAnswers, rate: e.target.value})}
                  disabled={showAnalysisFeedback}
                  placeholder="e.g., 60-100"
                  className={`w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 ${showAnalysisFeedback ? 'opacity-60' : ''}`}
                />
                {showAnalysisFeedback && (
                  <p className="text-sm mt-1 text-emerald-400">Answer: {correctAnalysis.rate}</p>
                )}
              </div>

              {/* Regularity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Regularity</label>
                <input
                  type="text"
                  value={analysisAnswers.regularity}
                  onChange={(e) => setAnalysisAnswers({...analysisAnswers, regularity: e.target.value})}
                  disabled={showAnalysisFeedback}
                  placeholder="e.g., Regular, Irregular"
                  className={`w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 ${showAnalysisFeedback ? 'opacity-60' : ''}`}
                />
                {showAnalysisFeedback && (
                  <p className="text-sm mt-1 text-emerald-400">Answer: {correctAnalysis.regularity}</p>
                )}
              </div>

              {/* P Waves */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">P Waves</label>
                <input
                  type="text"
                  value={analysisAnswers.pWaves}
                  onChange={(e) => setAnalysisAnswers({...analysisAnswers, pWaves: e.target.value})}
                  disabled={showAnalysisFeedback}
                  placeholder="e.g., Normal, Absent"
                  className={`w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 ${showAnalysisFeedback ? 'opacity-60' : ''}`}
                />
                {showAnalysisFeedback && (
                  <p className="text-sm mt-1 text-emerald-400">Answer: {correctAnalysis.pWaves}</p>
                )}
              </div>

              {/* PR Interval */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">PR Interval</label>
                <input
                  type="text"
                  value={analysisAnswers.prInterval}
                  onChange={(e) => setAnalysisAnswers({...analysisAnswers, prInterval: e.target.value})}
                  disabled={showAnalysisFeedback}
                  placeholder="e.g., 0.12-0.20 sec"
                  className={`w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 ${showAnalysisFeedback ? 'opacity-60' : ''}`}
                />
                {showAnalysisFeedback && (
                  <p className="text-sm mt-1 text-emerald-400">Answer: {correctAnalysis.prInterval}</p>
                )}
              </div>

              {/* QRS Complex */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">QRS Complex</label>
                <input
                  type="text"
                  value={analysisAnswers.qrsComplex}
                  onChange={(e) => setAnalysisAnswers({...analysisAnswers, qrsComplex: e.target.value})}
                  disabled={showAnalysisFeedback}
                  placeholder="e.g., Narrow, Wide"
                  className={`w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 ${showAnalysisFeedback ? 'opacity-60' : ''}`}
                />
                {showAnalysisFeedback && (
                  <p className="text-sm mt-1 text-emerald-400">Answer: {correctAnalysis.qrsComplex}</p>
                )}
              </div>
            </div>

            {!showAnalysisFeedback ? (
              <button
                onClick={handleSubmitAnalysis}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600"
              >
                Check Answers
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleTryAgain} className="flex-1 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500">Try Again</button>
                <button onClick={handleNextRandom} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600">Next Random</button>
              </div>
            )}
          </div>
        )}

        {/* Clinical Information (reference mode or after answering) */}
        {(mode === 'learn' || showFeedback || showAnalysisFeedback) && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-5">Clinical Information</h2>
            <div className="space-y-5">
              {selectedRhythm.explanation.split(/\n\n+/).filter(s => s.trim()).map((block, idx) => {
                const lines = block.split('\n').map(l => l.trimEnd());
                const firstLine = lines[0].trim();

                // Detect section headers
                const isAllCaps = /^[A-Z][A-Z0-9\s—\-\/(),.:₂#]+$/.test(firstLine) && firstLine.length < 80;
                const isHeaderColon = /^[A-Z][^a-z]*:/.test(firstLine) && firstLine.length < 80;
                const isHeader = isAllCaps || isHeaderColon;

                // Color-code by section type
                let accent = 'border-slate-600 text-slate-400';
                if (isHeader) {
                  if (/PACING|INDICATION/.test(firstLine)) accent = 'border-red-500/50 text-red-400';
                  else if (/TREATMENT|MANAGEMENT/.test(firstLine)) accent = 'border-emerald-500/50 text-emerald-400';
                  else if (/RECOGNIZE|IDENTIFY|KEY FEATURES|Features/.test(firstLine)) accent = 'border-cyan-500/50 text-cyan-400';
                  else if (/TELL.*APART|DIFFERENT/.test(firstLine)) accent = 'border-amber-500/50 text-amber-400';
                  else if (/TAKEAWAY|PEARL|REMEMBER/.test(firstLine)) accent = 'border-purple-500/50 text-purple-400';
                  else if (/CAUSE/.test(firstLine)) accent = 'border-orange-500/50 text-orange-400';
                  else if (/WHAT/.test(firstLine)) accent = 'border-sky-500/50 text-sky-400';
                }

                const [borderClass, textClass] = accent.split(' ');
                const bodyLines = isHeader ? lines.slice(1).filter(l => l.trim()) : lines.filter(l => l.trim());

                return (
                  <div key={idx} className={isHeader ? `pl-4 border-l-[3px] ${borderClass}` : ''}>
                    {isHeader && (
                      <h3 className={`text-[11px] font-bold tracking-[0.15em] uppercase mb-2 ${textClass}`}>
                        {firstLine.replace(/:$/, '')}
                      </h3>
                    )}
                    {bodyLines.length > 0 && (
                      <div className="space-y-1">
                        {bodyLines.map((line, i) => {
                          const trimmed = line.trim();
                          const isBullet = /^[•—\-]/.test(trimmed);
                          const isNumbered = /^\d+\./.test(trimmed);
                          const content = trimmed.replace(/^[•—\-]\s*/, '').replace(/^\d+\.\s*/, '');

                          if (isBullet) {
                            return (
                              <div key={i} className="flex items-start gap-2.5">
                                <span className="w-1 h-1 mt-2 rounded-full bg-slate-500 shrink-0" />
                                <span className="text-slate-300 text-[14px] leading-relaxed">{content}</span>
                              </div>
                            );
                          }
                          if (isNumbered) {
                            return (
                              <div key={i} className="flex items-start gap-2.5">
                                <span className="text-slate-500 text-[13px] font-medium shrink-0 mt-[1px]">{trimmed.match(/^\d+/)?.[0]}.</span>
                                <span className="text-slate-300 text-[14px] leading-relaxed">{content}</span>
                              </div>
                            );
                          }
                          return <p key={i} className="text-slate-300 text-[14px] leading-relaxed">{trimmed}</p>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-950 border-t border-slate-800 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2025 Mr Pacemaker LLC</p>
        </div>
      </footer>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Unlock All Rhythms</h3>
              <p className="text-slate-400 mb-6">
                Get access to all 46 ECG rhythms including AV blocks, atrial arrhythmias, and ventricular rhythms.
              </p>

              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl p-4 mb-6 border border-emerald-500/30">
                <div className="text-3xl font-bold text-emerald-400 mb-1">$9.99<span className="text-lg font-normal text-slate-400">/month</span></div>
                <p className="text-sm text-slate-400">Cancel anytime</p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/vault"
                  className="block w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 transition"
                >
                  Upgrade to Pro
                </Link>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="block w-full text-slate-400 py-2 hover:text-slate-200 transition"
                >
                  Continue with Free
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
