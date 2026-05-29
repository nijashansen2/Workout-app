import { useState, useEffect, useRef, useCallback } from 'react';
import { EXERCISES, loadProgress, saveProgress, getExerciseProgression } from '../workoutData';

const PHASES = { INTRO: 'intro', WORK: 'work', REST: 'rest', DONE: 'done' };
const CIRCUIT_ORDER = ['pushups', 'squats', 'pullups'];

export default function Workout({ onDone }) {
  const [progress, setProgress] = useState(null);
  const [phase, setPhase] = useState(PHASES.INTRO);

  // Circuit position
  const [currentSet, setCurrentSet] = useState(1); // 1 or 2
  const [currentExIdx, setCurrentExIdx] = useState(0); // 0,1,2

  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  const totalSets = 2;
  const totalSteps = CIRCUIT_ORDER.length * totalSets; // 6
  const currentStep = (currentSet - 1) * CIRCUIT_ORDER.length + currentExIdx + 1;

  const currentExId = CIRCUIT_ORDER[currentExIdx];
  const ex = EXERCISES[currentExId];
  const prog = progress ? getExerciseProgression(currentExId, progress[currentExId] || 1) : null;

  const isLastStep = currentSet === totalSets && currentExIdx === CIRCUIT_ORDER.length - 1;

  const goNext = useCallback(() => {
    setTimerActive(false);
    if (isLastStep) {
      setPhase(PHASES.DONE);
    } else {
      const nextExIdx = (currentExIdx + 1) % CIRCUIT_ORDER.length;
      const nextSet = nextExIdx === 0 ? currentSet + 1 : currentSet;
      setCurrentExIdx(nextExIdx);
      setCurrentSet(nextSet);
      setPhase(PHASES.WORK);
    }
  }, [currentExIdx, currentSet, isLastStep]);

  useEffect(() => {
    if (!timerActive) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setTimerActive(false);
          goNext();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timerActive, goNext]);

  if (!progress || !prog) {
    return (
      <div className="screen workout-screen" style={{ justifyContent: 'center' }}>
        <div className="loading">Henter data...</div>
      </div>
    );
  }

  function handleSetDone() {
    if (isLastStep) {
      setPhase(PHASES.DONE);
    } else {
      setTimeLeft(prog.rest);
      setPhase(PHASES.REST);
      setTimerActive(true);
    }
  }

  async function handleFinish() {
    const today = new Date().toDateString();
    const updated = {
      ...progress,
      totalWorkouts: (progress.totalWorkouts || 0) + 1,
      completedDates: [...new Set([...(progress.completedDates || []), today])],
    };
    await saveProgress(updated);
    onDone();
  }

  const circumference = 2 * Math.PI * 40;
  const restProgress = timerActive && timeLeft !== null ? (1 - timeLeft / prog.rest) * circumference : 0;

  return (
    <div className="screen workout-screen">
      <button className="back-btn" onClick={onDone}>← Tilbage</button>

      {phase !== PHASES.DONE && (
        <>
          {/* Progress bar */}
          <div className="circuit-progress">
            <div className="circuit-bar">
              <div
                className="circuit-fill"
                style={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
              />
            </div>
            <span className="circuit-label">{currentStep - 1} / {totalSteps}</span>
          </div>

          {/* Circuit map */}
          <div className="circuit-map">
            {Array.from({ length: totalSets }).map((_, setIdx) =>
              CIRCUIT_ORDER.map((exId, exIdx) => {
                const stepNum = setIdx * CIRCUIT_ORDER.length + exIdx;
                const stepCurrent = (currentSet - 1) * CIRCUIT_ORDER.length + currentExIdx;
                const isDone = stepNum < stepCurrent;
                const isActive = stepNum === stepCurrent;
                return (
                  <div
                    key={`${setIdx}-${exIdx}`}
                    className={`circuit-step ${isDone ? 'done' : isActive ? 'active' : ''}`}
                  >
                    <span className="circuit-step-emoji">{EXERCISES[exId].emoji}</span>
                    <span className="circuit-step-label">{setIdx + 1}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="workout-header">
            <span className="ex-emoji-lg">{ex.emoji}</span>
            <h2>{prog.name}</h2>
            <p className="ex-muscle">{ex.muscle} · Sæt {currentSet}/{totalSets}</p>
          </div>
        </>
      )}

      {phase === PHASES.INTRO && (
        <div className="phase-card">
          <div className="tip-box">
            <strong>Dagens træning</strong>
            <p>2 runder · 3 øvelser · ~10 minutter</p>
          </div>
          <div className="circuit-overview">
            {CIRCUIT_ORDER.map((exId) => {
              const p = getExerciseProgression(exId, progress[exId] || 1);
              return (
                <div key={exId} className="circuit-overview-row">
                  <span>{EXERCISES[exId].emoji} {p.name}</span>
                  <span className="overview-sets">{p.sets}×{p.isDuration ? `${p.duration}s` : p.reps}</span>
                </div>
              );
            })}
          </div>
          <button className="primary-btn" onClick={() => setPhase(PHASES.WORK)}>
            Start træning 🔥
          </button>
        </div>
      )}

      {phase === PHASES.WORK && (
        <div className="phase-card">
          <div className="rep-display">
            {prog.isDuration ? `Hold ${prog.duration} sek` : `${prog.reps} reps`}
          </div>
          <div className="tip-box" style={{ marginTop: 0 }}>
            <strong>Teknik-tip</strong>
            <p>{ex.tip}</p>
          </div>
          <button className="primary-btn" onClick={handleSetDone}>
            {isLastStep ? 'Færdig! 🎉' : 'Klaret ✓'}
          </button>
        </div>
      )}

      {phase === PHASES.REST && (
        <div className="phase-card">
          <div className="rest-label">Pause inden næste øvelse</div>
          <div className="timer-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#ff6b35" strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - restProgress}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="timer-text">{timeLeft}s</span>
          </div>
          <div className="next-exercise-hint">
            <span>Næste: {EXERCISES[CIRCUIT_ORDER[(currentExIdx + 1) % CIRCUIT_ORDER.length]].emoji}</span>
            <span>{getExerciseProgression(CIRCUIT_ORDER[(currentExIdx + 1) % CIRCUIT_ORDER.length], progress[CIRCUIT_ORDER[(currentExIdx + 1) % CIRCUIT_ORDER.length]] || 1).name}</span>
          </div>
          <button className="secondary-btn" onClick={goNext}>
            Spring pause over
          </button>
        </div>
      )}

      {phase === PHASES.DONE && (
        <div className="phase-card done-card">
          <div className="done-emoji">🏆</div>
          <h3>Træning klaret!</h3>
          <p>6 sæt · 3 øvelser · ~10 minutter</p>
          <div className="done-summary">
            {CIRCUIT_ORDER.map((exId) => {
              const p = getExerciseProgression(exId, progress[exId] || 1);
              return (
                <div key={exId} className="done-row">
                  <span>{EXERCISES[exId].emoji} {p.name}</span>
                  <span>{totalSets}×{p.isDuration ? `${p.duration}s` : p.reps}</span>
                </div>
              );
            })}
          </div>
          <button className="primary-btn" onClick={handleFinish}>
            Gem og afslut 💾
          </button>
        </div>
      )}
    </div>
  );
}
