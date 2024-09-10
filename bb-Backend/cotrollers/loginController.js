const { pool } = require("../db/pool");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { FETCH_LOGIN_CREDENTIALS, CREATE_NEW_USER } = require("../utlis/utli");
const { logger, httpLogger } = require("../utlis/utli");
async function userLogin(req, context) {
  const { email, password } = req.body;

  if (!email || !password) {
      context.res = {
          status: 400,
          body: { error: "Email and password are required" },
          headers: { 'Content-Type': 'application/json' }
      };
      return;
  }

  try {
      const result = await pool.query(FETCH_LOGIN_CREDENTIALS, [email]);

      if (result.rowCount === 0) {
          context.res = {
              status: 400,
              body: { error: "Invalid email or password" },
              headers: { 'Content-Type': 'application/json' }
          };
          return;
      }

      const user = result.rows[0];
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          context.res = {
              status: 400,
              body: { error: "Invalid email or password" },
              headers: { 'Content-Type': 'application/json' }
          };
          return;
      }

      const token = jwt.sign(
          { user_id: user.user_id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      context.res = {
          status: 200,
          body: { message: "Login successful", token },
          headers: { 'Content-Type': 'application/json' }
      };
  } catch (error) {
      context.log(error);
      context.res = {
          status: 500,
          body: { error: "Internal server error" },
          headers: { 'Content-Type': 'application/json' }
      };
  }
}

module.exports = { userLogin };