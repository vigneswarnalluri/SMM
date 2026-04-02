const knex = require('knex'); // Import the Knex query builder for SQL
const path = require('path'); // Import the path module to handle file paths

const db = knex({ // Initialize the Knex database instance
  client: 'better-sqlite3', // Set the database driver to better-sqlite3 for local storage
  connection: { // Configure the database connection parameters
    filename: path.join(__dirname, '../../database.sqlite'), // Define the path to the SQLite database file
  }, // Close the connection configuration
  useNullAsDefault: true, // Use NULL as the default value for missing properties in SQLite
}); // Close the Knex initialization

async function initializeDb() { // Define an asynchronous function to set up the database tables
  const hasMedia = await db.schema.hasTable('media'); // Check if the 'media' table already exists
  if (!hasMedia) { // If the 'media' table does not exist
    await db.schema.createTable('media', (table) => { // Begin creating the 'media' table schema
      table.increments('id'); // Create an auto-incrementing integer 'id' as the primary key
      table.text('file_path'); // Create a text column for the original image file path
      table.text('thumbnail_path'); // Create a text column for the generated thumbnail file path
      table.text('status'); // Create a text column to track the processing status of the image
      table.timestamp('created_at').defaultTo(db.fn.now()); // Create a 'created_at' timestamp with the current time
    }); // Close the 'media' table schema definition
  } // End of the if statement for the 'media' table

  const hasFaces = await db.schema.hasTable('faces'); // Check if the 'faces' table already exists
  if (!hasFaces) { // If the 'faces' table does not exist
    await db.schema.createTable('faces', (table) => { // Begin creating the 'faces' table schema
      table.increments('id'); // Create an auto-incrementing integer 'id' as the primary key
      table.integer('media_id'); // Create an integer column to link the face to an image in the 'media' table
      table.text('embedding'); // Create a text column to store the facial embedding data as a string
      table.timestamp('created_at').defaultTo(db.fn.now()); // Create a 'created_at' timestamp with the current time
    }); // Close the 'faces' table schema definition
  } // End of the if statement for the 'faces' table
} // End of the initializeDb function

module.exports = { db, initializeDb }; // Export the database instance and initialization function for use in other files
