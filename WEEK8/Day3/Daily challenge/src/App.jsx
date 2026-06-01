import React from 'react';
import { TaskProvider } from './TaskContext';
import { TaskManager } from './TaskManager';
import './App.css';

function App() {
  return (
    <TaskProvider>
      <div className="app-container">
        <TaskManager />
      </div>
    </TaskProvider>
  );
}

export default App;
