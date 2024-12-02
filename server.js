const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());

const TASKS_FILE = 'tasks.json';
let tasks = [];

const loadTasks = () => {
    if (fs.existsSync(TASKS_FILE)) {
        const data = fs.readFileSync(TASKS_FILE, 'utf-8');
        tasks = JSON.parse(data);
    }
};

const saveTasks = () => {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
};

loadTasks();


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.post('/tasks', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            message: "Title and description are required",
        });
    }

    const newTask = {
        id: uuidv4(),
        title,
        description,
        status: "pending",
    };

    tasks.push(newTask);
    saveTasks();

    res.status(201).json({
        message: "Task created successfully............",
        task: newTask,
    });
});

// Task 3: Get all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});


// Task 4: update a task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({
            error: "Invalid status. Use 'pending' or 'completed'.",
        });
    }

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found",
        });
    }

    task.status = status;
    saveTasks();

    res.status(200).json({
        message: "Task updated successfully",
        task,
    });
});

// Task 5: Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;

    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: "Task not found",
        });
    }

    tasks.splice(taskIndex, 1);
    saveTasks();

    res.status(200).json({
        message: "Task deleted successfully",
    });
});

// Task 6: Filter tasks by status
app.get('/tasks/status/:status', (req, res) => {
    const { status } = req.params;

    if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({
            error: "Invalid status. Use 'pending' or 'completed'.",
        });
    }

    const filteredTasks = tasks.filter(task => task.status === status);
    res.status(200).json(filteredTasks);
});


app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
    });
});
