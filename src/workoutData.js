import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, ensureAuth } from './firebase';

export const EXERCISES = {
  pushups: {
    id: 'pushups',
    name: 'Push-ups',
    emoji: '💪',
    muscle: 'Bryst, skulder, triceps',
    progressions: [
      { level: 1, name: 'Knæ Push-ups', sets: 2, reps: 10, rest: 60 },
      { level: 2, name: 'Push-ups', sets: 2, reps: 10, rest: 60 },
      { level: 3, name: 'Negative Push-ups', sets: 2, reps: 8, rest: 60 },
      { level: 4, name: 'Ekstrem Negative Push-ups', sets: 2, reps: 6, rest: 75 },
      { level: 5, name: 'Diamond Push-ups', sets: 2, reps: 8, rest: 75 },
    ],
    tip: 'Hold kroppen stiv som et bræt. Sænk langsomt ned (2-5 sek), skub eksplosivt op.',
  },
  squats: {
    id: 'squats',
    name: 'Squats',
    emoji: '🦵',
    muscle: 'Quad, glutes, hamstrings',
    progressions: [
      { level: 1, name: 'Stol Squats (90°)', sets: 2, reps: 15, rest: 45 },
      { level: 2, name: 'Bodyweight Squats', sets: 2, reps: 20, rest: 45 },
      { level: 3, name: 'Jump Squats', sets: 2, reps: 12, rest: 60 },
      { level: 4, name: 'Bulgarian Split Squats', sets: 2, reps: 30, rest: 75 },
    ],
    tip: 'Knæene følger tæernes retning. Sæt dig ned til parallelt eller dybere.',
  },
  pullups: {
    id: 'pullups',
    name: 'Pull-ups',
    emoji: '🏋️',
    muscle: 'Ryg, biceps, core',
    progressions: [
      { level: 1, name: 'Pull-ups', sets: 2, reps: 5, rest: 90 },
      { level: 2, name: 'Pull-ups', sets: 2, reps: 10, rest: 90 },
      { level: 3, name: 'Pull-ups', sets: 2, reps: 15, rest: 90 },
      { level: 4, name: 'Pull-ups', sets: 2, reps: 20, rest: 90 },
      { level: 5, name: 'Pull-ups', sets: 2, reps: 25, rest: 90 },
    ],
    tip: 'Start fra fuld hæng. Træk skulderblad ned FØR du bøjer armene.',
  },
};

export const SCHEDULE_DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
export const WORKOUT_DAYS = [1, 3, 5];

export function getTodayWorkoutStatus() {
  const day = new Date().getDay();
  return WORKOUT_DAYS.includes(day);
}

export function getNextWorkoutDay() {
  const today = new Date().getDay();
  for (let i = 1; i <= 7; i++) {
    const next = (today + i) % 7;
    if (WORKOUT_DAYS.includes(next)) {
      return SCHEDULE_DAYS[next === 0 ? 6 : next - 1];
    }
  }
}

export const DEFAULT_PROGRESS = {
  pushups: 1,
  squats: 1,
  pullups: 1,
  completedDates: [],
  totalWorkouts: 0,
};

export async function loadProgress() {
  try {
    const user = await ensureAuth();
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { ...DEFAULT_PROGRESS };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export async function saveProgress(progress) {
  try {
    const user = await ensureAuth();
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, progress);
  } catch (e) {
    console.error('Kunne ikke gemme fremgang:', e);
  }
}

export function getExerciseProgression(exerciseId, level) {
  const ex = EXERCISES[exerciseId];
  const lvl = Math.min(level, ex.progressions.length);
  return { ...ex, ...ex.progressions[lvl - 1] };
}
