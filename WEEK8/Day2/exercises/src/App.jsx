import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import ErrorBoundary from './components/ErrorBoundary';
import { HomeScreen, ProfileScreen, ShopScreen } from './components/Screens';
import PostList from './components/PostList';
import { Example1, Example2, Example3 } from './components/Examples';
import Day3Exercises from './components/Day3Exercises';
import WebhookPost from './components/WebhookPost';

function App() {
  const [activeTab, setActiveTab] = useState('ex1');

  return (
    <BrowserRouter>
      <div className="container py-5">
        <header className="mb-5 text-center">
          <h1 className="display-4 fw-bold text-primary">Week 8 - Day 2</h1>
          <p className="lead text-muted">Advanced React & Express Server</p>
        </header>

        <ul className="nav nav-pills justify-content-center mb-4">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'ex1' ? 'active' : ''}`} onClick={() => setActiveTab('ex1')}>Exercise 1</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'ex2' ? 'active' : ''}`} onClick={() => setActiveTab('ex2')}>Exercise 2</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'ex3' ? 'active' : ''}`} onClick={() => setActiveTab('ex3')}>Exercise 3</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'ex4' ? 'active' : ''}`} onClick={() => setActiveTab('ex4')}>Exercise 4</button>
          </li>
        </ul>

        <div className="bg-light p-4 rounded shadow-sm border">
          {activeTab === 'ex1' && (
            <div>
              <h2 className="mb-4">Exercise 1: React Router Error Boundary</h2>
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded mb-4 px-3">
                <div className="navbar-nav">
                  <NavLink className="nav-link" to="/">Home</NavLink>
                  <NavLink className="nav-link" to="/profile">Profile</NavLink>
                  <NavLink className="nav-link" to="/shop">Shop</NavLink>
                </div>
              </nav>

              <Routes>
                <Route path="/" element={<ErrorBoundary><HomeScreen /></ErrorBoundary>} />
                <Route path="/profile" element={<ErrorBoundary><ProfileScreen /></ErrorBoundary>} />
                <Route path="/shop" element={<ErrorBoundary><ShopScreen /></ErrorBoundary>} />
              </Routes>
            </div>
          )}

          {activeTab === 'ex2' && <PostList />}

          {activeTab === 'ex3' && (
            <div>
              <h2 className="mb-4">Exercise 3: Complex JSON</h2>
              <Example1 />
              <Example2 />
              <Example3 />
            </div>
          )}

          {activeTab === 'ex4' && <WebhookPost />}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
