const { eq } = require('drizzle-orm');
const { db } = require('./index.js');
const { usersTable } = require('./schema.js');

async function createUser(data) {
  await db.insert(usersTable).values(data);
}

async function findUserById(id) {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
}

async function updateAccessToken(id, newAccessToken) {
    await db.update(usersTable)
        .set({ accessToken: newAccessToken })
        .where(eq(usersTable.id, id));
}

module.exports = { createUser, findUserById, updateAccessToken };
