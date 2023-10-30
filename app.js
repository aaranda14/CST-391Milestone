// Import necessary libraries and modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Set up the MySQL connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'ecohub',
  connectionLimit: 10,
});

// Test the MySQL connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

// Create an article
app.post('/articles', (req, res) => {
  const { title, content } = req.body;
  const sql = 'INSERT INTO articles (Title, Content) VALUES (?, ?)';
  db.query(sql, [title, content], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const newArticle = { id: results.insertId, title, content };
      res.status(201).json(newArticle);
    }
  });
});

// Read all articles
app.get('/articles', (req, res) => {
  const sql = 'SELECT * FROM articles';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  });
});

// Read a specific article
app.get('/articles/:id', (req, res) => {
  const articleId = req.params.id;
  const sql = 'SELECT * FROM articles WHERE ArticleID = ?'; // Assuming 'ArticleID' is the correct column name
  db.query(sql, [articleId], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).send('Internal Server Error');
    } else if (results.length === 0) {
      res.status(404).send('Article not found');
    } else {
      res.json(results[0]);
    }
  });
});

// Update an article
app.put('/articles/:id', (req, res) => {
  const articleId = req.params.id;
  const { title, content } = req.body;
  const sql = 'UPDATE articles SET Title = ?, Content = ? WHERE ArticleID = ?'; // Assuming 'ArticleID' is the correct column name
  db.query(sql, [title, content, articleId], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).send('Internal Server Error');
    } else if (results.affectedRows === 0) {
      res.status(404).send('Article not found');
    } else {
      res.json({ id: articleId, title, content });
    }
  });
});

// Delete an article
app.delete('/articles/:id', (req, res) => {
  const articleId = req.params.id;
  const sql = 'DELETE FROM articles WHERE ArticleID = ?'; // Assuming 'ArticleID' is the correct column name
  db.query(sql, [articleId], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).send('Internal Server Error');
    } else if (results.affectedRows === 0) {
      res.status(404).send('Article not found');
    } else {
      res.json({ id: articleId });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
