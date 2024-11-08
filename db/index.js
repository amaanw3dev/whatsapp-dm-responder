const { config } = require('dotenv');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

config({ path: '.env' });
const client = postgres(process.env.DATABASE_URL);
module.exports.db = drizzle({ client });