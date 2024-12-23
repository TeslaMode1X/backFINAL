const express = require('express');
const path = require('path');
const pool = require('./db');
const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'signin.html'));
});

app.post('/login', async (req, res) => {
    // GETTING CREDENTIALS DROM JSON BODY
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            res.send('Login successful');
        } else {
            res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    console.log('Request Body:', req.body); 

    if (!username || !password) {
        return res.status(400).send('Missing username or password');
    }

    try {
        await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2)',
            [username, password]
        );
        res.send('Sign In successful');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// хероку, render, 
// update, delete,

(async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('Connected to the database successfully');

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error.message);
        process.exit(1); 
    }
})();
