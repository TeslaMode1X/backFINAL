const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt'); 
const pool = require('./db'); 
const app = express();
const port = process.env.SERVER_PORT || 3000; 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

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
    const { email, password } = req.body; 

    if (!email || !password) {
        return res.status(400).send('Missing email or password');
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).send('Invalid credentials(email)');
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password); // Проверка хеша пароля

        if (!isValidPassword) {
            return res.status(400).send('Invalid credentials(password)');
        }

        res.send('Login successful');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

app.post('/signin', async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return res.status(400).send('Missing email, name, or password');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        await pool.query(
            'INSERT INTO users (email, name, password) VALUES ($1, $2, $3)',
            [email, name, hashedPassword]
        );
        res.send('Sign In successful');
    } catch (error) {
        console.error(error.message);
        if (error.code === '23505') { 
            return res.status(400).send('Email already exists');
        }
        res.status(500).send('Server error');
    }
});

app.get('/api/v1/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, name, password FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

app.put('/api/v1/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        res.send('User updated successfully');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

app.delete('/api/v1/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        res.send('User deleted successfully');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

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
