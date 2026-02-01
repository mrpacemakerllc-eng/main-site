# ECG Rhythm Strip Drawing Notes

## Key Principle: ONE Continuous Line
A real ECG is drawn with a single continuous line - the stylus/pen never lifts from the paper. The waveform should flow:

**Baseline → P wave → PR segment → QRS complex → ST segment → T wave → Baseline**

All connected, no gaps.

## Implementation Approach

### Drawing Function
Use `ctx.lineTo()` throughout without breaking the path. Start with `ctx.beginPath()` and `ctx.moveTo()`, then use only `lineTo()` for the entire strip, ending with a single `ctx.stroke()`.

### Timing Proportions (within one RR interval)
```
pStart = 0.05      // P wave begins
pEnd = 0.15        // P wave ends
prEnd = 0.25       // PR segment ends (QRS starts)
qrsEnd = 0.35      // QRS ends (narrow) or 0.45 (wide)
stEnd = 0.45       // ST segment ends (T wave starts)
tEnd = 0.65        // T wave ends (narrow) or 0.75 (wide)
```

### Amplitude Scaling
- P wave height: `amplitudeScale * 0.15`
- R wave height: `amplitudeScale * 1.0` (narrow) or `0.9` (wide)
- Q depth: `amplitudeScale * 0.1`
- S depth: `amplitudeScale * 0.2`
- T wave height: `amplitudeScale * 0.18` (narrow) or `0.22` (wide)
  - T wave should be ~1/4 to 1/3 of R wave height per ECG standards

### Speed Calculation
- Standard ECG paper speed: 25 mm/sec
- At 25mm/sec: 1 second = 25mm on paper
- RR interval (pixels) = `((60 / heartRate) * speed) * pixelsPerMm`
- Example: 60 bpm = 1 sec between beats = 25mm = 100px (at 4px/mm)

### Scrolling Animation
Calculate which beat should be at left edge based on offset:
```javascript
const startBeat = Math.floor(offset / ventricularIntervalPx) - 1;
const beatStart = beat * ventricularIntervalPx - offset;
```

This ensures beats continuously scroll left with new beats appearing from right.

## Rhythm-Specific Notes

### Complete Heart Block (CHB)
- P waves and QRS are INDEPENDENT (AV dissociation)
- Draw P waves at atrial rate, QRS+T at ventricular rate
- P waves "march through" the QRS complexes

### Mobitz Type II
- 3:2 conduction pattern (2 conducted, 1 dropped)
- Constant PR interval for conducted beats
- Third P wave has NO following QRS (the "dropped beat")
- Wide QRS typical (infranodal block)

### AFib
- No P waves - fibrillatory baseline instead
- Irregularly irregular RR intervals
- F-waves: combine multiple sine frequencies for chaotic appearance
- F-wave amplitude: ~4% of amplitudeScale (subtle)
- T waves remain normal morphology (not affected by AFib)

### Sinus Pause
- Normal sinus beats, then long flat baseline (the pause)
- Pause typically >2 seconds (>50mm at 25mm/sec)
