import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mysql, { OkPacket } from 'mysql2';

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'ecohub',
  connectionLimit: 10,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

app.post('/articles', (req: Request, res: Response) => {
  const { title, content } = req.body;
  const sql = 'INSERT INTO articles (Title, Content) VALUES (?, ?)';
  db.query(sql, [title, content], (err, results: OkPacket) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const newArticle = { id: results.insertId, title, content };
      res.status(201).json(newArticle);
    }
  });
});

app.put('/articles/:id', (req: Request, res: Response) => {
  const articleId = req.params.id;
  const { title, content } = req.body;
  const sql = 'UPDATE articles SET Title = ?, Content = ? WHERE ArticleID = ?';
  db.query(sql, [title, content, articleId], (err, results: OkPacket) => {
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

app.delete('/articles/:id', (req: Request, res: Response) => {
  const articleId = req.params.id;
  const sql = 'DELETE FROM articles WHERE ArticleID = ?';
  db.query(sql, [articleId], (err, results: OkPacket) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
