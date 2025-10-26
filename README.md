# Articles App

full-stack app for managing articles

## Setup

Install dependencies:
```
cd backend
npm install

cd frontend
npm install
```

## Run

Start backend (port 3001):
```
cd backend
npm start
```

Start frontend (port 3000) in another terminal:
```
cd frontend
npm start
```

Open in browser http://localhost:3000

## Files

Backend:
- `backend/server.js` - Express API server with 3 endpoints
- `backend/package.json` - backend dependencies

Frontend:
- `frontend/src/App.js` - main component with routing
- `frontend/src/components/ArticleList.js` - displays all articles
- `frontend/src/components/ArticleView.js` - shows single article
- `frontend/src/components/ArticleCreate.js` - form with WYSIWYG editor

Data:
- `data/` - articles saved as JSON files

## Features

- View list of articles
- Read article content
- Create new articles with WYSIWYG editor
- Articles saved as JSON files
