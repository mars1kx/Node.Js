const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const WebSocket = require('ws');
const http = require('http');
const db = require('./models');
const { UPLOAD_DIR } = require('./middleware/upload');

const articlesRouter = require('./routes/articles');
const commentsRouter = require('./routes/comments');
const workspacesRouter = require('./routes/workspaces');
const authRouter = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New WebSocket connection');
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket connection closed');
  });
});

function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

app.locals.broadcast = broadcast;

app.use('/auth', authRouter);
app.use('/articles', articlesRouter);
app.use('/comments', commentsRouter);
app.use('/workspaces', workspacesRouter);

fs.mkdir(UPLOAD_DIR, { recursive: true }).then(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');
    
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`WebSocket running on ws://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to connect to database:', err);
  }
});

