const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// mysql db configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'tdlj',
    database: process.env.DB_NAME || 'first_aid',
});

// Register 
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const [existingUser] = await pool.query('SELECT * FROM User WHERE username = ? OR email = ?', [username, email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Insert new user into the database
        await pool.query('INSERT INTO user (username, email, password) VALUES (?,?,?)', [username, email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully'});
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Internal server error'});
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});