const express = require('express');
const app = express();
const taskRoutes = require('./routes/tasks');

app.use(express.json());

// Routes
app.use('/tasks', taskRoutes);

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Task Management API running on http://localhost:${PORT}`);
});
