import React from 'react';
import './App.css';
import UserFavoriteAnimals from './components/UserFavoriteAnimals';
import Exercise from './components/Exercise3';
import CarouselComponent from './components/CarouselComponent';

function App() {
  // Exercise 1: JSX
  const myelement = <h1>I Love JSX!</h1>;
  const sum = 5 + 5;

  // Exercise 2: Object
  const user = {
    firstName: 'Bob',
    lastName: 'Dylan',
    favAnimals: ['Horse', 'Turtle', 'Elephant', 'Monkey']
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>React Introduction</h1>
        <p>Week 7 Day 4 Exercises</p>
      </header>

      <main className="content-grid">
        {/* Exercise 1 */}
        <section className="exercise-card">
          <h2>Exercise 1: JSX Basics</h2>
          <p>Hello World!</p>
          {myelement}
          <p>React is {sum} times better with JSX</p>
        </section>

        {/* Exercise 2 */}
        <section className="exercise-card">
          <h2>Exercise 2: User Object</h2>
          <h3>{user.firstName}</h3>
          <h3>{user.lastName}</h3>
          <UserFavoriteAnimals favAnimals={user.favAnimals} />
        </section>

        {/* Exercise 3 */}
        <section className="exercise-card">
          <h2>Exercise 3: HTML Tags & Styling</h2>
          <Exercise />
        </section>

        {/* Daily Challenge */}
        <CarouselComponent />
      </main>

      <footer className="main-footer">
        <p>&copy; 2026 Developers Institute - Elvis Bitolo</p>
      </footer>
    </div>
  );
}

export default App;
