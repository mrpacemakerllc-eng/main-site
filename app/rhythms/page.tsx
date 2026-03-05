'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import RhythmStrip from '../components/RhythmStrip';
import { Rhythm, rhythms, getQuizOptions, FREE_RHYTHM_IDS } from '../data/rhythms';

type Mode = 'learn' | 'quiz' | 'analyze';

// Analysis answers for each rhythm
// Analysis answers updated per 2018 HRS guidelines (NSR 50-100, brady <50)
const rhythmAnalysis: Record<string, {
  rate: string;
  regularity: string;
  pWaves: string;
  prInterval: string;
  qrsComplex: string;
}> = {
  'nsr': { rate: '50-100', regularity: 'Regular', pWaves: 'Normal, upright', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-tach': { rate: '>100', regularity: 'Regular', pWaves: 'Normal, upright', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-brady': { rate: '<50', regularity: 'Regular', pWaves: 'Normal, upright', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-arrhythmia': { rate: '50-100', regularity: 'Regularly irregular (varies with breathing)', pWaves: 'Normal, upright', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-pause': { rate: 'Variable', regularity: 'Irregular (pause)', pWaves: 'Normal when present', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'sinus-arrest': { rate: 'Variable', regularity: 'Irregular (arrest = 2× P-P)', pWaves: 'Normal when present', prInterval: '0.12-0.20 sec', qrsComplex: 'Narrow (<0.12 sec)' },
  'nsr-pac': { rate: '50-100', regularity: 'Regularly irregular (early beats)', pWaves: 'Abnormal before PAC', prInterval: 'Variable', qrsComplex: 'Narrow (<0.12 sec)' },
  'nsr-pvc': { rate: '50-100', regularity: 'Regularly irregular (early beats)', pWaves: 'None before PVC', prInterval: 'None before PVC', qrsComplex: 'Wide (>0.12 sec) for PVC' },
  'v-bigeminy': { rate: '50-100', regularity: 'Regularly irregular (N-PVC-N-PVC)', pWaves: 'Present before normal beats', prInterval: 'Normal before sinus beats', qrsComplex: 'Alternating narrow/wide' },
  'v-trigeminy': { rate: '50-100', regularity: 'Regularly irregular (N-N-PVC)', pWaves: 'Present before normal beats', prInterval: 'Normal before sinus beats', qrsComplex: 'Every 3rd beat wide' },
  'first-degree': { rate: '50-100', regularity: 'Regular', pWaves: 'Normal, upright', prInterval: '>0.20 sec (prolonged)', qrsComplex: 'Narrow (<0.12 sec)' },
  'mobitz1': { rate: '50-100', regularity: 'Regularly irregular (grouped beating)', pWaves: 'More P than QRS', prInterval: 'Progressive lengthening', qrsComplex: 'Narrow (<0.12 sec)' },
  'mobitz2': { rate: '50-100', regularity: 'Regularly irregular (dropped beats)', pWaves: 'More P than QRS', prInterval: 'Constant', qrsComplex: 'Often wide' },
  'block-2to1': { rate: '~38 (half atrial rate)', regularity: 'Regular', pWaves: '2 P waves per QRS', prInterval: 'Constant in conducted beats', qrsComplex: 'Narrow or Wide (determines type)' },
  'chb': { rate: '30-40', regularity: 'Regular (P and QRS independent)', pWaves: 'Present, dissociated', prInterval: 'Variable (no relationship)', qrsComplex: 'Wide (escape rhythm)' },
  'wap': { rate: '50-100', regularity: 'Irregularly irregular', pWaves: '3+ different morphologies', prInterval: 'Variable', qrsComplex: 'Narrow (<0.12 sec)' },
  'mat': { rate: '>100', regularity: 'Irregularly irregular', pWaves: '3+ different morphologies', prInterval: 'Variable', qrsComplex: 'Narrow (<0.12 sec)' },
  'atrial-tach': { rate: '100-250', regularity: 'Regular', pWaves: 'Abnormal morphology', prInterval: 'Variable', qrsComplex: 'Narrow (<0.12 sec)' },
  'junctional': { rate: '40-60', regularity: 'Regular', pWaves: 'Absent or inverted', prInterval: 'Short or absent', qrsComplex: 'Narrow (<0.12 sec)' },
  'accel-junctional': { rate: '60-100', regularity: 'Regular', pWaves: 'Absent or inverted', prInterval: 'Short or absent', qrsComplex: 'Narrow (<0.12 sec)' },
  'junctional-tach': { rate: '>100', regularity: 'Regular', pWaves: 'Absent or inverted', prInterval: 'Short or absent', qrsComplex: 'Narrow (<0.12 sec)' },
  'svt': { rate: '150-250', regularity: 'Regular', pWaves: 'Hidden in QRS/T', prInterval: 'Not measurable', qrsComplex: 'Narrow (<0.12 sec)' },
  'afib-slow': { rate: '<50', regularity: 'Irregularly irregular', pWaves: 'Absent (fibrillatory)', prInterval: 'None', qrsComplex: 'Narrow (<0.12 sec)' },
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
  'v-couplet': { rate: '50-100', regularity: 'Irregular (paired PVCs)', pWaves: 'None before PVCs', prInterval: 'None before PVCs', qrsComplex: 'Wide for PVCs' },
  'wpw': { rate: '50-100', regularity: 'Regular', pWaves: 'Normal', prInterval: 'Short (<0.12 sec)', qrsComplex: 'Wide with delta wave' },
  'nsr-pjc': { rate: '50-100', regularity: 'Irregular (early beats)', pWaves: 'Absent or inverted before PJC', prInterval: 'Short or absent', qrsComplex: 'Narrow (<0.12 sec)' },
  'blocked-pac': { rate: '50-100', regularity: 'Irregular (pause after early P)', pWaves: 'Early abnormal P without QRS', prInterval: 'N/A (blocked)', qrsComplex: 'Absent after early P' },
  'lbbb': { rate: '50-100', regularity: 'Regular', pWaves: 'Normal', prInterval: '0.12-0.20 sec', qrsComplex: 'Wide (>0.12 sec), WiLLiaM' },
  'rbbb': { rate: '50-100', regularity: 'Regular', pWaves: 'Normal', prInterval: '0.12-0.20 sec', qrsComplex: 'Wide (>0.12 sec), MaRRoW' },
};

// Simple question pool per rhythm - each rhythm has multiple clinical questions
type QuizQuestion = { question: string; answer: string; distractors: string[]; explanation: string };

const rhythmQuestions: Record<string, QuizQuestion[]> = {
  'nsr': [
    { question: 'What rhythm is this?', answer: 'Normal Sinus Rhythm', distractors: ['Sinus Bradycardia', 'Sinus Tachycardia', 'Junctional Rhythm'], explanation: 'NSR has regular rhythm, rate 50-100 (per 2018 HRS guidelines), upright P waves before each QRS with normal PR interval.' },
    { question: 'NSR originates from which pacemaker?', answer: 'SA node', distractors: ['AV node', 'Bundle of His', 'Purkinje fibers'], explanation: 'The SA node is the primary pacemaker of the heart, located in the right atrium.' },
    { question: 'Normal PR interval range?', answer: '0.12-0.20 seconds', distractors: ['0.08-0.12 seconds', '0.20-0.28 seconds', '0.30-0.40 seconds'], explanation: 'PR interval represents conduction from atria to ventricles. <0.12s suggests pre-excitation, >0.20s indicates first-degree AV block.' },
    { question: 'NSR rate range?', answer: '50-100 bpm', distractors: ['40-60 bpm', '100-150 bpm', '60-100 bpm'], explanation: 'Per 2018 HRS guidelines, NSR is 50-100 bpm. Rate <50 is bradycardia, >100 is tachycardia.' },
  ],
  'sinus-brady': [
    { question: 'What rhythm is this?', answer: 'Sinus Bradycardia', distractors: ['Junctional Escape', 'Complete Heart Block', 'Normal Sinus Rhythm'], explanation: 'Sinus brady has all features of NSR but rate <50 bpm (per 2018 HRS guidelines). Upright P waves distinguish it from junctional.' },
    { question: 'First-line drug for symptomatic sinus bradycardia?', answer: 'Atropine', distractors: ['Adenosine', 'Amiodarone', 'Epinephrine'], explanation: 'Atropine blocks vagal tone, increasing heart rate. Adenosine would slow it further!' },
    { question: 'Sinus brady differs from junctional by:', answer: 'Upright P waves present', distractors: ['No P waves', 'Wide QRS', 'Faster rate'], explanation: 'In sinus brady, the SA node is still the pacemaker so P waves are upright. Junctional has absent or inverted P waves.' },
    { question: 'When is pacing indicated for sinus bradycardia?', answer: 'When symptomatic (dizzy, syncope, hypotension)', distractors: ['Always', 'Never', 'Only if rate < 30'], explanation: 'Many people tolerate bradycardia well (athletes). Pacing is for symptomatic patients not responding to atropine.' },
    { question: 'Common cause of sinus bradycardia:', answer: 'Beta-blockers', distractors: ['Caffeine', 'Thyroid storm', 'Anxiety'], explanation: 'Beta-blockers slow the heart. Other causes include hypothyroidism, increased vagal tone, and inferior MI.' },
  ],
  'sinus-tach': [
    { question: 'What rhythm is this?', answer: 'Sinus Tachycardia', distractors: ['SVT', 'Atrial Flutter', 'Atrial Tachycardia'], explanation: 'Sinus tach has upright P waves, regular rhythm, and rate >100. It\'s a response to something, not a primary arrhythmia.' },
    { question: 'Sinus tach treatment is:', answer: 'Treat the underlying cause', distractors: ['Adenosine', 'Cardioversion', 'Defibrillation'], explanation: 'Sinus tach is compensatory - treat the cause (pain, fever, hypovolemia, anxiety) not the rhythm itself.' },
    { question: 'Key difference: sinus tach vs SVT?', answer: 'Sinus tach has gradual onset/offset', distractors: ['Sinus tach is faster', 'SVT has P waves', 'No difference'], explanation: 'SVT starts and stops abruptly ("flipping a switch"). Sinus tach gradually speeds up and slows down.' },
    { question: 'Common causes of sinus tach include:', answer: 'Pain, fever, hypovolemia, anxiety', distractors: ['Sleep', 'Beta-blockers', 'Hypothermia'], explanation: 'Remember the causes with "PAINFADE": Pain, Anxiety, Infection, Need for O2, Fluids, Anemia, Drugs, Endocrine.' },
  ],
  'afib-slow': [
    { question: 'What rhythm is this?', answer: 'AFib with Slow Ventricular Response', distractors: ['Sinus Bradycardia', 'Junctional Rhythm', 'Complete Heart Block'], explanation: 'AFib is irregularly irregular with NO P waves - just fibrillatory baseline. Slow response means rate <50 (per 2018 HRS guidelines).' },
    { question: 'Hallmark of AFib on ECG:', answer: 'Irregularly irregular with no P waves', distractors: ['Regular rhythm', 'Sawtooth waves', 'Wide QRS'], explanation: 'The chaotic atrial activity produces fibrillatory waves and completely irregular R-R intervals.' },
    { question: 'Major complication of AFib requiring anticoagulation:', answer: 'Stroke', distractors: ['Heart attack', 'Kidney failure', 'Pneumonia'], explanation: 'Blood pools in non-contracting atria forming clots. These can embolize to the brain causing stroke.' },
    { question: 'If AFib is slow due to rate-control meds:', answer: 'Hold or reduce medications', distractors: ['Increase dose', 'Add another med', 'Cardiovert'], explanation: 'Slow AFib is often from too much beta-blocker or calcium channel blocker. Reduce or hold the meds.' },
  ],
  'afib-nvr': [
    { question: 'What rhythm is this?', answer: 'AFib with Normal Ventricular Response', distractors: ['Normal Sinus Rhythm', 'Sinus Arrhythmia', 'AFib with Slow Ventricular Response'], explanation: 'AFib NVR is irregularly irregular with no P waves and a controlled rate of 50-100 bpm.' },
    { question: 'AFib NVR differs from NSR by:', answer: 'Irregularly irregular with no P waves', distractors: ['Rate is different', 'QRS is wider', 'No difference'], explanation: 'NSR is regular with P waves. AFib NVR has the same rate range but is irregular with no P waves.' },
    { question: 'AFib with normal ventricular response is the goal of:', answer: 'Rate control therapy', distractors: ['Rhythm control', 'Defibrillation', 'Pacing'], explanation: 'Rate control aims to keep AFib ventricular rate 50-100 bpm using beta-blockers, CCBs, or digoxin.' },
    { question: 'Even with controlled rate, AFib patients need:', answer: 'Anticoagulation assessment (CHA₂DS₂-VASc)', distractors: ['No further treatment', 'Immediate cardioversion', 'Pacemaker'], explanation: 'AFib at any rate carries stroke risk. Anticoagulation is based on CHA₂DS₂-VASc score, not heart rate.' },
  ],
  'afib-rvr': [
    { question: 'What rhythm is this?', answer: 'AFib with Rapid Ventricular Response', distractors: ['SVT', 'Atrial Flutter', 'Ventricular Tachycardia'], explanation: 'AFib RVR is irregularly irregular with no P waves and rate >100. The irregularity helps distinguish from flutter.' },
    { question: 'First-line rate control for stable AFib RVR?', answer: 'Diltiazem or metoprolol', distractors: ['Adenosine', 'Atropine', 'Lidocaine'], explanation: 'Calcium channel blockers (diltiazem) or beta-blockers slow AV conduction. Adenosine won\'t work - it\'s for reentrant SVT.' },
    { question: 'When to cardiovert AFib RVR?', answer: 'When unstable (hypotension, chest pain, altered mental status)', distractors: ['Always', 'Never', 'Only if rate > 200'], explanation: 'Unstable = syncope, hypotension, chest pain, altered mental status, or heart failure. These need immediate cardioversion.' },
    { question: 'AFib differs from MAT by:', answer: 'AFib has NO P waves', distractors: ['AFib is regular', 'MAT is faster', 'AFib has flutter waves'], explanation: 'MAT has at least 3 different P wave morphologies. AFib has no discernible P waves at all.' },
  ],
  'vtach': [
    { question: 'What rhythm is this?', answer: 'Ventricular Tachycardia', distractors: ['SVT with aberrancy', 'Atrial Flutter', 'Torsades de Pointes'], explanation: 'VT is wide complex (>120ms), regular tachycardia originating from the ventricles. Life-threatening!' },
    { question: 'Wide complex tachycardia - assume:', answer: 'VT until proven otherwise', distractors: ['SVT', 'Artifact', 'Benign'], explanation: 'Treating VT as SVT can be fatal. Treating SVT as VT is safe. Always assume VT with wide complex tachycardia.' },
    { question: 'Treatment for stable VT with pulse?', answer: 'Amiodarone', distractors: ['Adenosine', 'Atropine', 'Observation'], explanation: 'Amiodarone is first-line for stable VT. Adenosine won\'t work (that\'s for SVT). Unstable VT needs cardioversion.' },
    { question: 'VT can progress to:', answer: 'VFib and cardiac arrest', distractors: ['NSR', 'Bradycardia', 'AFib'], explanation: 'VT is unstable and can degenerate into VFib at any moment, causing cardiac arrest.' },
    { question: 'Key ECG finding suggesting VT:', answer: 'AV dissociation', distractors: ['Narrow QRS', 'Regular P waves', 'Normal rate'], explanation: 'AV dissociation (P waves marching independently) proves the rhythm is ventricular in origin.' },
  ],
  'vfib': [
    { question: 'What rhythm is this?', answer: 'Ventricular Fibrillation', distractors: ['Fine AFib', 'Asystole', 'Torsades'], explanation: 'VFib is chaotic, disorganized ventricular activity with no identifiable QRS complexes. No pulse!' },
    { question: 'First action for VFib?', answer: 'Defibrillate immediately', distractors: ['Give epinephrine first', 'Start CPR for 2 min first', 'Check pulse'], explanation: 'VFib is a shockable rhythm - defibrillation is the definitive treatment. Early defib = better survival.' },
    { question: 'VFib is a shockable rhythm - true or false?', answer: 'True - defibrillate', distractors: ['False - pace instead', 'False - medications only', 'False - CPR only'], explanation: 'VFib and pulseless VT are the two shockable rhythms. Asystole and PEA are not shockable.' },
    { question: 'How to confirm VFib vs asystole?', answer: 'Check in 2 leads', distractors: ['One lead is enough', 'Give epinephrine first', 'Wait and see'], explanation: 'Fine VFib can look like asystole. Check multiple leads and ensure leads are connected before calling asystole.' },
  ],
  'torsades': [
    { question: 'What rhythm is this?', answer: 'Torsades de Pointes', distractors: ['Monomorphic VT', 'VFib', 'Polymorphic VT without long QT'], explanation: 'Torsades is polymorphic VT with QRS twisting around the baseline, associated with prolonged QT.' },
    { question: 'Torsades is associated with:', answer: 'Prolonged QT interval', distractors: ['Short PR', 'Delta wave', 'Peaked T waves'], explanation: 'Long QT (>500ms) predisposes to Torsades. Causes: drugs (antiarrhythmics, antibiotics), electrolytes, congenital.' },
    { question: 'First-line treatment for Torsades?', answer: 'IV Magnesium', distractors: ['Amiodarone', 'Lidocaine', 'Adenosine'], explanation: 'Magnesium stabilizes the membrane even with normal Mg levels. Give 2g IV push.' },
    { question: 'Why avoid amiodarone in Torsades?', answer: 'It prolongs QT further', distractors: ['It is too expensive', 'It causes bradycardia', 'It is not effective'], explanation: 'Amiodarone prolongs QT and would make Torsades worse. Use magnesium, correct K+, and consider overdrive pacing.' },
  ],
  'chb': [
    { question: 'What rhythm is this?', answer: 'Complete Heart Block', distractors: ['Mobitz II', '2:1 AV Block', 'First Degree Block'], explanation: 'In CHB (3rd degree), atria and ventricles beat independently. P waves and QRS have no relationship.' },
    { question: 'Key finding in complete heart block:', answer: 'P waves and QRS are independent', distractors: ['Prolonged PR only', 'Dropped beats with pattern', 'No P waves'], explanation: 'AV dissociation is the hallmark - P waves march out regularly, QRS marches out regularly, but they have no relationship.' },
    { question: 'Treatment for symptomatic CHB:', answer: 'Transcutaneous pacing', distractors: ['Adenosine', 'Observation', 'Beta-blockers'], explanation: 'CHB is a pacing emergency. Transcutaneous pacing bridges to transvenous/permanent pacing.' },
    { question: 'CHB requires permanent pacing:', answer: 'Yes, even if asymptomatic', distractors: ['Only if symptomatic', 'Never', 'Only in elderly'], explanation: 'CHB almost always requires permanent pacing because the escape rhythm is unreliable and can fail suddenly.' },
  ],
  'mobitz1': [
    { question: 'What rhythm is this?', answer: 'Mobitz Type I (Wenckebach)', distractors: ['Mobitz Type II', 'Complete Heart Block', 'First Degree Block'], explanation: 'Wenckebach shows progressive PR lengthening until a beat drops, then the cycle repeats.' },
    { question: 'Hallmark of Wenckebach:', answer: 'PR gets longer until QRS drops', distractors: ['Constant PR with dropped beat', 'No P waves', 'Wide QRS'], explanation: 'The PR gradually lengthens each beat until the AV node fails to conduct and a QRS is dropped.' },
    { question: 'Mobitz I is usually:', answer: 'Benign - observation only', distractors: ['Emergency - pace immediately', 'Fatal', 'Requires cardioversion'], explanation: 'Mobitz I is at the AV node level which has good blood supply. Usually benign, often from increased vagal tone.' },
    { question: 'Mobitz I is due to block at:', answer: 'AV node level', distractors: ['SA node', 'His bundle', 'Purkinje fibers'], explanation: 'AV nodal block = usually benign (Mobitz I). Infranodal block = dangerous (Mobitz II).' },
  ],
  'mobitz2': [
    { question: 'What rhythm is this?', answer: 'Mobitz Type II', distractors: ['Mobitz Type I', 'Complete Heart Block', '2:1 Block'], explanation: 'Mobitz II has constant PR intervals with sudden dropped beats. Often has wide QRS indicating infranodal disease.' },
    { question: 'Key difference from Mobitz I:', answer: 'PR is constant before dropped beat', distractors: ['PR lengthens', 'No P waves', 'Narrow QRS'], explanation: 'In Mobitz II, PR is fixed - the beat drops suddenly without warning. This is what makes it dangerous.' },
    { question: 'Mobitz II is dangerous because:', answer: 'Can progress suddenly to complete heart block', distractors: ['It is benign', 'It is painful', 'It causes hypertension'], explanation: 'Mobitz II indicates His-Purkinje disease which can suddenly fail completely, causing asystole.' },
    { question: 'Management of Mobitz II:', answer: 'Prepare pacing, plan for permanent pacer', distractors: ['Observation only', 'Adenosine', 'Cardioversion'], explanation: 'Mobitz II is a pacing indication even when asymptomatic due to risk of sudden complete block.' },
  ],
  'junctional': [
    { question: 'What rhythm is this?', answer: 'Junctional Escape Rhythm', distractors: ['Sinus Bradycardia', 'Idioventricular Rhythm', 'AFib'], explanation: 'Junctional rhythm has narrow QRS (40-60 bpm) with absent, inverted, or retrograde P waves.' },
    { question: 'Junctional rhythm indicates:', answer: 'SA node has failed', distractors: ['Normal finding', 'Ventricular problem', 'Atrial problem'], explanation: 'Junctional rhythm is an escape rhythm - the AV junction takes over when the SA node fails.' },
    { question: 'P waves in junctional rhythm are:', answer: 'Absent, inverted, or retrograde', distractors: ['Upright and normal', 'Always present', 'Wide and tall'], explanation: 'Since impulse comes from AV junction, P waves are either hidden in QRS, inverted before QRS, or retrograde after QRS.' },
    { question: 'Junctional escape rate:', answer: '40-60 bpm', distractors: ['50-100 bpm', '20-40 bpm', '100-150 bpm'], explanation: 'AV junction inherent rate is 40-60 bpm. SA node is 50-100 (per 2018 HRS), ventricles are 20-40.' },
  ],
  'svt': [
    { question: 'What rhythm is this?', answer: 'SVT', distractors: ['Sinus Tachycardia', 'Atrial Flutter', 'VT'], explanation: 'SVT is a narrow complex, regular tachycardia (150-250 bpm) with P waves often hidden. Abrupt onset/offset.' },
    { question: 'First treatment for stable SVT:', answer: 'Vagal maneuvers', distractors: ['Cardioversion', 'Defibrillation', 'Atropine'], explanation: 'Vagal maneuvers (Valsalva, carotid massage) increase vagal tone and can break the reentrant circuit.' },
    { question: 'If vagal maneuvers fail, next step:', answer: 'Adenosine 6mg rapid IV push', distractors: ['Amiodarone', 'Defibrillate', 'Observe'], explanation: 'Adenosine briefly blocks AV conduction, breaking the reentrant circuit. Must be given fast IV push with flush.' },
    { question: 'SVT differs from sinus tach by:', answer: 'Abrupt onset and offset', distractors: ['Gradual onset', 'Visible P waves', 'Slower rate'], explanation: 'SVT starts and stops suddenly ("like flipping a switch"). Sinus tach gradually accelerates and decelerates.' },
  ],
  'first-degree': [
    { question: 'What rhythm is this?', answer: 'First Degree AV Block', distractors: ['Normal Sinus Rhythm', 'Mobitz I', 'Mobitz II'], explanation: 'First degree block has prolonged PR interval (>0.20s) but every P wave conducts - no dropped beats.' },
    { question: 'PR interval in first degree block:', answer: '>0.20 seconds (prolonged)', distractors: ['<0.12 seconds', '0.12-0.20 seconds', 'Variable'], explanation: 'First degree = PR > 200ms. Every beat conducts, just slowly through the AV node.' },
    { question: 'First degree block requires pacing:', answer: 'No - it is benign', distractors: ['Yes - always', 'Only if symptomatic', 'Only if PR > 0.30'], explanation: 'First degree block alone never needs pacing. It\'s a delay, not a block. All beats conduct.' },
    { question: 'First degree block is caused by:', answer: 'Slowed AV node conduction', distractors: ['SA node failure', 'Bundle branch block', 'Ventricular ectopy'], explanation: 'The AV node conducts slowly (aging, drugs, ischemia) but reliably. No beats are dropped.' },
  ],
  'block-2to1': [
    { question: 'What rhythm is this?', answer: '2:1 AV Block', distractors: ['Complete Heart Block', 'Mobitz II', 'Atrial Flutter'], explanation: '2:1 block has exactly 2 P waves for every QRS. Cannot distinguish Mobitz I vs II with 2:1 ratio.' },
    { question: '2:1 block is ambiguous because:', answer: 'Cannot tell if Mobitz I or II', distractors: ['PR is always normal', 'It is always benign', 'QRS is always wide'], explanation: 'With only one conducted beat between dropped beats, you can\'t see PR lengthening (Mobitz I) or constant PR (Mobitz II).' },
    { question: 'How to determine type of 2:1 block:', answer: 'Look at QRS width - wide suggests Mobitz II', distractors: ['Give adenosine', 'Always assume benign', 'Check blood pressure'], explanation: 'Wide QRS suggests infranodal (Mobitz II). Narrow QRS suggests AV nodal (Mobitz I). Atropine may help differentiate.' },
  ],
  'sinus-arrhythmia': [
    { question: 'What rhythm is this?', answer: 'Sinus Arrhythmia', distractors: ['AFib', 'MAT', 'Wandering Atrial Pacemaker'], explanation: 'Sinus arrhythmia has normal P waves with rate varying with respiration. Speeds up on inspiration.' },
    { question: 'Sinus arrhythmia varies with:', answer: 'Breathing (respiratory variation)', distractors: ['Blood pressure', 'Body position', 'Time of day'], explanation: 'Rate increases with inspiration, decreases with expiration. This is normal vagal tone variation.' },
    { question: 'Sinus arrhythmia is:', answer: 'Normal - no treatment needed', distractors: ['Dangerous - needs pacing', 'Pre-AFib - needs ablation', 'Requires beta-blockers'], explanation: 'Sinus arrhythmia is completely benign and common in young, healthy people. Sign of good vagal tone.' },
  ],
  'sinus-pause': [
    { question: 'What rhythm is this?', answer: 'Sinus Pause', distractors: ['Sinus Arrest', 'Blocked PAC', 'Second Degree Block'], explanation: 'Sinus pause is a temporary failure of SA node firing. Pause is NOT a multiple of the P-P interval.' },
    { question: 'Sinus pause differs from sinus arrest by:', answer: 'Pause is shorter and not a multiple of P-P', distractors: ['Pause is longer', 'Arrest has P waves', 'No difference'], explanation: 'Sinus pause: SA node hesitates briefly. Sinus arrest: SA node completely stops (pause = exact multiple of P-P).' },
    { question: 'Treatment for symptomatic sinus pause:', answer: 'Pacemaker if recurrent and symptomatic', distractors: ['Adenosine', 'Cardioversion', 'Beta-blockers'], explanation: 'Recurrent symptomatic pauses indicate sick sinus syndrome requiring permanent pacing.' },
  ],
  'sinus-arrest': [
    { question: 'What rhythm is this?', answer: 'Sinus Arrest', distractors: ['Sinus Pause', 'Complete Heart Block', 'Asystole'], explanation: 'Sinus arrest: SA node completely stops. Pause equals exact multiple of P-P interval (2x, 3x, etc.).' },
    { question: 'Key finding in sinus arrest:', answer: 'Pause is exact multiple of P-P interval', distractors: ['Irregular P-P intervals', 'No P waves ever', 'Wide QRS'], explanation: 'In arrest, SA node stops completely so pause = 2x, 3x the normal P-P. In pause, it\'s not an exact multiple.' },
    { question: 'Sinus arrest is part of:', answer: 'Sick Sinus Syndrome', distractors: ['WPW syndrome', 'Brugada syndrome', 'Long QT syndrome'], explanation: 'Sick sinus syndrome includes sinus arrest, sinus pauses, and tachy-brady syndrome. Often needs pacing.' },
  ],
  'asystole': [
    { question: 'What rhythm is this?', answer: 'Asystole', distractors: ['Fine VFib', 'Complete Heart Block', 'Pulseless VT'], explanation: 'Asystole is a flat line - no electrical activity. Confirm in 2 leads and check connections.' },
    { question: 'Asystole is a shockable rhythm:', answer: 'No - NOT shockable', distractors: ['Yes - defibrillate', 'Yes - cardiovert', 'Only if fine'], explanation: 'Asystole and PEA are NOT shockable. Only VFib and pulseless VT are shockable rhythms.' },
    { question: 'Treatment for asystole:', answer: 'CPR + Epinephrine', distractors: ['Defibrillation', 'Amiodarone', 'Cardioversion'], explanation: 'High quality CPR and epinephrine every 3-5 min. Address reversible causes (Hs and Ts). Defibrillation won\'t help.' },
    { question: 'Before calling asystole, always:', answer: 'Check leads and confirm in 2 leads', distractors: ['Give epinephrine', 'Shock once', 'Start pacing'], explanation: 'Fine VFib can look like asystole. Always check lead connections and confirm in a second lead.' },
  ],
  'nsr-pac': [
    { question: 'What rhythm is this?', answer: 'NSR with PACs', distractors: ['NSR with PVCs', 'AFib', 'MAT'], explanation: 'PACs are early beats from atria (not SA node). P wave looks different, QRS is narrow.' },
    { question: 'PAC stands for:', answer: 'Premature Atrial Contraction', distractors: ['Premature Atrial Capture', 'Post-Atrial Contraction', 'Peripheral Atrial Complex'], explanation: 'The atria fire early from an ectopic focus, producing an abnormal-looking P wave before a narrow QRS.' },
    { question: 'PACs usually require:', answer: 'No treatment - usually benign', distractors: ['Ablation', 'Amiodarone', 'Pacemaker'], explanation: 'PACs are very common and usually benign. Treat only if very symptomatic. Reduce caffeine/stress.' },
    { question: 'PAC P wave looks:', answer: 'Different from sinus P wave', distractors: ['Identical to sinus', 'Always inverted', 'Always absent'], explanation: 'Since PAC comes from different atrial location, P wave morphology differs from sinus P waves.' },
  ],
  'nsr-pvc': [
    { question: 'What rhythm is this?', answer: 'NSR with PVCs', distractors: ['NSR with PACs', 'VTach', 'Bigeminy'], explanation: 'PVCs are early wide QRS beats from ventricles. No P wave before PVC, followed by compensatory pause.' },
    { question: 'PVC stands for:', answer: 'Premature Ventricular Contraction', distractors: ['Premature Vagal Contraction', 'Post-Ventricular Complex', 'Peripheral Ventricular Capture'], explanation: 'The ventricle fires early from an ectopic focus, producing a wide, bizarre QRS without preceding P wave.' },
    { question: 'PVCs have what characteristic QRS:', answer: 'Wide and bizarre (>0.12 sec)', distractors: ['Narrow and normal', 'Absent', 'Delta wave'], explanation: 'Since PVC originates in ventricle, it bypasses normal conduction system causing wide, abnormal QRS.' },
    { question: 'Frequent PVCs may indicate:', answer: 'Underlying heart disease or electrolyte issues', distractors: ['Normal heart', 'Need for pacing', 'Atrial problem'], explanation: 'Occasional PVCs are common. Frequent PVCs (>10% of beats) may indicate ischemia, cardiomyopathy, or electrolyte imbalance.' },
  ],
  'nsr-pjc': [
    { question: 'What rhythm is this?', answer: 'NSR with PJCs', distractors: ['NSR with PACs', 'Junctional Rhythm', 'NSR with PVCs'], explanation: 'PJCs are premature beats from AV junction. P wave is absent, inverted, or retrograde with narrow QRS.' },
    { question: 'PJC originates from:', answer: 'AV junction', distractors: ['SA node', 'Atria', 'Ventricles'], explanation: 'Premature Junctional Contractions come from AV junction, producing narrow QRS with absent/inverted P waves.' },
    { question: 'PJC differs from PAC by:', answer: 'P wave is absent or inverted in PJC', distractors: ['QRS is wide in PJC', 'PJC has pause', 'No difference'], explanation: 'PACs have abnormal but upright P waves. PJCs have no P wave or inverted P wave (retrograde conduction).' },
  ],
  'blocked-pac': [
    { question: 'What rhythm is this?', answer: 'Blocked PAC', distractors: ['Sinus Pause', 'Mobitz II', 'Sinus Arrest'], explanation: 'Blocked PAC: early P wave visible but no QRS follows - the PAC finds AV node refractory.' },
    { question: 'In blocked PAC, you see:', answer: 'Early P wave with no QRS', distractors: ['Wide QRS', 'No P wave', 'Inverted T wave'], explanation: 'The premature atrial beat arrives when AV node is still refractory, so it doesn\'t conduct to ventricles.' },
    { question: 'Blocked PAC can mimic:', answer: 'Sinus pause or second degree block', distractors: ['VTach', 'AFib', 'First degree block'], explanation: 'The pause from blocked PAC looks like sinus pause. Look carefully for the early P wave hiding in the T wave.' },
  ],
  'aflutter-svr': [
    { question: 'What rhythm is this?', answer: 'Atrial Flutter with Controlled Response', distractors: ['AFib', 'Sinus Tachycardia', 'MAT'], explanation: 'Flutter has sawtooth waves at 250-350/min. With controlled response, ventricular rate is slower due to AV block.' },
    { question: 'Classic flutter wave appearance:', answer: 'Sawtooth pattern', distractors: ['Fibrillatory baseline', 'Peaked T waves', 'Delta waves'], explanation: 'Flutter waves create a distinctive sawtooth pattern best seen in leads II, III, aVF.' },
    { question: 'Typical atrial rate in flutter:', answer: '250-350 bpm', distractors: ['60-100 bpm', '100-150 bpm', '400-600 bpm'], explanation: 'Atrial flutter typically has atrial rate around 300 bpm with variable AV block (2:1, 3:1, 4:1).' },
  ],
  'aflutter-rvr': [
    { question: 'What rhythm is this?', answer: 'Atrial Flutter with RVR', distractors: ['SVT', 'AFib RVR', 'VTach'], explanation: 'Flutter with rapid response often has 2:1 block giving ventricular rate ~150 bpm. Look for flutter waves.' },
    { question: 'Flutter with 2:1 block gives rate of:', answer: '~150 bpm', distractors: ['~75 bpm', '~300 bpm', '~200 bpm'], explanation: 'Atrial rate 300, 2:1 block = ventricular rate 150. This is very common presentation of flutter.' },
    { question: 'Treatment for unstable flutter RVR:', answer: 'Synchronized cardioversion', distractors: ['Defibrillation', 'Adenosine', 'Observation'], explanation: 'Unstable = cardiovert. Stable = rate control (diltiazem, beta-blocker) or rhythm control.' },
  ],
  'wap': [
    { question: 'What rhythm is this?', answer: 'Wandering Atrial Pacemaker', distractors: ['MAT', 'AFib', 'NSR with PACs'], explanation: 'WAP has 3+ different P wave morphologies with rate <100. The pacemaker wanders between atrial foci.' },
    { question: 'WAP differs from MAT by:', answer: 'Rate - WAP is <100, MAT is >100', distractors: ['P wave morphology', 'QRS width', 'Regularity'], explanation: 'Both have 3+ P wave morphologies. WAP rate <100 bpm, MAT rate >100 bpm. Same mechanism, different rates.' },
    { question: 'WAP is usually:', answer: 'Benign - no treatment needed', distractors: ['Emergency', 'Needs ablation', 'Needs pacing'], explanation: 'WAP is benign variation. If rate increases >100, it becomes MAT which may need treatment.' },
  ],
  'mat': [
    { question: 'What rhythm is this?', answer: 'Multifocal Atrial Tachycardia', distractors: ['AFib', 'WAP', 'Atrial Flutter'], explanation: 'MAT has 3+ different P wave morphologies with rate >100. Common in COPD patients.' },
    { question: 'MAT is commonly seen in:', answer: 'COPD and pulmonary disease', distractors: ['Young athletes', 'Healthy hearts', 'Hypothyroidism'], explanation: 'MAT is strongly associated with pulmonary disease, especially COPD. Treat the underlying lung disease.' },
    { question: 'MAT treatment focuses on:', answer: 'Treating underlying pulmonary disease', distractors: ['Cardioversion', 'Adenosine', 'Ablation'], explanation: 'MAT responds poorly to cardioversion/drugs. Correct hypoxia, electrolytes, and treat COPD.' },
    { question: 'MAT has how many P wave morphologies:', answer: 'At least 3 different morphologies', distractors: ['1 morphology', '2 morphologies', 'No P waves'], explanation: 'By definition, MAT requires 3 or more distinct P wave shapes from multiple atrial foci.' },
  ],
  'atrial-tach': [
    { question: 'What rhythm is this?', answer: 'Atrial Tachycardia', distractors: ['Sinus Tachycardia', 'SVT', 'Atrial Flutter'], explanation: 'Atrial tach has abnormal P waves (different from sinus) at rate 100-250 with normal PR interval.' },
    { question: 'Atrial tach differs from sinus tach by:', answer: 'P wave morphology is different from sinus', distractors: ['Rate is faster', 'QRS is wider', 'No difference'], explanation: 'In atrial tach, the P wave looks different because it originates from ectopic atrial focus, not SA node.' },
    { question: 'Atrial tach responds to adenosine:', answer: 'May slow temporarily but usually doesn\'t terminate', distractors: ['Always terminates', 'Never responds', 'Causes VFib'], explanation: 'Unlike AVNRT/AVRT (which terminate), atrial tach may transiently slow showing flutter/P waves but usually continues.' },
  ],
  'accel-junctional': [
    { question: 'What rhythm is this?', answer: 'Accelerated Junctional Rhythm', distractors: ['Junctional Escape', 'Junctional Tachycardia', 'NSR'], explanation: 'Accelerated junctional has rate 60-100 bpm with absent/inverted P waves. Faster than escape, slower than tach.' },
    { question: 'Accelerated junctional rate:', answer: '60-100 bpm', distractors: ['40-60 bpm', '>100 bpm', '<40 bpm'], explanation: 'Junctional escape: 40-60. Accelerated junctional: 60-100. Junctional tach: >100.' },
    { question: 'Accelerated junctional is often seen after:', answer: 'Cardiac surgery or digoxin toxicity', distractors: ['Exercise', 'Sleep', 'Caffeine'], explanation: 'Post-cardiac surgery and digoxin toxicity are common causes of accelerated junctional rhythm.' },
  ],
  'junctional-tach': [
    { question: 'What rhythm is this?', answer: 'Junctional Tachycardia', distractors: ['SVT', 'Accelerated Junctional', 'Atrial Tachycardia'], explanation: 'Junctional tach has rate >100 with absent/inverted P waves. Often from digoxin toxicity or post-op.' },
    { question: 'Junctional tachycardia rate:', answer: '>100 bpm', distractors: ['40-60 bpm', '60-100 bpm', '<40 bpm'], explanation: 'When junctional rhythm exceeds 100 bpm, it\'s called junctional tachycardia.' },
    { question: 'Common cause of junctional tachycardia:', answer: 'Digoxin toxicity', distractors: ['Hypokalemia', 'Hypothermia', 'Sleep'], explanation: 'Digoxin toxicity classically causes junctional tachycardia and other arrhythmias. Check dig level.' },
  ],
  'ivr': [
    { question: 'What rhythm is this?', answer: 'Idioventricular Rhythm', distractors: ['Junctional Escape', 'Complete Heart Block', 'VTach'], explanation: 'IVR is a ventricular escape rhythm at 20-40 bpm. Wide QRS, no P waves. Last backup pacemaker.' },
    { question: 'IVR rate:', answer: '20-40 bpm', distractors: ['40-60 bpm', '60-100 bpm', '>100 bpm'], explanation: 'Ventricular escape rate is 20-40 bpm - the slowest intrinsic pacemaker.' },
    { question: 'IVR indicates:', answer: 'SA and AV node have both failed', distractors: ['Normal rhythm', 'Atrial problem only', 'Drug effect'], explanation: 'IVR means both SA node and AV junction have failed. The ventricles are the last backup.' },
    { question: 'Treatment for IVR:', answer: 'Pacing - don\'t suppress it', distractors: ['Lidocaine', 'Amiodarone', 'Cardioversion'], explanation: 'Never suppress IVR with antiarrhythmics - it\'s keeping the patient alive! Support with pacing.' },
  ],
  'aivr': [
    { question: 'What rhythm is this?', answer: 'Accelerated Idioventricular Rhythm', distractors: ['VTach', 'IVR', 'Junctional Rhythm'], explanation: 'AIVR is ventricular rhythm at 40-100 bpm. Common during reperfusion after MI. Usually benign.' },
    { question: 'AIVR rate:', answer: '40-100 bpm', distractors: ['20-40 bpm', '>100 bpm', '>150 bpm'], explanation: 'AIVR is faster than IVR (20-40) but slower than VTach (>100). Rate 40-100 bpm.' },
    { question: 'AIVR after MI indicates:', answer: 'Reperfusion - good sign', distractors: ['Worsening ischemia', 'Need for CABG', 'Cardiogenic shock'], explanation: 'AIVR is a reperfusion arrhythmia - seeing it after thrombolytics/PCI means the artery opened!' },
    { question: 'AIVR treatment:', answer: 'Observation - usually self-limited', distractors: ['Amiodarone', 'Cardioversion', 'Lidocaine'], explanation: 'AIVR is usually benign and self-limited. Don\'t suppress with antiarrhythmics.' },
  ],
  'v-bigeminy': [
    { question: 'What rhythm is this?', answer: 'Ventricular Bigeminy', distractors: ['Ventricular Trigeminy', 'Couplets', 'NSR with PVCs'], explanation: 'Bigeminy is every other beat is a PVC: normal-PVC-normal-PVC pattern.' },
    { question: 'Bigeminy pattern:', answer: 'Normal beat, PVC, normal beat, PVC', distractors: ['Two PVCs in a row', 'PVC every third beat', 'Three PVCs in a row'], explanation: 'Bi = two. Every group of 2 beats has one normal and one PVC.' },
    { question: 'Bigeminy may cause:', answer: 'Decreased cardiac output (PVCs don\'t pump well)', distractors: ['Increased output', 'No hemodynamic effect', 'Hypertension'], explanation: 'PVCs often have poor stroke volume. With bigeminy, half the beats are ineffective which can drop BP.' },
  ],
  'v-trigeminy': [
    { question: 'What rhythm is this?', answer: 'Ventricular Trigeminy', distractors: ['Ventricular Bigeminy', 'NSR with PVCs', 'NSVT'], explanation: 'Trigeminy is PVC every third beat: normal-normal-PVC pattern.' },
    { question: 'Trigeminy pattern:', answer: 'Normal, normal, PVC repeating', distractors: ['PVC every other beat', 'Three PVCs in a row', 'Normal, PVC, PVC'], explanation: 'Tri = three. Every group of 3 beats has 2 normal beats and 1 PVC.' },
  ],
  'v-couplet': [
    { question: 'What rhythm is this?', answer: 'Ventricular Couplet', distractors: ['Bigeminy', 'NSVT', 'Single PVC'], explanation: 'Couplet is two PVCs in a row. More concerning than isolated PVCs.' },
    { question: 'Couplet consists of:', answer: 'Two consecutive PVCs', distractors: ['One PVC', 'Three PVCs', 'PVC every other beat'], explanation: 'Couplet = pair of PVCs back to back. Triplet = 3 PVCs. Three or more = NSVT.' },
    { question: 'Couplets may progress to:', answer: 'NSVT or sustained VT', distractors: ['NSR', 'Bradycardia', 'AFib'], explanation: 'Couplets indicate ventricular irritability and may be harbinger of longer VT runs.' },
  ],
  'nsvt': [
    { question: 'What rhythm is this?', answer: 'Non-Sustained VT', distractors: ['Sustained VT', 'SVT with aberrancy', 'Ventricular Couplet'], explanation: 'NSVT is 3+ consecutive PVCs lasting <30 seconds. Important warning sign.' },
    { question: 'NSVT definition:', answer: '3+ beats of VT lasting <30 seconds', distractors: ['Any PVC', '2 PVCs', 'VT >30 seconds'], explanation: 'NSVT: ≥3 consecutive ventricular beats at >100 bpm lasting <30 seconds. ≥30 sec = sustained VT.' },
    { question: 'NSVT in structural heart disease:', answer: 'Increases risk of sudden death', distractors: ['Is always benign', 'Requires no workup', 'Is protective'], explanation: 'NSVT in patients with cardiomyopathy or prior MI significantly increases SCD risk. May need ICD.' },
  ],
  'wpw': [
    { question: 'What rhythm is this?', answer: 'WPW Pattern', distractors: ['First Degree Block', 'LBBB', 'LVH'], explanation: 'WPW has short PR (<0.12s), delta wave (slurred QRS upstroke), and wide QRS from accessory pathway.' },
    { question: 'Classic WPW triad:', answer: 'Short PR, delta wave, wide QRS', distractors: ['Long PR, narrow QRS', 'No P waves', 'Sawtooth waves'], explanation: 'The accessory pathway bypasses AV node (short PR) and pre-excites ventricle (delta wave, wide QRS).' },
    { question: 'In WPW with AFib, avoid:', answer: 'AV nodal blockers (digoxin, diltiazem, verapamil)', distractors: ['Procainamide', 'Cardioversion', 'Amiodarone'], explanation: 'AV nodal blockers can accelerate conduction down accessory pathway causing VFib. Use procainamide instead.' },
    { question: 'WPW can cause:', answer: 'SVT and risk of sudden death with AFib', distractors: ['Only bradycardia', 'No arrhythmias', 'Only atrial flutter'], explanation: 'WPW causes AVRT (SVT). If AFib develops, rapid accessory conduction can cause VFib.' },
  ],
  'lbbb': [
    { question: 'What rhythm is this?', answer: 'Left Bundle Branch Block', distractors: ['RBBB', 'WPW', 'Ventricular Rhythm'], explanation: 'LBBB has wide QRS (>0.12s) with broad R in I, aVL, V5-V6 and deep S in V1. "WiLLiaM" pattern.' },
    { question: 'LBBB QRS appearance in V1:', answer: 'Deep S wave (rS pattern)', distractors: ['Tall R wave', 'RSR\' pattern', 'Delta wave'], explanation: 'WiLLiaM: W in V1 (deep S), M in V6 (tall R). The left ventricle depolarizes late.' },
    { question: 'New LBBB with chest pain suggests:', answer: 'Acute MI - treat as STEMI equivalent', distractors: ['Benign finding', 'Pulmonary embolism', 'Pericarditis'], explanation: 'New LBBB with ischemic symptoms is a STEMI equivalent - activate cath lab!' },
    { question: 'LBBB makes it difficult to diagnose:', answer: 'MI on ECG (masks ST changes)', distractors: ['Atrial enlargement', 'Heart rate', 'Rhythm'], explanation: 'LBBB causes ST-T changes that mask ischemic changes. Use Sgarbossa criteria or clinical judgment.' },
  ],
  'rbbb': [
    { question: 'What rhythm is this?', answer: 'Right Bundle Branch Block', distractors: ['LBBB', 'WPW', 'LVH'], explanation: 'RBBB has wide QRS with RSR\' (rabbit ears) in V1 and wide S wave in I, V6. "MaRRoW" pattern.' },
    { question: 'RBBB QRS appearance in V1:', answer: 'RSR\' pattern (rabbit ears)', distractors: ['Deep S wave', 'Delta wave', 'Tall R only'], explanation: 'MaRRoW: M in V1 (RSR\'), W in V6 (wide S). The right ventricle depolarizes late.' },
    { question: 'RBBB is more often:', answer: 'Benign (can be normal variant)', distractors: ['Always pathologic', 'Emergency', 'Indication for pacing'], explanation: 'Isolated RBBB can be benign. LBBB is more often associated with structural heart disease.' },
    { question: 'New RBBB with hypoxia may indicate:', answer: 'Pulmonary embolism', distractors: ['MI', 'Pericarditis', 'Hyperkalemia'], explanation: 'New RBBB (especially with S1Q3T3) in hypoxic patient suggests PE with right heart strain.' },
  ],
  'paced-aai': [
    { question: 'What rhythm is this?', answer: 'AAI Pacing', distractors: ['VVI Pacing', 'DDD Pacing', 'NSR'], explanation: 'AAI paces the atrium only. Atrial spike followed by P wave, then native QRS conduction.' },
    { question: 'AAI pacing is used when:', answer: 'Sinus node dysfunction with intact AV conduction', distractors: ['Complete heart block', 'AFib', 'Ventricular tachycardia'], explanation: 'AAI is for sick sinus with good AV conduction. If AV block develops, it won\'t pace ventricles.' },
    { question: 'AAI pacemaker has how many leads:', answer: 'One lead in atrium', distractors: ['One lead in ventricle', 'Two leads', 'Three leads'], explanation: 'AAI = Atrial pacing, Atrial sensing, Inhibited. Single atrial lead.' },
  ],
  'paced-vvi': [
    { question: 'What rhythm is this?', answer: 'VVI Pacing', distractors: ['AAI Pacing', 'DDD Pacing', 'AIVR'], explanation: 'VVI paces ventricle only. Ventricular spike followed by wide QRS. No atrial tracking.' },
    { question: 'VVI pacing produces:', answer: 'Wide QRS after pacing spike (LBBB pattern)', distractors: ['Narrow QRS', 'No QRS', 'RBBB pattern'], explanation: 'RV pacing produces LBBB-like QRS because left ventricle activates late.' },
    { question: 'VVI is often used for:', answer: 'AFib with slow ventricular response', distractors: ['Sinus node dysfunction', 'SVT', 'Young patients'], explanation: 'In chronic AFib (no P waves to track), VVI provides ventricular backup pacing.' },
  ],
  'paced-ddd': [
    { question: 'What rhythm is this?', answer: 'DDD Pacing', distractors: ['VVI Pacing', 'AAI Pacing', 'Biventricular'], explanation: 'DDD paces and senses both chambers. A-spike, P wave, V-spike, wide QRS. Maintains AV synchrony.' },
    { question: 'DDD pacing advantage:', answer: 'Maintains AV synchrony', distractors: ['Simplest mode', 'Longest battery life', 'Single lead'], explanation: 'DDD tracks atrial activity and times ventricular pacing to maintain normal AV relationship.' },
    { question: 'DDD pacemaker has:', answer: 'Two leads (atrium and ventricle)', distractors: ['One lead', 'Three leads', 'No leads'], explanation: 'DDD = Dual chamber pacing, Dual sensing, Dual response. Requires both atrial and ventricular leads.' },
  ],
  'failure-capture-atrial': [
    { question: 'What is this pacemaker malfunction?', answer: 'Atrial Failure to Capture', distractors: ['Ventricular Failure to Capture', 'Undersensing', 'Oversensing'], explanation: 'Atrial spike present but no P wave follows. The pacing stimulus failed to depolarize the atrium.' },
    { question: 'Failure to capture means:', answer: 'Pacing spike doesn\'t produce depolarization', distractors: ['No pacing spike', 'Pacing at wrong time', 'Sensing native beats'], explanation: 'The pacemaker fires (spike visible) but myocardium doesn\'t respond (no P wave or QRS).' },
    { question: 'Causes of failure to capture:', answer: 'Lead dislodgment, elevated threshold, fibrosis', distractors: ['Low battery', 'Electromagnetic interference', 'Patient movement'], explanation: 'Lead moved, scar tissue at tip, or electrolyte abnormalities can raise capture threshold.' },
  ],
  'failure-capture-ventricular': [
    { question: 'What is this pacemaker malfunction?', answer: 'Ventricular Failure to Capture', distractors: ['Atrial Failure to Capture', 'Undersensing', 'Oversensing'], explanation: 'Ventricular spike present but no QRS follows. Dangerous if patient is pacemaker dependent.' },
    { question: 'Ventricular failure to capture is:', answer: 'Potentially life-threatening', distractors: ['Always benign', 'Only cosmetic', 'Never urgent'], explanation: 'If patient depends on pacemaker for ventricular activation, failure to capture = no cardiac output.' },
    { question: 'Treatment for failure to capture:', answer: 'Increase output, check lead, may need revision', distractors: ['Turn off pacemaker', 'Give adenosine', 'Cardioversion'], explanation: 'Increase pacing output. If that fails, lead may need repositioning or replacement.' },
  ],
  'undersensing-atrial': [
    { question: 'What is this pacemaker malfunction?', answer: 'Atrial Undersensing', distractors: ['Atrial Oversensing', 'Failure to Capture', 'Normal Function'], explanation: 'Pacemaker doesn\'t see native P waves, fires inappropriately. Atrial spikes during P waves.' },
    { question: 'Undersensing causes pacemaker to:', answer: 'Fire when it shouldn\'t (doesn\'t see native beats)', distractors: ['Not fire when it should', 'Fire at correct times', 'Stop working'], explanation: 'Pacemaker is "blind" to native activity and paces even when patient\'s own rhythm is present.' },
    { question: 'Fix for undersensing:', answer: 'Increase sensitivity (lower mV threshold)', distractors: ['Decrease sensitivity', 'Increase output', 'Turn off pacemaker'], explanation: 'Lower the sensing threshold so pacemaker can detect smaller native signals.' },
  ],
  'undersensing-ventricular': [
    { question: 'What is this pacemaker malfunction?', answer: 'Ventricular Undersensing', distractors: ['Ventricular Oversensing', 'Failure to Capture', 'Normal Function'], explanation: 'Pacemaker doesn\'t see native QRS, fires during or near native beats. Dangerous!' },
    { question: 'Risk of ventricular undersensing:', answer: 'R-on-T phenomenon causing VT/VFib', distractors: ['Bradycardia', 'Asystole', 'No risk'], explanation: 'Pacing spike landing on T wave (vulnerable period) can trigger VT or VFib.' },
  ],
  'oversensing-atrial': [
    { question: 'What is this pacemaker malfunction?', answer: 'Atrial Oversensing', distractors: ['Atrial Undersensing', 'Failure to Capture', 'Normal Function'], explanation: 'Pacemaker sees signals that aren\'t P waves (noise, T waves) and inhibits. Results in pauses.' },
    { question: 'Oversensing causes pacemaker to:', answer: 'Inhibit when it shouldn\'t (sees false signals)', distractors: ['Fire when it shouldn\'t', 'Increase rate', 'Capture better'], explanation: 'Pacemaker is "fooled" by electrical noise or other signals and doesn\'t pace when needed.' },
    { question: 'Fix for oversensing:', answer: 'Decrease sensitivity (raise mV threshold)', distractors: ['Increase sensitivity', 'Increase output', 'New battery'], explanation: 'Raise the sensing threshold so pacemaker ignores small/false signals.' },
  ],
  'oversensing-ventricular': [
    { question: 'What is this pacemaker malfunction?', answer: 'Ventricular Oversensing', distractors: ['Ventricular Undersensing', 'Failure to Capture', 'Normal Function'], explanation: 'Pacemaker sees non-QRS signals (T waves, noise, myopotentials) and inhibits ventricular pacing.' },
    { question: 'Ventricular oversensing can cause:', answer: 'Symptomatic pauses or syncope', distractors: ['Tachycardia', 'Hypertension', 'No symptoms'], explanation: 'If pacemaker-dependent patient\'s ventricle doesn\'t pace due to oversensing, dangerous pauses occur.' },
    { question: 'Common causes of ventricular oversensing:', answer: 'T wave sensing, EMI, lead fracture', distractors: ['High battery', 'Proper programming', 'New leads'], explanation: 'Double-counting (sensing both QRS and T), electromagnetic interference, or lead damage can cause oversensing.' },
  ],
};

// General ECG knowledge questions - not rhythm specific
const generalECGQuestions: QuizQuestion[] = [
  // Rate & Intervals
  { question: 'Normal QRS duration is:', answer: '<0.12 seconds (3 small boxes)', distractors: ['<0.20 seconds', '<0.04 seconds', '>0.12 seconds'], explanation: 'Normal QRS is <120ms. Wide QRS (>120ms) suggests bundle branch block or ventricular origin.' },
  { question: 'Each small box on ECG paper represents:', answer: '0.04 seconds', distractors: ['0.20 seconds', '0.10 seconds', '1.0 second'], explanation: 'At standard 25mm/s: small box = 1mm = 0.04s. Large box (5mm) = 0.20s.' },
  { question: '300/number of large boxes between R waves gives:', answer: 'Heart rate in bpm', distractors: ['QT interval', 'PR interval', 'QRS duration'], explanation: 'Quick rate calculation: 300÷(large boxes between R-R) = HR. Works for regular rhythms.' },
  { question: 'Count R waves in 6-second strip and multiply by 10 to get:', answer: 'Heart rate for irregular rhythms', distractors: ['QT interval', 'Blood pressure', 'Respiratory rate'], explanation: 'For irregular rhythms, count R waves in 6 seconds × 10 = approximate HR.' },
  { question: 'Prolonged QT interval increases risk of:', answer: 'Torsades de Pointes', distractors: ['AFib', 'First degree block', 'Sinus tachycardia'], explanation: 'Long QT creates conditions for early afterdepolarizations leading to Torsades.' },
  { question: 'Normal QTc interval is:', answer: '<450ms (men) / <460ms (women)', distractors: ['<200ms', '<600ms', '>500ms'], explanation: 'QTc >500ms is high risk for Torsades. Use Bazett formula: QTc = QT/√RR.' },
  { question: 'U waves are most commonly seen with:', answer: 'Hypokalemia', distractors: ['Hyperkalemia', 'Hypercalcemia', 'Hypernatremia'], explanation: 'Prominent U waves suggest low potassium. Also seen in bradycardia and certain drugs.' },
  { question: 'Peaked T waves suggest:', answer: 'Hyperkalemia', distractors: ['Hypokalemia', 'Hypocalcemia', 'Hyponatremia'], explanation: 'Tall, peaked, "tented" T waves are classic for elevated potassium. Check labs urgently!' },

  // P Wave interpretation
  { question: 'Absent P waves with irregular rhythm suggests:', answer: 'Atrial fibrillation', distractors: ['Sinus rhythm', 'Complete heart block', 'Sinus bradycardia'], explanation: 'No P waves + irregularly irregular = AFib. Chaotic atrial activity produces fibrillatory baseline.' },
  { question: 'Inverted P waves in lead II suggest:', answer: 'Junctional or low atrial focus', distractors: ['Normal sinus', 'Hyperkalemia', 'MI'], explanation: 'P waves are normally upright in II. Inverted = impulse coming from below (retrograde conduction).' },
  { question: 'Multiple different P wave morphologies suggest:', answer: 'Wandering Atrial Pacemaker or MAT', distractors: ['Normal sinus', 'AFib', 'Junctional'], explanation: 'WAP (rate <100) or MAT (rate >100) have ≥3 different P wave shapes from multiple atrial foci.' },
  { question: 'Sawtooth P waves (flutter waves) at ~300/min indicate:', answer: 'Atrial Flutter', distractors: ['AFib', 'SVT', 'Sinus tachycardia'], explanation: 'Flutter creates regular sawtooth waves at ~300 bpm. Ventricular rate depends on AV block ratio.' },

  // QRS interpretation
  { question: 'Wide QRS with tachycardia - assume:', answer: 'VT until proven otherwise', distractors: ['SVT with aberrancy', 'Normal', 'Benign'], explanation: 'Wide complex tachycardia is VT until proven otherwise. This is safer for patient care.' },
  { question: 'rSR\' pattern in V1 with QRS >120ms indicates:', answer: 'Right Bundle Branch Block', distractors: ['Left Bundle Branch Block', 'WPW', 'Hyperkalemia'], explanation: 'RBBB shows rSR\' ("M" shape) in V1, wide S in I and V6. Remember: MaRRoW pattern.' },
  { question: 'Broad R wave in V6, deep S in V1 suggests:', answer: 'Left Bundle Branch Block', distractors: ['Right Bundle Branch Block', 'WPW', 'LVH'], explanation: 'LBBB shows broad R in V6, QS or rS in V1. Remember: WiLLiaM pattern.' },
  { question: 'Delta wave with short PR suggests:', answer: 'WPW (Wolff-Parkinson-White)', distractors: ['First degree block', 'LBBB', 'Hyperkalemia'], explanation: 'WPW: accessory pathway causes pre-excitation. Short PR + delta wave (slurred QRS upstroke).' },

  // Axis & Leads
  { question: 'Lead II best shows:', answer: 'P waves and overall rhythm', distractors: ['ST elevation', 'Left ventricular function', 'Right atrial enlargement'], explanation: 'Lead II is aligned with atrial depolarization axis, making P waves most visible.' },
  { question: 'Leads V1-V4 best detect:', answer: 'Anterior wall MI', distractors: ['Inferior MI', 'Lateral MI', 'Posterior MI'], explanation: 'Precordial leads V1-V4 look at the anterior wall. ST elevation here = anterior STEMI.' },
  { question: 'Leads II, III, aVF look at:', answer: 'Inferior wall', distractors: ['Anterior wall', 'Lateral wall', 'Posterior wall'], explanation: 'Inferior leads (II, III, aVF) see the bottom of the heart. Usually RCA territory.' },
  { question: 'ST elevation in leads I, aVL, V5, V6 indicates:', answer: 'Lateral wall MI', distractors: ['Inferior MI', 'Anterior MI', 'Posterior MI'], explanation: 'Lateral leads show lateral wall. Usually circumflex artery territory.' },

  // Rhythm interpretation basics
  { question: 'Regularly irregular rhythm suggests:', answer: 'Second degree AV block or PACs/PVCs in pattern', distractors: ['AFib', 'Complete heart block', 'Sinus rhythm'], explanation: 'Regularly irregular = pattern repeats. Examples: Wenckebach cycles, bigeminy, trigeminy.' },
  { question: 'Irregularly irregular rhythm with no P waves:', answer: 'Atrial Fibrillation', distractors: ['MAT', 'Sinus arrhythmia', 'Second degree block'], explanation: 'Irregularly irregular + absent P waves = classic AFib presentation.' },
  { question: 'Regular rhythm with more P waves than QRS:', answer: 'AV block (2nd or 3rd degree)', distractors: ['AFib', 'Sinus rhythm', 'Atrial flutter'], explanation: 'P:QRS ratio >1:1 = some P waves not conducting. Look at relationship to determine type.' },
  { question: 'Narrow QRS tachycardia with rate exactly 150:', answer: 'Consider Atrial Flutter with 2:1 block', distractors: ['VT', 'Sinus tachycardia', 'AFib'], explanation: 'Rate of exactly 150 is classic for flutter (300÷2). Look closely for hidden flutter waves.' },

  // Treatment knowledge
  { question: 'Adenosine works by:', answer: 'Briefly blocking AV node conduction', distractors: ['Increasing heart rate', 'Strengthening contractions', 'Dilating coronaries'], explanation: 'Adenosine causes transient AV block, breaking reentrant circuits. Give rapid IV push!' },
  { question: 'Epinephrine in cardiac arrest works by:', answer: 'Vasoconstriction improving coronary perfusion', distractors: ['Directly stimulating the heart', 'Reducing oxygen demand', 'Slowing the heart'], explanation: 'Epi\'s alpha effects cause vasoconstriction, improving coronary perfusion pressure during CPR.' },
  { question: 'Amiodarone is used for:', answer: 'VT/VFib and rate control', distractors: ['Bradycardia only', 'Hypertension only', 'Asystole'], explanation: 'Amiodarone: antiarrhythmic for ventricular arrhythmias and AFib rate control. Watch for hypotension.' },
  { question: 'Atropine works by:', answer: 'Blocking vagal (parasympathetic) tone', distractors: ['Blocking sympathetic tone', 'Directly stimulating SA node', 'Slowing AV conduction'], explanation: 'Atropine blocks acetylcholine at muscarinic receptors, removing vagal "brake" on heart rate.' },

  // Clinical scenarios
  { question: 'Chest pain + ST elevation + reciprocal changes =', answer: 'STEMI - activate cath lab', distractors: ['Stable angina', 'Anxiety', 'GERD'], explanation: 'ST elevation with reciprocal depression + symptoms = STEMI. Time is muscle!' },
  { question: 'New LBBB in chest pain patient should be treated as:', answer: 'Possible STEMI equivalent', distractors: ['Benign finding', 'Anxiety', 'Normal variant'], explanation: 'New LBBB + chest pain = STEMI equivalent. Cannot rely on ST changes with LBBB.' },
  { question: 'Electrical alternans (alternating QRS height) suggests:', answer: 'Pericardial effusion/tamponade', distractors: ['MI', 'WPW', 'Hyperkalemia'], explanation: 'Heart swinging in fluid causes beat-to-beat QRS amplitude variation. Check for tamponade!' },
];

// Get the identification question for a rhythm
function getIdentifyQuestion(rhythmId: string, rhythmName: string): { question: string; correctAnswer: string; options: string[]; explanation: string } {
  // Try to get explanation from the question pool
  const questions = rhythmQuestions[rhythmId];
  const identifyQ = questions?.find(q => q.question.toLowerCase().includes('what rhythm'));
  const explanation = identifyQ?.explanation || `This is ${rhythmName}.`;

  return {
    question: 'What rhythm is this?',
    correctAnswer: rhythmName,
    options: shuffleArray([rhythmName, ...getQuizOptions(rhythmName).filter(o => o !== rhythmName).slice(0, 3)]),
    explanation,
  };
}

// Get a clinical question for a rhythm (excludes "What rhythm is this?" questions)
function getClinicalQuestion(rhythmId: string, askedIndices: number[]): { question: string; correctAnswer: string; options: string[]; explanation: string; questionIndex: number } | null {
  const questions = rhythmQuestions[rhythmId];

  // Filter out "What rhythm is this?" type questions and already asked questions
  const availableRhythmQuestions = questions
    ? questions
        .map((q, idx) => ({ ...q, idx, isGeneral: false }))
        .filter(q => !q.question.toLowerCase().includes('what rhythm') && !askedIndices.includes(q.idx))
    : [];

  // Add general ECG questions (with offset index to avoid collision)
  const generalOffset = 1000; // Offset to distinguish general question indices
  const availableGeneralQuestions = generalECGQuestions
    .map((q, idx) => ({ ...q, idx: generalOffset + idx, isGeneral: true }))
    .filter(q => !askedIndices.includes(generalOffset + q.idx - generalOffset));

  // Combine pools - 70% rhythm-specific, 30% general (if rhythm questions available)
  const useGeneral = availableRhythmQuestions.length === 0 ||
    (availableGeneralQuestions.length > 0 && Math.random() < 0.3);

  const pool = useGeneral ? availableGeneralQuestions : availableRhythmQuestions;
  if (pool.length === 0) {
    // Try the other pool
    const fallbackPool = useGeneral ? availableRhythmQuestions : availableGeneralQuestions;
    if (fallbackPool.length === 0) return null;
    const selected = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    return {
      question: selected.question,
      correctAnswer: selected.answer,
      options: shuffleArray([selected.answer, ...selected.distractors]),
      explanation: selected.explanation,
      questionIndex: selected.idx,
    };
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  return {
    question: selected.question,
    correctAnswer: selected.answer,
    options: shuffleArray([selected.answer, ...selected.distractors]),
    explanation: selected.explanation,
    questionIndex: selected.idx,
  };
}

// Check if rhythm has clinical questions available (now always true with general pool)
function hasClinicalQuestions(rhythmId: string): boolean {
  // We now always have general ECG questions available, so always return true
  // This ensures "More Questions" is always offered
  return true;
}

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function RhythmReferenceContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [mode, setMode] = useState<Mode>('learn');
  const [selectedRhythm, setSelectedRhythm] = useState<Rhythm>(rhythms[0]);
  const [isRunning, setIsRunning] = useState(true);
  const [caliperMode, setCaliperMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  // Premium rhythms require purchase
  const isPro = false;
  const purchaseLoading = false;
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Handle direct checkout for ECG Library
  const handleDirectCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/ecg-library/purchase', {
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

  // Handle rhythm query parameter
  useEffect(() => {
    const rhythmId = searchParams.get('rhythm');
    if (rhythmId) {
      const rhythm = rhythms.find(r => r.id === rhythmId);
      if (rhythm) {
        setSelectedRhythm(rhythm);
        // Note: Quiz question will be updated by the main quiz state initialization
        setQuizOptions(getQuizOptions(rhythm.name));
      }
    }
  }, [searchParams]);

  // Check if a rhythm is accessible (free rhythms: NSR, Sinus Brady, Mobitz I)
  const isRhythmLocked = (rhythm: Rhythm) => !isPro && rhythm.premium;

  // Navigation mode - 'sequential' for in-order, 'random' after clicking Random
  const [navMode, setNavMode] = useState<'sequential' | 'random'>('sequential');

  // Quiz state
  const [quizPhase, setQuizPhase] = useState<'identify' | 'clinical'>('identify');
  const [askedQuestionIndices, setAskedQuestionIndices] = useState<number[]>([]);
  const [quizQuestion, setQuizQuestion] = useState<{ question: string; correctAnswer: string; options: string[]; explanation: string }>(() =>
    getIdentifyQuestion(rhythms[0].id, rhythms[0].name)
  );
  const [quizOptions, setQuizOptions] = useState<string[]>(() => getQuizOptions(rhythms[0].name));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Progress tracking (Quizlet-style)
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [masteredRhythms, setMasteredRhythms] = useState<Set<string>>(new Set());
  const [learningRhythms, setLearningRhythms] = useState<Set<string>>(new Set());

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
      if (currentIdx === -1) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        // Find next accessible rhythm
        for (let i = 1; i <= rhythms.length; i++) {
          const nextIdx = (currentIdx + i) % rhythms.length;
          const nextRhythm = rhythms[nextIdx];
          if (isPro || !nextRhythm.premium) {
            setSelectedRhythm(nextRhythm);
            const newQ = getIdentifyQuestion(nextRhythm.id, nextRhythm.name);
            setQuizQuestion(newQ);
            setQuizOptions(newQ.options);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setIsCorrect(false);
            setQuizPhase('identify');
            setAskedQuestionIndices([]);
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
            const newQ = getIdentifyQuestion(prevRhythm.id, prevRhythm.name);
            setQuizQuestion(newQ);
            setQuizOptions(newQ.options);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setIsCorrect(false);
            setQuizPhase('identify');
            setAskedQuestionIndices([]);
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
        ['wap', 'mat', 'atrial-tach', 'afib-slow', 'afib-nvr', 'afib-rvr', 'aflutter-svr', 'aflutter-rvr'].includes(r.id)
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

  const handleRhythmChange = (rhythmId: string, keepNavMode = false) => {
    const rhythm = rhythms.find(r => r.id === rhythmId);
    if (rhythm) {
      // Check if rhythm is locked
      if (isRhythmLocked(rhythm)) {
        setShowUpgradeModal(true);
        return;
      }
      setSelectedRhythm(rhythm);
      const newQ = getIdentifyQuestion(rhythm.id, rhythm.name);
      setQuizQuestion(newQ);
      setQuizOptions(newQ.options);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setQuizPhase('identify');
      setAskedQuestionIndices([]);
      setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
      setShowAnalysisFeedback(false);
      setCaliperMode(false);
      setIsRunning(true);
      if (!keepNavMode) {
        setNavMode('sequential'); // Back to sequential when selecting from dropdown
      }
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    const correct = answer === quizQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Track progress
    setTotalAnswered(prev => prev + 1);
    if (correct) {
      setCorrectCount(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      // Track mastery - if identified correctly in quiz, mark as mastered
      if (quizPhase === 'identify') {
        setMasteredRhythms(prev => new Set([...prev, selectedRhythm.id]));
        setLearningRhythms(prev => {
          const next = new Set(prev);
          next.delete(selectedRhythm.id);
          return next;
        });
      }
    } else {
      setStreak(0);
      // Mark as still learning
      setLearningRhythms(prev => new Set([...prev, selectedRhythm.id]));
      setMasteredRhythms(prev => {
        const next = new Set(prev);
        next.delete(selectedRhythm.id);
        return next;
      });
    }

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
    const newQuestion = getIdentifyQuestion(randomRhythm.id, randomRhythm.name);
    setQuizQuestion(newQuestion);
    setQuizOptions(newQuestion.options);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setQuizPhase('identify');
    setAskedQuestionIndices([]);
    setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
    setShowAnalysisFeedback(false);
    setIsRunning(true);
    setNavMode('random'); // Switch to random mode for subsequent swipes
  };

  const handleMoreQuestions = () => {
    const clinicalQ = getClinicalQuestion(selectedRhythm.id, askedQuestionIndices);
    if (clinicalQ) {
      setQuizQuestion(clinicalQ);
      setQuizOptions(clinicalQ.options);
      setAskedQuestionIndices([...askedQuestionIndices, clinicalQ.questionIndex]);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setQuizPhase('clinical');
    } else {
      // No more questions available
      handleNextRandom();
    }
  };

  const handleTryAgain = () => {
    const newQuestion = getIdentifyQuestion(selectedRhythm.id, selectedRhythm.name);
    setQuizQuestion(newQuestion);
    setQuizOptions(newQuestion.options);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setQuizPhase('identify');
    setAskedQuestionIndices([]);
    setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
    setShowAnalysisFeedback(false);
  };

  // Review rhythms that were missed (still learning)
  const handleReviewMissed = () => {
    const missedRhythmIds = Array.from(learningRhythms);
    if (missedRhythmIds.length === 0) return;

    // Pick a random missed rhythm
    const randomId = missedRhythmIds[Math.floor(Math.random() * missedRhythmIds.length)];
    const missedRhythm = rhythms.find(r => r.id === randomId);
    if (!missedRhythm) return;

    setSelectedRhythm(missedRhythm);
    const newQuestion = getIdentifyQuestion(missedRhythm.id, missedRhythm.name);
    setQuizQuestion(newQuestion);
    setQuizOptions(newQuestion.options);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setQuizPhase('identify');
    setAskedQuestionIndices([]);
    setAnalysisAnswers({ rhythm: '', rate: '', regularity: '', pWaves: '', prInterval: '', qrsComplex: '' });
    setShowAnalysisFeedback(false);
    setIsRunning(true);
  };

  const handleSubmitAnalysis = () => {
    setShowAnalysisFeedback(true);
  };

  const correctAnalysis = rhythmAnalysis[selectedRhythm.id] || rhythmAnalysis['nsr'];

  // Swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return; // Ignore multi-touch (pinch zoom)
    setTouchEnd(null);
    setTouchEndY(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return; // Ignore multi-touch (pinch zoom)
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart - touchEnd;
    const distanceY = Math.abs((touchStartY || 0) - (touchEndY || 0));
    // Only trigger swipe if horizontal movement is dominant (not pinch/scroll)
    if (distanceY > Math.abs(distanceX) * 0.5) return;
    const distance = distanceX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      if (navMode === 'random') {
        // In random mode, swipe goes to random rhythm
        const accessibleRhythms = rhythms.filter(r => r.id !== selectedRhythm.id && !isRhythmLocked(r));
        if (accessibleRhythms.length > 0) {
          const randomRhythm = accessibleRhythms[Math.floor(Math.random() * accessibleRhythms.length)];
          handleRhythmChange(randomRhythm.id, true); // Keep random mode
        }
      } else {
        // Sequential mode - go in order
        const idx = rhythms.findIndex(r => r.id === selectedRhythm.id);
        if (isRightSwipe) {
          // Swipe right = next rhythm (finger moves left to right)
          for (let i = 1; i <= rhythms.length; i++) {
            const nextIdx = (idx + i) % rhythms.length;
            const nextRhythm = rhythms[nextIdx];
            if (isPro || !nextRhythm.premium) {
              handleRhythmChange(nextRhythm.id, true); // Keep nav mode
              break;
            }
          }
        } else {
          // Swipe left = previous rhythm (finger moves right to left)
          for (let i = 1; i <= rhythms.length; i++) {
            const prevIdx = (idx - i + rhythms.length) % rhythms.length;
            const prevRhythm = rhythms[prevIdx];
            if (isPro || !prevRhythm.premium) {
              handleRhythmChange(prevRhythm.id, true); // Keep nav mode
              break;
            }
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-x-hidden">
      {/* Navigation - smaller on mobile */}
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-lg sm:text-2xl font-bold text-white">ECG Rhythm Library</h1>
                {isPro ? (
                  <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-semibold rounded-full">PRO</span>
                ) : (
                  <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold rounded-full">FREE</span>
                )}
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {!isPro && !purchaseLoading && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  disabled={checkoutLoading}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:from-emerald-600 hover:to-cyan-600 transition"
                >
                  {checkoutLoading ? '...' : 'Go Pro'}
                </button>
              )}
              {session && (
                <button
                  onClick={() => signOut({ callbackUrl: '/rhythms' })}
                  className="text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Free user upgrade banner */}
      {!isPro && !purchaseLoading && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 py-2 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-400 font-medium">🔒 Free Plan</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">3 of 49 rhythms</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-300 hidden sm:inline">Unlock causes, treatments & clinical pearls</span>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              disabled={checkoutLoading}
              className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1 rounded-lg text-sm font-semibold transition whitespace-nowrap animate-pulse"
            >
              Unlock All →
            </button>
          </div>
        </div>
      )}

      {/* Rotate hint - iPhone only (max-w 430px portrait) */}
      <div className="hidden max-[430px]:portrait:flex items-center justify-center gap-2 bg-slate-800/80 py-1.5 px-3 text-xs text-slate-400 border-b border-slate-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Rotate for better view</span>
        <span className="mx-2 text-slate-600">•</span>
        <span>Swipe to navigate</span>
      </div>

      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-6 landscape:py-1">
        {/* Controls Row */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-4 mb-4 sm:mb-6 landscape:mb-2 landscape:p-2">
          {/* Mobile: Stack vertically. Desktop: Flex row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 hidden sm:inline">Mode:</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-600 flex-1 sm:flex-none">
                <button
                  onClick={() => { setMode('learn'); setNavMode('sequential'); }}
                  className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium transition ${
                    mode === 'learn' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Learn
                </button>
                <button
                  onClick={() => { setMode('quiz'); handleTryAgain(); setNavMode('sequential'); }}
                  className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium transition ${
                    mode === 'quiz' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Quiz
                </button>
                <button
                  onClick={() => { setMode('analyze'); handleTryAgain(); setNavMode('sequential'); }}
                  className={`flex-1 sm:flex-none px-3 py-2 text-sm font-medium transition ${
                    mode === 'analyze' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Analyze
                </button>
              </div>
            </div>

            {/* Rhythm Dropdown - hidden in quiz/analyze mode until answered */}
            {(mode === 'learn' || showFeedback || showAnalysisFeedback) ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm text-slate-400 shrink-0">Rhythm:</span>
                <select
                  value={selectedRhythm.id}
                  onChange={(e) => handleRhythmChange(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-700 text-white text-sm"
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
              <div className="flex-1 py-2 sm:py-0">
                <p className="text-slate-400 italic text-sm text-center sm:text-left">Answer to reveal rhythm</p>
              </div>
            )}

            {/* Random */}
            <button onClick={handleNextRandom} className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-medium hover:bg-purple-500/30 border border-purple-500/30 text-sm shrink-0">
              Random
            </button>
          </div>
          {/* Keyboard hint - visible on tablet+ screens */}
          <div className="hidden md:block mt-3 pt-3 border-t border-slate-700 text-center">
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
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-6 mb-3 sm:mb-6 landscape:p-2 landscape:mb-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1 sm:mb-2 landscape:mb-0 landscape:flex-row landscape:items-center">
              <h1 className="text-base sm:text-3xl font-bold text-white landscape:text-sm">{selectedRhythm.name}</h1>
              {selectedRhythm.pacingIndication && (
                <span className="px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30 self-start sm:self-auto">
                  PACING
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs sm:text-base landscape:hidden">{selectedRhythm.description}</p>
          </div>
        )}

        {/* Analyze Prompt (quiz prompt moved into quiz section below) */}
        {mode === 'analyze' && !showAnalysisFeedback && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-400">Analyze this rhythm</h2>
            <p className="text-emerald-300/70 mt-1 text-sm sm:text-base">Fill in the analysis below</p>
          </div>
        )}

        {/* ECG Strip - with swipe support on mobile */}
        <div
          className="bg-white p-2 sm:p-4 rounded-xl shadow-lg mb-4 sm:mb-6 landscape:mb-2 landscape:p-1 touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-full">
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
              leadLabel={selectedRhythm.leadLabel}
              responsive={true}
            />
          </div>
          <div className="flex justify-center gap-2 sm:gap-3 mt-3">
            <button
              onClick={() => {
                const newRunning = !isRunning;
                setIsRunning(newRunning);
                if (newRunning) setCaliperMode(false);
              }}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base ${isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
            >
              {isRunning ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => {
                const newMode = !caliperMode;
                setCaliperMode(newMode);
                if (newMode) setIsRunning(false);
              }}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base ${caliperMode ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'}`}
            >
              Calipers
            </button>
          </div>
          {/* Next/Previous buttons */}
          <div className="flex justify-center gap-2 sm:gap-3 mt-3">
            <button
              onClick={() => {
                const idx = rhythms.findIndex(r => r.id === selectedRhythm.id);
                // Find previous accessible rhythm with wrap-around
                for (let i = 1; i <= rhythms.length; i++) {
                  const prevIdx = (idx - i + rhythms.length) % rhythms.length;
                  const prevRhythm = rhythms[prevIdx];
                  if (isPro || !prevRhythm.premium) {
                    handleRhythmChange(prevRhythm.id);
                    break;
                  }
                }
              }}
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm sm:text-base"
            >
              ← Prev
            </button>
            <button
              onClick={() => {
                const idx = rhythms.findIndex(r => r.id === selectedRhythm.id);
                // Find next accessible rhythm with wrap-around
                for (let i = 1; i <= rhythms.length; i++) {
                  const nextIdx = (idx + i) % rhythms.length;
                  const nextRhythm = rhythms[nextIdx];
                  if (isPro || !nextRhythm.premium) {
                    handleRhythmChange(nextRhythm.id);
                    break;
                  }
                }
              }}
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm sm:text-base"
            >
              Next →
            </button>
          </div>
          {caliperMode && (
            <p className="text-center text-xs sm:text-sm text-cyan-600 mt-2 px-2">
              Tap two points to measure interval
            </p>
          )}
        </div>

        {/* Quiz Mode - Multiple Choice */}
        {mode === 'quiz' && (
          <div className="bg-slate-800 p-3 sm:p-6 rounded-xl border border-slate-700 mb-3 sm:mb-6">
            {/* Progress Stats Bar */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Streak */}
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl">{streak > 0 ? '🔥' : '💫'}</span>
                  <div>
                    <p className="text-xs text-slate-500 leading-none">Streak</p>
                    <p className={`text-sm sm:text-base font-bold ${streak >= 5 ? 'text-orange-400' : streak >= 3 ? 'text-amber-400' : 'text-slate-300'}`}>{streak}</p>
                  </div>
                </div>
                {/* Score */}
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl">📊</span>
                  <div>
                    <p className="text-xs text-slate-500 leading-none">Score</p>
                    <p className="text-sm sm:text-base font-bold text-emerald-400">{totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}%</p>
                  </div>
                </div>
              </div>
              {/* Progress */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500 leading-none">Mastered</p>
                  <p className="text-sm sm:text-base font-medium text-emerald-400">{masteredRhythms.size}</p>
                </div>
                {learningRhythms.size > 0 ? (
                  <button
                    onClick={handleReviewMissed}
                    className="text-right px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 transition"
                  >
                    <p className="text-xs text-amber-400 leading-none">Review</p>
                    <p className="text-sm sm:text-base font-medium text-amber-400">{learningRhythms.size}</p>
                  </button>
                ) : (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 leading-none">Learning</p>
                    <p className="text-sm sm:text-base font-medium text-slate-500">0</p>
                  </div>
                )}
              </div>
            </div>

            {/* Guideline Note */}
            <p className="text-xs text-slate-400 mb-3 text-center">
              <span className="text-amber-400">Note:</span> Per 2018 HRS guidelines, NSR is 50-100 bpm (was 60-100). Sinus brady is &lt;50 bpm.
            </p>

            {/* Question - always visible */}
            <div className={`${showFeedback ? (isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30') : 'bg-emerald-500/10 border-emerald-500/30'} border rounded-lg sm:rounded-xl p-3 sm:p-5 mb-3 sm:mb-5 text-center`}>
              <h2 className={`text-sm sm:text-2xl font-bold ${showFeedback ? (isCorrect ? 'text-emerald-400' : 'text-amber-400') : 'text-emerald-400'}`}>{quizQuestion.question}</h2>
            </div>
            <h3 className="text-xs sm:text-lg font-semibold text-white mb-2 sm:mb-4">{showFeedback ? 'Your answer:' : 'Select:'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {quizQuestion.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index);
                let buttonClass = 'w-full p-3 sm:p-4 text-left rounded-lg border-2 transition font-medium text-sm sm:text-base ';
                if (!showFeedback) {
                  buttonClass += selectedAnswer === option
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-600 bg-slate-700 hover:border-emerald-500/50 hover:bg-slate-600 text-slate-200';
                } else if (option === quizQuestion.correctAnswer) {
                  buttonClass += 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
                } else if (selectedAnswer === option && !isCorrect) {
                  buttonClass += 'border-red-500 bg-red-500/20 text-red-300';
                } else {
                  buttonClass += 'border-slate-700 bg-slate-800 text-slate-500';
                }
                return (
                  <button key={option} onClick={() => handleAnswerSelect(option)} disabled={showFeedback} className={buttonClass}>
                    <span className="flex items-center justify-between gap-2">
                      <span><strong className="mr-1 sm:mr-2">{letter}.</strong>{option}</span>
                      {showFeedback && option === quizQuestion.correctAnswer && <span className="text-emerald-400 font-bold shrink-0">✓</span>}
                      {showFeedback && selectedAnswer === option && option !== quizQuestion.correctAnswer && <span className="text-red-400 font-bold shrink-0">✗</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {showFeedback && (
              <div className="space-y-3 sm:space-y-4">
                {/* Feedback message */}
                <div className={`p-3 sm:p-4 rounded-lg ${isCorrect ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
                  <p className={`font-semibold text-sm sm:text-base ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                  </p>
                  <p className="text-slate-300 mt-2 text-xs sm:text-sm">{quizQuestion.explanation}</p>
                </div>

                {/* Action buttons - always show next question + next rhythm */}
                <div className="flex gap-2 sm:gap-3">
                  {hasClinicalQuestions(selectedRhythm.id) && getClinicalQuestion(selectedRhythm.id, askedQuestionIndices) ? (
                    <button onClick={handleMoreQuestions} className="flex-1 py-2.5 sm:py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 text-sm sm:text-base">
                      Next Question
                    </button>
                  ) : (
                    <button onClick={handleTryAgain} className="flex-1 py-2.5 sm:py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500 text-sm sm:text-base">
                      Try Again
                    </button>
                  )}
                  <button onClick={handleNextRandom} className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 text-sm sm:text-base">
                    Next Rhythm
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyze Mode - Fill in the blanks */}
        {mode === 'analyze' && (
          <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Fill in your analysis:</h3>
            <p className="text-xs text-slate-400 mb-3 -mt-1">
              <span className="text-amber-400">Note:</span> Per 2018 HRS guidelines, normal sinus rhythm is now 50-100 bpm (previously 60-100). Sinus bradycardia is &lt;50 bpm.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
                  placeholder="e.g., 50-100"
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
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 text-sm sm:text-base"
              >
                Check Answers
              </button>
            ) : (
              <div className="flex gap-2 sm:gap-3">
                <button onClick={handleTryAgain} className="flex-1 py-2.5 sm:py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500 text-sm sm:text-base">Try Again</button>
                <button onClick={handleNextRandom} className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 text-sm sm:text-base">Next Random</button>
              </div>
            )}
          </div>
        )}

        {/* Clinical Information (reference mode or after answering) */}
        {(mode === 'learn' || showFeedback || showAnalysisFeedback) && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-5">Clinical Information</h2>
            <div className="space-y-5 relative">
              {selectedRhythm.explanation.split(/\n\n+/).filter(s => s.trim()).map((block, idx) => {
                // For free users: show first 2 blocks as teaser, blur the rest
                const isBlurred = !isPro && idx > 1;
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

                // If blurred for free users, show compelling upgrade prompt
                if (isBlurred && idx === 2) {
                  return (
                    <div key={idx} className="relative mt-4">
                      {/* Blurred preview of what's locked */}
                      <div className="blur-[6px] select-none pointer-events-none opacity-60">
                        <div className="space-y-3">
                          <div className="pl-4 border-l-[3px] border-orange-500/50">
                            <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase mb-2 text-orange-400">CAUSES</h3>
                            <p className="text-slate-300 text-[14px]">Underlying etiologies and risk factors...</p>
                          </div>
                          <div className="pl-4 border-l-[3px] border-emerald-500/50">
                            <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase mb-2 text-emerald-400">TREATMENT</h3>
                            <p className="text-slate-300 text-[14px]">Step-by-step management protocols...</p>
                          </div>
                          <div className="pl-4 border-l-[3px] border-red-500/50">
                            <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase mb-2 text-red-400">CLINICAL PEARLS</h3>
                            <p className="text-slate-300 text-[14px]">Expert tips and key differentiators...</p>
                          </div>
                        </div>
                      </div>
                      {/* Upgrade CTA overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-slate-900/95 rounded-xl p-5 text-center border border-amber-500/30 shadow-xl max-w-sm">
                          <div className="text-amber-400 text-2xl mb-2">🔓</div>
                          <p className="text-white font-bold text-lg mb-2">What You're Missing</p>
                          <ul className="text-left text-slate-300 text-sm mb-4 space-y-1.5">
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400">•</span>
                              <span><strong className="text-white">Causes:</strong> Why this rhythm happens</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400">•</span>
                              <span><strong className="text-white">Treatment:</strong> How to manage it</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              <span><strong className="text-white">Clinical Pearls:</strong> Expert insights</span>
                            </li>
                          </ul>
                          <button
                            onClick={() => setShowUpgradeModal(true)}
                            disabled={checkoutLoading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-2.5 rounded-lg font-bold hover:from-amber-400 hover:to-orange-400 transition"
                          >
                            {checkoutLoading ? 'Loading...' : 'Unlock Full Access'}
                          </button>
                          <p className="text-slate-500 text-xs mt-2">$19 one-time · Lifetime access</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (isBlurred) return null; // Hide other blurred sections

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

              {/* Guideline Reference Link */}
              {selectedRhythm.guidelineRef && (
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <a
                    href={selectedRhythm.guidelineRef.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{selectedRhythm.guidelineRef.title}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Disclaimer */}
      <div className="bg-slate-900/80 border-t border-slate-800 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                <span className="text-amber-400 font-semibold">Educational Use Only:</span> Live ECG Rhythm Library is for educational and practice purposes only. It does not provide medical advice or replace professional training. Always follow clinical protocols and consult qualified professionals for patient care.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-slate-950 border-t border-slate-800 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2026 Mr Pacemaker LLC</p>
        </div>
      </footer>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Unlock All 49 Rhythms</h3>
              <p className="text-slate-400 mb-4">
                Master AFib, V-Tach, heart blocks, paced rhythms, and more.
              </p>

              {/* What's included */}
              <div className="text-left bg-slate-900/50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-slate-300 mb-2">Pro includes:</p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> All 49 animated rhythms
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Quiz mode with scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Analysis practice mode
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> EP-reviewed explanations
                  </li>
                </ul>
              </div>

              {/* One-time Price */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl p-4 mb-4 border border-emerald-500/30">
                <div className="text-3xl font-bold text-white mb-1">$19</div>
                <p className="text-sm text-slate-400">One-time payment · Lifetime access</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDirectCheckout()}
                  disabled={checkoutLoading}
                  className="block w-full text-white py-3.5 rounded-lg font-semibold transition disabled:opacity-50 text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                >
                  {checkoutLoading ? 'Loading...' : 'Get Lifetime Access — $19'}
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="block w-full text-slate-500 py-2 hover:text-slate-300 transition text-sm"
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

// Wrap in Suspense for useSearchParams
export default function RhythmReferencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <RhythmReferenceContent />
    </Suspense>
  );
}
