const express = require("express");
const pool = require("../db");
const router = express.Router();
const bcrypt = require("bcrypt");

// Configure session middleware


// Middleware to set user data in session (simulated login)
// router.use((req, res, next) => {
//     if (!req.session.user) {
//         req.session.user = {id: 1, username: "user123"};
//     }
//     next();
// });

router.get("/", (req, res) => {
    console.log(req.session);
});

// Route to simulate login
router.post("/login/student", async (req, res) => {
    const {mat_no, password} = req.body;
    try {
        const result = await pool.query(
            "SELECT mat_no AS id, password FROM students WHERE mat_no = $1",
            [mat_no]
        );
        if (result.rows.length === 0) {
            res.status(401).send("Invalid mat number or password");
            return;
        }
        
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).send("Invalid email or password");
            return;
        }
        req.session.user = {id: user.id, role: "student"};
        res.status(200).send({id: user.id, role: "student"});
    } catch (err) {
        console.error("Error logging in", err);
        res.status(500).send("An error occurred");
    }
});

router.post("/login/lecturer", async (req, res) => {
    const {staff_id, password} = req.body;
    try {
        const result = await pool.query(
            "SELECT staff_id AS id, password FROM lecturers WHERE staff_id = $1",
            [staff_id]
        );
        if (result.rows.length === 0) {
            res.status(401).send("Invalid mat number or password");
            return;
        }
        
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).send("Invalid email or password");
            return;
        }
        req.session.user = {id: user.id, role: "lecturer"};
        res.status(200).send({id: user.id, role: "lecturer"});
    } catch (err) {
        console.error("Error logging in", err);
        res.status(500).send("An error occurred");
    }
});


// Route to simulate logout
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session", err);
            res.status(500).send("An error occurred");
            return;
        }
        res.send("Logged out successfully");
    });
});

module.exports = router;
