export type WaveformType = 'sinus' | 'sinus_tach' | 'first_degree' | 'junctional' | 'chb' | 'mobitz1' | 'mobitz2' | 'block_2to1' | 'afib_slow' | 'afib_rvr' | 'aflutter_svr' | 'aflutter_rvr' | 'sinus_pause' | 'sinus_arrest' | 'vtach' | 'vfib' | 'nsr_pac' | 'nsr_pvc' | 'torsades' | 'sinus_arrhythmia' | 'asystole' | 'svt' | 'accel_junctional' | 'junctional_tach' | 'wap' | 'mat' | 'atrial_tach' | 'ivr' | 'aivr' | 'v_bigeminy' | 'v_trigeminy' | 'paced_aai' | 'paced_vvi' | 'paced_ddd' | 'failure_capture_a' | 'failure_capture_v' | 'undersensing_a' | 'undersensing_v' | 'oversensing_a' | 'oversensing_v' | 'nsvt' | 'couplet' | 'wpw' | 'nsr_pjc' | 'blocked_pac' | 'lbbb' | 'rbbb';

export interface Rhythm {
  id: string;
  name: string;
  rate: number; // bpm (ventricular rate for heart blocks)
  atrialRate?: number; // atrial rate if different (for AV dissociation)
  description: string;
  waveform: WaveformType;
  explanation: string;
  pacingIndication: boolean;
  premium: boolean; // true = requires subscription
}

// Free rhythm IDs (available without subscription)
export const FREE_RHYTHM_IDS = ['nsr', 'sinus-brady', 'mobitz1'];

export interface RhythmQuiz {
  rhythm: Rhythm;
  options: string[];
  correctAnswer: string;
}

// Sinus Bradycardia - pacing indication if symptomatic
export const sinusBradycardia: Rhythm = {
  id: 'sinus-brady',
  name: 'Sinus Bradycardia',
  rate: 45,
  description: 'Regular rhythm, rate < 60 bpm, normal P waves before each QRS',
  waveform: 'sinus',
  pacingIndication: true,
  premium: false, // FREE
  explanation: `WHAT IS IT
A normal sinus rhythm running slower than 60 bpm. The SA node is firing correctly — just at a reduced rate.

RECOGNIZE IT
• Regular R-R intervals
• Upright P wave before every QRS (1:1 conduction)
• PR interval 0.12–0.20 sec
• Narrow QRS (<0.12 sec)
• Rate < 60 bpm

HOW TO TELL IT APART
• vs Junctional Escape → Junctional has NO upright P waves and rate 40–60
• vs 2:1 AV Block → Count P waves — if 2 P's per QRS, it's block not bradycardia

CAUSES
• Normal in athletes and during sleep
• Medications: beta-blockers, calcium channel blockers, digoxin
• Increased vagal tone, hypothyroidism, hypothermia
• Sick sinus syndrome (SSS)

TREATMENT
• Asymptomatic → no treatment needed
• Symptomatic → atropine 0.5 mg IV (first-line)
• Refractory → transcutaneous pacing as bridge

PACING — CLASS I INDICATION IF SYMPTOMATIC
• Symptomatic bradycardia with documented symptom-rhythm correlation
• Chronotropic incompetence limiting daily activity
• Rate < 40 bpm while awake with symptoms

KEY TAKEAWAY
Symptoms are everything. A rate of 42 bpm in a sleeping athlete is normal. The same rate in a dizzy 80-year-old needs a pacemaker. Always correlate symptoms with the rhythm before deciding on pacing.`
};

// Normal Sinus Rhythm for comparison
export const normalSinusRhythm: Rhythm = {
  id: 'nsr',
  name: 'Normal Sinus Rhythm',
  rate: 72,
  description: 'Regular rhythm, rate 60-100 bpm, normal P waves',
  waveform: 'sinus',
  pacingIndication: false,
  premium: false, // FREE
  explanation: `WHAT IS IT
The gold standard — a healthy heart rhythm originating from the SA node at 60–100 bpm.

RECOGNIZE IT
• Regular R-R intervals
• Upright P wave before every QRS
• PR interval 0.12–0.20 sec
• Narrow QRS (<0.12 sec)
• Rate 60–100 bpm

HOW TO TELL IT APART
• vs Sinus Brady → Same morphology, just rate < 60
• vs Sinus Tach → Same morphology, just rate > 100
• vs Accelerated Junctional → Junctional has no upright P waves

PACING — NOT INDICATED
This is the normal baseline rhythm. Know it cold — every abnormal rhythm is compared to this.

KEY TAKEAWAY
NSR is your reference point. If you can identify every component of NSR (P, PR, QRS, T) you can identify what's missing or abnormal in any other rhythm.`
};

// Sinus Tachycardia
export const sinusTachycardia: Rhythm = {
  id: 'sinus-tach',
  name: 'Sinus Tachycardia',
  rate: 110,
  description: 'Regular rhythm, rate > 100 bpm, normal P waves before each QRS',
  waveform: 'sinus_tach',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
The SA node firing faster than 100 bpm. This is a response to something — not a primary arrhythmia. The heart is doing exactly what it's told.

RECOGNIZE IT
• Regular R-R intervals
• Upright P wave before every QRS (may merge with preceding T at high rates)
• PR interval 0.12–0.20 sec
• Narrow QRS (<0.12 sec)
• Rate 100–180 bpm with gradual onset and offset

HOW TO TELL IT APART
• vs SVT → SVT is abrupt on/off, rate usually > 150, P waves hidden. Sinus tach has gradual acceleration and visible P waves
• vs Atrial Tachycardia → Atrial tach has abnormal P wave morphology (different shape than sinus P)
• vs Atrial Flutter 2:1 → Flutter has sawtooth pattern; rate locks near 150 bpm

CAUSES
• Pain, fever, anxiety, exercise
• Hypovolemia, hemorrhage, dehydration
• PE, sepsis, hyperthyroidism, anemia
• Medications: albuterol, atropine, stimulants

TREATMENT
• Treat the underlying cause — not the rhythm
• Do NOT give beta-blockers blindly (could mask hypovolemia or PE)
• If rate > 150, strongly consider other diagnoses (SVT, flutter)

PACING — NOT INDICATED
Sinus tach is never a pacing indication. It's a symptom, not a disease.

KEY TAKEAWAY
Sinus tach is the heart's check engine light. Don't treat the tachycardia — find out WHY the heart rate is up. If someone says "sinus tach at 150," prove it's not flutter or SVT first.`
};

// First Degree AV Block
export const firstDegreeBlock: Rhythm = {
  id: 'first-degree',
  name: 'First Degree AV Block',
  rate: 65,
  description: 'Regular sinus rhythm with prolonged PR interval (>200ms)',
  waveform: 'first_degree',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
Every atrial impulse conducts to the ventricles — it just takes longer than normal. The AV node is slow, not blocked.

RECOGNIZE IT
• Regular R-R intervals
• P wave before every QRS (1:1 conduction preserved)
• PR interval > 0.20 sec — this is THE finding
• Narrow QRS
• Rate is usually normal

HOW TO TELL IT APART
• vs NSR → Looks identical except the PR is too long. Measure it.
• vs Mobitz I → Mobitz I has progressively LENGTHENING PR intervals and dropped beats. First degree has a constant (but long) PR with no dropped beats.
• vs Mobitz II → Mobitz II drops beats suddenly. First degree never drops a beat.

CAUSES
• Medications: beta-blockers, calcium channel blockers, digoxin
• Increased vagal tone (athletes)
• AV nodal disease, myocarditis
• Inferior MI (right coronary artery supplies AV node)

TREATMENT
• Usually none — this is generally benign
• Monitor for progression to higher-degree block
• Review medications that slow AV conduction

PACING — NOT INDICATED
First degree block alone is benign and does not require pacing. However, if PR is markedly prolonged (> 0.30 sec) and patient is symptomatic from loss of AV synchrony, pacing may be considered.

KEY TAKEAWAY
First degree AV block means "slow but not blocked." Every P wave gets through — it's just late. Know the number: PR > 0.20 sec (> 200 ms = > one big box on ECG paper).`
};

// Mobitz Type I (Wenckebach)
export const mobitzType1: Rhythm = {
  id: 'mobitz1',
  name: 'Mobitz Type I (Wenckebach)',
  rate: 55,
  atrialRate: 75,
  description: 'Progressive PR prolongation until a beat is dropped, then cycle repeats',
  waveform: 'mobitz1',
  pacingIndication: false,
  premium: false, // FREE
  explanation: `WHAT IS IT
Second degree AV block where the AV node gets progressively more fatigued with each beat until it finally fails to conduct one. Then it resets and the cycle repeats.

RECOGNIZE IT
• PR interval gets longer with each beat → then a QRS drops
• Grouped beating pattern (e.g., 4:3, 3:2 conduction ratios)
• After the dropped beat, the PR resets to its shortest length
• Narrow QRS (block is in the AV node)
• R-R intervals shorten slightly before the dropped beat

The classic mantra: "Longer, longer, longer... DROP!"

HOW TO TELL IT APART
• vs Mobitz II → Mobitz II has a CONSTANT PR that suddenly drops. Mobitz I has a CHANGING PR that progressively lengthens.
• vs First Degree → First degree never drops a beat. Mobitz I drops beats in a predictable cycle.
• vs Complete Heart Block → In CHB, P waves and QRS are completely independent. In Mobitz I, they still have a relationship.

CAUSES
• Increased vagal tone
• Medications: beta-blockers, CCBs, digoxin
• Inferior MI (AV node ischemia)
• Myocarditis

TREATMENT
• Usually none needed — this is the "benign" second degree block
• Stop offending medications if possible
• Atropine may temporarily improve conduction
• Rarely needs pacing unless severely symptomatic

PACING — RARELY INDICATED
Mobitz I is AV nodal disease and usually benign. Pacing only if severely symptomatic and not responsive to medication changes. Far less dangerous than Mobitz II.

KEY TAKEAWAY
Mobitz I = the AV node gets tired. It's the friendly second degree block. The changing PR is your clue — if the PR is getting longer beat to beat, it's Wenckebach. If the PR is constant and beats just drop, that's Mobitz II and that's dangerous.`
};

// Junctional Rhythm - escape rhythm, may need pacing
export const junctionalRhythm: Rhythm = {
  id: 'junctional',
  name: 'Junctional Escape Rhythm',
  rate: 42,
  description: 'Regular rhythm from AV junction, absent/inverted P waves, rate 40-60 bpm',
  waveform: 'junctional',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
The AV junction acts as a backup pacemaker when the SA node fails. This is a rescue rhythm — the junction is keeping the patient alive at its intrinsic rate of 40–60 bpm.

RECOGNIZE IT
• Regular R-R intervals
• P waves absent, inverted (before QRS), or retrograde (after QRS)
• Rate 40–60 bpm (the junction's intrinsic rate)
• Narrow QRS complex

HOW TO TELL IT APART
• vs Sinus Brady → Sinus brady has upright P waves before each QRS. Junctional has no upright P waves.
• vs Accelerated Junctional → Same morphology, but accelerated junctional runs 60–100 bpm
• vs IVR → IVR has WIDE QRS (ventricular origin). Junctional has narrow QRS.

CAUSES
• SA node failure (sick sinus syndrome)
• Medications: digoxin, beta-blockers, CCBs
• Post-cardiac surgery
• Inferior MI

TREATMENT
• Assess hemodynamic stability
• Atropine 0.5 mg IV if symptomatic
• Transcutaneous pacing if atropine fails
• Treat underlying cause

PACING — CLASS I IF SYMPTOMATIC
Junctional escape at 40–60 bpm often causes symptoms. If symptomatic, permanent pacing is indicated. This rhythm tells you the SA node has failed.

KEY TAKEAWAY
Know the pacemaker hierarchy: SA node (60–100) → Junction (40–60) → Ventricle (20–40). Junctional escape means the top pacemaker failed and the backup kicked in. Never suppress an escape rhythm — it's the only thing keeping the patient alive.`
};

// Complete Heart Block (3rd Degree AV Block) - CLASSIC pacing indication
export const completeHeartBlock: Rhythm = {
  id: 'chb',
  name: 'Complete Heart Block',
  rate: 32,
  atrialRate: 75,
  description: 'AV dissociation - P waves march through QRS at different rate, wide QRS escape',
  waveform: 'chb',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
The electrical connection between the atria and ventricles is completely severed. The atria and ventricles beat independently — no atrial impulse reaches the ventricles. A slow escape rhythm keeps the patient alive.

RECOGNIZE IT
• P waves march through at their own rate (typically 60–80 bpm)
• QRS complexes march through at a DIFFERENT, slower rate (30–40 bpm)
• Regular P-P intervals AND regular R-R intervals — but NO relationship between them
• P waves randomly appear before, during, and after QRS complexes
• Wide QRS = ventricular escape | Narrow QRS = junctional escape

HOW TO TELL IT APART
• vs Mobitz II → Mobitz II still conducts SOME beats (constant PR in conducted beats). CHB conducts NONE.
• vs AV Dissociation in VT → In VT, the ventricular rate is FAST (>100). In CHB, the ventricular rate is SLOW (30–40).
• vs Third Degree vs High-Grade Block → High-grade block (e.g., 3:1) still conducts occasionally. CHB = zero conduction.

CAUSES
• Inferior MI (AV nodal block) — may be transient
• Anterior MI (infranodal block) — often permanent
• Degenerative conduction disease (Lenegre, Lev disease)
• Post-cardiac surgery, TAVR
• Medications (rare at therapeutic doses)

TREATMENT
• Emergent transcutaneous pacing if unstable
• Atropine may help IF block is at the AV node (narrow QRS escape)
• Atropine will NOT help infranodal block (wide QRS escape)
• Transvenous pacing as bridge to permanent pacemaker

PACING — CLASS I ABSOLUTE INDICATION
Complete heart block is a Class I indication for permanent pacing per HRS guidelines, even if asymptomatic, due to the risk of hemodynamic compromise and sudden death. This is one of the strongest pacing indications in cardiology.

KEY TAKEAWAY
Two hallmarks: (1) P waves and QRS have NO relationship, and (2) the atrial rate is faster than the ventricular rate. Wide QRS escape is more dangerous than narrow — it means the block is below the AV node and the escape is unreliable. This patient needs a pacemaker yesterday.`
};

// Mobitz Type II - High-grade block, pacing indication
export const mobitzType2: Rhythm = {
  id: 'mobitz2',
  name: 'Mobitz Type II (2nd Degree)',
  rate: 50,
  atrialRate: 80,
  description: 'Intermittent non-conducted P waves with constant PR interval, often wide QRS',
  waveform: 'mobitz2',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
Second degree AV block where beats drop suddenly and without warning. The PR interval stays constant in conducted beats — then a QRS just doesn't show up. The block is below the AV node (His-Purkinje system) and is unreliable.

RECOGNIZE IT
• PR interval is CONSTANT in all conducted beats
• QRS suddenly drops — no progressive PR change
• Often wide QRS (infranodal disease)
• More P waves than QRS complexes
• May show fixed ratios: 2:1, 3:1, or higher

HOW TO TELL IT APART
• vs Mobitz I (Wenckebach) → Mobitz I has progressively LENGTHENING PR before the drop. Mobitz II has CONSTANT PR — the drop comes out of nowhere.
• vs Complete Heart Block → CHB has NO conducted beats. Mobitz II still conducts some.
• vs 2:1 Block → When you see exactly 2:1, you can't tell Mobitz I from II. Look for other conduction ratios (3:2, 4:3) to determine the type.

CAUSES
• Anterior MI (LAD territory — damages His-Purkinje)
• Degenerative conduction disease
• Post-cardiac surgery
• Infiltrative diseases (sarcoidosis, amyloidosis)

TREATMENT
• Transcutaneous pacing standby — can progress to CHB at any time
• Atropine is usually INEFFECTIVE (block is below AV node)
• Isoproterenol may help temporarily
• Permanent pacemaker is definitive treatment

PACING — CLASS I ABSOLUTE INDICATION
Mobitz II is a Class I indication for permanent pacing per HRS guidelines, even if asymptomatic, due to high risk of progression to complete heart block.

KEY TAKEAWAY
Mobitz II is the dangerous second degree block. Constant PR + sudden dropped beats = infranodal disease = pacemaker. If Mobitz I is the "friendly" block, Mobitz II is the one that will kill your patient. Never send a Mobitz II patient home without pacing.`
};

// 2:1 AV Block - type of Mobitz II (second degree block)
export const block2to1: Rhythm = {
  id: 'block-2to1',
  name: '2:1 AV Block (2nd Degree)',
  rate: 42,
  atrialRate: 85,
  description: 'Every other P wave is blocked — 2 P waves per QRS, constant PR in conducted beats',
  waveform: 'block_2to1',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
A second degree AV block where exactly every other P wave is blocked. Two P waves for every one QRS. The problem: you can't tell if it's Mobitz I or Mobitz II because you only see one conducted beat between drops — so there's no opportunity to see progressive PR lengthening.

RECOGNIZE IT
• 2 P waves for every 1 QRS (2:1 conduction ratio)
• Regular P-P intervals at the atrial rate
• Regular R-R intervals at half the atrial rate
• Constant PR interval in conducted beats
• Non-conducted P wave visible between QRS complexes

HOW TO TELL IT APART
• vs Mobitz I → Mobitz I shows grouped beating with progressive PR prolongation. 2:1 has a fixed ratio — you can't see PR changes.
• vs Mobitz II → Mobitz II also has constant PR and dropped beats, but shows other ratios (3:1, 3:2) that confirm it. Pure 2:1 is ambiguous.
• vs Complete Heart Block → In CHB, P waves and QRS are completely independent (random relationship). In 2:1, every other P wave conducts with a fixed PR.

CLUES TO DETERMINE TYPE
• Narrow QRS → more likely AV nodal (Mobitz I type) → better prognosis
• Wide QRS → more likely infranodal (Mobitz II type) → worse prognosis, more urgent
• If atropine improves conduction → likely AV nodal (Mobitz I type)
• If atropine worsens block → likely infranodal (Mobitz II type)

CAUSES
• Same as Mobitz I and II: medications, MI, degenerative disease
• AV nodal disease or His-Purkinje disease

TREATMENT
• Narrow QRS → monitor, may be AV nodal and benign
• Wide QRS → treat as Mobitz II (pacemaker)
• If uncertain → electrophysiology study to localize the block

PACING — INDICATED IF WIDE QRS OR SYMPTOMATIC
2:1 block with wide QRS is treated as Mobitz II (Class I pacing indication). Narrow QRS 2:1 may be observed if asymptomatic.

KEY TAKEAWAY
2:1 block is the "can't tell" second degree block. You see exactly 2 P waves per QRS, but you can't determine Mobitz I vs II from a single strip. The QRS width is your best clue: narrow = probably AV nodal (benign), wide = probably infranodal (needs a pacemaker).`
};

// AFib with slow ventricular response - tachy-brady syndrome
export const afibSlowResponse: Rhythm = {
  id: 'afib-slow',
  name: 'AFib with Slow Ventricular Response',
  rate: 38,
  description: 'Irregularly irregular rhythm, no P waves (fibrillatory baseline), slow rate',
  waveform: 'afib_slow',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
Atrial fibrillation with a ventricular rate below 60 bpm. The atria are fibrillating chaotically, but the AV node is letting very few impulses through — either because of disease or medications.

RECOGNIZE IT
• Irregularly irregular R-R intervals — the hallmark of AFib
• No P waves — fibrillatory, chaotic baseline between QRS complexes
• Ventricular rate < 60 bpm
• Narrow QRS (unless concurrent bundle branch block)

HOW TO TELL IT APART
• vs AFib RVR → Same rhythm, different rate. Slow = < 60, RVR = > 100.
• vs Sinus Brady → Sinus brady is REGULAR with visible P waves. Slow AFib is IRREGULAR with no P waves.
• vs Junctional Escape → Junctional is REGULAR. AFib slow is always IRREGULAR.

CAUSES
• AV nodal blocking medications (beta-blockers, CCBs, digoxin)
• Intrinsic AV node disease
• Part of tachy-brady syndrome (alternating fast AFib and pauses)
• Hypothyroidism, hypothermia

TREATMENT
• Reduce or stop rate-control medications if iatrogenic
• Treat underlying cause
• If part of tachy-brady: pacemaker allows you to safely use rate-control drugs
• Anticoagulation for stroke prevention (CHA₂DS₂-VASc score)

PACING — INDICATED FOR TACHY-BRADY SYNDROME
If the patient swings between fast AFib and slow rates, pacing is needed so you can safely give rate-control medications without causing dangerous bradycardia.

KEY TAKEAWAY
Two questions with slow AFib: (1) Is it from medications? If so, reduce the dose. (2) Is it tachy-brady? If the patient alternates between fast and slow AFib, they need a pacemaker to allow safe rate control.`
};

// Sinus Pause
export const sinusPause: Rhythm = {
  id: 'sinus-pause',
  name: 'Sinus Pause',
  rate: 55,
  description: 'Sinus rhythm with sudden pause, then resumption - pause is NOT a multiple of P-P interval',
  waveform: 'sinus_pause',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
The SA node momentarily fails to fire, creating a gap in the rhythm. It then resets and picks up at a slightly different point in its cycle.

RECOGNIZE IT
• Normal sinus rhythm present before and after the pause
• Sudden gap with no P-QRST complexes
• The pause is NOT an exact multiple of the normal P-P interval (the SA node reset mid-cycle)
• After the pause, sinus rhythm resumes

HOW TO TELL IT APART
• vs Sinus Arrest → ARREST = pause IS an exact multiple of P-P (2×, 3×). PAUSE = pause is NOT a multiple (e.g., 1.7× or 2.3×). Measure carefully.
• vs Blocked PAC → Look for a hidden P wave in the T wave before the pause. A blocked PAC has an early P wave that doesn't conduct.
• vs 2nd Degree AV Block → In AV block, P waves continue during the pause. In sinus pause, there are NO P waves.

CAUSES
• Increased vagal tone
• Sick sinus syndrome
• Medications: digoxin, beta-blockers, CCBs
• Carotid sinus hypersensitivity

TREATMENT
• Asymptomatic → monitor
• Symptomatic → reduce offending medications
• Atropine for acute episodes

PACING — CLASS I IF SYMPTOMATIC
Pacing indicated for symptomatic pauses > 3 seconds or syncope correlated with pauses. Pauses > 3 seconds while awake are always abnormal.

KEY TAKEAWAY
Pause vs Arrest comes down to math. Measure the pause and divide by the normal P-P interval. If it's a clean multiple (2.0×, 3.0×), it's arrest. If it's not (1.7×, 2.3×), it's a pause. The SA node reset instead of missing entire cycles.`
};

// Sinus Arrest - distinct from Sinus Pause
export const sinusArrest: Rhythm = {
  id: 'sinus-arrest',
  name: 'Sinus Arrest',
  rate: 55,
  description: 'Complete SA node failure - pause IS a multiple of P-P interval (2+ missed cycles)',
  waveform: 'sinus_arrest',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
The SA node completely stops firing for two or more full cycles. Unlike a sinus pause (where the node resets mid-cycle), in arrest the node misses entire cycles cleanly.

RECOGNIZE IT
• Prolonged gap with no P-QRST complexes
• The pause IS an exact multiple of the normal P-P interval (2×, 3×)
• May see junctional or ventricular escape beats during long pauses
• Sinus rhythm eventually resumes

HOW TO TELL IT APART
• vs Sinus Pause → ARREST = exact multiple of P-P (2.0×). PAUSE = not a clean multiple (1.7×, 2.3×). Same concept, different math.
• vs Complete Heart Block → In CHB, P waves keep marching through during the pause. In sinus arrest, there are no P waves at all.

CAUSES
• Sick sinus syndrome (most common)
• Medications: digoxin toxicity, beta-blockers
• Inferior MI
• Increased vagal tone

TREATMENT
• Same as sinus pause: atropine acutely, pacing if recurrent
• Stop offending medications
• Transcutaneous pacing for prolonged episodes

PACING — CLASS I IF SYMPTOMATIC
Symptomatic sinus arrest with syncope or pauses > 3 seconds while awake requires permanent pacing.

KEY TAKEAWAY
Sinus arrest = the SA node pauses for exactly 2 (or more) full cycles. The math is clean — pause ÷ P-P = whole number. The key difference between pause and arrest is whether the pause is an exact multiple of the P-P interval.`
};

// Ventricular Tachycardia (VT)
export const ventricularTachycardia: Rhythm = {
  id: 'vtach',
  name: 'Ventricular Tachycardia',
  rate: 180,
  description: 'Wide complex tachycardia originating from ventricles, rate 100-250 bpm',
  waveform: 'vtach',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A life-threatening tachycardia originating from the ventricles. Wide, fast, and dangerous. This is a cardiac emergency until proven otherwise.

RECOGNIZE IT
• Wide QRS (> 0.12 sec, often > 0.14 sec)
• Rate 100–250 bpm
• Regular R-R intervals (monomorphic VT)
• AV dissociation — P waves march independently (hard to see at fast rates)
• Fusion beats and capture beats are diagnostic if present

HOW TO TELL IT APART
• vs SVT with Aberrancy → When in doubt, treat as VT. AV dissociation, fusion beats, and concordance in precordial leads all point to VT.
• vs Torsades → Torsades has a "twisting" axis that waxes and wanes. Monomorphic VT has a consistent QRS shape.
• vs Sinus Tach with BBB → VT is usually wider (> 140 ms), has an "ugly" QRS morphology, and has AV dissociation.

CAUSES
• Prior MI / structural heart disease (scar-related reentry)
• Cardiomyopathy (dilated, hypertrophic)
• Electrolyte imbalance (K+, Mg2+)
• Drug toxicity, long QT syndrome

TREATMENT
• Pulseless VT → defibrillate immediately (same protocol as VFib)
• Stable VT → amiodarone 150 mg IV over 10 min
• Unstable with pulse → synchronized cardioversion
• Long-term: ICD, ablation, antiarrhythmics

PACING — ICD INDICATED (NOT STANDARD PACEMAKER)
Monomorphic VT with structural heart disease is a Class I indication for ICD. ICDs can deliver antitachycardia pacing (ATP) to terminate VT without a shock.

KEY TAKEAWAY
The general approach: wide complex tachycardia should be treated as VT until proven otherwise. Giving adenosine to VT is unlikely to help, but treating SVT as VT is generally safe. When in doubt, err on the side of caution.`
};

// Ventricular Fibrillation (VF)
export const ventricularFibrillation: Rhythm = {
  id: 'vfib',
  name: 'Ventricular Fibrillation',
  rate: 0,
  description: 'Chaotic, disorganized ventricular activity - no discernible QRS complexes',
  waveform: 'vfib',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
Cardiac arrest. The ventricles are quivering chaotically with no organized contraction and zero cardiac output. The patient is clinically dead and needs immediate defibrillation.

RECOGNIZE IT
• No identifiable P waves, QRS complexes, or T waves
• Chaotic, disorganized electrical activity
• Coarse VF = larger undulations (better prognosis, more responsive to shock)
• Fine VF = small undulations (may look like asystole — confirm in 2 leads)
• Patient is pulseless and unresponsive

HOW TO TELL IT APART
• vs Asystole → Asystole is a flat line. VFib has chaotic electrical activity. Fine VFib can mimic asystole — check two leads.
• vs Polymorphic VT / Torsades → Torsades has an organized twisting pattern. VFib is completely chaotic.
• vs Artifact → Motion artifact can mimic VFib. Check the patient, not just the monitor.

CAUSES
• Acute MI
• Prior VT degenerated to VFib
• Electrolyte abnormalities (severe hypo/hyperkalemia)
• Drug toxicity, electrical shock, drowning, hypothermia

TREATMENT
• DEFIBRILLATE IMMEDIATELY — this is a shockable rhythm
• CPR between shocks (high-quality, minimal interruptions)
• Epinephrine 1 mg IV every 3–5 minutes
• Amiodarone 300 mg IV for refractory VFib
• Identify and treat reversible causes (H's and T's)

PACING — NOT APPLICABLE
VFib cannot be paced. Defibrillation is the only electrical treatment. After resuscitation, ICD is indicated for secondary prevention.

KEY TAKEAWAY
Time is survival. Every minute without defibrillation drops survival by about 10%. Coarse VFib responds better to shock than fine VFib. If in doubt whether it's fine VFib or asystole, shock it — defibrillating asystole won't help, but missing VFib kills.`
};

// Torsades de Pointes (Polymorphic VT)
export const torsadesDePointes: Rhythm = {
  id: 'torsades',
  name: 'Torsades de Pointes',
  rate: 200,
  description: 'Polymorphic VT with twisting QRS axis, associated with prolonged QT',
  waveform: 'torsades',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
"Twisting of the points" — a polymorphic ventricular tachycardia where the QRS axis rotates around the baseline, creating a distinctive waxing-and-waning pattern. Associated with prolonged QT interval.

RECOGNIZE IT
• QRS complexes twist around the baseline
• Amplitude waxes and wanes in a sinusoidal spindle pattern
• Rate 150–250 bpm
• Often preceded by a "short-long-short" sequence (PVC → pause → PVC triggers it)
• Prolonged QT on baseline ECG

HOW TO TELL IT APART
• vs Monomorphic VT → Monomorphic VT has a consistent QRS shape. Torsades twists.
• vs VFib → VFib is completely chaotic. Torsades has an organized twisting pattern.
• vs Polymorphic VT with normal QT → If QT is normal, it's polymorphic VT (treat like VT). If QT is prolonged, it's Torsades (different treatment!).

CAUSES
• QT-prolonging medications (antiarrhythmics, antibiotics, antipsychotics)
• Electrolyte imbalances: hypokalemia, hypomagnesemia, hypocalcemia
• Congenital long QT syndrome
• Bradycardia (longer pauses = longer QT)

TREATMENT — DIFFERENT FROM STANDARD VT
• IV Magnesium 2g push — first line, give IMMEDIATELY
• Overdrive pacing (increase heart rate → shortens QT)
• Isoproterenol IV (bridge to pacing)
• STOP all QT-prolonging medications
• Correct K+ to > 4.0 mEq/L
• Defibrillate if sustained or pulseless

PACING — OVERDRIVE PACING IS THERAPEUTIC
Temporary overdrive pacing at 90–110 bpm shortens the QT interval and suppresses Torsades. This is one of the few arrhythmias where pacing is part of acute treatment.

KEY TAKEAWAY
Torsades is NOT regular VT — avoid amiodarone (it prolongs QT and can worsen the arrhythmia). Magnesium is first-line treatment, with overdrive pacing as an option. The treatment approach differs from standard VT. Check the QT interval to identify the underlying cause.`
};

// NSR with PAC (Premature Atrial Contraction)
export const nsrWithPAC: Rhythm = {
  id: 'nsr-pac',
  name: 'NSR with PAC',
  rate: 72,
  description: 'Normal sinus rhythm with occasional early beats from ectopic atrial focus',
  waveform: 'nsr_pac',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A normal sinus rhythm interrupted by premature beats originating from an ectopic atrial focus. An irritable spot in the atrium fires early.

RECOGNIZE IT
• Underlying regular sinus rhythm
• Early beat appears sooner than expected
• P wave before the early beat looks DIFFERENT from sinus P waves (peaked, notched, or inverted)
• Narrow QRS follows the abnormal P wave
• Incomplete compensatory pause (the next sinus beat comes slightly early)

HOW TO TELL IT APART
• vs PVC → PAC has a narrow QRS with an abnormal P wave before it. PVC has a wide QRS with NO preceding P wave.
• vs Sinus Arrhythmia → Sinus arrhythmia has a gradual rate change with the same P wave morphology. PACs are sudden with a different P wave shape.

CAUSES
• Caffeine, alcohol, stress, fatigue
• Electrolyte imbalances
• Heart failure, COPD, hyperthyroidism
• Frequent PACs may herald atrial fibrillation

TREATMENT
• Usually none — PACs are benign in most patients
• Reduce caffeine, alcohol, stress
• Beta-blockers if highly symptomatic
• Investigate for AFib risk if PAC burden is high

PACING — NOT INDICATED

KEY TAKEAWAY
Spot the early beat, then look for the abnormal P wave. If the early beat has a different-looking P wave and a narrow QRS, it's a PAC. If it's wide with no P wave, it's a PVC. The P wave tells the story.`
};

// NSR with Blocked/Nonconducted PAC
export const blockedPAC: Rhythm = {
  id: 'blocked-pac',
  name: 'NSR with Blocked PAC',
  rate: 75,
  description: 'Premature P wave that fails to conduct to ventricles - P wave without QRS',
  waveform: 'blocked_pac',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A premature atrial contraction that occurs so early that the AV node is still refractory and cannot conduct the impulse to the ventricles. You see a P wave but NO QRS follows it.

RECOGNIZE IT
• Underlying regular sinus rhythm
• Early, abnormal P wave appears (often distorting the preceding T wave)
• NO QRS follows the premature P wave
• Pause after the blocked PAC (looks like a dropped beat)
• Next sinus beat arrives on time or slightly early

HOW TO TELL IT APART
• vs Sinus Pause/Arrest → Blocked PAC has a visible early P wave (look carefully in the T wave). Sinus pause has NO P wave during the pause.
• vs 2nd Degree AV Block → Blocked PAC has an EARLY, abnormal P wave. AV block has ON-TIME sinus P waves that don't conduct.
• vs Conducted PAC → Conducted PAC has a QRS after the early P wave. Blocked PAC has no QRS.

CAUSES
• Same as conducted PACs: caffeine, stress, electrolytes
• Very early coupling interval (PAC fires during AV node refractory period)
• Often seen with frequent PACs

CLINICAL SIGNIFICANCE
• Usually benign
• Can cause symptoms if frequent (feels like skipped beats)
• May be misdiagnosed as sinus pause if P wave hidden in T wave
• Look carefully at the T wave morphology - is it different from other T waves?

Clinical Pearl: When you see a pause, always examine the T wave before the pause. If it looks different (peaked, notched, or taller than other T waves), a PAC is likely hiding in there. The P wave + refractory AV node = blocked PAC.`
};

// NSR with PJC (Premature Junctional Contraction)
export const nsrWithPJC: Rhythm = {
  id: 'nsr-pjc',
  name: 'NSR with PJC',
  rate: 72,
  description: 'Normal sinus rhythm with early beats from AV junction - narrow QRS, absent/inverted P wave',
  waveform: 'nsr_pjc',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A premature beat originating from the AV junction that fires early, interrupting the normal sinus rhythm. The impulse travels both up to the atria (retrograde) and down to the ventricles simultaneously.

RECOGNIZE IT
• Underlying regular sinus rhythm
• Early beat appears sooner than expected
• Narrow QRS (same as sinus beats - uses normal conduction system)
• P wave is either:
  - Absent (hidden in QRS)
  - Inverted in lead II (retrograde conduction to atria)
  - Appears just before or just after the QRS
• Incomplete compensatory pause

HOW TO TELL IT APART
• vs PAC → PAC has an abnormal but UPRIGHT P wave before the narrow QRS. PJC has no P wave or an INVERTED P wave.
• vs PVC → PVC has a WIDE, bizarre QRS with no P wave. PJC has a NARROW QRS.
• vs Junctional Escape Beat → Escape beats come LATE (after a pause). PJCs come EARLY (premature).

CAUSES
• Digitalis toxicity (classic cause)
• Caffeine, stress
• Ischemia, electrolyte imbalances
• Post-cardiac surgery

TREATMENT
• Usually none needed if infrequent
• Stop digitalis if toxicity suspected
• Reduce caffeine/stimulants
• Treat underlying cause

Clinical Pearl: The key to identifying a PJC is narrow QRS + no upright P wave + early timing. If you see an early narrow complex without a normal P wave, think junctional origin.`
};

// NSR with PVC (Premature Ventricular Contraction)
export const nsrWithPVC: Rhythm = {
  id: 'nsr-pvc',
  name: 'NSR with PVC',
  rate: 72,
  description: 'Normal sinus rhythm with occasional wide, bizarre early beats from ventricle',
  waveform: 'nsr_pvc',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A normal sinus rhythm interrupted by premature beats originating from the ventricles. The ventricle fires on its own before the next sinus beat arrives — producing a wide, bizarre QRS with no preceding P wave.

RECOGNIZE IT
• Underlying regular sinus rhythm
• Early beat with NO preceding P wave
• Wide, bizarre QRS (> 0.12 sec) — looks completely different from sinus beats
• Discordant T wave (T wave deflects opposite to QRS)
• Full compensatory pause (the R-R interval spanning the PVC = 2× normal R-R)

HOW TO TELL IT APART
• vs PAC → PAC has a narrow QRS with an abnormal P wave. PVC has a wide QRS with NO P wave.
• vs PAC with Aberrant Conduction → Aberrant PAC still has a P wave before it. PVC does not.
• vs Ventricular Escape Beat → Escape beats are LATE (after a pause). PVCs are EARLY (before the next expected beat).

CAUSES
• Caffeine, alcohol, stimulants
• Electrolyte imbalance (hypokalemia, hypomagnesemia)
• Ischemia, heart failure, cardiomyopathy
• Medications, hyperthyroidism

TREATMENT
• Isolated PVCs → usually no treatment
• Symptomatic → beta-blockers
• Frequent PVCs (> 10–15% burden) → evaluate for PVC-induced cardiomyopathy, consider ablation
• PVCs in structural heart disease → ICD evaluation

PACING — NOT INDICATED (ICD MAY BE)
PVCs themselves don't need pacing. But frequent PVCs with reduced EF or structural heart disease may warrant ICD evaluation.

KEY TAKEAWAY
No P wave + wide QRS + early = PVC. Full compensatory pause confirms it (the sinus node wasn't reset). Isolated PVCs are benign, but a high burden (> 10-15%) can weaken the heart over time.`
};

// Atrial Flutter with Slow Ventricular Response
export const aflutterSVR: Rhythm = {
  id: 'aflutter-svr',
  name: 'AFL with Slow Ventricular Response',
  rate: 50,
  atrialRate: 300,
  description: 'Sawtooth flutter waves at ~300/min with slow ventricular response (6:1 block)',
  waveform: 'aflutter_svr',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
Atrial flutter with a high conduction block (6:1) resulting in a slow ventricular rate of ~50 bpm. The atria flutter at ~300/min but only every 6th impulse reaches the ventricles.

RECOGNIZE IT
• Sawtooth "F waves" at ~300/min — look for the classic inverted sawtooth pattern in lead II
• Regular ventricular response at ~50 bpm (300 ÷ 6 = 50)
• Narrow QRS (unless bundle branch block)
• F waves visible continuously between QRS complexes
• Count the F waves per QRS to determine conduction ratio

HOW TO TELL IT APART
• vs AFL with RVR → Same sawtooth, but RVR has 2:1 conduction (~150 bpm). Slow has 4:1, 6:1, etc.
• vs AFib Slow → AFib is irregularly irregular with NO organized atrial activity. Flutter is regular with organized sawtooth waves.
• vs Sinus Brady → Sinus brady has upright P waves. Flutter has sawtooth F waves.

CAUSES
• AV nodal blocking medications (beta-blockers, CCBs, digoxin)
• Intrinsic AV nodal disease
• Part of tachy-brady syndrome

TREATMENT
• Evaluate if rate needs to be faster (symptomatic bradycardia?)
• Reduce rate-control medications if iatrogenic
• Consider cardioversion to restore sinus rhythm
• Anticoagulation for stroke prevention (same as AFib)

PACING — MAY BE INDICATED
If slow rate is symptomatic and caused by necessary medications, or part of tachy-brady syndrome, pacing allows safe use of rate-control drugs.

KEY TAKEAWAY
The sawtooth is the signature. Count the F waves between each QRS to determine the conduction ratio. Ventricular rate = 300 ÷ conduction ratio. Slow flutter suggests either medications or AV nodal disease.`
};

// Atrial Flutter with Rapid Ventricular Response
export const aflutterRVR: Rhythm = {
  id: 'aflutter-rvr',
  name: 'AFL with Rapid Ventricular Response',
  rate: 150,
  atrialRate: 300,
  description: 'Sawtooth flutter waves at ~300/min with rapid ventricular response (2:1 block)',
  waveform: 'aflutter_rvr',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
Atrial flutter with 2:1 conduction — the most common and most missed form of flutter. The atria flutter at ~300/min and every other impulse conducts, producing a ventricular rate of ~150 bpm.

RECOGNIZE IT
• Regular narrow-complex tachycardia at ~150 bpm
• Sawtooth F waves partially hidden by QRS and T waves (hard to see at 2:1)
• Flutter waves visible between every other QRS if you look carefully
• Very regular R-R intervals
• Narrow QRS

HOW TO TELL IT APART
• vs Sinus Tachycardia → Sinus tach has visible P waves and rarely locks at exactly 150. Flutter at 2:1 = ~150 bpm.
• vs SVT → SVT is usually > 150 and has no visible atrial activity. Flutter has sawtooth waves if you look closely (try carotid massage or adenosine to unmask them).
• vs AFL Slow → Same sawtooth, but higher conduction ratio = slower rate.

CAUSES
• Same as other forms of flutter: hypertension, heart failure, pulmonary disease
• Post-cardiac surgery
• Hyperthyroidism, alcohol excess

TREATMENT
• Rate control: beta-blockers, CCBs, or digoxin
• Cardioversion (electrical or pharmacologic with ibutilide)
• Adenosine can transiently increase block to reveal flutter waves (diagnostic, not therapeutic)
• Catheter ablation is highly effective (cure rate > 90%)
• Anticoagulation for stroke prevention

PACING — NOT INDICATED

KEY TAKEAWAY
Regular narrow-complex tachycardia at 150 bpm = flutter until proven otherwise. This is one of the most frequently missed diagnoses. If you see 150 bpm, hunt for the sawtooth. Adenosine will briefly slow the rate and unmask the flutter waves.`
};

// AFib with Rapid Ventricular Response
export const afibRVR: Rhythm = {
  id: 'afib-rvr',
  name: 'AFib with Rapid Ventricular Response',
  rate: 140,
  description: 'Irregularly irregular rhythm with rapid rate (>100 bpm), no P waves',
  waveform: 'afib_rvr',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
Atrial fibrillation with a fast ventricular rate (> 100 bpm). The atria are fibrillating chaotically and the AV node is letting too many impulses through, driving the ventricles fast.

RECOGNIZE IT
• Irregularly irregular R-R intervals — the defining feature of AFib
• No P waves — chaotic, undulating baseline
• Ventricular rate > 100 bpm (often 130–180 bpm)
• Narrow QRS unless bundle branch block or rate-related aberrancy

HOW TO TELL IT APART
• vs AFib Slow → Same irregular rhythm and absent P waves, just rate < 60.
• vs MAT → MAT has discrete P waves (at least 3 different morphologies). AFib has NO P waves.
• vs Atrial Flutter → Flutter is regular with organized sawtooth. AFib is irregular with chaotic baseline.

CAUSES
• Hypertension (most common)
• Heart failure, valvular disease
• Hyperthyroidism, PE, alcohol ("holiday heart")
• Post-operative (cardiac surgery)
• Obstructive sleep apnea

TREATMENT
• Hemodynamically unstable → synchronized cardioversion
• Stable → rate control first:
  — IV diltiazem or metoprolol for acute control
  — Digoxin if heart failure present
• Rhythm control: amiodarone, flecainide, cardioversion
• Anticoagulation: assess CHA₂DS₂-VASc score for stroke risk
• Long-term: rate vs rhythm control strategy

PACING — NOT INDICATED FOR RVR
AFib RVR needs rate control, not pacing. However, if rate-control medications are later pushed too far and cause bradycardia, see AFib with Slow Response.

KEY TAKEAWAY
Three things identify AFib: (1) irregularly irregular, (2) no P waves, (3) chaotic baseline. The rate tells you the ventricular response. RVR needs rate control urgently — don't forget anticoagulation for stroke prevention.`
};

// Sinus Arrhythmia - normal variant, rate varies with respiration
export const sinusArrhythmia: Rhythm = {
  id: 'sinus-arrhythmia',
  name: 'Sinus Arrhythmia',
  rate: 68,
  description: 'Irregular rhythm from SA node, rate varies with respiration (faster on inspiration)',
  waveform: 'sinus_arrhythmia',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A normal variant where the heart rate subtly speeds up with inspiration and slows with expiration. The SA node is still in control — the rate just fluctuates with breathing.

RECOGNIZE IT
• Normal upright P waves before every QRS
• PR interval constant (0.12–0.20 sec)
• Narrow QRS
• R-R intervals vary by > 0.16 sec or > 10%
• Rate is within normal range overall (60–100 bpm)
• Variation follows a smooth respiratory cycle

HOW TO TELL IT APART
• vs NSR → NSR has uniform R-R intervals. Sinus arrhythmia has subtle variation.
• vs PACs → PACs cause sudden early beats with different P waves. Sinus arrhythmia is gradual with identical P waves.
• vs WAP → WAP has 3+ different P wave morphologies. Sinus arrhythmia has consistent P waves — just varying intervals.

CAUSES
• Normal vagal tone (healthy response)
• Most common in young, healthy individuals and athletes
• Diminishes with age and autonomic dysfunction
• Enhanced by deep breathing

TREATMENT
• None — this is a sign of cardiovascular health

PACING — NOT INDICATED
This is normal. Presence of sinus arrhythmia actually indicates good vagal tone.

KEY TAKEAWAY
The P waves all look the same — only the spacing changes. If someone calls you about an "irregular rhythm" and the P waves are normal, check if it tracks with breathing. Sinus arrhythmia is the healthy irregular rhythm.`
};

// Asystole - cardiac arrest rhythm
export const asystole: Rhythm = {
  id: 'asystole',
  name: 'Asystole',
  rate: 0,
  description: 'Flat line - no electrical activity, no cardiac output',
  waveform: 'asystole',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
The absence of all cardiac electrical activity. Flat line. The heart has no electrical function. This is the worst cardiac arrest rhythm with the poorest prognosis.

RECOGNIZE IT
• Flat line — no P waves, no QRS, no T waves
• Patient is pulseless and unresponsive
• Must confirm in at least 2 leads (rule out lead disconnect / artifact)
• Occasional P waves without QRS = "P-wave asystole" (ventricular standstill)

HOW TO TELL IT APART
• vs Fine VFib → Fine VFib has small undulations. True asystole is flat. If there's ANY doubt, treat as VFib and shock.
• vs Lead Disconnect → Check the patient AND the leads. Loose electrodes show a flat line too.
• vs PEA → PEA shows organized electrical activity but no pulse. Asystole has no electrical activity at all.

CAUSES
• End-stage cardiac arrest (VFib deteriorated to asystole)
• Severe hypoxia, hypothermia
• Massive MI
• Tension pneumothorax, cardiac tamponade
• Severe electrolyte imbalances

TREATMENT
• NON-SHOCKABLE — do NOT defibrillate
• High-quality CPR immediately
• Epinephrine 1 mg IV every 3–5 minutes
• Identify reversible causes — the H's and T's:
  — Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo/Hyperkalemia, Hypothermia
  — Tension pneumothorax, Tamponade, Toxins, Thrombosis (PE or MI)
• Transcutaneous pacing may be tried but is rarely effective

PACING — RARELY EFFECTIVE
Transcutaneous pacing can be attempted for P-wave asystole (ventricular standstill) but almost never works for true asystole. Focus on CPR and reversible causes.

KEY TAKEAWAY
Confirm in 2 leads, start CPR, give epi, and search for reversible causes. Asystole has < 2% survival out of hospital. If there's any electrical activity that could be fine VFib, shock it. Asystole is the one rhythm where pacing and shocking won't save the patient — finding the cause might.`
};

// SVT (Supraventricular Tachycardia)
export const svt: Rhythm = {
  id: 'svt',
  name: 'Supraventricular Tachycardia (SVT)',
  rate: 180,
  description: 'Regular narrow-complex tachycardia, rate 150-250 bpm, P waves often hidden',
  waveform: 'svt',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A rapid, regular tachycardia originating above the ventricles, most commonly from a reentrant circuit involving the AV node (AVNRT) or an accessory pathway (AVRT). Turns on and off abruptly like a light switch.

RECOGNIZE IT
• Rate 150–250 bpm (often exactly 150–180)
• Regular R-R intervals
• Narrow QRS (< 0.12 sec)
• P waves usually hidden in QRS or T waves (not visible)
• Abrupt onset and offset ("paroxysmal")

HOW TO TELL IT APART
• vs Sinus Tach → Sinus tach has visible P waves, gradual onset/offset, and responds to the clinical situation. SVT starts and stops abruptly.
• vs Atrial Flutter 2:1 → Flutter has sawtooth pattern and locks at ~150. SVT can vary. Adenosine will unmask flutter waves but will terminate SVT.
• vs VT → VT has wide QRS. SVT has narrow QRS (unless aberrant conduction).

CAUSES
• AVNRT (most common) — reentry circuit within the AV node
• AVRT — reentry using an accessory pathway (WPW)
• Atrial tachycardia with rapid conduction
• Triggers: caffeine, stress, exercise, alcohol

TREATMENT — STEPWISE APPROACH
1. Vagal maneuvers: Valsalva (modified = blow into syringe, then lie flat and elevate legs), carotid massage
2. Adenosine 6 mg rapid IV push → if no response, 12 mg → if no response, 12 mg again
3. If unstable: synchronized cardioversion
4. Rate control: diltiazem or beta-blockers for recurrent episodes
5. Catheter ablation: curative (> 95% success rate)

PACING — NOT INDICATED

KEY TAKEAWAY
The adenosine test: adenosine will TERMINATE SVT (AVNRT/AVRT) but will only TRANSIENTLY SLOW atrial flutter/tach, revealing the underlying atrial activity. This makes adenosine both diagnostic and therapeutic. Catheter ablation is the cure.`
};

// Wolff-Parkinson-White (WPW) Pattern
export const wpw: Rhythm = {
  id: 'wpw',
  name: 'Wolff-Parkinson-White (WPW)',
  rate: 75,
  description: 'Short PR interval (<120ms) with delta wave (slurred QRS upstroke) - accessory pathway',
  waveform: 'wpw',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
WPW is a pre-excitation syndrome caused by an accessory pathway (Bundle of Kent) that bypasses the AV node. Impulses travel down the accessory pathway AND the AV node simultaneously, causing early ventricular activation (pre-excitation) that produces the characteristic delta wave.

RECOGNIZE IT
• Short PR interval (<120 ms or <3 small boxes)
• Delta wave: slurred upstroke of QRS (initial slurring)
• Wide QRS (>100 ms) due to fusion of early accessory pathway conduction
• Secondary ST-T changes (discordant to delta wave)
• May be intermittent

THE DANGER - AVRT
• The accessory pathway can participate in reentrant tachycardia (AVRT)
• Orthodromic AVRT: down AV node, up accessory pathway → narrow QRS SVT
• Antidromic AVRT: down accessory pathway, up AV node → wide QRS tachycardia

WPW + AFib = DANGER
• If patient develops AFib, impulses can conduct rapidly down accessory pathway
• Very fast, irregular wide-complex tachycardia
• AV nodal blockers (adenosine, diltiazem, digoxin) are CONTRAINDICATED
• Can accelerate conduction down accessory pathway → VF
• Treatment: procainamide or cardioversion

TREATMENT
• Asymptomatic WPW: observation vs. ablation (controversial)
• Symptomatic (AVRT episodes): catheter ablation (curative, >95% success)
• WPW + AFib: procainamide, ibutilide, or DC cardioversion

EP STUDY - RISK STRATIFICATION
• EP testing determines if the accessory pathway is capable of rapid conduction
• Inducibility of AVRT or AFib during the study indicates higher risk
• Shortest pre-excited RR interval (SPERRI) < 250ms = high risk for sudden cardiac death
• EP study guides decision for catheter ablation
• Recommended for symptomatic patients and high-risk occupations (pilots, athletes)

Clinical Pearl: The classic WPW triad is short PR, delta wave, and wide QRS. EP study is valuable to assess if arrhythmia is inducible and to stratify risk. NEVER give AV nodal blocking agents (adenosine, beta blockers, calcium channel blockers, digoxin) to WPW patients in AFib - it can cause VF.`
};

// Accelerated Junctional Rhythm
export const accelJunctional: Rhythm = {
  id: 'accel-junctional',
  name: 'Accelerated Junctional Rhythm',
  rate: 75,
  description: 'Junctional rhythm with rate 60-100 bpm, absent or inverted P waves',
  waveform: 'accel_junctional',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
The AV junction is firing at an enhanced rate (60–100 bpm) — faster than its normal escape rate but not fast enough to be tachycardia. Something is irritating the junction and speeding it up.

RECOGNIZE IT
• Rate 60–100 bpm
• P waves absent, inverted before QRS, or retrograde after QRS
• Narrow QRS complex
• Regular R-R intervals

HOW TO TELL IT APART
• vs Junctional Escape → Same morphology, different rate. Escape = 40–60 bpm (backup rhythm). Accelerated = 60–100 bpm (enhanced automaticity).
• vs Junctional Tachycardia → Junctional tach = > 100 bpm. Accelerated junctional = 60–100.
• vs NSR → NSR has upright P waves before QRS. Accelerated junctional has absent or inverted P waves.

CAUSES
• Digitalis toxicity (classic cause — always check dig level)
• Acute inferior MI
• Post-cardiac surgery
• Myocarditis
• Electrolyte imbalances

TREATMENT
• Identify and treat the underlying cause
• If digoxin toxic → stop digoxin, check level, correct K+ and Mg2+
• Usually self-limited and resolves when the cause is corrected
• Rarely needs specific antiarrhythmic therapy

PACING — NOT INDICATED
Usually transient. Treat the cause, not the rhythm.

KEY TAKEAWAY
Three junctional rhythms, three rate ranges: escape (40–60), accelerated (60–100), tachycardia (> 100). All look the same — no upright P waves, narrow QRS. The rate tells you which one it is. If you see accelerated junctional, think digoxin toxicity first.`
};

// Junctional Tachycardia
export const junctionalTachycardia: Rhythm = {
  id: 'junctional-tach',
  name: 'Junctional Tachycardia',
  rate: 120,
  description: 'Rapid junctional rhythm >100 bpm, absent/inverted P waves, narrow QRS',
  waveform: 'junctional_tach',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
The AV junction is firing rapidly at > 100 bpm. This is the fastest of the three junctional rhythms and often indicates a seriously irritated junction — think toxicity or post-surgical irritation.

RECOGNIZE IT
• Rate > 100 bpm (typically 100–180 bpm)
• P waves absent, inverted, or retrograde
• Narrow QRS complex
• Regular R-R intervals

HOW TO TELL IT APART
• vs SVT (AVNRT) → Both are narrow-complex tachycardias. AVNRT is reentrant (terminates with adenosine/vagal). Junctional tach is automatic (may slow but won't terminate with adenosine).
• vs Accelerated Junctional → Rate cutoff: accelerated = 60–100, tach = > 100.
• vs Sinus Tach → Sinus tach has upright P waves. Junctional tach has no upright P waves.

CAUSES
• Digitalis toxicity (the classic cause — check digoxin level immediately)
• Post-cardiac surgery (especially valve surgery)
• Myocarditis
• Acute MI

TREATMENT
• Digoxin toxicity → stop digoxin, correct K+ and Mg2+, give Digibind (digoxin-specific antibody) if severe
• Rate control: beta-blockers or calcium channel blockers
• Post-surgical → usually resolves within days
• Cardioversion is generally NOT effective (automatic focus, not reentrant)

PACING — NOT INDICATED

KEY TAKEAWAY
Junctional tachycardia screams "check the digoxin level." It's the most common rhythm associated with dig toxicity. Unlike SVT, it won't terminate with adenosine because it's an automatic focus, not a reentry circuit.`
};

// Wandering Atrial Pacemaker
export const wanderingAtrialPacemaker: Rhythm = {
  id: 'wap',
  name: 'Wandering Atrial Pacemaker',
  rate: 72,
  description: 'At least 3 different P wave morphologies, rate <100 bpm, irregular rhythm',
  waveform: 'wap',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
The pacemaker site shifts between the SA node and multiple atrial foci, producing P waves of different shapes. Like a conductor's baton passing between musicians — each one plays a slightly different note.

RECOGNIZE IT
• At least 3 different P wave morphologies (shapes change beat to beat)
• Rate 60–100 bpm
• Irregular R-R intervals (different foci fire at slightly different rates)
• PR intervals vary (different distances from each focus to the AV node)
• Narrow QRS complex

HOW TO TELL IT APART
• vs MAT → Same concept but MAT has rate > 100 bpm. WAP is < 100. WAP is benign; MAT is concerning.
• vs AFib → AFib has NO P waves. WAP has P waves — they just look different from each other.
• vs Sinus Arrhythmia → Sinus arrhythmia has the same P wave morphology throughout. WAP has 3+ different P wave shapes.

CAUSES
• Normal variant in healthy individuals and athletes
• Enhanced vagal tone
• COPD, heart disease
• Digitalis effect

TREATMENT
• None — WAP is benign
• No intervention needed unless it becomes MAT (rate > 100)

PACING — NOT INDICATED

KEY TAKEAWAY
Count the P wave shapes. If you see 3 or more different P wave morphologies at a rate < 100, it's WAP. Same finding at rate > 100 = MAT. WAP is benign. MAT is not.`
};

// Multifocal Atrial Tachycardia (MAT)
export const mat: Rhythm = {
  id: 'mat',
  name: 'Multifocal Atrial Tachycardia (MAT)',
  rate: 115,
  description: 'At least 3 different P wave morphologies, rate >100 bpm, irregularly irregular',
  waveform: 'mat',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
Multiple ectopic atrial foci firing rapidly and chaotically, producing an irregularly irregular rhythm with 3+ P wave morphologies at a rate > 100 bpm. Almost always associated with severe lung disease.

RECOGNIZE IT
• At least 3 different P wave morphologies
• Rate > 100 bpm (typically 100–150 bpm)
• Irregularly irregular R-R intervals
• Variable PR intervals
• Narrow QRS complex

HOW TO TELL IT APART
• vs AFib → The most common mistake. MAT has discrete, visible P waves (just different shapes). AFib has NO P waves. Look closely at the baseline.
• vs WAP → Same concept but WAP has rate < 100. MAT is the tachycardic version.
• vs Atrial Flutter → Flutter is organized with sawtooth pattern and usually regular. MAT is chaotic with varying P waves and irregular.

CAUSES
• COPD with acute exacerbation (most common by far)
• Hypoxemia, respiratory failure
• Theophylline toxicity
• Electrolyte imbalances (hypokalemia, hypomagnesemia)
• Decompensated heart failure

TREATMENT
• Fix the lungs first — treat COPD/hypoxia/respiratory failure
• Correct electrolytes (K+, Mg2+)
• Rate control: diltiazem or verapamil (NOT beta-blockers in severe COPD)
• Stop theophylline if toxic
• Cardioversion does NOT work (multiple foci = not a single reentrant circuit)

PACING — NOT INDICATED

KEY TAKEAWAY
MAT = sick lungs. If you see an irregularly irregular rhythm that looks like AFib but has visible P waves, look at the patient — they're probably in respiratory distress. Treat the lungs, not the rhythm. Cardioversion will fail because there's no single circuit to break.`
};

// Atrial Tachycardia
export const atrialTachycardia: Rhythm = {
  id: 'atrial-tach',
  name: 'Atrial Tachycardia',
  rate: 150,
  description: 'Rapid atrial rhythm from single ectopic focus, rate 100-250 bpm, abnormal P waves',
  waveform: 'atrial_tach',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A rapid rhythm from a single ectopic atrial focus (not the SA node). One irritable spot in the atrium is firing repetitively at a fast rate. The P wave shape is different from sinus because the impulse originates from a different location.

RECOGNIZE IT
• Rate 100–250 bpm
• Abnormal P wave morphology (different shape from sinus P waves)
• P waves precede each QRS (visible between beats)
• Regular R-R intervals
• Narrow QRS complex
• May show "warm up" (gradual acceleration) and "cool down" (gradual slowing)

HOW TO TELL IT APART
• vs Sinus Tach → Sinus tach has normal upright P waves (same shape as baseline). Atrial tach has abnormal P waves (different shape).
• vs SVT (AVNRT) → SVT usually hides P waves in QRS. Atrial tach shows visible abnormal P waves between beats.
• vs MAT → MAT has 3+ different P wave shapes and is irregular. Atrial tach has ONE consistent abnormal P wave shape and is regular.
• vs Atrial Flutter → Flutter has sawtooth pattern. Atrial tach has discrete P waves between QRS complexes.

CAUSES
• Digoxin toxicity (especially atrial tach with block)
• COPD, heart failure
• Alcohol, stimulants
• Structural atrial disease

TREATMENT
• Adenosine slows the rate briefly (helps diagnose) but rarely terminates
• Rate control: beta-blockers, calcium channel blockers
• Catheter ablation for recurrent episodes
• Treat underlying cause

PACING — NOT INDICATED

KEY TAKEAWAY
The P wave tells you everything. If the tachycardia has visible P waves that look different from sinus P waves, it's atrial tach. The "warm up / cool down" pattern (gradual rate changes) is a classic feature that distinguishes it from reentrant rhythms like SVT which start and stop abruptly.`
};

// Idioventricular Rhythm (IVR)
export const idioventricularRhythm: Rhythm = {
  id: 'ivr',
  name: 'Idioventricular Rhythm',
  rate: 35,
  description: 'Ventricular escape rhythm, rate 20-40 bpm, wide QRS, no P waves',
  waveform: 'ivr',
  pacingIndication: true,
  premium: true,
  explanation: `WHAT IS IT
The last-resort escape rhythm. Both the SA node and AV junction have failed, and the ventricles are generating their own rhythm at a dangerously slow rate of 20–40 bpm. This is the bottom of the pacemaker hierarchy.

RECOGNIZE IT
• Rate 20–40 bpm (intrinsic ventricular escape rate)
• Wide, bizarre QRS (> 0.12 sec) — ventricular origin
• No P waves
• Regular R-R intervals
• Very slow — patient is likely hemodynamically compromised

HOW TO TELL IT APART
• vs AIVR → Same morphology but AIVR runs at 40–100 bpm (enhanced). IVR is the slowest version at 20–40.
• vs Junctional Escape → Junctional has narrow QRS. IVR has wide QRS.
• vs Complete Heart Block → CHB shows P waves marching through independently. IVR has no visible P waves.

CAUSES
• Complete failure of SA node and AV junction
• Severe cardiac disease
• Post-cardiac arrest
• Massive MI
• Drug toxicity

TREATMENT
• Do NOT suppress this rhythm — it's keeping the patient alive
• Emergent transcutaneous pacing
• Atropine (may not work — block is below AV node)
• Dopamine or epinephrine infusion as bridge
• Transvenous pacing → permanent pacemaker

PACING — CLASS I ABSOLUTE INDICATION
IVR at 20–40 bpm means all higher pacemakers have failed. This patient needs an artificial pacemaker urgently.

KEY TAKEAWAY
Pacemaker hierarchy: SA node (60–100) → Junction (40–60) → Ventricle (20–40). IVR means you're at the bottom. Never give a drug that could suppress this escape rhythm (no amiodarone, no lidocaine). The ventricles are the patient's last lifeline until you get a pacemaker in.`
};

// Accelerated Idioventricular Rhythm (AIVR)
export const aivr: Rhythm = {
  id: 'aivr',
  name: 'Accelerated Idioventricular Rhythm (AIVR)',
  rate: 75,
  description: 'Enhanced ventricular rhythm, rate 40-100 bpm, wide QRS, often post-reperfusion',
  waveform: 'aivr',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
A ventricular rhythm running at an enhanced rate (40–100 bpm) — faster than a ventricular escape but not fast enough to be VT. Most commonly seen after successful reperfusion of a blocked coronary artery.

RECOGNIZE IT
• Rate 40–100 bpm
• Wide, bizarre QRS complex
• No P waves or AV dissociation
• Regular R-R intervals
• Often transient — starts and stops on its own

HOW TO TELL IT APART
• vs IVR → IVR is 20–40 bpm (escape). AIVR is 40–100 bpm (enhanced).
• vs VT → VT is > 100 bpm and dangerous. AIVR is < 100 bpm and usually benign.
• vs Accelerated Junctional → Junctional has narrow QRS. AIVR has wide QRS.

CAUSES
• Coronary reperfusion (the classic cause — it's a GOOD sign post-PCI)
• Acute MI
• Digoxin toxicity
• Myocarditis
• Post-cardiac surgery

TREATMENT
• Usually NO treatment needed — this is benign and self-limiting
• If hemodynamically compromised (rare), atropine may speed the sinus rate to override it
• Do NOT give antiarrhythmics — you'd suppress a benign rhythm
• Monitor and reassure

PACING — NOT INDICATED

KEY TAKEAWAY
AIVR post-MI is good news — it means blood flow has been restored to the heart muscle. The cath lab team loves seeing this rhythm after opening a blocked artery. It's one of the few ventricular rhythms you can smile about. Don't treat it — it'll go away on its own.`
};

// NSR with Bigeminal PVCs
export const ventricularBigeminy: Rhythm = {
  id: 'v-bigeminy',
  name: 'NSR with Bigeminal PVCs',
  rate: 72,
  description: 'Alternating pattern: normal sinus beat followed by PVC, repeating',
  waveform: 'v_bigeminy',
  pacingIndication: false,
  premium: true,
  explanation: `Ventricular bigeminy is a repeating pattern of one sinus beat followed by one PVC.

Key Features:
• Pattern: Normal beat → PVC → Normal beat → PVC (repeating)
• Every other beat is a PVC
• PVCs are wide, bizarre, no preceding P wave
• Underlying sinus rhythm present
• "Coupled" rhythm (bigeminy = every 2 beats)

PACING INDICATION: None - treat underlying cause if needed.
• May reduce cardiac output (PVCs don't pump efficiently)
• Causes: electrolyte imbalance, ischemia, stimulants, digitalis
• Treatment: correct cause, beta-blockers, ablation if frequent

Clinical Pearl: With bigeminy, the "effective" heart rate is halved since PVCs often don't produce pulses. Patient may feel palpitations. Check K+, Mg2+, and consider ischemia.`
};

// NSR with Trigeminal PVCs
export const ventricularTrigeminy: Rhythm = {
  id: 'v-trigeminy',
  name: 'NSR with Trigeminal PVCs',
  rate: 72,
  description: 'Repeating pattern: two normal sinus beats followed by one PVC',
  waveform: 'v_trigeminy',
  pacingIndication: false,
  premium: true,
  explanation: `Ventricular trigeminy is a repeating pattern of two sinus beats followed by one PVC.

Key Features:
• Pattern: Normal → Normal → PVC → Normal → Normal → PVC (repeating)
• Every third beat is a PVC
• PVCs are wide, bizarre, no preceding P wave
• Underlying sinus rhythm present
• "Trigeminy" = every 3 beats

PACING INDICATION: None - treat underlying cause if needed.
• Generally better tolerated than bigeminy
• Same causes as bigeminy: electrolytes, ischemia, stimulants
• Treatment: correct underlying cause

Clinical Pearl: Trigeminy is less concerning than bigeminy from a hemodynamic standpoint. The 2:1 ratio of good beats to PVCs maintains better cardiac output.`
};

// Ventricular Couplet (2 PVCs in a row)
export const ventricularCouplet: Rhythm = {
  id: 'v-couplet',
  name: 'NSR with Couplet (Paired PVCs)',
  rate: 72,
  description: 'Normal sinus rhythm with two consecutive PVCs (couplet/paired PVCs)',
  waveform: 'couplet',
  pacingIndication: false,
  premium: true,
  explanation: `A ventricular couplet is two consecutive PVCs occurring in a row, followed by return to normal rhythm.

Key Features:
• Two wide QRS complexes in succession (back-to-back PVCs)
• No P waves preceding the PVCs
• Short coupling interval between the two PVCs
• Compensatory pause often follows
• Returns to underlying sinus rhythm

SIGNIFICANCE:
• More concerning than isolated PVCs
• May indicate increased ventricular irritability
• Can be harbinger of more sustained arrhythmias
• Often associated with structural heart disease

CAUSES:
• Ischemia/infarction
• Electrolyte imbalances (K+, Mg++)
• Cardiomyopathy
• Stimulants, medications
• Hypoxia

Clinical Pearl: Couplets are more significant than isolated PVCs. Three or more consecutive PVCs = NSVT. The presence of couplets warrants evaluation for underlying cardiac disease.`
};

// Non-Sustained Ventricular Tachycardia (NSVT)
export const nsvt: Rhythm = {
  id: 'nsvt',
  name: 'Non-Sustained VT (NSVT)',
  rate: 150,
  description: '3 or more consecutive PVCs lasting <30 seconds, rate >100 bpm',
  waveform: 'nsvt',
  pacingIndication: false,
  premium: true,
  explanation: `Non-sustained ventricular tachycardia (NSVT) is a run of 3 or more consecutive ventricular beats at >100 bpm that terminates spontaneously within 30 seconds.

Key Features:
• ≥3 consecutive wide QRS complexes
• Rate typically 100-250 bpm
• Lasts <30 seconds by definition
• Self-terminates without intervention
• Returns to underlying rhythm

SIGNIFICANCE:
• May be asymptomatic or cause palpitations/dizziness
• Associated with increased mortality in structural heart disease
• Risk marker for sustained VT/sudden cardiac death
• Requires evaluation for underlying cause

CAUSES:
• Ischemic heart disease
• Cardiomyopathy (dilated, hypertrophic)
• Electrolyte abnormalities
• Drug toxicity (digoxin, antiarrhythmics)
• Long QT syndrome

MANAGEMENT:
• Identify and treat underlying cause
• Echocardiogram to assess LV function
• Consider EP study/ICD in high-risk patients

Clinical Pearl: NSVT in a patient with reduced EF (<35%) significantly increases risk of sudden cardiac death. These patients often warrant ICD consideration per guidelines.`
};

// ========== BUNDLE BRANCH BLOCKS ==========

// Left Bundle Branch Block (LBBB)
export const lbbb: Rhythm = {
  id: 'lbbb',
  name: 'Sinus Rhythm with LBBB',
  rate: 72,
  description: 'Wide QRS (>120ms) with broad R wave in lateral leads, deep S in V1 - "WiLLiaM"',
  waveform: 'lbbb',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
Left Bundle Branch Block occurs when conduction through the left bundle branch is blocked. The right ventricle depolarizes first (via the right bundle), then the impulse spreads slowly across the septum to depolarize the left ventricle late.

RECOGNIZE IT - "WiLLiaM" Pattern
• Wide QRS (≥120 ms or ≥3 small boxes)
• Lead V1: Deep, wide S wave (W shape - down)
• Leads I, aVL, V5-V6: Broad, notched R wave (M shape - up)
• No septal Q waves in lateral leads
• ST-T changes discordant to QRS (opposite direction)

THE MEMORY TRICK
"WiLLiaM" = W in V1, M in Lateral leads (I, aVL, V5-V6) = LBBB

CAUSES
• Ischemic heart disease / MI
• Hypertension with LVH
• Cardiomyopathy (dilated)
• Aortic valve disease
• Degenerative conduction system disease
• Can be rate-related (appears at faster rates)

CLINICAL SIGNIFICANCE
• NEW LBBB + chest pain = STEMI equivalent (cath lab activation)
• LBBB makes ischemia diagnosis difficult (ST changes unreliable)
• Associated with underlying structural heart disease
• May indicate need for CRT if EF reduced

PACING CONSIDERATION
• LBBB with reduced EF may benefit from CRT (biventricular pacing)
• CRT resynchronizes ventricular contraction

Clinical Pearl: NEW LBBB in a patient with chest pain should be treated as a STEMI equivalent. Use Sgarbossa criteria to help identify MI in the setting of LBBB: ≥1mm concordant ST elevation, ≥1mm ST depression in V1-V3, or ≥5mm discordant ST elevation.`
};

// Right Bundle Branch Block (RBBB)
export const rbbb: Rhythm = {
  id: 'rbbb',
  name: 'Sinus Rhythm with RBBB',
  rate: 72,
  description: 'Wide QRS (>120ms) with RSR\' pattern in V1, wide S in lateral leads - "MaRRoW"',
  waveform: 'rbbb',
  pacingIndication: false,
  premium: true,
  explanation: `WHAT IS IT
Right Bundle Branch Block occurs when conduction through the right bundle branch is blocked. The left ventricle depolarizes normally first, then the impulse spreads slowly to depolarize the right ventricle late, producing the characteristic RSR' pattern.

RECOGNIZE IT - "MaRRoW" Pattern
• Wide QRS (≥120 ms or ≥3 small boxes)
• Lead V1: RSR' pattern (M shape - "rabbit ears" or "M for Marrow")
• Leads I, V6: Wide, slurred S wave (W shape)
• T wave inversion in V1-V3 (secondary to RBBB)

THE MEMORY TRICK
"MaRRoW" = M in V1 (RSR'), W in lateral leads = RBBB
(Opposite of LBBB "WiLLiaM")

CAUSES
• Can be NORMAL variant in healthy individuals
• Pulmonary embolism (acute right heart strain)
• Right heart disease (cor pulmonale, ASD, pulmonary HTN)
• Ischemic heart disease
• Myocarditis
• Post-cardiac surgery
• Degenerative conduction disease

CLINICAL SIGNIFICANCE
• RBBB alone is often benign (can be normal variant)
• NEW RBBB may indicate PE or acute cardiac event
• RBBB + Left axis deviation = Bifascicular block (more concerning)
• Does NOT usually interfere with MI diagnosis (unlike LBBB)

PACING CONSIDERATION
• Isolated RBBB rarely needs pacing
• RBBB + symptomatic AV block may need pacemaker
• Bifascicular block (RBBB + LAFB) with syncope warrants evaluation

Clinical Pearl: Unlike LBBB, isolated RBBB can be a normal finding, especially in young healthy individuals. However, NEW RBBB should prompt evaluation for PE, especially with dyspnea or hypoxia. The RSR' "rabbit ears" in V1 is the classic finding.`
};

// ========== PACED RHYTHMS ==========

// AAI Pacing (Atrial pacing, atrial sensing, inhibited)
export const pacedAAI: Rhythm = {
  id: 'paced-aai',
  name: 'AAI Pacing',
  rate: 70,
  description: 'Atrial pacing only - pacing spike before P wave, native QRS conduction',
  waveform: 'paced_aai',
  pacingIndication: false,
  premium: true,
  explanation: `AAI pacing provides atrial pacing with atrial sensing, inhibited by sensed atrial activity.

Key Features:
• Pacing spike before each P wave (atrial capture)
• Normal narrow QRS (native conduction through AV node)
• No ventricular pacing spike
• Rate determined by programmed lower rate
• Spike inhibited when native atrial activity sensed

USED FOR:
• Sinus node dysfunction with intact AV conduction
• Patients who need atrial support but have normal AV node function
• Preserves AV synchrony and native ventricular activation

Clinical Pearl: AAI mode is rarely used alone today - most patients get DDD devices for backup ventricular pacing. However, AAI(R) can be used in isolated sinus node disease.`
};

// VVI Pacing (Ventricular pacing, ventricular sensing, inhibited)
export const pacedVVI: Rhythm = {
  id: 'paced-vvi',
  name: 'VVI Pacing',
  rate: 70,
  description: 'Ventricular pacing only - pacing spike before wide QRS, no atrial tracking',
  waveform: 'paced_vvi',
  pacingIndication: false,
  premium: true,
  explanation: `VVI pacing provides ventricular pacing with ventricular sensing, inhibited by sensed ventricular activity.

Key Features:
• Pacing spike before each QRS complex
• Wide QRS (paced from RV apex = LBBB morphology)
• No atrial pacing or sensing
• Rate determined by programmed lower rate
• Spike inhibited when native ventricular activity sensed

USED FOR:
• Permanent AFib with slow ventricular response - VVI is ideal here since there's no atrial activity to track
• Backup pacing when atrial tracking not needed
• Simple, single-lead system

Clinical Pearl: VVI pacing is particularly beneficial when the patient is in permanent AFib with slow ventricular response, as there's no atrial synchrony to preserve anyway. In sinus rhythm patients, VVI causes AV dyssynchrony (no atrial kick) which can cause "pacemaker syndrome" - fatigue, dyspnea, hypotension.

Lead II Morphology: With RV apical pacing, the QRS is predominantly negative in lead II (deep S wave) because ventricular depolarization travels superiorly, away from the inferior leads.`
};

// DDD Pacing (Dual chamber pacing and sensing)
export const pacedDDD: Rhythm = {
  id: 'paced-ddd',
  name: 'DDD Pacing',
  rate: 70,
  description: 'Dual chamber pacing - atrial spike, AV delay, then ventricular spike, both wide',
  waveform: 'paced_ddd',
  pacingIndication: false,
  premium: true,
  explanation: `DDD pacing provides dual chamber pacing and sensing with tracking capability.

Key Features:
• Atrial pacing spike (if atrial pacing needed)
• Programmed AV delay (mimics native PR interval)
• Ventricular pacing spike after AV delay
• Can track native atrial activity (sense P → pace V)
• Four behaviors: A-pace/V-pace, A-pace/V-sense, A-sense/V-pace, A-sense/V-sense

USED FOR:
• Complete heart block (most common indication)
• Sinus node dysfunction with AV block
• Any patient needing both atrial and ventricular support
• Preserves AV synchrony

Clinical Pearl: DDD is the most physiologic pacing mode - it maintains AV synchrony and allows rate response. Understanding the four states (AS-VS, AS-VP, AP-VS, AP-VP) helps with interpreting paced rhythms.`
};

// Atrial Failure to Capture
export const failureToCaptureAtrial: Rhythm = {
  id: 'failure-capture-atrial',
  name: 'Atrial Failure to Capture',
  rate: 70,
  description: 'Atrial spike present but no P wave follows - atrial lead fails to depolarize atrium',
  waveform: 'failure_capture_a',
  pacingIndication: false,
  premium: true,
  explanation: `Atrial failure to capture occurs when the atrial pacing spike fails to depolarize the atrium.

Key Features:
• Atrial pacing spike visible on ECG
• NO P wave following the atrial spike
• Ventricular pacing may still capture normally
• Loss of AV synchrony (atrial kick lost)

CAUSES:
• Elevated atrial capture threshold (fibrosis, scarring)
• Atrial lead dislodgement or migration
• Lead fracture or insulation breach
• Post-operative atrial inflammation
• Medications affecting atrial tissue

MANAGEMENT:
• Increase atrial output (voltage, pulse width)
• Check atrial lead impedance and position
• Consider lead revision if mechanical problem
• May need to switch to VVI mode if atrial lead unrepairable

Clinical Pearl: Atrial failure to capture causes loss of atrial kick (15-25% of cardiac output). Less immediately dangerous than ventricular failure, but still needs correction for optimal hemodynamics.`
};

// Ventricular Failure to Capture
export const failureToCaptureVentricular: Rhythm = {
  id: 'failure-capture-ventricular',
  name: 'Ventricular Failure to Capture',
  rate: 40,
  description: 'Ventricular spike present but no QRS follows - potentially life-threatening',
  waveform: 'failure_capture_v',
  pacingIndication: false,
  premium: true,
  explanation: `Ventricular failure to capture occurs when the ventricular pacing spike fails to depolarize the ventricle.

Key Features:
• Ventricular pacing spike visible on ECG
• NO QRS complex following the spike
• Patient relies on underlying escape rhythm
• Can cause symptomatic bradycardia or asystole

CAUSES:
• Elevated ventricular capture threshold (fibrosis, infarct)
• Ventricular lead dislodgement or migration
• Lead fracture or insulation breach
• Metabolic: hyperkalemia, acidosis, hypoxia
• Medications: antiarrhythmics

MANAGEMENT:
• Increase ventricular output (voltage, pulse width)
• Check ventricular lead impedance and position
• Correct reversible causes (K+, medications)
• Lead revision if mechanical problem
• Temporary pacing if pacemaker-dependent

Clinical Pearl: Ventricular failure to capture is an EMERGENCY in pacemaker-dependent patients. Check impedance: high = fracture, low = insulation breach. CXR to check lead position. Be ready for transcutaneous pacing.`
};

// Atrial Undersensing (Failure to Sense - Atrial Lead)
export const undersensingAtrial: Rhythm = {
  id: 'undersensing-atrial',
  name: 'Atrial Undersensing',
  rate: 72,
  description: 'Atrial lead fails to sense native P waves - atrial spikes fire inappropriately',
  waveform: 'undersensing_a',
  pacingIndication: false,
  premium: true,
  explanation: `Atrial undersensing occurs when the atrial lead fails to detect native P waves and fires inappropriately.

Key Features:
• Atrial pacing spikes occurring on or near native P waves
• Ventricular sensing intact - native QRS properly sensed
• Atrial lead "doesn't see" native atrial activity
• Atrial pacing at fixed rate regardless of native P waves

CAUSES:
• Atrial sensitivity programmed too low (number too high)
• Atrial lead dislodgement
• Low intrinsic P wave amplitude (small P waves)
• Lead fracture or insulation breach
• Atrial fibrosis or scarring

MANAGEMENT:
• Increase atrial sensitivity (lower the mV number)
• Check atrial lead position and impedance
• Reprogram if P wave amplitude inadequate
• Lead revision if necessary

Clinical Pearl: Atrial undersensing causes competitive atrial pacing but is less immediately dangerous than ventricular undersensing. Still needs correction to restore proper AV synchrony.`
};

// Ventricular Undersensing (Failure to Sense - Ventricular Lead)
export const undersensingVentricular: Rhythm = {
  id: 'undersensing-ventricular',
  name: 'Ventricular Undersensing',
  rate: 72,
  description: 'Ventricular lead fails to sense native QRS - paces into native rhythm dangerously',
  waveform: 'undersensing_v',
  pacingIndication: false,
  premium: true,
  explanation: `Ventricular undersensing occurs when the ventricular lead fails to detect native QRS complexes and paces inappropriately.

Key Features:
• Ventricular pacing spikes occurring during/after native QRS
• Spikes may fall on T waves (dangerous - can trigger VT/VF)
• Native QRS is present but device "doesn't see it"
• Ventricular pacing at fixed rate regardless of native activity

CAUSES:
• Ventricular sensitivity programmed too low (number too high)
• Ventricular lead dislodgement
• Low intrinsic R wave amplitude
• Lead fracture or insulation breach
• Myocardial infarction (reduced signal)

MANAGEMENT:
• Increase ventricular sensitivity (lower the mV number)
• Check ventricular lead position and impedance
• Reprogram if R wave amplitude inadequate
• Lead revision if necessary

Clinical Pearl: Ventricular undersensing is DANGEROUS - spikes landing on T waves ("R-on-T phenomenon") can trigger VT/VF. Requires immediate intervention. Increase sensitivity = lower the number (e.g., 2.5mV → 1.0mV).`
};

// Atrial Oversensing
export const oversensingAtrial: Rhythm = {
  id: 'oversensing-atrial',
  name: 'Atrial Oversensing',
  rate: 72,
  description: 'Atrial lead senses non-P wave signals - inhibits appropriate atrial pacing',
  waveform: 'oversensing_a',
  pacingIndication: false,
  premium: true,
  explanation: `Atrial oversensing occurs when the atrial lead detects signals other than P waves (like far-field R waves, myopotentials, or EMI) and inhibits atrial pacing.

Key Features:
• Atrial pacing inhibited despite need for pacing
• Device "sees" signals that aren't true P waves
• May cause inappropriate tracking in DDD mode
• Can result in pauses or loss of AV synchrony

CAUSES:
• Atrial sensitivity programmed too high (number too low)
• Far-field R wave sensing (ventricular signal seen by atrial lead)
• Myopotentials (muscle artifacts)
• Electromagnetic interference (EMI)
• Lead fracture causing noise

MANAGEMENT:
• Decrease atrial sensitivity (raise the mV number)
• Adjust PVAB (post-ventricular atrial blanking) if far-field R waves
• Check for lead fracture/noise
• Shield from EMI sources

Clinical Pearl: Far-field R wave oversensing is common - the atrial lead sees the larger ventricular signal. PVAB programming can help by blanking the atrial channel during ventricular activity.`
};

// Ventricular Oversensing
export const oversensingVentricular: Rhythm = {
  id: 'oversensing-ventricular',
  name: 'Ventricular Oversensing',
  rate: 72,
  description: 'Ventricular lead senses non-QRS signals - inhibits ventricular pacing inappropriately',
  waveform: 'oversensing_v',
  pacingIndication: false,
  premium: true,
  explanation: `Ventricular oversensing occurs when the ventricular lead detects signals other than R waves (like T waves, myopotentials, or EMI) and inhibits ventricular pacing.

Key Features:
• Ventricular pacing inappropriately inhibited
• Pauses in paced rhythm - no spikes when expected
• Device "sees" signals that aren't true R waves
• Can cause symptomatic bradycardia or pauses

CAUSES:
• Ventricular sensitivity programmed too high (number too low)
• T wave oversensing (tall T waves)
• Myopotentials (especially pectoral muscle)
• Electromagnetic interference (EMI)
• Lead fracture causing noise/make-break signals

MANAGEMENT:
• Decrease ventricular sensitivity (raise the mV number)
• Extend ventricular refractory period if T wave oversensing
• Check for lead fracture (impedance, noise)
• Shield from EMI sources

Clinical Pearl: T wave oversensing is common in patients with tall T waves (hyperkalemia, LVH). The pacemaker sees the T wave as another R wave, inhibiting the next paced beat. This can cause dangerous pauses.`
};

// All available rhythms - ordered logically
export const rhythms: Rhythm[] = [
  // Sinus rhythms
  normalSinusRhythm,
  sinusTachycardia,
  sinusBradycardia,
  sinusArrhythmia,
  sinusPause,
  sinusArrest,
  // NSR with ectopy
  nsrWithPAC,
  blockedPAC,
  nsrWithPJC,
  nsrWithPVC,
  ventricularBigeminy,
  ventricularTrigeminy,
  // AV Blocks (progressive)
  firstDegreeBlock,
  mobitzType1,
  mobitzType2,
  block2to1,
  completeHeartBlock,
  // Atrial arrhythmias
  wanderingAtrialPacemaker,
  mat,
  atrialTachycardia,
  afibSlowResponse,
  afibRVR,
  aflutterSVR,
  aflutterRVR,
  // Junctional rhythms
  junctionalRhythm,
  accelJunctional,
  junctionalTachycardia,
  svt,
  wpw,
  // Ventricular arrhythmias
  idioventricularRhythm,
  aivr,
  ventricularTachycardia,
  torsadesDePointes,
  ventricularFibrillation,
  asystole,
  ventricularCouplet,
  nsvt,
  // Bundle Branch Blocks
  lbbb,
  rbbb,
  // Paced rhythms
  pacedAAI,
  pacedVVI,
  pacedDDD,
  // Pacemaker malfunctions
  failureToCaptureAtrial,
  failureToCaptureVentricular,
  undersensingAtrial,
  undersensingVentricular,
  oversensingAtrial,
  oversensingVentricular,
];

// All rhythm names for quiz options
const quizEligibleNames = rhythms.map(r => r.name);

// Map of similar rhythms for quiz distractors (based on "TELL IT APART" sections)
const similarRhythms: Record<string, string[]> = {
  // Sinus Rhythms - rate-based confusion
  'Normal Sinus Rhythm': ['Sinus Bradycardia', 'Sinus Tachycardia', 'Sinus Arrhythmia'],
  'Sinus Bradycardia': ['Normal Sinus Rhythm', 'Junctional Escape Rhythm', '2:1 AV Block'],
  'Sinus Tachycardia': ['Normal Sinus Rhythm', 'SVT', 'Atrial Tachycardia'],
  'Sinus Arrhythmia': ['Normal Sinus Rhythm', 'AFib with Slow Ventricular Response', 'Wandering Atrial Pacemaker'],
  'Sinus Pause': ['Sinus Arrest', 'NSR with Blocked PAC', 'Mobitz Type II'],
  'Sinus Arrest': ['Sinus Pause', 'Complete Heart Block', 'Mobitz Type II'],

  // Ectopy - PAC vs PVC confusion
  'NSR with PAC': ['NSR with PVC', 'NSR with PJC', 'NSR with Blocked PAC'],
  'NSR with PVC': ['NSR with PAC', 'Ventricular Bigeminy', 'Ventricular Couplet'],
  'NSR with PJC': ['NSR with PAC', 'Junctional Escape Rhythm', 'NSR with PVC'],
  'NSR with Blocked PAC': ['Sinus Pause', 'Mobitz Type II', 'NSR with PAC'],
  'Ventricular Bigeminy': ['Ventricular Trigeminy', 'NSR with PVC', 'NSR with PAC'],
  'Ventricular Trigeminy': ['Ventricular Bigeminy', 'NSR with PVC', 'NSR with PAC'],
  'Ventricular Couplet': ['NSR with PVC', 'NSVT', 'Ventricular Bigeminy'],

  // AV Blocks - commonly confused
  'First Degree AV Block': ['Normal Sinus Rhythm', 'Mobitz Type I (Wenckebach)', 'Junctional Escape Rhythm'],
  'Mobitz Type I (Wenckebach)': ['Mobitz Type II', '2:1 AV Block', 'First Degree AV Block'],
  'Mobitz Type II': ['Mobitz Type I (Wenckebach)', '2:1 AV Block', 'Complete Heart Block'],
  '2:1 AV Block': ['Mobitz Type I (Wenckebach)', 'Mobitz Type II', 'Complete Heart Block'],
  'Complete Heart Block': ['Mobitz Type II', '2:1 AV Block', 'Idioventricular Rhythm'],

  // Atrial Arrhythmias - irregular rhythms
  'Wandering Atrial Pacemaker': ['Multifocal Atrial Tachycardia', 'Sinus Arrhythmia', 'AFib with Slow Ventricular Response'],
  'Multifocal Atrial Tachycardia': ['Wandering Atrial Pacemaker', 'AFib with Rapid Ventricular Response', 'Atrial Tachycardia'],
  'Atrial Tachycardia': ['Sinus Tachycardia', 'SVT', 'AFL with Rapid Ventricular Response'],
  'AFib with Slow Ventricular Response': ['AFib with Rapid Ventricular Response', 'Wandering Atrial Pacemaker', 'AFL with Slow Ventricular Response'],
  'AFib with Rapid Ventricular Response': ['AFib with Slow Ventricular Response', 'AFL with Rapid Ventricular Response', 'Multifocal Atrial Tachycardia'],
  'AFL with Slow Ventricular Response': ['AFib with Slow Ventricular Response', 'AFL with Rapid Ventricular Response', 'Atrial Tachycardia'],
  'AFL with Rapid Ventricular Response': ['AFL with Slow Ventricular Response', 'SVT', 'Sinus Tachycardia'],

  // Junctional Rhythms - rate-based
  'Junctional Escape Rhythm': ['Accelerated Junctional Rhythm', 'Sinus Bradycardia', 'Idioventricular Rhythm'],
  'Accelerated Junctional Rhythm': ['Junctional Escape Rhythm', 'Junctional Tachycardia', 'Normal Sinus Rhythm'],
  'Junctional Tachycardia': ['Accelerated Junctional Rhythm', 'SVT', 'Atrial Tachycardia'],
  'SVT': ['Sinus Tachycardia', 'AFL with Rapid Ventricular Response', 'Junctional Tachycardia'],
  'WPW Pattern': ['First Degree AV Block', 'LBBB', 'NSR with PVC'],

  // Ventricular Rhythms - wide complex
  'Idioventricular Rhythm': ['Accelerated Idioventricular Rhythm', 'Complete Heart Block', 'Junctional Escape Rhythm'],
  'Accelerated Idioventricular Rhythm': ['Idioventricular Rhythm', 'Ventricular Tachycardia', 'Junctional Escape Rhythm'],
  'Ventricular Tachycardia': ['SVT', 'AFL with Rapid Ventricular Response', 'Torsades de Pointes'],
  'NSVT': ['Ventricular Tachycardia', 'Ventricular Couplet', 'NSR with PVC'],
  'Torsades de Pointes': ['Ventricular Tachycardia', 'Ventricular Fibrillation', 'Polymorphic VT'],
  'Ventricular Fibrillation': ['Asystole', 'Torsades de Pointes', 'Ventricular Tachycardia'],
  'Asystole': ['Ventricular Fibrillation', 'Fine VFib', 'Complete Heart Block'],

  // Bundle Branch Blocks
  'LBBB': ['RBBB', 'WPW Pattern', 'Ventricular Paced Rhythm'],
  'RBBB': ['LBBB', 'NSR with PVC', 'Normal Sinus Rhythm'],

  // Paced Rhythms
  'AAI Paced Rhythm': ['DDD Paced Rhythm', 'Normal Sinus Rhythm', 'Sinus Bradycardia'],
  'VVI Paced Rhythm': ['DDD Paced Rhythm', 'Idioventricular Rhythm', 'Complete Heart Block'],
  'DDD Paced Rhythm': ['AAI Paced Rhythm', 'VVI Paced Rhythm', 'First Degree AV Block'],

  // Pacemaker Malfunctions
  'Failure to Capture - Atrial': ['Atrial Undersensing', 'AAI Paced Rhythm', 'Sinus Arrest'],
  'Failure to Capture - Ventricular': ['Ventricular Undersensing', 'VVI Paced Rhythm', 'Complete Heart Block'],
  'Atrial Undersensing': ['Failure to Capture - Atrial', 'AAI Paced Rhythm', 'Atrial Oversensing'],
  'Ventricular Undersensing': ['Failure to Capture - Ventricular', 'VVI Paced Rhythm', 'Ventricular Oversensing'],
  'Atrial Oversensing': ['Atrial Undersensing', 'AAI Paced Rhythm', 'Sinus Pause'],
  'Ventricular Oversensing': ['Ventricular Undersensing', 'VVI Paced Rhythm', 'Sinus Pause'],
};

// Generate 4 quiz options (A, B, C, D) including the correct answer
export function getQuizOptions(correctAnswer: string): string[] {
  const options = [correctAnswer];

  // Add similar rhythms from the map (these are commonly confused)
  const confusableRhythms = similarRhythms[correctAnswer] || [];
  for (const rhythm of confusableRhythms) {
    if (options.length < 4 && quizEligibleNames.includes(rhythm)) {
      options.push(rhythm);
    }
  }

  // Get other options (exclude correct answer and already added options)
  let otherOptions = quizEligibleNames.filter(
    name => name !== correctAnswer && !options.includes(name)
  );

  // Shuffle other options
  for (let i = otherOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherOptions[i], otherOptions[j]] = [otherOptions[j], otherOptions[i]];
  }

  // Fill remaining slots (need 4 total)
  const slotsNeeded = 4 - options.length;
  options.push(...otherOptions.slice(0, slotsNeeded));

  // Shuffle the final 4 options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}

// Track shown rhythms to avoid repeats until all have been shown
let shownRhythmIds: Set<string> = new Set();

// Rhythms available for quiz
const quizRhythms = rhythms;

export function getRandomRhythm(currentRhythmId?: string): Rhythm {
  // If current rhythm provided, add to shown set
  if (currentRhythmId) {
    shownRhythmIds.add(currentRhythmId);
  }

  // Get rhythms that haven't been shown yet (from quiz-eligible rhythms)
  let availableRhythms = quizRhythms.filter(r => !shownRhythmIds.has(r.id));

  // If all rhythms have been shown, reset and start over (but exclude current)
  if (availableRhythms.length === 0) {
    shownRhythmIds.clear();
    if (currentRhythmId) {
      shownRhythmIds.add(currentRhythmId);
    }
    availableRhythms = quizRhythms.filter(r => r.id !== currentRhythmId);
  }

  // Pick a random rhythm from available ones
  const randomIndex = Math.floor(Math.random() * availableRhythms.length);
  const selectedRhythm = availableRhythms[randomIndex];

  // Mark as shown
  shownRhythmIds.add(selectedRhythm.id);

  return selectedRhythm;
}

// Reset shown rhythms (for new session)
export function resetShownRhythms(): void {
  shownRhythmIds.clear();
}

// Get only rhythms with pacing indications
export function getPacingIndicationRhythms(): Rhythm[] {
  return rhythms.filter(r => r.pacingIndication);
}
