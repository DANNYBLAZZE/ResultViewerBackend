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
    res.status(200).send("Server is running");
});

// Route to simulate login
router.post("/login/student", async (req, res) => {
    const {mat_no, password} = req.body;


    try {
        if (!mat_no) 
            return res.status(400).send({message: "Matriculation number is required"});
        if (!password) 
            return res.status(400).send({message: "Password is required"});

        const result = await pool.query(
            "SELECT mat_no AS id, password FROM students WHERE mat_no = $1",
            [mat_no]
        );
        if (result.rows.length === 0) {
            res.status(400).send({message: "Invalid matriculation number or password"});
            return;
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            res.status(401).send({message: "Invalid matriculation number or password"});
            return;
        }

        // res.cookie("role", "user");
        const userInfo = {id: user.id, role: "student"};
        res.cookie("user", JSON.stringify(userInfo), {
            secure: false,
            maxAge: 3.1536e10,
        });
        req.session.user = userInfo;
        res.status(200).send(userInfo);
    } catch (err) {
        console.error("Error logging in", err);
        res.status(500).send({message: "An error occurred"});
    }
});


// Route to simulate login
router.post("/register/student", async (req, res) => {
    let {mat_no, first_name, last_name, department_code, email, password} =
        req.body;
    mat_no = (mat_no || "").toUpperCase();
    department_code = (department_code || "").toLowerCase();

    try {
        if (!mat_no) 
            return res.status(400).send({message: "Matriculation number is required"});
        if (!password) 
            return res.status(400).send({message: "Password is required"});
        if (!first_name) 
            return res.status(400).send({message: "First Name is required"});
        if (!last_name) 
            return res.status(400).send({message: "Last Name is required"});
        if (!department_code) 
            return res.status(400).send({message: "Department code is required"});
        if (!email) 
            return res.status(400).send({message: "Email is required"});

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

        const userInfo = {id: mat_no, role: "student"};
        res.cookie("user", JSON.stringify(userInfo), {
            secure: false,
            maxAge: 3.1536e10,
        });

        req.session.user = userInfo;
        res.status(200).send(userInfo);
    } catch (err) {
        if (err.code == "23505" && err.constraint == "students_pkey")
            return res.status(400).send({message: "User already exists"});
        if (err.code == "23505" && err.constraint == "students_email_key")
            return res.status(400).send({message: "Email already exists for another user"});
        if (err.constraint == "students_mat_no_check")
            return res.status(400).send({message: "Not a valid matriculation number"});
        if (err.code == "22001")
            return res.status(400).send({message: "Department code can only be three characters long"});

        console.error("Error logging in", err);
        res.status(500).send({message: "An error occurred"});
    }
});

router.post("/register/lecturer", async (req, res) => {
    const {staff_id, first_name, last_name, email, password} = req.body;
    console.log(password);
    try {
        if (!staff_id) 
            return res.status(400).send({message: "Staff Id is required"});
        if (!password) 
            return res.status(400).send({message: "Password is required"});
        if (!first_name) 
            return res.status(400).send({message: "First Name is required"});
        if (!last_name) 
            return res.status(400).send({message: "Last Name is required"});
        if (!email) 
            return res.status(400).send({message: "Email is required"});

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO lecturers (staff_id, first_name, last_name, email, password)
            VALUES ($1, $2, $3, $4, $5)`,
            [staff_id, first_name, last_name, email, hashedPassword]
        );

        const userInfo = {id: staff_id, role: "lecturer"};

        res.cookie("user", JSON.stringify(userInfo), {
            secure: false,
            maxAge: 3.1536e10,
        });
        req.session.user = userInfo;
        res.status(200).send(userInfo);
    } catch (err) {
        if (err.code == "23505" && err.constraint == "lecturers_pkey")
            return res.status(400).send({message: "User already exists"});
        if (err.code == "23505" && err.constraint == "lecturers_email_key")
            return res.status(400).send({message: "Email already exists for another user"});
        
        // if (err.code == "23505")
        //     return res.status(400).send("User already exists");

        console.error("Error logging in", err);
        res.status(500).send("An error occurred");
    }
});

router.post("/login/lecturer", async (req, res) => {
    const {staff_id, password} = req.body;
    try {
        if (!staff_id) 
            return res.status(400).send({message: "Staff Id is required"});
        if (!password) 
            return res.status(400).send({message: "Password is required"});

        const result = await pool.query(
            "SELECT staff_id AS id, password FROM lecturers WHERE staff_id = $1",
            [staff_id]
        );
        if (result.rows.length === 0) {
            res.status(401).send({message: "Invalid staff Id or password"});
            return;
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).send({message: "Invalid staff Id or password"});
            return;
        }

        const userInfo = {id: user.id, role: "lecturer"};
        res.cookie("user", JSON.stringify(userInfo), {
            secure: false,
            maxAge: 3.1536e10,
        });
        req.session.user = userInfo;
        res.status(200).send(userInfo);
    } catch (err) {
        console.error("Error logging in", err);
        res.status(500).send({message: "An error occurred"});
    }
});

// Route to simulate logout
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session", err);
            res.status(500).send({message: "An error occurred"});
            return;
        }
        res.send({message: "Logged out successfully"});
    });
});

module.exports = router;
