const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { SELECT_USERS, SELECT_USER_BYID, INSERT_USER, UPDATE_USER, DELETE_USER } = require('../utlis/utli'); // Note: Changed to 'utils' from 'utlis'

// Database pool setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Hash password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

// Verify password
const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

const getAllUsers = async () => {
    try {
        const result = await pool.query(SELECT_USERS);
        return result.rows;
    } catch (err) {
        throw new Error(`Failed to retrieve users: ${err.message}`);
    }
};

const getUserById = async (id) => {
    try {
        const result = await pool.query(SELECT_USER_BYID, [id]);
        return result.rows[0];
    } catch (err) {
        throw new Error(`Failed to retrieve user: ${err.message}`);
    }
};

const createUser = async (name, email, password) => {
    try {
        const hashedPassword = await hashPassword(password);
        const result = await pool.query(
            INSERT_USER,
            [name, email, hashedPassword]
        );
        return result.rows[0];
    } catch (err) {
        throw new Error(`Failed to create user: ${err.message}`);
    }
};

const updateUser = async (id, name, email) => {
    try {
        const result = await pool.query(
            UPDATE_USER,
            [name, email, id]
        );
        return result.rows[0];
    } catch (err) {
        throw new Error(`Failed to update user: ${err.message}`);
    }
};

const deleteUser = async (id) => {
    try {
        const result = await pool.query(DELETE_USER, [id]);
        return result.rows[0];
    } catch (err) {
        throw new Error(`Failed to delete user: ${err.message}`);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    verifyPassword
};
