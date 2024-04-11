const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',           // Your PostgreSQL username
  host: 'localhost',        // Your PostgreSQL server host
  database: 'Proyecto02',   // Your PostgreSQL database name
  password: '',   // Your PostgreSQL password
  port: 5432,               // Your PostgreSQL port (5432 is the default)
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
