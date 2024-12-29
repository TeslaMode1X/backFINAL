// js web serve, like gin in go
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt'); 

// postgres db connections
const pool = require('./db'); 
const mongoose = require('./mongo')

// swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// logger 
const logger = require('./logger/winston')

const app = express();
const port = process.env.SERVER_PORT || 3000; 

// 1) middleware for using json
// 2) for html to send form-data to backend
// 3) folder for front-end files
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


// Swagger Setup
const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Weather API',
        version: '1.0.0',
        description: 'API to get weather data for different cities',
      },
      servers: [
        {
          url: `http://localhost:${port}`,
        },
      ],
    },
    apis: ['./server.js'], // Путь к файлу с аннотациями
  };

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
    logger.info(`Request: ${req.method} ${req.originalUrl}`);
    next();
});
  

// Main Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Weather Page
app.get('/weather', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/weather', 'weather.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'signin.html'));
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *       400:
 *         description: Invalid credentials (email or password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials(email)"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
app.post('/login', async (req, res) => {
    const { email, password } = req.body; 

    if (!email || !password) {
        logger.warn('Missing email or password');
        return res.status(400).send('Missing email or password');
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            logger.warn('Invalid credentials (email)');
            return res.status(400).send('Invalid credentials(email)');
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password); // Проверка хеша пароля

        if (!isValidPassword) {
            logger.warn('Invalid credentials (password)');
            return res.status(400).send('Invalid credentials(password)');
        }

        logger.info(`Login successful for user: ${email}`);
        res.send('Login successful');
    } catch (error) {
        logger.error(error.message);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Sign In successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sign In successful"
 *       400:
 *         description: Missing required fields or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
app.post('/signin', async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        logger.warn('Missing email, name, or password in request body');
        return res.status(400).send('Missing email, name, or password');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (email, name, password) VALUES ($1, $2, $3)',
            [email, name, hashedPassword]
        );
        logger.info(`User signed up: email=${email}`);
        res.send('Sign In successful');
    } catch (error) {
        logger.error(`Error during sign up: ${error.message}`);
        if (error.code === '23505') {
            return res.status(400).send('Email already exists');
        }
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users from the database
 *     responses:
 *       200:
 *         description: A list of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "12345"  
 *                   email:
 *                     type: string
 *                     example: "johndoe@example.com"
 *                   name:
 *                     type: string
 *                     example: "John Doe"  
 *                   password:
 *                     type: string
 *                     example: "$2b$10$M1Mf.XyVrQYX5a7CmHbE1.BD2GbvIMcLyzgMzYmePY2nRUWFiNOaS"  
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error" 
 */
app.get('/api/v1/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, name, password FROM users');
        logger.info('Fetched all users');
        res.json(result.rows);
    } catch (error) {
        logger.error(`Error fetching users: ${error.message}`);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *           example: "12345"
 *       - in: body
 *         name: user
 *         description: The user data to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "John Doe" 
 *             email:
 *               type: string
 *               example: "johndoe@example.com"  
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully!" 
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing email or password"  
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found" 
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"  
 */
app.put('/api/v1/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );

        if (result.rows.length === 0) {
            logger.warn(`User not found: id=${id}`);
            return res.status(404).send('User not found');
        }

        logger.info(`User updated: id=${id}`);
        res.send('User updated successfully');
    } catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: string
 *           example: "12345"  
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully!" 
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"  
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"  
 */
app.delete('/api/v1/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            logger.warn(`User not found for deletion: id=${id}`);
            return res.status(404).send('User not found');
        }

        logger.info(`User deleted: id=${id}`);
        res.send('User deleted successfully');
    } catch (error) {
        logger.error(`Error deleting user: ${error.message}`);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /api/v1/today/weather/{city}:
 *   get:
 *     summary: Get today's weather for a city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         description: The name of the city to fetch the weather for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Weather data for the city
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   example: "2025-12-27"
 *                 temperature:
 *                   type: integer
 *                   example: 22
 *                 weather_condition:
 *                   type: string
 *                   example: "Clear"
 *                 humidity:
 *                   type: integer
 *                   example: 65
 *                 wind_speed:
 *                   type: integer
 *                   example: 15
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
app.get('/api/v1/today/weather/:city', async (req, res) => {
    const { city } = req.params;
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear() + 1;
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();

        const newStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        logger.info(`Fetching today's weather for city=${city}, date=${newStr}`);

        const cityCollection = mongoose.connection.db.collection(city.toLowerCase());

        const weatherData = await cityCollection.find(
            { date: newStr }
        ).limit(1).toArray();

        if (weatherData.length === 0) {
            logger.warn(`No weather data found for city=${city}`);
        } else {
            logger.info(`Weather data fetched for city=${city}`);
        }

        res.json(weatherData);
    } catch (error) {
        logger.error(`Error fetching today's weather: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/v1/week/weather/{city}:
 *   get:
 *     summary: Get weather forecast for the next 7 days for a city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         description: The name of the city to fetch the weather forecast for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Weather data for the next 7 days
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     example: "2025-12-27"
 *                   temperature:
 *                     type: integer
 *                     example: 22
 *                   weather_condition:
 *                     type: string
 *                     example: "Clear"
 *                   humidity:
 *                     type: integer
 *                     example: 65
 *                   wind_speed:
 *                     type: integer
 *                     example: 15
 *             examples:
 *               example1:
 *                 value: 
 *                   - date: "2025-12-27"
 *                     temperature: 22
 *                     weather_condition: "Clear"
 *                     humidity: 65
 *                     wind_speed: 15
 *                   - date: "2025-12-28"
 *                     temperature: 20
 *                     weather_condition: "Partly Cloudy"
 *                     humidity: 60
 *                     wind_speed: 12
 *                   - date: "2025-12-29"
 *                     temperature: 18
 *                     weather_condition: "Rainy"
 *                     humidity: 80
 *                     wind_speed: 20
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
app.get('/api/v1/week/weather/:city', async (req, res) => {
    const { city } = req.params;
    try {
        const currentDate = new Date();
        const dates = [];

        for (let i = 0; i < 7; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);

            const year = nextDate.getFullYear() + 1;
            const month = nextDate.getMonth() + 1;
            const day = nextDate.getDate();

            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            dates.push(formattedDate);
        }

        logger.info(`Fetching weekly weather for city=${city}, dates=${dates.join(', ')}`);

        const cityCollection = mongoose.connection.db.collection(city.toLowerCase());

        const weatherData = await cityCollection.find(
            { date: { $in: dates } }
        ).toArray();

        if (weatherData.length === 0) {
            logger.warn(`No weekly weather data found for city=${city}`);
        } else {
            logger.info(`Weekly weather data fetched for city=${city}`);
        }

        res.json(weatherData);
    } catch (error) {
        logger.error(`Error fetching weekly weather: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// connection to databases and server starting
(async () => {
    try {
        await pool.query('SELECT NOW()'); 
        logger.info('Connected to PostgreSQL database successfully');
        
    
        app.listen(port, () => {
            logger.info(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        logger.error('Failed to connect to the database:', error.message);
        process.exit(1);
    }
})();

