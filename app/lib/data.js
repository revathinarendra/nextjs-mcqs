const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');

// PostgreSQL client setup
const client = new Client({
  connectionString: process.env.POSTGRES_URL, // Ensure this environment variable is set
});

// Function to insert subjects into the database
const insertSubject = async (subject) => {
  const query = 'INSERT INTO subject(subject_name) VALUES($1) RETURNING *'; // Adjust the query based on your table structure
  try {
    const res = await client.query(query, [subject.subject_name]);
    console.log('Inserted:', res.rows[0]);
  } catch (err) {
    console.error('Insertion error:', err.stack);
  }
};

// Connect to the PostgreSQL client
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    // Read and parse the CSV file
    fs.createReadStream('subject.csv')
      .pipe(csv())
      .on('data', (row) => {
        insertSubject(row); // Assuming each row has a 'subject_name' column
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      })
      .on('error', (err) => {
        console.error('Error reading CSV file:', err);
      })
      .on('close', () => {
        client.end(); // Close the connection after processing
        console.log('Database connection closed');
      });
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL database:', err);
    client.end(); // Close the connection in case of an error
  });
