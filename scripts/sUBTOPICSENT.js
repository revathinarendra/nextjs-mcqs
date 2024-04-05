const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
const { promisify } = require('util');
const stream = require('stream');

const sslConfig = {
    rejectUnauthorized: false // This bypasses the certificate verification. Use with caution.
};

// Configure your PostgreSQL connection
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    ssl: sslConfig,
});

// Function to ensure a topic exists in the database
async function ensureTopicExists(topicName, client) {
    const res = await client.query('SELECT 1 FROM topic WHERE topic_name = $1', [topicName]);
    if (res.rows.length === 0) {
        await client.query('INSERT INTO topic (topic_name) VALUES ($1)', [topicName]);
    }
}

// Function to process the CSV file
async function processCsv() {
    const client = await pool.connect();
    try {
        const rows = [];

        // Use pipeline to handle backpressure and errors properly
        await promisify(stream.pipeline)(
            fs.createReadStream('ENT.csv'),
            csv(),
            async function* (source) {
                for await (const row of source) {
                    yield row; // This passes the row through, but you could transform it here if needed
                    rows.push(row);
                }
            }
        );

        // Begin a transaction
        await client.query('BEGIN');

        for (const row of rows) {
            await ensureTopicExists(row.topic_name, client);
            await client.query('INSERT INTO sub_topic (sub_topic_name, topic_name, subject_name) VALUES ($1, $2, $3)', [row.sub_topic_name, row.topic_name, row.subject_name]);
        }

        // Commit the transaction
        await client.query('COMMIT');
    } catch (e) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        throw e;
    } finally {
        // Release the client back to the pool
        client.release();
    }
}

// Call the function to process the CSV file
processCsv()
    .then(() => {
        console.log('CSV file successfully processed');
    })
    .catch((error) => {
        console.error('Error processing CSV file:', error);
    });
