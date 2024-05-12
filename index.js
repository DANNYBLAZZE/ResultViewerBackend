const express = require("express");
require("dotenv").config();
const app = express();
const logger = require("morgan");
const cors = require("cors");

const port = 5000;

app.use(logger("combined"))
app.use(express.json())
app.use(cors());


const authRoutes = require("./routes/auth")

// Define routes and middleware here...
// Import routes
const userRoutes = require('./routes/user');



// Mount routes
app.use(authRoutes);
app.use('/api', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
