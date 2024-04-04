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
        topic_name VARCHAR(255),
        subject_name VARCHAR(255) REFERENCES subject(subject_name)
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
        subject_name VARCHAR(255) REFERENCES subject(subject_name),
        topic_name VARCHAR(255), REFERENCES topic(topic_name),
        sub_topic_name VARCHAR(255),
      
      );

      CREATE TABLE IF NOT EXISTS approver (
        id SERIAL PRIMARY KEY,
        approver_name VARCHAR(255),
        designation VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS question (
        question_id SERIAL PRIMARY KEY,
        subject_name VARCHAR(255) REFERENCES subject(subject_name),
        topic_name VARCHAR(255) REFERENCES topic(topic_name),
        sub_topic_name VARCHAR(255) REFERENCES sub_topic(sub_topic_name),
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

      // Continue with the rest of your table creations...
    `);

    console.log('Tables created and modified successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}