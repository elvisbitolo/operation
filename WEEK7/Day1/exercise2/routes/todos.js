const express = require('express');
const router = express.Router();

// Sample in-memory database for storing to-do items
const todos = [];

// Get all to-do items
router.get('/', (req, res) => {
    res.json(todos);
});

// Add a new to-do item
router.post('/', (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).send('Task is required');
    
    const newTodo = { id: todos.length + 1, task };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// Update a to-do item by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    const todo = todos.find(t => t.id === parseInt(id));
    
    if (todo) {
        todo.task = task || todo.task;
        res.json(todo);
    } else {
        res.status(404).send('Todo not found');
    }
});

// Delete a to-do item by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = todos.findIndex(t => t.id === parseInt(id));
    
    if (index !== -1) {
        todos.splice(index, 1);
        res.send('Todo deleted');
    } else {
        res.status(404).send('Todo not found');
    }
});

module.exports = router;
