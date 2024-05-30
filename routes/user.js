const express = require("express");
const router = express.Router();
const pool = require("../db"); 

router.use((req, res, next) => {
  if (!req.session.user && req.path !== "/login") {
    return res.status(403).send({ message: "Not Authorized" });
  }
  next();
});

router.get("/get_details", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT mat_no, first_name, last_name, department_code, email FROM students WHERE mat_no = $1",
      [req.session.user.id]
    );
    res.json(rows[0]); 
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get_result", async (req, res) => {
  try {
    const matNo = req.session.user.id;
    const { rows } = await pool.query("SELECT * FROM results WHERE mat_no = $1", [matNo]);
    console.log(rows);
    res.json(rows); 
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
