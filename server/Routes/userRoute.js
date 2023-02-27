const jwt = require('jsonwebtoken');
const express = require('express');
const mysql2 = require('mysql2/promise');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);


const userRoute = express.Router();

// Enable CORS
userRoute.use(cors());

userRoute.use(express.json());

// Parse JSON request body
userRoute.use(bodyParser.json());


// connection to mysql
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "web_novel",
});

// Check database connect 
db.connect((err) => {
  if (err) {
      console.log(err);
  } else {
      console.log("Connected to database");
  }
});

// Connect to MySQL database
const pool = mysql2.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'web_novel'
});
//session sql
const sessionStore = new MySQLStore({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'web_novel',
});
//session middleware
userRoute.use(session({
  secret: 'BAT',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
}));

// Handle login request
userRoute.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if userRoute exists in database
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

  if (rows.length === 0) {
      res.status(401).json({ message: 'Invalid email or password' });
  } else {
      const user = rows[0];
      const token = jwt.sign({ sub: user.id }, 'bbl', { expiresIn: '1h' });

      // Create session and store the token
      req.session.token = token;
      req.session.userRoute = user;

      res.json({ user, token });
  }
});

//protected routes to check for a valid session
userRoute.get('/protected', (req, res) => {
  const token = req.session.token;
  const user = req.session.user;

  // Check for a valid session
  if (user && token) {
    // Send protected data
    res.json({ message: `Welcome ${user.username}! This is a protected page.` });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});



// Handle register request
userRoute.post("/register", (req, res) => {
    const { user_name, email, password } = req.body;
    const sqlInsert =
      "INSERT INTO userRoutes (user_name, email, password) VALUES (?, ?, ?)";
    db.query(sqlInsert, [user_name, email, password], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error registering user");
      } else {
        console.log(result);
        res.status(200).send("user registered successfully");
      }
    });
  });


  // Update a user's information in the database
  userRoute.put('/users/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { user_name, email, password } = req.body;
  
    const query = 'UPDATE users SET user_name = ?, email = ?, password = ? WHERE user_id = ?';
    connection.query(query, [user_name, email, password, user_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error updating user in database');
      } else {
        console.log('User updated in the database!');
        res.send('User updated in the database!');
      }
    });
  });
  

module.exports = userRoute;
