

const { Pool } = require('pg');
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "proyecto2",
  password: "sergio",
  port: 5432,
});

module.exports = pool;

