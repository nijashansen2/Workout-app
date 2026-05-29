import { useState } from 'react';
import Home from './components/Home';
import Workout from './components/Workout';
import Progress from './components/Progress';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('home');

  return (
    <div className="app">
      {screen === 'home' && (
        <Home onStartWorkout={() => setScreen('workout')} onProgress={() => setScreen('progress')} />
      )}
      {screen === 'workout' && (
        <Workout onDone={() => setScreen('home')} />
      )}
      {screen === 'progress' && (
        <Progress onBack={() => setScreen('home')} />
      )}
    </div>
  );
}
