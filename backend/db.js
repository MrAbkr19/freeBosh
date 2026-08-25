const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const adapter = new JSONFile('db.json');
const db = new Low(adapter, { users: [] , modules:[], documents:[], announcements:[]});

// Call this once before using db.data anywhere else.
async function initDb() {
  await db.read();
  db.data ||= { users: [] , modules: [], documents:[], announcements:[]};
}

module.exports = { db, initDb };