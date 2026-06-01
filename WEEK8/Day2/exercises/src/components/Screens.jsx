import React from 'react';

export const HomeScreen = () => {
  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h2 className="display-6 text-primary mb-3">home</h2>
      <p className="text-secondary">Welcome to the Home Screen!</p>
    </div>
  );
};

export const ProfileScreen = () => {
  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h2 className="display-6 text-success mb-3">profile</h2>
      <p className="text-secondary">This is the profile page.</p>
    </div>
  );
};

export const ShopScreen = () => {
  throw new Error("Simulated Error in ShopScreen");
  return (
    <div>
      <h1>shop</h1>
    </div>
  );
};
