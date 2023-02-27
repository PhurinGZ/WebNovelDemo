const jwt = require('jsonwebtoken');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const novelRoute = express.Router();
const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: process.env.ALLOWED_METHODS.split(','),
  allowedHeaders: process.env.ALLOWED_HEADERS.split(',')
}));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Read novels
app.get('/novels', (req, res) => {
  connection.query('SELECT * FROM novel', (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

// Create novel
novelRoute.post('/novels', async (req, res) => {
  const { novel_name, novel_type_name, author_name, description, tag_name,img } = req.body;
  const newNovel = {
    novel_name,
    novel_type_name,
    author_name,
    description,
    tag_name,
    img,
  };
  try {
    const query = `INSERT INTO novel SET ?`;
    const result = await connection.query(query, newNovel);
    newNovel.novel_id = result.insertId;
    res.status(201).json(newNovel);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating novel');
  }
});

// Update novel
novelRoute.put('/novels/:id', (req, res) => {
  const id = req.params.id;
  const updatedNovel = req.body;
  connection.query('SELECT * FROM novel WHERE novel_id = ?', [id], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).json({ error: 'Novel not found' });
    } else {
      connection.query('UPDATE novel SET ? WHERE novel_id = ?', [updatedNovel, id], (err, result) => {
        if (err) throw err;
        res.status(200).json(updatedNovel);
      });
    }
  });
});

// Delete novel
novelRoute.delete('/novels/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM novel WHERE novel_id = ?', id, (err, result) => {
    if (err) throw err;
    if (result.affectedRows === 0) {
      res.status(404).send(`Novel with ID ${id} not found`);
    } else {
      res.status(200).send(`Novel with ID ${id} deleted`);
    }
  });
});


// Add a new chapter to the database
novelRoute.post('/chapters', (req, res) => {
  const { title, content, published_date, novel_id } = req.body;
  connection.promise().query(
    'INSERT INTO chapters (title, content, published_date, novel_id) VALUES (?, ?, ?, ?)',
    [title, content, published_date, novel_id]
  )
  .then(result => {
    res.status(201).send('Chapter added to the database!');
  })
  .catch(err => {
    console.log(err);
    res.status(500).send('Error adding chapter to the database!');
  });
});


// Get all novels by a specific author from the database
novelRoute.get('/novels/:author_id', (req, res) => {
  const author_id = req.params.author_id;
  const query = 'SELECT * FROM novel WHERE author_id = ?';
  connection.query(query, [author_id], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error getting novels from the database');
    } else {
      res.send(results);
    }
  });
});


// Get all comments for a specific chapter from the database
novelRoute.get('/comments/:chapter_id', (req, res) => {
  const chapter_id = req.params.chapter_id;
  const query = 'SELECT * FROM comment WHERE chapter_id = ?';
  connection.query(query, [chapter_id], (err, results) => {
      if (err) {
          res.status(500).send(err);
      } else {
          res.send(results);
      }
  });
});

// Get all comments for a specific chapter from the database
novelRoute.get('/chapters/:chapter_id/comments', (req, res) => {
  const chapter_id = req.params.chapter_id;
  const query = 'SELECT * FROM comment WHERE chapter_id = ?';
  connection.query(query, [chapter_id], (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving comments from database');
    } else {
      res.status(200).json(results);
    }
  });
});


// Add a new like to the database
novelRoute.post('/likes', (req, res) => {
  const { chapter_id, user_id } = req.body;
  const like = { chapter_id, user_id };
  const query = 'INSERT INTO likes (chapter_id, user_id) VALUES (?, ?)';
  connection.query(query, [like.chapter_id, like.user_id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error adding like');
    } else {
      like.like_id = results.insertId;
      res.status(201).json(like);
    }
  });
});


// Get all bookmarks for a specific user from the database
novelRoute.get('/bookmarks/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const query = 'SELECT * FROM bookmarks WHERE user_id = ?';
  try {
    const [results] = await connection.promise().query(query, [user_id]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching bookmarks for user');
  }
});



// Get a specific novel from the database by its ID
novelRoute.get('/novels/:novel_id', (req, res) => {
  const novel_id = req.params.novel_id;
  const query = 'SELECT * FROM novel WHERE novel_id = ?';
  connection.query(query, [novel_id], (err, results) => {
      if (err) {
          res.status(500).send(err);
      } else if (results.length === 0) {
          res.status(404).send('Novel not found');
      } else {
          res.send(results[0]);
      }
  });
});


// Delete a chapter from the database
novelRoute.delete('/chapters/:chapter_id', async (req, res) => {
  try {
    const chapter_id = req.params.chapter_id;
    const query = 'DELETE FROM chapters WHERE chapter_id = ?';
    const [result] = await connection.promise().query(query, [chapter_id]);
    if (result.affectedRows === 0) {
      res.status(404).send('Chapter not found');
    } else {
      res.status(200).send('Chapter deleted from the database!');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting chapter from the database');
  }
});


// Get all novels by a specific author from the database
novelRoute.get('/novels/:author_id', async (req, res) => {
  try {
    const author_id = req.params.author_id;
    const query = 'SELECT * FROM novel WHERE author_id = ?';
    const [results] = await connection.promise().query(query, [author_id]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching novels from the database');
  }
});



// Add a new tag to the database
novelRoute.post('/tags', (req, res) => {
  const tag = req.body;
  if (!tag || !tag.tag_name) {
    res.status(400).send('Tag name is required.');
    return;
  }
  const query = 'INSERT INTO tags (tag_name) VALUES (?)';
  connection.query(query, [tag.tag_name], (err, results) => {
      if (err) {
          res.status(500).send(err);
      } else {
          res.status(201).send('Tag added to the database!');
      }
  });
});



// Get all novels by a specific tag from the database
novelRoute.get('/novels/tag/:tag_id', async (req, res) => {
  try {
    const tag_id = req.params.tag_id;
    const query = 'SELECT * FROM novel WHERE tag_id = ?';
    const [results] = await connection.promise().query(query, [tag_id]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching novels by tag');
  }
});



// Add a new bookmark to the database
novelRoute.post('/bookmarks', async (req, res) => {
  try {
    const bookmark = req.body;
    const query = 'INSERT INTO bookmarks (chapter_id, user_id) VALUES (?, ?)';
    const result = await connection.promise().query(query, [bookmark.chapter_id, bookmark.user_id]);
    bookmark.bookmark_id = result[0].insertId;
    res.json(bookmark);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to add bookmark' });
  }
});


// Get all likes for a specific user
novelRoute.get('/likes/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const query = 'SELECT * FROM likes WHERE user_id = ?';
  connection.query(query, [user_id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Unable to get likes' });
    } else {
      res.json(results);
    }
  });
});

// Get all novels for a specific category
novelRoute.get('/novels/category/:category_id', async (req, res) => {
  try {
    const category_id = req.params.category_id;
    const query = 'SELECT * FROM novel WHERE novel_type_id = ?';
    const [results] = await connection.promise().query(query, [category_id]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to get novels by category' });
  }
});


// Get all chapters for a specific novel from the database
novelRoute.get('/novels/:novel_id/chapters', async (req, res) => {
  try {
    const novel_id = req.params.novel_id;
    const query = 'SELECT * FROM chapters WHERE novel_id = ?';
    const [results] = await connection.promise().query(query, [novel_id]);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving chapters from database');
  }
});


novelRoute.post('/comments', async (req, res) => {
  try {
    const { rating, comment, chapter_id } = req.body;
    const query = 'INSERT INTO comment (rating, comment, chapter_id) VALUES (?, ?, ?)';
    const result = await connection.query(query, [rating, comment, chapter_id]);
    const comment_id = result.insertId;
    res.status(201).json({ comment_id, rating, comment, chapter_id });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update an existing comment in the database
novelRoute.put('/comments/:comment_id', (req, res) => {
  const { comment_id } = req.params;
  const { rating, comment } = req.body;
  const query = `UPDATE comment SET rating = ?, comment = ? WHERE comment_id = ?`;
  connection.query(query, [rating, comment, comment_id], (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.json({ comment_id, rating, comment });
    }
  });
});


// Delete a bookmark from the database
novelRoute.delete('/bookmarks/:bookmark_id', (req, res) => {
  const bookmark_id = req.params.bookmark_id;
  const query = 'DELETE FROM bookmarks WHERE bookmark_id = ?';
  connection.query(query, [bookmark_id], (err, result) => {
      if (err) {
          res.status(500).json({error: err});
      } else {
          res.status(200).json({message: "Bookmark deleted successfully."});
      }
  });
});

// Last optnize

// Get all likes for a specific chapter from the database
novelRoute.get('/likes/:chapter_id', (req, res) => {
  const chapter_id = req.params.chapter_id;
  const query = 'SELECT * FROM likes WHERE chapter_id = ?';
  connection.query(query, [chapter_id], (err, results) => {
      if (err) {
          res.status(500).json({error: err});
      } else {
          res.status(200).json(results);
      }
  });
});

// Delete a like from the database
novelRoute.delete('/likes/:like_id', (req, res) => {
  const like_id = req.params.like_id;
  const query = 'DELETE FROM likes WHERE like_id = ?';
  connection.query(query, [like_id], (err, result) => {
      if (err) {
          res.status(500).json({error: err});
      } else {
          res.status(200).json({message: "Like deleted successfully."});
      }
  });
});

// Update a chapter in the database
novelRoute.put('/chapters/:chapter_id', (req, res) => {
  const chapter_id = req.params.chapter_id;
  const chapter = req.body;
  const query = 'UPDATE chapters SET title = ?, content = ? WHERE chapter_id = ?';
  connection.query(query, [chapter.title, chapter.content, chapter_id], (err, result) => {
      if (err) {
          res.status(500).send('Error updating chapter in database.');
      } else if (result.affectedRows === 0) {
          res.status(404).send('Chapter not found.');
      } else {
          res.status(200).send('Chapter updated successfully.');
      }
  });
});

// Search for novels in the database based on a keyword
novelRoute.get('/novels/search', (req, res) => {
  const keyword = req.query.keyword;
  const searchKeyword = '%' + keyword + '%';

  const query = 'SELECT * FROM novel WHERE novel_name LIKE ? OR description LIKE ?';
  pool.query(query, [searchKeyword, searchKeyword], (err, results) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).json(results);
    }
  });
});

// Get all reviews for a specific chapter from the database
novelRoute.get('/chapters/:chapter_id/reviews', (req, res) => {
  const chapter_id = req.params.chapter_id;
  const query = 'SELECT * FROM comment WHERE chapter_id = ?';
  connection.query(query, [chapter_id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(results);
    }
  });
});

// Add a new review to the database
novelRoute.post('/chapters/:chapter_id/reviews', (req, res) => {
  const chapter_id = req.params.chapter_id;
  const { rating, comment } = req.body;
  const review = { rating, comment, chapter_id };
  const query = 'INSERT INTO comment (rating, comment, chapter_id) VALUES (?, ?, ?)';
  connection.query(query, [review.rating, review.comment, review.chapter_id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      review.comment_id = result.insertId;
      res.status(201).send(review);
    }
  });
});

// Update a review in the database
novelRoute.put('/chapters/:chapter_id/reviews/:review_id', (req, res) => {
  const review_id = req.params.review_id;
  const { rating, comment } = req.body;
  const review = { rating, comment, comment_id: review_id };
  const query = 'UPDATE comment SET rating = ?, comment = ? WHERE comment_id = ?';
  connection.query(query, [review.rating, review.comment, review.comment_id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(`Review ${review_id} updated successfully`);
    }
  });
});

// Delete a review from the database
novelRoute.delete('/chapters/:chapter_id/reviews/:review_id', (req, res) => {
  const review_id = req.params.review_id;
  const query = 'DELETE FROM comment WHERE comment_id = ?';
  connection.query(query, [review_id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(`Review ${review_id} deleted successfully`);
    }
  });
});




module.exports = novelRoute;