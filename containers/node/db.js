require('dotenv').config();

const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE;
const { Client } = require('pg');
const client = new Client({
    user:POSTGRES_USER,
    host:"postgres",
    database:POSTGRES_DATABASE,
    password:POSTGRES_PASSWORD,
    port: 5432
});
client.connect();

module.exports = client