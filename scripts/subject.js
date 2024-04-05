
const csv = require('csv-parser');
const { Client } = require('pg');
const fs = require('fs');

// If you're connecting to a service like Heroku Postgres, you might need to accept self-signed certificates
// In such cases, you can use the following SSL configuration:
const sslConfig = {
  rejectUnauthorized: false // This bypasses the certificate verification. Use with caution.
};
const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  //port: process.env.PGPORT,//
  ssl: sslConfig,
});

client.connect();

const insertPromises = [];

fs.createReadStream('subject1.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Create a promise for each insert operation and add it to the array
    const insertPromise = client.query('INSERT INTO subject (subject_name) VALUES ($1)', [row.subject_name]);
    insertPromises.push(insertPromise);
  })
  .on('end', () => {
    // Wait for all insert operations to complete
    Promise.all(insertPromises).then(() => {
      console.log('CSV file successfully processed');
      client.end(); // Close the database connection
    }).catch(error => {
      console.error('Error inserting data:', error);
      client.end(); // Ensure the connection is closed in case of error
    });
  });