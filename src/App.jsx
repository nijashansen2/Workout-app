import { useState } from 'react';
import Home from './components/Home';
import Workout from './components/Workout';
import Progress from './components/Progress';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [workoutExercise, setWorkoutExercise] = useState(null);

  function startWorkout(exerciseId) {
    setWorkoutExercise(exerciseId);
    setScreen('workout');
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <Home onStartWorkout={startWorkout} onProgress={() => setScreen('progress')} />
      )}
      {screen === 'workout' && (
        <Workout exerciseId={workoutExercise} onDone={() => setScreen('home')} />
      )}
      {screen === 'progress' && (
        <Progress onBack={() => setScreen('home')} />
      )}
    </div>
  );
}
