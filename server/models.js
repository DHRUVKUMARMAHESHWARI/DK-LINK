
const mongoose = require('mongoose');

// --- User Schema ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  createdAt: { type: Date, default: Date.now }
});

// --- Link Schema ---
const linkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Other' },
  tags: [String],
  clicks: { type: Number, default: 0 },
  createdAt: { type: Number, default: Date.now }
});

// --- Password Schema ---
const passwordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  site: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }, // In production, this should be encrypted field-level
  category: { type: String, default: 'Personal' },
  strength: { type: String, enum: ['Weak', 'Medium', 'Strong'], default: 'Medium' },
  lastUpdated: { type: Number, default: Date.now }
});

// --- Event Schema ---
const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: String, required: true }, // ISO String
  type: { type: String, enum: ['Meeting', 'Birthday', 'Deadline', 'Reminder'], default: 'Reminder' },
  completed: { type: Boolean, default: false }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Link: mongoose.model('Link', linkSchema),
  Password: mongoose.model('Password', passwordSchema),
  Event: mongoose.model('Event', eventSchema)
};
