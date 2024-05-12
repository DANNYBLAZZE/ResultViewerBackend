const express = require("express");
const session = require("express-session");
const pool = require("../db");
const router = express.Router();
const bcrypt = require("bcrypt");

// Configure session middleware
router.use(
    session({
        secret: "your_secret_key", // Session secret for encryption
        resave: false,
        saveUninitialized: true,

        cookie: {secure: false, maxAge: 3.1536e10}, // Cookie settings (e.g., secure: true for HTTPS)
    })
);

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
router.post("/login", async (req, res) => {
    const {mat_no, password} = req.body;
    try {
        const result = await pool.query(
            "SELECT * FROM students WHERE mat_no = $1",
            [mat_no]
        );
        if (result.rows.length === 0) {
            res.status(401).send("Invalid mat number or password");
            return;
        }
        
        const user = result.rows[0];
        console.log(user)
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).send("Invalid email or password");
            return;
        }
        req.session.user = {id: user.id};
        res.status(200).send("Logged in successfully");
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
