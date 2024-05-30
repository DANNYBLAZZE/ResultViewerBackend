const express = require("express");
require("dotenv").config();
const session = require("express-session");
const app = express();
const logger = require("morgan");
const cors = require("cors");
const pgSession = require('connect-pg-simple')(session);
const cookieParser = require("cookie-parser");

const pool = require("./db"); // Import the PostgreSQL connection pool


const port = 5000;

app.use(logger("combined"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(
    session({
        store: new pgSession({
            
            pool: pool, // Connection pool
            tableName: "session", // Use another table-name than the default "session" one
            // Insert connect-pg-simple options here
        }),
        secret: process.env.SECRET, // Session secret for encryption
        resave: false,
        
        saveUninitialized: true,

        cookie: {secure: false, maxAge: 3.1536e10}, // Cookie settings (e.g., secure: true for HTTPS)
    })
);

const authRoutes = require("./routes/auth");

// Define routes and middleware here...
// Import routes
const userRoutes = require("./routes/user");

const adminRoutes = require("./routes/admin")

// Mount routes
app.use("/", authRoutes);
app.use("/student", userRoutes);
app.use("/lecturer", adminRoutes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
