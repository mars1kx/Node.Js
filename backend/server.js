const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3001;
const DATA_DIR = path.join(__dirname, '../data');
const UPLOAD_DIR = path.join(__dirname, '../uploads');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and PDF files allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

app.use('/uploads', express.static(UPLOAD_DIR));

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

app.post('/articles', upload.array('files', 5), async (req, res) => {
  const { title, content } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const id = Date.now().toString();
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype
    })) : [];

    const article = {
      id,
      title: title.trim(),
      content: content,
      attachments: attachments,
      createdAt: new Date().toISOString()
    };

    const filePath = path.join(DATA_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(article, null, 2));

    broadcast({
      type: 'article_created',
      article: { id: article.id, title: article.title }
    });

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save article' });
  }
});

app.put('/articles/:id', upload.array('files', 5), async (req, res) => {
  const { title, content, removedFiles } = req.body;

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

    if (removedFiles) {
      const filesToRemove = JSON.parse(removedFiles);
      for (const filename of filesToRemove) {
        const uploadPath = path.join(UPLOAD_DIR, filename);
        try {
          await fs.unlink(uploadPath);
        } catch (err) {
          console.error(`Failed to delete file: ${filename}`);
        }
      }
      article.attachments = (article.attachments || []).filter(
        file => !filesToRemove.includes(file.filename)
      );
    }

    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype
      }));
      article.attachments = [...(article.attachments || []), ...newAttachments];
    }

    await fs.writeFile(filePath, JSON.stringify(article, null, 2));

    broadcast({
      type: 'article_updated',
      article: { id: article.id, title: article.title }
    });

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/articles/:id', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
    
    let article;
    try {
      const data = await fs.readFile(filePath, 'utf8');
      article = JSON.parse(data);
    } catch (err) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.attachments && article.attachments.length > 0) {
      for (const file of article.attachments) {
        const uploadPath = path.join(UPLOAD_DIR, file.filename);
        try {
          await fs.unlink(uploadPath);
        } catch (err) {
          console.error(`Failed to delete file: ${file.filename}`);
        }
      }
    }

    await fs.unlink(filePath);
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

Promise.all([
  fs.mkdir(DATA_DIR, { recursive: true }),
  fs.mkdir(UPLOAD_DIR, { recursive: true })
]).then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket running on ws://localhost:${PORT}`);
  });
});

