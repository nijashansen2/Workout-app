import { useState } from 'react';
import { EXERCISES, loadProgress, getExerciseProgression, getTodayWorkoutStatus, getNextWorkoutDay } from '../workoutData';

export default function Home({ onStartWorkout, onProgress }) {
  const [progress] = useState(() => loadProgress());
  const isWorkoutDay = getTodayWorkoutStatus();
  const nextDay = getNextWorkoutDay();

  const today = new Date().toDateString();
  const doneToday = progress.completedDates?.includes(today);

  return (
    <div className="screen">
      <header className="header">
        <h1 className="app-title">💪 10-Min Workout</h1>
        <button className="icon-btn" onClick={onProgress} title="Progress">
          📊
        </button>
      </header>

      <div className="day-banner">
        {doneToday ? (
          <div className="banner done">
            <span className="banner-icon">✅</span>
            <div>
              <strong>Dagens træning klaret!</strong>
              <p>Næste træning: {nextDay}</p>
            </div>
          </div>
        ) : isWorkoutDay ? (
          <div className="banner active">
            <span className="banner-icon">🔥</span>
            <div>
              <strong>Træningsdag!</strong>
              <p>3 øvelser · ~10 minutter</p>
            </div>
          </div>
        ) : (
          <div className="banner rest">
            <span className="banner-icon">😴</span>
            <div>
              <strong>Hviledag</strong>
              <p>Næste træning: {nextDay}</p>
            </div>
          </div>
        )}
      </div>

      <p className="section-label">ØVELSER</p>

      <div className="exercise-list">
        {Object.values(EXERCISES).map((ex) => {
          const prog = getExerciseProgression(ex.id, progress[ex.id] || 1);
          return (
            <button
              key={ex.id}
              className="exercise-card"
              onClick={() => onStartWorkout(ex.id)}
            >
              <div className="ex-left">
                <span className="ex-emoji">{ex.emoji}</span>
                <div>
                  <div className="ex-name">{prog.name}</div>
                  <div className="ex-muscle">{ex.muscle}</div>
                </div>
              </div>
              <div className="ex-right">
                <div className="ex-sets">
                  {prog.isDuration
                    ? `${prog.sets}×${prog.duration}s`
                    : `${prog.sets}×${prog.reps}`}
                </div>
                <div className="ex-level">Niveau {progress[ex.id] || 1}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="schedule-section">
        <p className="section-label">UGENTLIG PLAN</p>
        <div className="schedule-row">
          {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((day, i) => {
            const dayIndex = i === 6 ? 0 : i + 1;
            const isTraining = [1, 3, 5].includes(dayIndex);
            const isToday = new Date().getDay() === dayIndex;
            return (
              <div
                key={i}
                className={`schedule-day ${isTraining ? 'train' : 'rest'} ${isToday ? 'today' : ''}`}
              >
                <span className="day-label">{day}</span>
                <span className="day-icon">{isTraining ? '💪' : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-num">{progress.totalWorkouts || 0}</div>
          <div className="stat-label">Træninger</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">30</div>
          <div className="stat-label">Min/uge</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">3</div>
          <div className="stat-label">Dage/uge</div>
        </div>
      </div>
    </div>
  );
}
