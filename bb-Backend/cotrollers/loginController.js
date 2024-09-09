const { pool } = require("../db/pool");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { FETCH_LOGIN_CREDENTIALS, CREATE_NEW_USER } = require("../utlis/utli");
const { logger, httpLogger } = require("../utlis/utli");

const userLogin = async (req, context) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(FETCH_LOGIN_CREDENTIALS, [email]);
    console.log(result.rowCount)
    console.log(email)

    if (result.rowCount === 0) {
      context.res = {
        status: 400,
        body: { error: "Invalid email or password" },
        headers: { 'Content-Type': 'application/json' }
      };
      context.log('Invalid email or password response sent');
      return;
    }

    const prwebuser = result.rows[0];
    const isMatch = await bcrypt.compare(password, prwebuser.password);

    if (!isMatch) {
      context.res = {
        status: 400,
        body: { error: "Invalid email or password" },
        headers: { 'Content-Type': 'application/json' }
      };
      context.log('Invalid password response sent');
      return;
    }

    const token = jwt.sign(
      { email: prwebuser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    context.res = {
      status: 200,
      body: { message: "Login successful", "access-token": token },
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `token=${token}; HttpOnly; Max-Age=3600`
      }
    };
    context.log('Login successful response sent with token');
  } catch (error) {
    logger.error("Error during login:", error);
    context.res = {
      status: 500,
      body: { error: "Internal server error" },
      headers: { 'Content-Type': 'application/json' }
    };
    context.log('Internal server error response sent');
  }
};


const userLogOut = function (req, res) {
  res.cookie("token", "", { expires: new Date(0), httpOnly: true });
  res.status(200).json({ message: "Logged out successfully" });
};

const checkLogin = function (req, res) {
  res.status(200).json({ message: "You are logged in" });
};

const userRegistration = async function (req, res) {
  const { email, password, first_name,last_name } = req.body;

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
        id: createdUser.rows[0],
        email: createdUser.rows[0].email,
        firstname: createdUser.rows[0].first_nm,
      },
    });
  } catch (error) {
    logger.error("Error creating user", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { userLogin, userLogOut, checkLogin, userRegistration };
