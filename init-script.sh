#!/bin/bash
# =====================================
# 🚀 Project-X-Web CTF Platform Setup Script
# Node.js + Express + MongoDB (MERN base)
# =====================================

echo "⚙️  Setting up Project-X-Web CTF Platform..."
sleep 1

# Create main structure
mkdir -p Project-X-Web-ctf/backend/src/{config,controllers,models,routes,middlewares,utils} Project-X-Web-ctf/frontend
cd Project-X-Web-ctf/backend || exit

# Initialize backend
npm init -y >/dev/null 2>&1
npm install express mongoose bcryptjs jsonwebtoken dotenv cors >/dev/null 2>&1
npm install --save-dev nodemon >/dev/null 2>&1

# Create .env
cat <<EOF > .env
MONGO_URI=mongodb://localhost:27017/Project-X-Web_ctf
JWT_SECRET=supersecretkey
PORT=5000
EOF

# Create server.js
cat <<'EOF' > server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import challengeRoutes from './src/routes/challengeRoutes.js';
import leaderboardRoutes from './src/routes/leaderboardRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => res.send('🔥 Project-X-Web CTF API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
EOF

# Database config
cat <<'EOF' > src/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
EOF

# User model
cat <<'EOF' > src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  score: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model('User', userSchema);
EOF

# Challenge model
cat <<'EOF' > src/models/Challenge.js
import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  flag: String,
  points: Number,
});

export default mongoose.model('Challenge', challengeSchema);
EOF

# Auth controller
cat <<'EOF' > src/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    res.json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
EOF

# Challenge controller
cat <<'EOF' > src/controllers/challengeController.js
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';

export const getChallenges = async (req, res) => {
  const challenges = await Challenge.find().select('-flag');
  res.json(challenges);
};

export const submitFlag = async (req, res) => {
  const { userId, challengeId, submittedFlag } = req.body;
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

  if (submittedFlag === challenge.flag) {
    await User.findByIdAndUpdate(userId, { $inc: { score: challenge.points } });
    res.json({ message: '✅ Correct flag! Points awarded.' });
  } else {
    res.status(400).json({ message: '❌ Incorrect flag.' });
  }
};
EOF

# Leaderboard controller
cat <<'EOF' > src/controllers/leaderboardController.js
import User from '../models/User.js';

export const getLeaderboard = async (req, res) => {
  const leaderboard = await User.find().sort({ score: -1 }).limit(20);
  res.json(leaderboard);
};
EOF

# Auth routes
cat <<'EOF' > src/routes/authRoutes.js
import express from 'express';
import { register, login } from '../controllers/authController.js';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
export default router;
EOF

# Challenge routes
cat <<'EOF' > src/routes/challengeRoutes.js
import express from 'express';
import { getChallenges, submitFlag } from '../controllers/challengeController.js';
const router = express.Router();
router.get('/', getChallenges);
router.post('/submit', submitFlag);
export default router;
EOF

# Leaderboard routes
cat <<'EOF' > src/routes/leaderboardRoutes.js
import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
const router = express.Router();
router.get('/', getLeaderboard);
export default router;
EOF

# Update package.json
npx json -I -f package.json -e 'this.type="module"; this.scripts={start:"node server.js",dev:"nodemon server.js"}'

cd ..

# Create frontend placeholder
cd ../frontend || exit
npx create-react-app . >/dev/null 2>&1

echo "⚙️  Setting up frontend..."
npm install axios react-router-dom >/dev/null 2>&1

# Done
cd ..
echo ""
echo "🎉 Project-X-Web CTF Platform setup complete!"
echo ""
echo "To run backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Backend API: http://localhost:5000"
echo "MongoDB URI: mongodb://localhost:27017/Project-X-Web_ctf"
echo ""
echo "Now you can start building your frontend dashboard at Project-X-Web-ctf/frontend/"
echo "🔥 Happy hacking!"
