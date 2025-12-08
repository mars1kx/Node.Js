const db = require('../models');
const fs = require('fs').promises;
const path = require('path');
const { UPLOAD_DIR } = require('../middleware/upload');

const getAllArticles = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const where = workspaceId ? { workspaceId } : {};
    
    const articles = await db.Article.findAll({
      where,
      attributes: ['id', 'title', 'createdAt', 'workspaceId'],
      order: [['createdAt', 'DESC']]
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await db.Article.findByPk(req.params.id, {
      include: [{
        model: db.Comment,
        as: 'comments',
        order: [['createdAt', 'ASC']]
      }]
    });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

const createArticle = async (req, res) => {
  const { title, content, workspaceId } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype
    })) : [];

    const article = await db.Article.create({
      title: title.trim(),
      content: content,
      attachments: attachments,
      workspaceId: workspaceId || null
    });

    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'article_created',
        article: { id: article.id, title: article.title }
      });
    }

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save article' });
  }
};

const updateArticle = async (req, res) => {
  const { title, content, removedFiles } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const article = await db.Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    article.title = title.trim();
    article.content = content;

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
      article.attachments = article.attachments.filter(
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
      article.attachments = [...article.attachments, ...newAttachments];
    }

    await article.save();

    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'article_updated',
        article: { id: article.id, title: article.title }
      });
    }

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update article' });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const article = await db.Article.findByPk(req.params.id);
    if (!article) {
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

    await article.destroy();
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};

