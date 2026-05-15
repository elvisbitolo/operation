import React, { useRef } from 'react';
import { useTasks } from './TaskContext';
import { TaskItem } from './TaskItem';

export function TaskManager() {
  const { state, dispatch } = useTasks();
  const taskInputRef = useRef(null);

  const handleAddTask = (e) => {
    e.preventDefault();
    const text = taskInputRef.current.value;
    if (text.trim() !== '') {
      dispatch({ type: 'ADD_TASK', payload: text });
      taskInputRef.current.value = '';
    }
  };

  const handleFilter = (filterType) => {
    dispatch({ type: 'FILTER_TASKS', payload: filterType });
  };

  const filteredTasks = state.tasks.filter((task) => {
    if (state.filter === 'active') return !task.completed;
    if (state.filter === 'completed') return task.completed;
    return true; // 'all'
  });

  return (
    <div className="task-manager">
      <h1>Enhanced Task Manager</h1>
      
      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          ref={taskInputRef}
          type="text"
          placeholder="Add a new task..."
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="filters">
        <button 
          className={state.filter === 'all' ? 'active-filter' : ''} 
          onClick={() => handleFilter('all')}
        >
          All
        </button>
        <button 
          className={state.filter === 'active' ? 'active-filter' : ''} 
          onClick={() => handleFilter('active')}
        >
          Active
        </button>
        <button 
          className={state.filter === 'completed' ? 'active-filter' : ''} 
          onClick={() => handleFilter('completed')}
        >
          Completed
        </button>
      </div>

      <ul className="task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))
        ) : (
          <p className="empty-message">No tasks found.</p>
        )}
      </ul>
    </div>
  );
}
