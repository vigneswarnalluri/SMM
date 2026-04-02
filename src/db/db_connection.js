const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../database.sqlite'),
  },
  useNullAsDefault: true,
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
