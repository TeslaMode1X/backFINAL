require('dotenv').config({ path: '../.env' });

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});
  
// Testing purposes
// console.log(pool.user)
// console.log(pool.host)
// console.log(pool.database)
// console.log(pool.password)
// console.log(pool.pool)

pool.connect()
  .then(() => console.log('Connected to the Postgres db'))
  .catch((err) => {
    console.error('Failed to connect to the database:', err.message);
  });

module.exports = pool;
