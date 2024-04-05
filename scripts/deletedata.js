const { Client } = require('pg');

// Changed from 'export default async function' to module.exports
module.exports = async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false, // Only needed if using self-signed certificate
    },
  });

  try {
    await client.connect();

    // Delete from sub_topic
    const subTopicQuery = `
        DELETE FROM sub_topic
        WHERE sub_topic.subject_name IN (
            SELECT subject_name FROM subject
        )
        AND sub_topic.topic_name IN (
            SELECT topic_name FROM topic
            WHERE topic.subject_name IN (
                SELECT subject_name FROM subject
            )
        );
    `;
    await client.query(subTopicQuery);

    // Delete from topic
    const topicQuery = `
        DELETE FROM topic
        WHERE topic.subject_name IN (
            SELECT subject_name FROM subject
        );
    `;
    await client.query(topicQuery);

    // Delete from subject
    const subjectQuery = `DELETE FROM subject;`;
    await client.query(subjectQuery);

    if (res) {
      res.status(200).json({ message: 'Data deleted successfully' });
    } else {
      console.log('Data deleted successfully');
    }
  } catch (error) {
    console.error('Error executing queries:', error);
    if (res) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.error('Internal server error');
    }
  } finally {
    await client.end();
  }
};