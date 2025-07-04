require('dotenv').config();
const express = require('express');
const sequelize = require('./database');
const db = require('./models');
const User = db.User;
const Post = db.Post;
const Comment = db.Comment;
const Like = db.Like;
const { signup, login } = require('./controllers/auth');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/api/signup', signup);
app.post('/api/login', login);

// Posts
app.post('/api/posts', authenticate, async (req, res) => {
  try {
    const post = await Post.create({ 
      content: req.body.content,
      userId: req.userId
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ['id', 'username'] },
        { model: Comment, include: [User] },
        { model: Like, include: [User] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comments
app.post('/api/comments', authenticate, async (req, res) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      postId: req.body.postId,
      userId: req.userId
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Likes
app.post('/api/posts/:postId/like', authenticate, async (req, res) => {
  try {
    const [like, created] = await Like.findOrCreate({
      where: {
        userId: req.userId,
        postId: req.params.postId
      }
    });

    if (!created) {
      await like.destroy();
      return res.json({ liked: false });
    }
    res.json({ liked: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [
                { model: Post },
                { model: Comment, include: [Post] }
            ]
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync database and start server
db.sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});