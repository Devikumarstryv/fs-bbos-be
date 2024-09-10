const { pool } = require("../db/pool");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { FETCH_LOGIN_CREDENTIALS, CREATE_NEW_USER } = require("../utlis/utli");
const { logger, httpLogger } = require("../utlis/winstonLogger");

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(FETCH_LOGIN_CREDENTIALS, [email]);
    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const prwebuser = result.rows[0];
    console.log(prwebuser)
    
    const isMatch = await bcrypt.compare(password, prwebuser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email: prwebuser.email, first_name: prwebuser.first_nm },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    });

    const createdData = await pool.query(
  //working query: 
  `INSERT INTO fs_bbos.user_login_audit(
	login_audit_id, user_id, login_ts, login_status, login_txt, login_location, login_mac, login_ip, session_key)
	VALUES (20240909201023, 1,CURRENT_TIMESTAMP,'success', 'login successful', NULL, NULL, NULL, NULL);
      VALUES ($1, $2, $3, $4, $5, NOW())`,
  
    //   `INSERT INTO fs_bbos.user_login_audit (
    //   login_audit_id, user_id, login_ts, login_status, login_txt, login_location, login_mac, login_ip, session_key)
    //   VALUES ($1, $2, $3, $4, NULL, NULL, NULL, NULL, NULL)
    //   `
    [  prwebuser.user_id, token, prwebuser.email, prwebuser.first_nm, prwebuser.last_nm]
    );
    console.log(createdData);

    res.status(200).json({ message: "Login successful", "access-token": token, "first_name": prwebuser.first_nm, "last_name": prwebuser.last_nm });
  } catch (error) {
    logger.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
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
