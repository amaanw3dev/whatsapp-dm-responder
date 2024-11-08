const { config } = require('dotenv');
const { defineConfig } = require('drizzle-kit');

config({ path: '.env' });

module.exports = defineConfig({
  schema: './db/schema.js',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
