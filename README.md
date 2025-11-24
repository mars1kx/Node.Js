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

## Database Setup

1. Install PostgreSQL on your system

2. Create a database:
```sql
CREATE DATABASE articles_db;
```

3. Copy env.example to .env and update with your database credentials:
```
cd backend
copy env.example .env
```

Edit `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=articles_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

4. Run migrations to create tables:
```
cd backend
npm run migrate
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
- `backend/server.js` - Express API server with 5 endpoints
- `backend/models/` - Sequelize models
- `backend/migrations/` - database migrations
- `backend/config/` - database configuration
- `backend/package.json` - backend dependencies

Frontend:
- `frontend/src/App.js` - main component with routing
- `frontend/src/components/ArticleList.js` - displays all articles
- `frontend/src/components/ArticleView.js` - shows single article with edit/delete
- `frontend/src/components/ArticleCreate.js` - form with WYSIWYG editor
- `frontend/src/components/ArticleEdit.js` - edit existing article

Database:
- PostgreSQL database with Sequelize ORM
- Articles stored in `articles` table

## Features

- View list of articles
- Read article content
- Create new articles with WYSIWYG editor
- Edit existing articles
- Delete articles with confirmation
- Upload attachments (images and PDFs)
- Real-time notifications via WebSocket
- Articles saved as JSON files

## API Endpoints

- GET /articles - get all articles
- GET /articles/:id - get single article
- POST /articles - create new article (with file upload)
- PUT /articles/:id - update article (with file upload)
- DELETE /articles/:id - delete article
- WebSocket - real-time notifications

## File Upload

- Supported formats: JPG, PNG, PDF
- Max file size: 5MB
- Multiple files per article
- Files stored in `uploads/` folder
