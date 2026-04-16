const knex = require('knex');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  } : {
    // Fallback for local development if DATABASE_URL is not set
    host: '127.0.0.1',
    user: 'your_user',
    password: 'your_password',
    database: 'your_db'
  },
});

async function initializeDb() {
  const hasMedia = await db.schema.hasTable('media');
  if (!hasMedia) {
    await db.schema.createTable('media', (table) => {
      table.increments('id');
      table.text('file_path');
      table.text('thumbnail_path');
      table.text('status');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  const hasFaces = await db.schema.hasTable('faces');
  if (!hasFaces) {
    await db.schema.createTable('faces', (table) => {
      table.increments('id');
      table.integer('media_id');
      table.text('embedding');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }
}

module.exports = { db, initializeDb };
