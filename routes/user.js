const express = require('express');
const router = express.Router();
const pool = require('../db'); // Import the PostgreSQL connection pool


router.post('/users', async (req, res) => {
    try {
        // Query the database
        const {matNo} = req.body;
        const { rows } = await pool.query('SELECT * FROM results WHERE mat_no = $1', [matNo]);
        res.json(rows); // Send the query result as JSON response
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;