---
title: Section 3 - ECG Interpretation
tags: [ibhre, section-3, ecg, interpretation]
exam_weight: 4%
videos: 10
duration: 1.5 hours
priority: 🟢 LOW
---

# Section 3: ECG Interpretation (4% of exam)

> [!info] Section Overview
> - **Exam Weight**: 4%
> - **Total Videos**: 10 videos
> - **Duration**: ~1.5 hours
> - **Priority**: 🟢 LOW (but clinically essential)

**Focus**: ECG interpretation as it relates to device therapy selection and troubleshooting

---

## 3.A. Basic ECG Interpretation for Device Therapy

> [!example] Video Breakdown: 4 videos, ~40 minutes

### Video 1: 12-Lead ECG Basics (10-12 min)

**Systematic ECG Review:**

| Component | Normal Values | Device Implications |
|-----------|---------------|---------------------|
| **Rate** | 60-100 bpm | <60 = consider pacing |
| **Rhythm** | Regular, sinus | Irregular = A-fib → VVI mode |
| **PR Interval** | 0.12-0.20 sec | >0.20 = 1° AVB → DDD |
| **QRS Duration** | <0.12 sec | ≥0.15 + LBBB + HF = CRT candidate |
| **QT Interval** | <440 ms (men), <460 ms (women) | Long QT = ICD risk |
| **Axis** | -30° to +90° | LAFB, LPFB patterns |

**Lead Placement & Vectors:**
- Limb leads (I, II, III, aVR, aVL, aVF)
- Precordial leads (V1-V6)
- Understanding vectors for device EGM correlation

**Visual Aid:**
- 12-lead ECG with normal annotations
- Lead vector diagrams
- Common artifacts

---

### Video 2: Conduction Blocks on ECG (10-12 min)

**AV Blocks:**

> [!danger] 1st Degree AV Block
> - PR >0.20 sec, all P-waves conducted
> - **Device**: Usually none, but consider if symptomatic

> [!danger] 2nd Degree Mobitz I (Wenckebach)
> - Progressive PR prolongation → dropped QRS
> - **Device**: Usually benign, watch for progression

> [!danger] 2nd Degree Mobitz II
> - Fixed PR, sudden dropped QRS
> - **Device**: DDD pacemaker (high risk of complete block)

> [!danger] 3rd Degree (Complete) AV Block
> - No relationship between P and QRS
> - Escape rhythm often slow, unreliable
> - **Device**: DDD pacemaker (urgent)

**Bundle Branch Blocks:**

```
RBBB Pattern:
  V1: rSR' ("rabbit ears")
  V6: Wide S wave
  QRS ≥0.12 sec
  → May need CRT if EF low

LBBB Pattern:
  V1: Deep QS complex
  V6: Broad R wave, no Q
  QRS ≥0.12 sec
  → Strong CRT indication if ≥150ms + HF

Bifascicular Block (RBBB + LAFB):
  → Monitor for progression to complete block
```

---

### Video 3: Pre-Excitation & Accessory Pathways (8-10 min)

**Wolff-Parkinson-White (WPW):**

> [!warning] ECG Features
> - Short PR interval (<0.12 sec)
> - Delta wave (slurred QRS upstroke)
> - Wide QRS (>0.12 sec)

**Device Considerations:**

> [!danger] A-fib + WPW = DANGER
> - Bypass tract can conduct rapidly (>300 bpm)
> - Risk of VF
> - **Treatment**: Ablation first, ICD if high risk

**Visual Aid:**
- ECG showing delta wave
- Before/after ablation
- A-fib with rapid conduction via accessory pathway

---

### Video 4: Ischemia & MI Patterns (8-10 min)

**Acute MI Recognition:**

| Finding | Location | Device Impact |
|---------|----------|---------------|
| **ST elevation V1-V4** | Anterior MI | May need ICD (low EF risk) |
| **ST elevation II, III, aVF** | Inferior MI | Watch for AV block (RCA occlusion) |
| **ST depression V1-V3** | Posterior MI | Often need revascularization first |
| **Diffuse ST elevation** | Pericarditis | Avoid device implant until resolved |

**Q Waves & Scar:**
- Pathologic Q waves = old MI, scar
- Scar = arrhythmia substrate
- ICD consideration for secondary prevention

---

## 3.B. Device-Related ECG Patterns

> [!example] Video Breakdown: 6 videos, ~60 minutes

### Video 5: Paced ECG Patterns (10-12 min)

**Pacing Spikes:**

```
Atrial Pacing (AP):
  ─▲────P────────
   ↑ Spike followed by P-wave

Ventricular Pacing (VP):
  ─▲────QRS─────
   ↑ Spike followed by wide QRS

Dual Chamber Pacing (AP-VP):
  ─▲────P───▲────QRS
   AP      150ms   VP
```

**QRS Morphology by Lead Position:**

| Lead Location | V1 Morphology | Axis |
|---------------|---------------|------|
| **RV Apex** | LBBB pattern | Left axis |
| **RV Septum** | LBBB or narrow | Normal axis |
| **RVOT** | LBBB pattern | Inferior axis |
| **Biventricular** | Variable (fusion) | Depends on timing |

**Fusion & Pseudofusion:**
- **Fusion**: Pacing + intrinsic beat merge
- **Pseudofusion**: Spike on QRS (no capture, not harmful)

---

### Video 6: Pacemaker Malfunction on ECG (10-12 min)

**Loss of Capture:**

```
Expected: ─▲────QRS
Actual:   ─▲─────── (spike, no QRS)

Causes:
  ├─ High threshold (exit block)
  ├─ Lead dislodgement
  ├─ Lead fracture
  └─ Battery depletion
```

**Undersensing:**

```
Expected: R───(pause)───R
Actual:   R──▲QRS──R

Device fails to see intrinsic beat → paces inappropriately
```

**Oversensing:**

```
Expected: (pacing at 60 bpm)
Actual:   Long pauses (device "sees" noise, inhibits pacing)

Causes:
  ├─ T-wave oversensing
  ├─ Myopotentials
  ├─ Lead fracture (noise)
  └─ EMI
```

**Visual Aid:**
- 12 ECG examples of each malfunction
- Troubleshooting flowchart

---

### Video 7: ICD Therapy on ECG (8-10 min)

**VT Detection & Therapy:**

```
Sinus → VT (180 bpm) → ATP → Sinus
─R─R─R─R─R─RRRRRR▬▬▬▬R─R─R─R─

▬ = ATP burst (8 beats)
```

**Shock Delivery:**

```
VT → Capacitor charging → Shock → Post-shock pacing → Sinus
RRRRRR ════════════ ⚡ ▲─▲─▲─▲─ R─R─R

⚡ = High-voltage shock
▲ = Backup pacing
```

**Inappropriate Shock ECG:**
- Sinus tachycardia with shock
- A-fib with RVR incorrectly treated
- Noise/artifact triggering detection

---

### Video 8: Biventricular Pacing ECG (10-12 min)

**CRT ECG Features:**

> [!success] Signs of Effective Biventricular Pacing
> - QRS narrowing (from 160ms → 130ms typical)
> - Frontal plane axis shift
> - Loss of negative V1 pattern (compared to baseline LBBB)

**Programming Verification:**

| Feature | What to Check |
|---------|---------------|
| **Pacing percentage** | Goal: >95% BiV pacing |
| **QRS width** | Narrower than intrinsic (usually) |
| **LV capture** | May see fusion beats |
| **Anodal capture** | RV ring captures (unintended) |

**Troubleshooting:**

```
Wide QRS despite CRT:
  ├─ LV lead dislodged (pacing RV only)
  ├─ LV threshold too high (no LV capture)
  ├─ Suboptimal V-V timing
  └─ Extensive scar (can't activate LV)
```

---

### Video 9: ECG During Device Interrogation (8-10 min)

**Magnet Application ECG:**

> [!info] Pacemaker Magnet Response
> - Switches to asynchronous pacing (VOO/DOO/AOO)
> - **Magnet rate** = battery status indicator
>   - BOL: 100 bpm
>   - Mid-life: 85-90 bpm
>   - ERI: 65-70 bpm (varies by manufacturer)

**ECG Markers:**
- Real-time annotations on programmer
- AS, AP, VS, VP events
- Refractory periods (gray bars)
- Mode switch events

**Visual Aid:**
- ECG with magnet on/off
- Programmer screen with ECG + markers

---

### Video 10: Advanced ECG Interpretation (8-10 min)

**Pacemaker-Mediated Tachycardia (PMT):**

```
Mechanism:
  PVC → Retrograde P → Sensed by atrium → Paces ventricle → Retrograde P...

ECG:
  Regular tachycardia at upper tracking rate (130 bpm)
  P wave after each QRS (negative in II, III, aVF)
```

**Sensor-Induced Tachycardia:**
- Rate increase with arm movement (accelerometer)
- Inappropriate rate response

**Runaway Pacemaker:**
- **RARE** but life-threatening
- Pacing at 200+ bpm (circuit failure)
- **Treatment**: Emergent magnet application, reprogram or explant

---

### 📝 Section 3 Quiz

1. QRS ≥150ms + LBBB indicates: (CRT candidate ✓, ICD only, no device)
2. Loss of capture shows: (spike without QRS ✓, no spike, double spike)
3. Mobitz II AV block requires: (observation, DDD pacemaker ✓, ICD)
4. Magnet on pacemaker causes: (asynchronous pacing ✓, no pacing, faster pacing)
5. Effective CRT shows: (QRS narrowing ✓, QRS widening, no change)

---

[[README|← Back to Master Plan]] | [[Section_2_Applied_Science|← Previous: Section 2]] | [[Section_4_Clinical_Assessment|Next: Section 4 →]]
