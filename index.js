const express = require("express");
require("dotenv").config();
const app = express();
const logger = require("morgan");

const port = 3000;

app.use(logger("combined"))
app.use(express.json())

// Define routes and middleware here...
// Import routes
const userRoutes = require('./routes/user');

// Mount routes
app.use('/api', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
