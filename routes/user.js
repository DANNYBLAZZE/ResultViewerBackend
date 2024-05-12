const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import the PostgreSQL connection pool

router.use((req, res, next) => {
    console.log("session", req.session.user);
    if (!req.session.user && req.path !== "/login") {
        return res.redirect("/login");
    }
    next();
});

router.get("/get_details", async (req, res) => {
    try {
        // Query the database
        console.log("session_data", req.session.user.id)
        const matNo = req.session.user.id;
        const {rows} = await pool.query(
            "SELECT mat_no, first_name, last_name, department_code, email FROM students WHERE mat_no = $1",
            [req.session.user.id]
        );
        res.json(rows); // Send the query result as JSON response
    } catch (err) {
        console.error("Error executing query", err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

router.get("/get_result", async (req, res) => {
    try {
        // Query the database
        const matNo = req.params.id;
        const {rows} = await pool.query(
            "SELECT * FROM results WHERE mat_no = $1",
            [matNo]
        );
        res.json(rows); // Send the query result as JSON response
    } catch (err) {
        console.error("Error executing query", err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

module.exports = router;
