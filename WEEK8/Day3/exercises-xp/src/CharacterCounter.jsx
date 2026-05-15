import React, { useRef, useState } from 'react';

export function CharacterCounter() {
  const inputRef = useRef(null);
  const [count, setCount] = useState(0);

  const handleInputChange = () => {
    if (inputRef.current) {
      setCount(inputRef.current.value.length);
    }
  };

  return (
    <div className="character-counter">
      <h2>Exercise 2: Character Counter</h2>
      <textarea
        ref={inputRef}
        onChange={handleInputChange}
        placeholder="Type something here..."
        rows="4"
      ></textarea>
      <p>Character count: {count}</p>
    </div>
  );
}
