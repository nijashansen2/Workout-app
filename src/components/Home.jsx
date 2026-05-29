import { useState, useEffect } from 'react';
import { EXERCISES, loadProgress, getExerciseProgression, getTodayWorkoutStatus, getNextWorkoutDay } from '../workoutData';

const CIRCUIT_ORDER = ['pushups', 'squats', 'pullups'];

export default function Home({ onStartWorkout, onProgress }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  if (!progress) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <div className="loading">Henter data...</div>
      </div>
    );
  }

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
              <p>2 runder · 3 øvelser · ~10 minutter</p>
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

      <p className="section-label">DAGENS CIRCUIT</p>

      <div className="circuit-preview">
        {CIRCUIT_ORDER.map((exId, i) => {
          const prog = getExerciseProgression(exId, progress[exId] || 1);
          return (
            <div key={exId} className="circuit-preview-row">
              <div className="circuit-preview-left">
                <span className="ex-emoji">{EXERCISES[exId].emoji}</span>
                <div>
                  <div className="ex-name">{prog.name}</div>
                  <div className="ex-muscle">{EXERCISES[exId].muscle}</div>
                </div>
              </div>
              <div className="ex-sets">
                {prog.sets}×{prog.isDuration ? `${prog.duration}s` : prog.reps}
              </div>
              {i < CIRCUIT_ORDER.length - 1 && <div className="circuit-arrow">↓</div>}
            </div>
          );
        })}
      </div>

      <button className="primary-btn start-btn" onClick={onStartWorkout}>
        {doneToday ? 'Træn igen 🔁' : 'Start træning 🔥'}
      </button>

      <div className="schedule-section">
        <p className="section-label">UGENTLIG PLAN</p>
        <div className="schedule-row">
          {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((day, i) => {
            const dayIndex = i === 6 ? 0 : i + 1;
            const isTraining = [1, 3, 5].includes(dayIndex);
            const isToday = new Date().getDay() === dayIndex;
            return (
              <div key={i} className={`schedule-day ${isTraining ? 'train' : 'rest'} ${isToday ? 'today' : ''}`}>
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
