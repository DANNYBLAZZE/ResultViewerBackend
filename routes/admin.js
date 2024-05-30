const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import the PostgreSQL connection pool
const multer = require("multer");
const csv = require("csv-parser");
const {Readable} = require("stream");
const sleep = require('sleep-promise');
const fs = require("fs");


const upload = multer({storage: multer.memoryStorage()});

router.use((req, res, next) => {
    console.log("session", req.session.user);
    if (!req.session.user && req.path !== "/login") {
        // return res.redirect("/login");
        return res.status(403).send({message: "Not Authorized"});

    }
    if (req.session.user.role != "lecturer")
        return res.status(403).send({message: "Not Authorized"});
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
        res.status(500).json({message: "Internal Server Error"});
    }
});

router.get("/:mat_no/get_result", async (req, res) => {
    console.log("yeah");
    try {
        // await sleep(5000);
        // Query the database
        const matNo = req.params["mat_no"];
        const {rows} = await pool.query(
            "SELECT * FROM results WHERE mat_no = $1",
            [matNo]
        );

        if (rows.length == 0){
            res.status(401).send({message: "Matriculation number does not exist"});
            return;
        }

        console.log(rows);
        res.json(rows); // Send the query result as JSON response
    } catch (err) {
        console.error("Error executing query", err);
        res.status(500).send({message: "Internal Server Error"});
    }
});

router.post("/upload-result", upload.single("results"), async (req, res) => {
    if (!req.file) 
        return res.status(400).send({message: "No data passed in the request body"})

    const csvData = req.file.buffer;

    const readCsv = await new Promise((resolve, reject) => {
        const results = [];
        Readable.from(req.file.buffer)
            .pipe(csv())
            .on("data", (data) => {
                // Process each row of the CSV data
                results.push(data);
            })
            .on("end", () => {
                // End of CSV file
                resolve(results);
            })
            .on("error", (err) => {
                // Handle errors
                console.error("Error reading CSV file:", err);
                reject(err);
            });
    });

    const results = await readCsv;

    const client = await pool.connect();
    console.log("results", results);
    
    let recordCount = 0;
    
    try {
        await client.query("BEGIN");
        for (const result of results) {
            const {"Mat No": matNo, ...courses} = result;
            for (const [course, score] of Object.entries(courses)) {
                if (score) {
                    recordCount++;
                    await client.query(
                        `INSERT INTO results (mat_no, course_code, score, session) VALUES ($1, $2, $3, $4)
                         ON CONFLICT (mat_no, course_code, session) DO UPDATE 
                         SET score = EXCLUDED.score
                        `,
                        [matNo, course, score, "2022/2023"]
                    );
                }
            }
        }
        await client.query("COMMIT");
        res.status(200).send({message: `Added ${recordCount} records for ${results.length} students`})
    } catch (error) {
        await client.query("ROLLBACK");

        console.log(error);
        if (error.code == "23503")
            return res.status(400).send({message: "Mat No does not exist"})
        res.status(400).send({message: "Error adding the results"})
    } finally {
        client.release();
    }
});

module.exports = router;
