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
    // console.log(req.session);
    res.status(200);
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

// Route to simulate login
router.post("/register/student", async (req, res) => {
    const {mat_no, first_name, last_name, department_code, email, password} =
        req.body;
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO students (mat_no, first_name, last_name, department_code, email, password)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                mat_no,
                first_name,
                last_name,
                department_code,
                email,
                hashedPassword,
            ]
        );

        req.session.user = {id: mat_no, role: "student"};
        res.status(200).send({id: mat_no, role: "student"});
    } catch (err) {
        if (err.code == "23505")
            return res.status(400).send("User already exists");
        if (err.constraint == "students_mat_no_check")
            return res.status(400).send("Not a valid matriculation number");

        console.error("Error logging in", err);
        res.status(500).send("An error occurred");
    }
});

router.post("/register/lecturer", async (req, res) => {
    const {staff_id, first_name, last_name, email, password} = req.body;
    console.log(password);
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO lecturers (staff_id, first_name, last_name, email, password)
            VALUES ($1, $2, $3, $4, $5)`,
            [staff_id, first_name, last_name, email, hashedPassword]
        );

        req.session.user = {id: staff_id, role: "lecturer"};
        res.status(200).send({id: staff_id, role: "lecturer"});
    } catch (err) {
        if (err.code == "23505")
            return res.status(400).send("User already exists");

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
