const { pgTable, text, uuid } = require('drizzle-orm/pg-core');

const usersTable = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  accessToken: text('access_token').notNull()
});

module.exports.usersTable = usersTable;
