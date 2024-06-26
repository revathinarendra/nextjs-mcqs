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

const csvFilePath = 'derma.csv'; // Path to your CSV file

async function insertData(row) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if the row contains all necessary fields
        if (!row.topic_name || !row.sub_topic_name || !row.question || !row.options || !row.opt_values || !row.selective_cnt || !row.correct_options || !row.difficulty || !row.explanation || !row.reference || !row.source || !row.approver_name || !row.subject_name) {
            console.error('Error: Incomplete row data', row);
            return; // Skip inserting incomplete rows
        }

        // Check if subject exists, if not insert into subject table
        let subject_name;
        const subjectRes = await client.query('SELECT subject_name FROM subject WHERE subject_name = $1', [row.subject_name]);
        if (subjectRes.rows.length === 0) {
            const insertSubjectRes = await client.query('INSERT INTO subject(subject_name) VALUES($1) RETURNING subject_name', [row.subject_name]);
            subject_name = insertSubjectRes.rows[0];
        } else {
            subject_name= subjectRes.rows[0].id;
        }

        // Check if sub_topic exists, if not insert into sub_topic table
        let sub_topic_name;
        const subTopicRes = await client.query('SELECT id FROM sub_topic WHERE sub_topic_name = $1', [row.sub_topic_name]);
        if (subTopicRes.rows.length === 0) {
            const insertSubTopicRes = await client.query('INSERT INTO sub_topic(sub_topic_name, subject_name) VALUES($1, $2) RETURNING sub_topic_name', [row.sub_topic_name, subject_name]);
            sub_topic_name = insertSubTopicRes.rows[0].id;
        } else {
            sub_topic_name= subTopicRes.rows[0].id;
        }

        // Check if topic exists, if not insert into topic table
        let topic_name;
        const topicRes = await client.query('SELECT topic_name FROM topic WHERE topic_name = $1', [row.topic_name]);
        if (topicRes.rows.length === 0) {
            const insertTopicRes = await client.query('INSERT INTO topic(topic_name, subject_name) VALUES($1, $2) RETURNING topic_name', [row.topic_name, subject_name]);
            topic_name = insertTopicRes.rows[0].id;
        } else {
            topic_name = topicRes.rows[0].id;
        }

        // Check if approver exists, if not insert into approver table
        let approver_name;
        const approverRes = await client.query('SELECT id FROM approver WHERE approver_name = $1', [row.approver_name]);
        if (approverRes.rows.length === 0) {
            const insertApproverRes = await client.query('INSERT INTO approver(approver_name) VALUES($1) RETURNING approver_name', [row.approver_name]);
            approver_name = insertApproverRes.rows[0].id;
        } else {
            approver_name= approverRes.rows[0].id;
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
            [topic_name, sub_topic_name, row.question, options, opt_values, correct_options, selective_cnt, row.difficulty, row.explanation, row.reference, row.source, approver_name, subject_name]
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
