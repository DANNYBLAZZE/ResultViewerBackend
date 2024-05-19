const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import the PostgreSQL connection pool
const multer = require('multer');
const csv = require('csv-parser');
const fs = require("fs");

const upload = multer({storage: multer.memoryStorage()})

router.use((req, res, next) => {
    console.log("session", req.session.user);
    if (!req.session.user && req.path !== "/login") {
        return res.redirect("/login");
    }
    if (req.session.user.role != "lecturer")
        return res.status(403).send("Not Authorized");
    next();
});

router.get("/get_details", async (req, res) => {
    try {
        // Query the database
        const staffId = req.session.user.id;
        const {rows} = await pool.query(
            "SELECT staff_id as id, first_name, last_name, email FROM lecturers WHERE staff_id = $1",
            [staffId]
        );
        res.json(rows[0]); // Send the query result as JSON response
    } catch (err) {
        console.error("Error executing query", err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

router.get("/:mat_no/get_result", async (req, res) => {
    try {
        // Query the database
        const matNo = req.params["mat_no"];
        const {rows} = await pool.query(
            "SELECT * FROM results WHERE mat_no = $1",
            [matNo]
        );
        console.log(rows);
        res.json(rows); // Send the query result as JSON response
    } catch (err) {
        console.error("Error executing query", err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

router.post("/upload-result", upload.single("results", (req, res) => {
    const csvData = req.file.buffer;

    const results = [];

    fs.createReadStream()    
}))

module.exports = router;
