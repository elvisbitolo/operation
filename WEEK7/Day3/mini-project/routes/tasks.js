const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const tasksFilePath = path.join(__dirname, '../tasks.json');

// Helper to read tasks
async function readTasks() {
    try {
        const data = await fs.readFile(tasksFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper to write tasks
async function writeTasks(tasks) {
    await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));
}

// GET /tasks: Retrieve a list of all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
});

// GET /tasks/:id: Retrieve a specific task by ID
router.get('/:id', async (req, res) => {
    try {
        const tasks = await readTasks();
        const task = tasks.find(t => t.id === parseInt(req.params.id));
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve task' });
    }
});

// POST /tasks: Create a new task
router.post('/', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const tasks = await readTasks();
        const newTask = {
            id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
            title,
            description,
            completed: false
        };

        tasks.push(newTask);
        await writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT /tasks/:id: Update a task by ID
router.put('/:id', async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        const tasks = await readTasks();
        const index = tasks.findIndex(t => t.id === parseInt(req.params.id));

        if (index === -1) return res.status(404).json({ error: 'Task not found' });

        tasks[index] = {
            ...tasks[index],
            title: title || tasks[index].title,
            description: description || tasks[index].description,
            completed: completed !== undefined ? completed : tasks[index].completed
        };

        await writeTasks(tasks);
        res.json(tasks[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE /tasks/:id: Delete a task by ID
router.delete('/:id', async (req, res) => {
    try {
        const tasks = await readTasks();
        const initialLength = tasks.length;
        const filteredTasks = tasks.filter(t => t.id !== parseInt(req.params.id));

        if (filteredTasks.length === initialLength) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await writeTasks(filteredTasks);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;
