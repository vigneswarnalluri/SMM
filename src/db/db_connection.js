const knex = require('knex');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  } : null,
  pool: {
    min: 2,
    max: 10,
    createTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false
  }
});

async function initializeDb() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL found. Skipping DB init.');
    return;
  }
  
  console.log('Connecting to Supabase...');
  try {
    const hasMedia = await db.schema.hasTable('media').timeout(10000);
    console.log('Connection successful!');
    
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
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = { db, initializeDb };
