const express = require("express");
require("dotenv").config();
const session = require("express-session");
const app = express();
const logger = require("morgan");
const cors = require("cors");
const pgSession = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser");

const pool = require("./db");

app.use(logger("combined"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(
  session({
    store: new pgSession({ pool: pool, tableName: "session" }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3.1536e10 },
  })
);

const authRoutes = require("./routes/auth");

const userRoutes = require("./routes/user");

const adminRoutes = require("./routes/admin");

app.use("/", authRoutes);
app.use("/student", userRoutes);
app.use("/lecturer", adminRoutes);

app.use((err, req, res, next) => {
  res.status(500).send({ message: "something went wrong" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
