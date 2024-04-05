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
    //port: process.env.PGPORT,//
    ssl: false,
});

const csvFilePath = 'anatomy.csv'; // Path to your CSV file

// Function to insert data into the database
async function insertData(row) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if approver exists, if not insert into approver table
    let approverId;
    const approverRes = await client.query('SELECT id FROM approver WHERE approver_name = $1', [row.approver]);
    if (approverRes.rows.length === 0) {
      const insertApproverRes = await client.query('INSERT INTO approver(approver_name) VALUES($1) RETURNING id', [row.approver]);
      approverId = insertApproverRes.rows[0].id;
    } else {
      approverId = approverRes.rows[0].id;
    }

    // Insert into topic and sub_topic tables similarly, assuming they have similar logic

    // Finally, insert into the question table
    await client.query(
      'INSERT INTO question(topic_name, sub_topic_name, question, options, opt_values, correct_options, selective_cnt, difficulty, explanation, reference, source, approver_name, subject_name) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
      [row.topic_name, row.sub_topic_name, row.question, row.options, row.opt_value, row.correct_options, row.selective_ctn, row.difficulty, row.explanation, row.reference, row.source, row.approver_name, row.subject_name]
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