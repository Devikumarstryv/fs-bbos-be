const { Pool } = require('pg');

// Create a new pool instance to manage PostgreSQL connections.
// The configuration can be found in the Azure portal or by using environment variables.

const pool = new Pool({
    user: 'postgres',
    host: 'fs-bb-db.postgres.database.azure.com',
    database: 'postgres',
    password: 'stryv@1234',
    port: 5432,
    ssl: {
        rejectUnauthorized: false // This might be necessary for some setups
    }
});

// Function to get data (SELECT operation)
async function getData() {
    const query = 'SELECT * FROM fs_bbos.web_user ';
    const values = [];
    try {
        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (err) {
        throw err;
    }
}

// // Function to delete data (DELETE operation)
// async function deleteData(id) {
//     const query = 'DELETE FROM your_table_name WHERE id = $1';
//     const values = [id];
//     try {
//         await pool.query(query, values);
//     } catch (err) {
//         throw err;
//     }
// }

// async function updateData(id, name) {
//     const query = 'UPDATE your_table_name SET name = $1 WHERE id = $2 RETURNING *';
//     const values = [name, id];
//     try {
//         const res = await pool.query(query, values);
//         return res.rows[0]; // Return the updated row
//     } catch (err) {
//         throw err;
//     }
// }

// Exporting the functions to be used in other parts of your application
module.exports = {
    // createData,
    getData,
    // updateData,
    // deleteData
};
