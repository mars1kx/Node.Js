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

## Roles

All registered users are assigned the regular `user` role by default. To create an admin user, you can either:

1. **Update role directly in the database:**
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   ```

2. **Create a seed file** in `backend/seeders/` to initialize admin users.

Admins have additional privileges including user management capabilities and the ability to edit any article.

## Files

Backend (Modular Architecture):
- `backend/server.js` - Main Express server (WebSocket, routes setup)
- `backend/routes/` - API route definitions
  - `articles.js` - Article and article comments routes
  - `comments.js` - Comment CRUD routes
  - `workspaces.js` - Workspace routes
- `backend/controllers/` - Business logic controllers
  - `articleController.js` - Article operations (CRUD)
  - `commentController.js` - Comment operations (CRUD)
  - `workspaceController.js` - Workspace operations
- `backend/middleware/` - Custom middleware
  - `upload.js` - Multer file upload configuration
- `backend/models/` - Sequelize models (Article, Comment, Workspace)
- `backend/migrations/` - Database migrations
- `backend/config/` - Database configuration
- `backend/package.json` - Backend dependencies

Frontend:
- `frontend/src/App.js` - main component with routing
- `frontend/src/components/ArticleList.js` - displays all articles
- `frontend/src/components/ArticleView.js` - shows single article with comments
- `frontend/src/components/ArticleCreate.js` - form with WYSIWYG editor
- `frontend/src/components/ArticleEdit.js` - edit existing article

Database:
- PostgreSQL database with Sequelize ORM
- Articles, Comments, and Workspaces stored in database tables

## Features

- **JWT Authentication** - secure login and registration
- View list of articles
- Read article content
- Create new articles with WYSIWYG editor
- Edit existing articles (creates new version)
- Delete articles with confirmation
- Upload attachments (images and PDFs)
- Real-time notifications via WebSocket
- Workspaces - organize articles into workspaces
- Comments - full CRUD operations (Create, Read, Update, Delete)
- Article Versioning - track changes, view history

## API Endpoints

Authentication:
- POST /auth/register - register new user (email + password)
- POST /auth/login - login and receive JWT token

All endpoints below require valid JWT token in Authorization header:
`Authorization: Bearer <token>`

Articles:
- GET /articles - get all articles (latest versions only, with optional ?workspaceId filter)
- GET /articles/:id - get single article with comments
- POST /articles - create new article (with file upload and workspace)
- PUT /articles/:id - update article (creates new version with file upload)
- DELETE /articles/:id - delete article
- GET /articles/:id/versions - get version history for article
- GET /articles/:id/versions/:versionId - get specific version of article

Workspaces:
- GET /workspaces - get all workspaces

Comments:
- GET /articles/:id/comments - get comments for article
- POST /articles/:id/comments - add comment to article
- PUT /comments/:id - update comment (author and text)
- DELETE /comments/:id - delete comment

WebSocket:
- Real-time notifications for article/comment changes

## File Upload

- Supported formats: JPG, PNG, PDF
- Max file size: 5MB
- Multiple files per article
- Files stored in `uploads/` folder

## Article Versioning

- Each article update creates a new version instead of overwriting
- Version history accessible via "📋 View History" button
- Old versions are read-only (cannot edit or add comments)
- Yellow banner indicates when viewing an old version
- Database tracks: version number, originalArticleId, isLatest flag
- Comments are tied to the original article, visible in all versions
