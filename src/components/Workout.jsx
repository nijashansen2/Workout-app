import { useState, useEffect, useRef, useCallback } from 'react';
import { EXERCISES, loadProgress, saveProgress, getExerciseProgression } from '../workoutData';

const PHASES = { INTRO: 'intro', WORK: 'work', REST: 'rest', DONE: 'done' };

export default function Workout({ exerciseId, onDone }) {
  const ex = EXERCISES[exerciseId];
  const [progress, setProgress] = useState(null);
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(null);
  const [completedSets, setCompletedSets] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  const prog = progress ? getExerciseProgression(exerciseId, progress[exerciseId] || 1) : null;
  const level = progress?.[exerciseId] || 1;

  const nextSet = useCallback(() => {
    if (!prog) return;
    setTimerActive(false);
    const next = currentSet + 1;
    if (next > prog.sets) {
      setPhase(PHASES.DONE);
    } else {
      setCurrentSet(next);
      setPhase(PHASES.WORK);
    }
  }, [currentSet, prog]);

  useEffect(() => {
    if (!timerActive) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setTimerActive(false);
          nextSet();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timerActive, nextSet]);

  if (!progress || !prog) {
    return (
      <div className="screen workout-screen" style={{ justifyContent: 'center' }}>
        <div className="loading">Henter data...</div>
      </div>
    );
  }

  function startRest() {
    setPhase(PHASES.REST);
    setTimeLeft(prog.rest);
    setTimerActive(true);
  }

  function handleSetDone() {
    setCompletedSets((s) => s + 1);
    if (currentSet >= prog.sets) {
      setPhase(PHASES.DONE);
    } else {
      startRest();
    }
  }

  async function handleLevelUp() {
    const maxLevel = ex.progressions.length;
    const newLevel = Math.min(level + 1, maxLevel);
    const today = new Date().toDateString();
    const updated = {
      ...progress,
      [exerciseId]: newLevel,
      totalWorkouts: (progress.totalWorkouts || 0) + 1,
      completedDates: [...new Set([...(progress.completedDates || []), today])],
    };
    await saveProgress(updated);
    setProgress(updated);
    onDone();
  }

  async function handleKeepLevel() {
    const today = new Date().toDateString();
    const updated = {
      ...progress,
      totalWorkouts: (progress.totalWorkouts || 0) + 1,
      completedDates: [...new Set([...(progress.completedDates || []), today])],
    };
    await saveProgress(updated);
    setProgress(updated);
    onDone();
  }

  const circumference = 2 * Math.PI * 40;
  const restProgress = timerActive && timeLeft !== null ? (1 - timeLeft / prog.rest) * circumference : 0;

  return (
    <div className="screen workout-screen">
      <button className="back-btn" onClick={onDone}>← Tilbage</button>

      <div className="workout-header">
        <span className="ex-emoji-lg">{ex.emoji}</span>
        <h2>{prog.name}</h2>
        <p className="ex-muscle">{ex.muscle}</p>
      </div>

      {phase === PHASES.INTRO && (
        <div className="phase-card">
          <div className="tip-box">
            <strong>Teknik-tip</strong>
            <p>{ex.tip}</p>
          </div>
          <div className="set-info">
            <div className="set-detail">
              <span className="set-num">{prog.sets}</span>
              <span className="set-label">sæt</span>
            </div>
            <div className="set-detail">
              <span className="set-num">{prog.isDuration ? `${prog.duration}s` : prog.reps}</span>
              <span className="set-label">{prog.isDuration ? 'sekunder' : 'reps'}</span>
            </div>
            <div className="set-detail">
              <span className="set-num">{prog.rest}s</span>
              <span className="set-label">pause</span>
            </div>
          </div>
          <button className="primary-btn" onClick={() => setPhase(PHASES.WORK)}>
            Start
          </button>
        </div>
      )}

      {phase === PHASES.WORK && (
        <div className="phase-card">
          <div className="set-counter">
            Sæt {currentSet} / {prog.sets}
          </div>
          <div className="rep-display">
            {prog.isDuration ? `Hold ${prog.duration} sek` : `${prog.reps} reps`}
          </div>
          <div className="set-dots">
            {Array.from({ length: prog.sets }).map((_, i) => (
              <span key={i} className={`dot ${i < currentSet - 1 ? 'done' : i === currentSet - 1 ? 'active' : ''}`} />
            ))}
          </div>
          <button className="primary-btn" onClick={handleSetDone}>
            Sæt klaret ✓
          </button>
        </div>
      )}

      {phase === PHASES.REST && (
        <div className="phase-card">
          <div className="rest-label">Pause</div>
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
          <p className="next-set-hint">Næste sæt {currentSet + 1} / {prog.sets}</p>
          <button className="secondary-btn" onClick={nextSet}>
            Spring pause over
          </button>
        </div>
      )}

      {phase === PHASES.DONE && (
        <div className="phase-card done-card">
          <div className="done-emoji">🎉</div>
          <h3>Øvelse klaret!</h3>
          <p>Du gennemførte {completedSets || prog.sets} sæt af {prog.name}</p>

          {level < ex.progressions.length && (
            <div className="level-up-prompt">
              <p>Føltes det nemt? Prøv næste niveau:</p>
              <strong>{ex.progressions[level].name}</strong>
              <button className="primary-btn" onClick={handleLevelUp}>
                Skift til niveau {level + 1} 🚀
              </button>
            </div>
          )}
          <button className="secondary-btn" onClick={handleKeepLevel}>
            {level >= ex.progressions.length ? 'Afslut' : 'Behold nuværende niveau'}
          </button>
        </div>
      )}
    </div>
  );
}
