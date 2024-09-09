const { HttpRequest, HttpResponse } = require('@azure/functions');
const express = require('express');
const { pool } = require("../db/pool");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { FETCH_LOGIN_CREDENTIALS, CREATE_NEW_USER } = require("../utlis/utli");
const { logger, httpLogger } = require("../utlis/winstonLogger");

const app = express();
app.use(express.json());

// Define your Express routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(FETCH_LOGIN_CREDENTIALS, [email]);
    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const prwebuser = result.rows[0];
    const isMatch = await bcrypt.compare(password, prwebuser.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ email: prwebuser.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ message: "Login successful", "access-token": token });
  } catch (error) {
    logger.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/logout', (req, res) => {
  res.cookie("token", "", { expires: new Date(0), httpOnly: true });
  res.status(200).json({ message: "Logged out successfully" });
});

app.get('/check-login', (req, res) => {
  res.status(200).json({ message: "You are logged in" });
});

app.post('/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const hash = await bcrypt.hash(password, 10);
    const createdUser = await pool.query(CREATE_NEW_USER, [
      email,
      hash,
      first_name,
      last_name
    ]);

    logger.info("New User Created", { id: createdUser.rows[0], email });

    res.status(201).json({
      message: "User Created Successfully",
      userDetails: {
        id: createdUser.rows[0].id,
        email: createdUser.rows[0].email,
        firstname: createdUser.rows[0].first_nm,
      },
    });
  } catch (error) {
    logger.error("Error creating user", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Azure Function entry point
module.exports = async function (context, req) {
    return new Promise((resolve, reject) => {
      app(req, context.res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).then(() => {
      context.res = {
        status: context.res.statusCode,
        body: context.res.body,
        headers: context.res.headers,
      };
    }).catch((error) => {
      logger.error('Error processing request:', error);
      context.res = {
        status: 500,
        body: 'Internal Server Error',
      };
    });
  };