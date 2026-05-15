import React, { useState } from 'react';
import BuggyCounter from './exercise1/BuggyCounter';
import ErrorBoundary from './exercise1/ErrorBoundary';
import Color from './exercise2/Color';
import FormContainer from './daily_challenge/FormContainer';

function App() {
  const [activeTab, setActiveTab] = useState('ex1');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Week 8 - Day 1</h1>
        <p className="app-subtitle">React Mastery: Components, State, Lifecycle & Events</p>
      </header>

      <nav className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'ex1' ? 'active' : ''}`}
          onClick={() => setActiveTab('ex1')}
        >
          Exercise 1: Error Boundary
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ex2' ? 'active' : ''}`}
          onClick={() => setActiveTab('ex2')}
        >
          Exercise 2 & 3: Lifecycle
        </button>
        <button 
          className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily Challenge: Form
        </button>
      </nav>

      <main>
        {activeTab === 'ex1' && (
          <div className="exercise-section">
            <div className="simulation-card">
              <h3 className="sim-title">Simulation 1: Shared Boundary</h3>
              <p className="sim-desc">Two buggy counters inside one error boundary. If one crashes, the boundary replaces both of them.</p>
              <ErrorBoundary>
                <div className="flex-gap">
                  <BuggyCounter />
                  <BuggyCounter />
                </div>
              </ErrorBoundary>
            </div>

            <div className="simulation-card">
              <h3 className="sim-title">Simulation 2: Isolated Boundaries</h3>
              <p className="sim-desc">Each counter is wrapped in its own error boundary. If one crashes, the other is not affected.</p>
              <div className="flex-gap">
                <ErrorBoundary>
                  <BuggyCounter />
                </ErrorBoundary>
                <ErrorBoundary>
                  <BuggyCounter />
                </ErrorBoundary>
              </div>
            </div>

            <div className="simulation-card">
              <h3 className="sim-title">Simulation 3: No Boundary</h3>
              <p className="sim-desc">A buggy counter without an error boundary. If it crashes, it unmounts the component tree.</p>
              <BuggyCounter />
            </div>
          </div>
        )}

        {activeTab === 'ex2' && (
          <div className="exercise-section">
            <Color />
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="exercise-section">
            <FormContainer />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
