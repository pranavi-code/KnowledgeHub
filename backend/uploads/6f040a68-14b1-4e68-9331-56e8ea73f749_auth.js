
/*
const express = require('express');
//const verifyToken = require('../middlewares/authMiddleware');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.get('/admin.html', verifyToken, (req, res) => {
  if (req.user.role === 'admin') {
      res.json({ message: 'Welcome to the Admin Dashboard' });
  } else {
      res.status(403).json({ message: 'Access denied, admin only' });
  }
});


router.post('/register', register);

// Login Route
router.post('/login', login2);

module.exports = router;
*/

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

app.use(bodyParser.json());

// Mock database
const users = [
  { username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { username: 'user1', password: bcrypt.hashSync('user123', 10), role: 'user' },
];

// JWT secret
const SECRET_KEY = 'mysecretkey';

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { username, password, role = 'user' } = req.body;

  // Check if user already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Hash password and save user
  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashedPassword, role });
  res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Validate password
  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  // Generate token and include role
  const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful', token, role: user.role });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



