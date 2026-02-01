---
title: Section 7 - Device Follow-Up & Troubleshooting
tags: [ibhre, section-7, follow-up, interrogation, troubleshooting]
exam_weight: 28%
videos: 27
duration: 4.5 hours
priority: 🔴 HIGH
---

# Section 7: Device Follow-Up & Troubleshooting (28% - 2ND LARGEST!)

> [!danger] CRITICAL SECTION - HIGHEST PRIORITY
> - **Exam Weight**: 28% (2nd largest, nearly 1/3 of exam!)
> - **Total Videos**: 27 videos
> - **Duration**: ~4.5 hours
> - **Priority**: 🔴 HIGH - Master this!

**Focus**: Device interrogation, interpretation, programming, troubleshooting

---

## 7.A. Interrogation & Data Review

> [!example] Video Breakdown: 6 videos, ~60 minutes

### Video 1: Systematic Interrogation Approach (10-12 min)
**Every Follow-Up Should Include:**

| Component | What to Check | Normal Values |
|-----------|---------------|---------------|
| **Battery** | Voltage, charge time (ICD) | PM: 2.4-2.8V, ICD: 10-15s |
| **Lead integrity** | Impedance trends | 400-1200Ω |
| **Capture** | Pacing thresholds | <1.5V atrial, <1.0V ventricular |
| **Sensing** | Intrinsic amplitudes | P>2mV, R>5mV |
| **Diagnostics** | % pacing, arrhythmias, mode switch | |
| **Programming** | Appropriate for patient | |

**Documentation:**
- Date, device model, serial number
- Battery status, lead parameters
- Episodes stored
- Programming changes made
- Plan for next follow-up

---

### Video 2: Battery Status Assessment (10-12 min)
**Pacemaker Battery Indicators:**

```
Battery Voltage Progression:
BOL (Beginning of Life): 2.8V
   ↓ (years of normal use)
Nominal: 2.5-2.7V
   ↓
ERI (Elective Replacement): 2.4V
   ↓ (months)
EOL (End of Life): 2.0V
```

**ICD Battery Indicators:**
- Voltage (3.2V → 2.6V ERI)
- **Charge time** (more sensitive indicator)
  - <10s: Excellent
  - 10-15s: Normal
  - 15-20s: ERI approaching
  - >20s: Replace soon!

**Capacitor Reformation:**
- Automatic process (weekly-monthly)
- Maintains capacitor function
- Slight battery drain

---

### Video 3: Lead Impedance Trends (10-12 min)
**Interpreting Impedance:**

> [!success] Stable Impedance (Good)
> ```
> Impedance (Ω)
>    │
> 800│ ═══════════════════════
>    │        Stable
>    └──────────────────────→ Time
>       Imp  3m  6m  1y  2y
> ```

> [!danger] Rising Impedance (Fracture)
> ```
> Impedance (Ω)
>     │
> 2000│            ╱───── Fracture!
>     │          ╱
> 1200│ ════════╱
>     │
>  800│────────
>     └──────────────────→ Time
> ```

> [!danger] Falling Impedance (Insulation Breach)
> ```
> Impedance (Ω)
>     │
>  800│────────╲
>     │         ╲
>  400│          ═════════
>     │  Insulation breach
>  200│
>     └──────────────────→ Time
> ```

**Action Items:**
- Sudden ↑ (>300Ω) → Suspect fracture (high-voltage test, fluoroscopy)
- Sudden ↓ (>300Ω drop) → Suspect insulation breach (provocative maneuvers)

---

### Video 4: Threshold & Sensing Trends (10-12 min)
**Threshold Maturation:**

```
Normal Threshold Curve:
Voltage (V)
   │
2.0│     ╱╲ Peak at 2-6 weeks (inflammatory response)
   │    ╱  ╲___
1.0│   ╱       ╲______ Chronic threshold (steroid lead)
   │  ╱
0.5│ ╱──────────────────────
   │╱ Acute
   └─────────────────────→ Time
    Imp  2w  6w  3m  6m  1y
```

**Rising Threshold Causes:**
- Fibrosis, scar
- Medication (amiodarone, flecainide)
- Metabolic (hyperkalemia, acidosis)
- Ischemia at tip
- Exit block

**Sensing Amplitude:**
- Should remain stable after maturation
- Sudden drop → Lead dislodgement, insulation breach
- Gradual rise → Normal (endothelialization)

---

### Video 5: Diagnostics & Event Logs (10-12 min)
**Key Diagnostic Counters:**

| Metric | Clinical Use |
|--------|--------------|
| **% Atrial pacing** | Assess sinus node function |
| **% Ventricular pacing** | Minimize if possible (<40% goal) |
| **Mode switch episodes** | A-fib burden |
| **High ventricular rate episodes** | Rapid conducted A-fib (adjust AV or beta blocker) |
| **PVC count** | Ventricular ectopy burden |
| **ATP attempts** | VT frequency |
| **Shocks delivered** | Appropriate vs inappropriate |

**Activity Histogram:**
- 24-hour activity profile
- Assess rate response appropriateness

---

### Video 6: EGM Review & Storage (10-12 min)
**Stored EGMs:**
- Atrial EGM (if available)
- Ventricular EGM
- Shock EGM (ICD)
- Marker channels (timing annotations)

**What to Look For:**
- Appropriate sensing (R-wave clearly above noise)
- Appropriate therapy (shock for VT/VF, not SVT)
- Oversensing (T-waves, noise, myopotentials)
- Undersensing (missed beats)

**ICD Episode Classification:**
- VF treated (appropriate)
- VT treated (appropriate)
- SVT/sinus tach inappropriately shocked (inappropriate)

---

## 7.B. Troubleshooting Common Problems

> [!example] Video Breakdown: 8 videos, ~85 minutes

### Video 7: Loss of Capture (10-12 min)
**Definition**: Pacing spike without myocardial depolarization

**ECG/EGM Findings:**
```
Expected: ─▲────QRS────▲────QRS
Actual:   ─▲──────────▲──────── (spikes, no QRS)
```

**Troubleshooting Steps:**
1. Check lead connection (set screw tight?)
2. Check impedance (high = fracture, low = insulation breach)
3. Check threshold (test capture at increasing outputs)
4. Check X-ray (lead position)
5. Increase output temporarily
6. Plan lead revision if persistent

**Acute vs Chronic:**
- Acute (<30 days): Likely dislodgement → reposition
- Chronic (>30 days): Exit block, medication, metabolic

---

### Video 8: Undersensing (10-12 min)
**Definition**: Device fails to detect intrinsic cardiac activity

**ECG Findings:**
```
Expected: R───(pause)───R
Actual:   R──▲QRS──R (paces despite intrinsic beat)
```

**Causes:**
- Low intrinsic amplitude (R-wave <2mV)
- Sensitivity programmed too low (e.g., 5.0mV)
- Lead dislodgement
- Medications (flecainide)

**Solutions:**
1. Increase sensitivity (lower number: 5mV → 2mV)
2. Check lead position
3. Enable auto-sensing
4. Lead repositioning if amplitude persistently low

---

### Video 9: Oversensing (10-12 min)
**Definition**: Device senses non-cardiac signals as cardiac events

**Common Types:**

> [!warning] T-Wave Oversensing
> ```
> Normal: R_______T_______R
> Oversensed: R___T___R___T (device counts T as R → doubles rate)
> ```
> **Solution**: Decrease sensitivity (0.3mV → 0.6mV)

> [!warning] Myopotential Oversensing
> - Pectoral muscle activity detected
> - Causes: Arm movement, exercise
> - **Solution**: Bipolar sensing, adjust sensitivity

> [!warning] Lead Noise (Fracture)
> - High-frequency artifact
> - **Solution**: Lead replacement

---

### Video 10: Inappropriate ICD Shocks (12-15 min)
**Most Common Causes:**

| Cause | Mechanism | Solution |
|-------|-----------|----------|
| **A-fib with RVR** | V-rate exceeds VT zone | Rate control (beta blockers), higher VT cutoff |
| **Sinus tachycardia** | Exercise, pain, fever | Increase rate cutoff (>180 bpm) |
| **SVT (AVNRT)** | Regular narrow-complex tach | Enable discriminators, ablation |
| **T-wave oversensing** | Doubles rate | Decrease sensitivity |
| **Lead fracture** | Noise interpreted as VF | Lead replacement |

**ICD Programming to Reduce Inappropriate Shocks:**
- Higher rate cutoffs (VF >200 bpm, not 180 bpm)
- Longer detection times (30/40 intervals, not 18/24)
- Enable all discriminators (stability, onset, morphology)
- SVT upper rate limit (withholds shock if <sinus tach rate)

---

### Video 11: Pacemaker-Mediated Tachycardia (PMT) (10-12 min)
**Mechanism:**

```
PVC → Retrograde P-wave → Atrial sensing → AV delay → V-pace → Retrograde P...
(Endless loop tachycardia)
```

**ECG:**
- Regular tachycardia at upper tracking limit
- Inverted P-waves after QRS (negative in II, III, aVF)

**Prevention:**
- Extend PVARP (400ms)
- Enable PVARP extension after PVC
- Enable PMT termination algorithm

**Termination:**
- Automatic: Device withholds 1 V-pace → breaks loop
- Manual: Magnet application (temporary asynchronous pacing)

---

### Video 12: Mode Switch Issues (10-12 min)
**Normal Mode Switch:**
- Detects rapid atrial rate (>175 bpm)
- Switches from DDD → VVI
- Prevents rapid V-pacing during A-fib

**Inappropriate Mode Switch:**
- Far-field R-wave on atrial channel → double counting
- Atrial oversensing (myopotentials, EMI)

**Solutions:**
- Adjust atrial sensitivity (less sensitive)
- Extend PVARP
- Bipolar atrial sensing

---

### Video 13: High Ventricular Rate Episodes (10-12 min)
**Definition**: V-rate >XXX bpm for >YYY seconds (programmable)

**Causes:**
- A-fib with rapid ventricular response
- Tracking atrial tachycardia (AT, flutter)
- PMT

**Management:**
1. Review stored EGMs (identify rhythm)
2. Rate control (beta blockers, CCB)
3. Ablation if recurrent AT/flutter
4. Adjust upper tracking rate
5. Enable mode switch

---

### Video 14: Battery Depletion & ERI Management (10-12 min)
**ERI (Elective Replacement Indicator):**
- 3-6 months of normal function remaining
- Schedule elective replacement
- Avoid emergencies

**EOL Features Disabled:**
- Rate response
- Stored diagnostics
- Some pacing modes
- ICD: Tachy therapies may be suspended

**Urgent vs Elective Replacement:**
- Pacemaker-dependent + ERI → Urgent (within 2-4 weeks)
- Non-dependent + ERI → Elective (within 3 months)

---

## 7.C. Advanced Programming

> [!example] Video Breakdown: 7 videos, ~75 minutes

### Video 15: Optimizing AV Delay (10-12 min)
**Methods:**

**Empiric:**
- Normal EF: 150-200ms
- Heart failure: 100-120ms
- 1° AVB: 250-300ms (allow intrinsic conduction)

**Echocardiographic (Ritter Method):**
- Measure intrinsic A-wave duration
- Optimal AV delay = Current AV − (A-wave duration − 75ms)

**Iterative Testing:**
- Adjust AV delay in 20ms steps
- Measure cardiac output, symptoms
- Use shortest AV delay with best hemodynamics

---

### Video 16: CRT Optimization (V-V Timing) (12-15 min)
**V-V Delay:**
- Time offset between RV and LV pacing
- **Simultaneous (0ms)**: Most common
- **LV-first (−40ms)**: If RV conducts faster than LV
- **RV-first (+40ms)**: Rare

**Optimization Methods:**
- **Echo**: Measure VTI (velocity-time integral), adjust for max VTI
- **ECG**: QRS narrowing
- **Clinical**: Symptoms, NYHA class, 6-min walk

**When to Optimize:**
- Non-responders (<15% improvement)
- Clinical deterioration
- Not routine (time-intensive, modest benefit)

---

### Video 17: Rate Response Programming (10-12 min)
**Activity Threshold:**
- Low: Very sensitive (minimal activity triggers rate increase)
- Medium: Moderate activity required
- High: Significant activity required

**Rate Response Slope:**
- How aggressively rate increases with activity
- Settings: 1-16 (5-7 typical)

**Upper Sensor Rate:**
- Maximum rate with activity
- Age-adjusted: 220 − age × 0.8

**Testing:**
- 6-minute walk test
- Goal: HR 80-100 bpm with moderate activity
- Adjust if under- or over-response

---

### Video 18: ICD Zone Programming (10-12 min)
**Single vs Dual vs Triple Zone:**

| Zones | Configuration | Use Case |
|-------|---------------|----------|
| **Single (VF only)** | >200 bpm = VF (shock) | Monomorphic VT patients (slow VT) |
| **Dual (VT + VF)** | 150-200 = VT (ATP+shock), >200 = VF (shock) | Most patients |
| **Triple** | 150-180 = Monitor, 180-200 = VT, >200 = VF | Rare, complex cases |

**Conservative Programming (Reduce Shocks):**
- VF zone >200 bpm (not 180)
- VT zone ATP-only (withholds shock unless ATP fails)
- Longer detection (30/40 intervals)

---

### Video 19: ATP Programming (8-10 min)
**Burst vs Ramp:**
- **Burst**: 8 beats at fixed cycle length (88% of VT)
- **Ramp**: Each beat 10ms shorter (more aggressive)

**Number of Attempts:**
- 1-3 ATP sequences before shock
- More ATP = fewer shocks (but delays treatment)

**ATP During Charging:**
- Delivers ATP while capacitor charges
- If successful → aborts shock
- No delay in therapy

---

### Video 20: Discriminators & Enhancements (10-12 min)
**SVT Discriminators:**
- **Stability**: Irregular R-R → A-fib (withhold shock)
- **Onset**: Gradual → sinus tach (withhold)
- **Morphology**: QRS matches template → SVT (withhold)
- **Chamber of Origin**: A-rate > V-rate → SVT

**Enhanced Detection:**
- **PR Logic** (dual chamber): P:QRS relationship
- **Wavelet**: Advanced morphology analysis
- **SmartShock** (Boston): Multi-parameter algorithm

---

### Video 21: Remote Monitoring Setup (10-12 min)
**Systems:**
- **Medtronic**: CareLink
- **Abbott**: Merlin.net
- **Boston Scientific**: LATITUDE
- **Biotronik**: Home Monitoring

**Transmission Schedule:**
- Automatic: Nightly or weekly
- Manual: Patient-initiated (symptoms)
- Alert-based: Device detects issue → immediate transmission

**What's Transmitted:**
- Battery status
- Lead parameters
- Arrhythmia episodes
- % pacing
- Alerts (lead failure, VT/VF episodes, high threshold)

**Benefits:**
- Early detection of issues (vs waiting for clinic visit)
- Reduced clinic burden
- Improved outcomes (TRUST, ALTITUDE trials)

---

## 7.D. Special Populations & Scenarios

> [!example] Video Breakdown: 6 videos, ~60 minutes

### Video 22: End-of-Life Device Management (10-12 min)
**ICD Deactivation:**
- Appropriate in terminal illness
- Prevents painful shocks during natural death
- **Ethical**: Withdrawing therapy (permissible)
- **How**: Disable tachy therapies (pacing remains active)

**Pacemaker Management:**
- Generally NOT deactivated (passive therapy)
- May deactivate if family requests + patient non-dependent

**Communication:**
- Document goals of care
- Involve palliative care, family
- Reassure patient: Deactivation does NOT cause death

---

### Video 23: Pediatric Considerations (10-12 min)
**Unique Challenges:**
- Small body size (limited pocket space)
- Growth (leads must accommodate)
- Activity level (higher lead stress)

**Lead Options:**
- Epicardial (infants, congenital heart disease)
- Transvenous (school-age and older)
- Active fixation preferred (better long-term)

**Programming:**
- Higher upper rates (children have faster HR)
- Rate response often needed

---

### Video 24: Pregnancy & Devices (8-10 min)
**Device Implantation During Pregnancy:**
- Avoid X-ray/fluoroscopy (especially first trimester)
- Use echo/EGM-guided implantation if urgent
- Defer elective implants until post-partum

**Device Follow-Up:**
- Safe to interrogate (no radiation)
- Adjust settings for physiologic changes (higher HR needs)

**Delivery:**
- Device does NOT need to be turned off
- No contraindication to vaginal delivery
- ICD may detect artifact during pushing (rare shocks)

---

### Video 25: Dialysis Patients (10-12 min)
**Challenges:**
- Venous access (AV fistula → limited veins)
- High infection risk (immunosuppression, frequent access)
- Electrolyte shifts (threshold changes)

**Lead Placement:**
- Contralateral to fistula (preserve veins)
- Consider S-ICD (no venous leads)
- Antibiotic envelope strongly recommended

**Monitoring:**
- Check thresholds after dialysis (K+ shifts)
- Watch for sensing changes

---

### Video 26: Patients with Ventricular Assist Devices (VAD) (10-12 min)
**Interactions:**
- VAD flow pulsatile or continuous
- Continuous flow → no pulse (complicates assessment)
- VAD can generate EMI → device interference

**Device Settings:**
- Disable rate response (VAD movement → false acceleration)
- Consider asynchronous pacing (if VAD causes EMI)
- ICD remains active (VT/VF still possible)

---

### Video 27: Lead Extraction Decision-Making (10-12 min)
**Indications for Extraction:**

| Indication | Class |
|------------|-------|
| **Infection** (any device-related) | I (must extract) |
| **Lead malfunction** + venous occlusion (can't add new lead) | I |
| **Life-threatening arrhythmia from abandoned lead** | I |
| **Non-functional lead** + need for MRI | IIa (reasonable) |
| **Cosmetic** | III (not recommended) |

**Risks:**
- Major complication: 1-2% (death, SVC tear, tamponade)
- Minor complication: 10% (hematoma, pneumothorax)

**When to Refer:**
- Experienced center (>50 extractions/year)
- Cardiac surgery backup
- Laser/mechanical sheaths
- Femoral workstation

---

### 📝 Section 7 Quiz

1. ERI charge time for ICD: (>20s ✓, 10-15s, <10s)
2. Rising impedance suggests: (fracture ✓, insulation breach, normal)
3. PMT is terminated by: (extending PVARP, withholding 1 V-pace ✓, increasing rate)
4. Conservative VF zone cutoff: (>180 bpm, >200 bpm ✓, >220 bpm)
5. Device infection requires: (antibiotics only, pocket drainage, complete extraction ✓)

---

[[README|← Back to Master Plan]] | [[Section_6_Safety|← Previous: Section 6]] | [[Section_8_Radiology|Next: Section 8 →]]
