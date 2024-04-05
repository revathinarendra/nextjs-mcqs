
const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');






const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seed() {
  try {
    await client.connect();

    // Create tables in the correct order
    await client.query(`
      CREATE TABLE IF NOT EXISTS subject (
        subject_name VARCHAR(255) PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS topic (
        id SERIAL PRIMARY KEY,
        topic_name VARCHAR(255) UNIQUE 
      );

      CREATE TABLE IF NOT EXISTS profession (
        id SERIAL PRIMARY KEY,
        profession_name VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS referred_by (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS user_data (
        user_id SERIAL PRIMARY KEY,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email_id VARCHAR(255),
        phone_number VARCHAR(255),
        country_code VARCHAR(255),
        gender VARCHAR(255),
        age INT,
        password VARCHAR(255),
        profession_id INT REFERENCES profession(id),
        referred_by_id INT REFERENCES referred_by(id),
        profile_pic BYTEA,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sub_topic (
        id SERIAL PRIMARY KEY,
        topic_id INT REFERENCES topic(id), -- Changed topic_Iid to id
        sub_topic_name VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS approver (
        id SERIAL PRIMARY KEY,
        approver_name VARCHAR(255),
        designation VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS question (
        question_id SERIAL PRIMARY KEY,
        topic_id INT REFERENCES topic(id), -- Changed topic_id to id
        sub_topic_id INT REFERENCES sub_topic(id), -- Changed sub_topic_id to id
        question TEXT,
        options TEXT[],
        opt_values TEXT[],
        correct_options BOOLEAN[],
        selective_cnt VARCHAR(255),
        difficulty VARCHAR(255),
        explanation TEXT,
        reference TEXT,
        source TEXT,
        approver_id INT REFERENCES approver(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        visibility_flag BOOLEAN
      );
    `);

    // Modify 'topic' table
    await client.query(`
    ALTER TABLE topic ADD CONSTRAINT topic_name_unique UNIQUE (topic_name);
      ALTER TABLE topic ADD COLUMN IF NOT EXISTS subject_name VARCHAR(255) REFERENCES subject(subject_name);
      
    `);

    // Modify the 'sub_topic' table
    await client.query(`
      ALTER TABLE sub_topic DROP COLUMN IF EXISTS topic_id; -- Only if you're sure it's safe to remove
      ALTER TABLE sub_topic ADD COLUMN IF NOT EXISTS topic_name VARCHAR(255) REFERENCES topic(topic_name);
      ALTER TABLE sub_topic ADD COLUMN IF NOT EXISTS subject_name VARCHAR(255) REFERENCES subject(subject_name);
      
      
    `);

    // Modify the 'question' table
    await client.query(`
      ALTER TABLE question DROP COLUMN IF EXISTS topic_id; -- Only if you're sure it's safe to remove
      ALTER TABLE question DROP COLUMN IF EXISTS sub_topic_id; -- Only if you're sure it's safe to remove
      ALTER TABLE question ADD COLUMN IF NOT EXISTS subject_name VARCHAR(255) REFERENCES subject(subject_name);
      ALTER TABLE question ADD COLUMN IF NOT EXISTS topic_name VARCHAR(255) REFERENCES topic(topic_name);
      ALTER TABLE question ADD COLUMN IF NOT EXISTS sub_topic_name VARCHAR(255) REFERENCES sub_topic(sub_topic_name);
      
    `);

    console.log('Tables created and modified successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}

seed();
async function seedData() {
  try {
    // Read the CSV file and seed data into the table
    fs.createReadStream('subject.csv')
      .pipe(csv())
      .on('data', async (row) => {
        await client.query('INSERT INTO subject (name, description) VALUES ($1, $2)', [row.name, row.description]);
      })
      .on('end', () => {
        console.log('Data seeded successfully');
        client.end(); // Close the database connection
      });
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}