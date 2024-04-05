const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
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

const csvFilePath = 'question1.csv'; // Path to your CSV file

async function insertData(row) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if the row contains all necessary fields
        if (!row.topic_name || !row.sub_topic_name || !row.question || !row.options || !row.opt_values || !row.selective_cnt || !row.correct_options || !row.difficulty || !row.explanation || !row.reference || !row.source || !row.approver_name || !row.subject_name) {
            console.error('Error: Incomplete row data', row);
            return; // Skip inserting incomplete rows
        }

        // Check if approver exists, if not insert into approver table
        let approverId;
        const approverRes = await client.query('SELECT id FROM approver WHERE approver_name = $1', [row.approver_name]);
        if (approverRes.rows.length === 0) {
            const insertApproverRes = await client.query('INSERT INTO approver(approver_name) VALUES($1) RETURNING id', [row.approver_name]);
            approverId = insertApproverRes.rows[0].id;
        } else {
            approverId = approverRes.rows[0].id;
        }

        // Format options as an array
        const options = row.options.split(';');

        // Format opt_values as an array
        const opt_values = row.opt_values.split(';');

        // Format correct_options as an array
        const correct_options = row.correct_options.substring(1, row.correct_options.length - 1).split(';').map(Number);

        // Format selective_ctn as an array of integers if it's defined
        const selective_cnt = row.selective_cnt ? row.selective_cnt.split(';').map(Number) : [];

        // Finally, insert into the question table
        await client.query(
            'INSERT INTO question(topic_name, sub_topic_name, question, options, opt_values, correct_options, selective_cnt, difficulty, explanation, reference, source, approver_name, subject_name) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
            [row.topic_name, row.sub_topic_name, row.question, options, opt_values, correct_options, selective_cnt, row.difficulty, row.explanation, row.reference, row.source, row.approver_name, row.subject_name]
        );

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}


// Read the CSV file and insert data
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    insertData(row).catch(console.error);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
