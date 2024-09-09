const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const userRoutes = require('./routes/mainRoute');
require('dotenv').config();
const bcrypt = require('bcrypt');
const {pool} = require('./db/pool')
const { logger, httpLogger } = require('./utlis/winstonLogger');

// const redis = require('redis');



const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(httpLogger);

// const redisClient = redis.createClient({
//   url: 'redis://<your-redis-cache-name>.redis.cache.windows.net:6379', // Azure Redis Cache URL
//   password: '<your-primary-key>'  // Primary key from Azure Redis Access Keys
// });

// // Connect to Redis
// redisClient.connect().then(() => {
//   logger.info('Connected to Azure Redis Cache');
// }).catch(err => {
//   logger.warn('Redis connection error:', err);
// });

const checkConnection = async () => {
  try {
    const client = await pool.connect();
    logger.info('Database connection successful!');

    client.release(); // Release the client back to the pool
  } catch (err) {
    logger.warn(`Database connection failed:', ${err.message}`)
  }
};

checkConnection();

app.use('/api', userRoutes);

// const PORT = process.env.PORT || 9000;
// app.listen(PORT, () => {
//   logger.info(`Server started on port ${PORT}`);
// });

module.exports = app;
