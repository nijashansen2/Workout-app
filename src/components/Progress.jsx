import { useState } from 'react';
import { EXERCISES, loadProgress, saveProgress, getExerciseProgression } from '../workoutData';

export default function Progress({ onBack }) {
  const [progress, setProgress] = useState(() => loadProgress());

  function changeLevel(exerciseId, delta) {
    const ex = EXERCISES[exerciseId];
    const current = progress[exerciseId] || 1;
    const newLevel = Math.max(1, Math.min(current + delta, ex.progressions.length));
    const updated = { ...progress, [exerciseId]: newLevel };
    saveProgress(updated);
    setProgress(updated);
  }

  function resetAll() {
    if (!confirm('Vil du nulstille al fremgang?')) return;
    const reset = { pushups: 1, squats: 1, pullups: 1, completedDates: [], totalWorkouts: 0 };
    saveProgress(reset);
    setProgress(reset);
  }

  const streak = calculateStreak(progress.completedDates || []);

  return (
    <div className="screen">
      <header className="header">
        <button className="back-btn" onClick={onBack}>← Tilbage</button>
        <h2>Fremgang</h2>
        <div />
      </header>

      <div className="stats-row top-stats">
        <div className="stat-box">
          <div className="stat-num">{progress.totalWorkouts || 0}</div>
          <div className="stat-label">Træninger</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{streak}</div>
          <div className="stat-label">Ugers streak</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{progress.completedDates?.length || 0}</div>
          <div className="stat-label">Dage aktiv</div>
        </div>
      </div>

      <p className="section-label">NIVEAU PER ØVELSE</p>

      {Object.values(EXERCISES).map((ex) => {
        const level = progress[ex.id] || 1;
        const prog = getExerciseProgression(ex.id, level);
        const maxLevel = ex.progressions.length;

        return (
          <div key={ex.id} className="progress-card">
            <div className="prog-header">
              <span className="ex-emoji">{ex.emoji}</span>
              <div>
                <div className="ex-name">{ex.name}</div>
                <div className="prog-current">{prog.name}</div>
              </div>
              <div className="level-badge">Niveau {level}/{maxLevel}</div>
            </div>

            <div className="level-bar">
              {Array.from({ length: maxLevel }).map((_, i) => (
                <div key={i} className={`level-segment ${i < level ? 'filled' : ''}`} />
              ))}
            </div>

            <div className="prog-details">
              <span>{prog.sets} sæt</span>
              <span>{prog.isDuration ? `${prog.duration}s` : `${prog.reps} reps`}</span>
              <span>{prog.rest}s pause</span>
            </div>

            <div className="level-controls">
              <button
                className="level-btn"
                onClick={() => changeLevel(ex.id, -1)}
                disabled={level <= 1}
              >
                −
              </button>
              <span>Justér niveau</span>
              <button
                className="level-btn"
                onClick={() => changeLevel(ex.id, 1)}
                disabled={level >= maxLevel}
              >
                +
              </button>
            </div>

            <div className="progression-list">
              <strong>Alle niveauer:</strong>
              {ex.progressions.map((p, i) => (
                <div key={i} className={`prog-item ${i + 1 === level ? 'current' : i + 1 < level ? 'past' : ''}`}>
                  <span className="prog-dot">{i + 1 < level ? '✓' : i + 1 === level ? '▶' : '○'}</span>
                  <span>{p.name} — {p.isDuration ? `${p.duration}s` : `${p.reps} reps`}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <button className="danger-btn" onClick={resetAll}>Nulstil al fremgang</button>
    </div>
  );
}

function calculateStreak(dates) {
  if (!dates.length) return 0;
  const weeks = new Set(dates.map((d) => {
    const date = new Date(d);
    const jan1 = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date - jan1) / (7 * 24 * 60 * 60 * 1000));
  }));
  return weeks.size;
}
