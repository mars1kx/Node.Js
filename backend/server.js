const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, '../data');

app.use(cors());
app.use(express.json());

app.get('/articles', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const articles = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
        const article = JSON.parse(data);
        articles.push({
          id: article.id,
          title: article.title,
          createdAt: article.createdAt
        });
      }
    }

    articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(articles);
  } catch (err) {
    res.json([]);
  }
});

app.get('/articles/:id', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: 'Article not found' });
  }
});

app.post('/articles', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const id = Date.now().toString();
    const article = {
      id,
      title: title.trim(),
      content: content,
      createdAt: new Date().toISOString()
    };

    const filePath = path.join(DATA_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(article, null, 2));

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save article' });
  }
});

app.put('/articles/:id', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
    
    let article;
    try {
      const data = await fs.readFile(filePath, 'utf8');
      article = JSON.parse(data);
    } catch (err) {
      return res.status(404).json({ error: 'Article not found' });
    }

    article.title = title.trim();
    article.content = content;
    article.updatedAt = new Date().toISOString();

    await fs.writeFile(filePath, JSON.stringify(article, null, 2));
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/articles/:id', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
    
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await fs.unlink(filePath);
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

fs.mkdir(DATA_DIR, { recursive: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

