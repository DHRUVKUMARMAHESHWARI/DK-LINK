
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User, Link, Password, Event } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_secret_key_dev';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB:', err));


// --- Routes: Auth ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, isAuthenticated: true },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    
    res.json({
      user: { id: user._id, name: user.name, email: user.email, isAuthenticated: true },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Routes: Links ---

app.get('/api/links', auth, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/links', auth, async (req, res) => {
  try {
    const link = new Link({ ...req.body, userId: req.userId });
    await link.save();
    res.status(201).json(link);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/links/:id', auth, async (req, res) => {
  try {
    await Link.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Routes: Passwords ---

app.get('/api/passwords', auth, async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.userId });
    res.json(passwords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/passwords', auth, async (req, res) => {
  try {
    const password = new Password({ ...req.body, userId: req.userId });
    await password.save();
    res.status(201).json(password);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/passwords/:id', auth, async (req, res) => {
  try {
    await Password.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Routes: Events ---

app.get('/api/events', auth, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.userId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/events', auth, async (req, res) => {
  try {
    const event = new Event({ ...req.body, userId: req.userId });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/events/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/events/:id', auth, async (req, res) => {
  try {
    await Event.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
