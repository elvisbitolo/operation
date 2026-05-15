import React, { useState, useRef } from 'react';
import { useTasks } from './TaskContext';

export function TaskItem({ task }) {
  const { dispatch } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const editInputRef = useRef(null);

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: task.id });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Use timeout to allow the input to render before focusing
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 0);
  };

  const handleSaveEdit = () => {
    if (editInputRef.current && editInputRef.current.value.trim() !== '') {
      dispatch({
        type: 'EDIT_TASK',
        payload: { id: task.id, text: editInputRef.current.value },
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    }
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
      />
      
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          defaultValue={task.text}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          className="edit-input"
        />
      ) : (
        <span className="task-text" onClick={handleToggle}>{task.text}</span>
      )}

      <div className="task-actions">
        {isEditing ? (
          <button onClick={handleSaveEdit}>Save</button>
        ) : (
          <button onClick={handleEdit}>Edit</button>
        )}
        <button onClick={handleDelete} className="delete-btn">Delete</button>
      </div>
    </li>
  );
}
