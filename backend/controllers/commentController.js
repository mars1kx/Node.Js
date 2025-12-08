const db = require('../models');

const getCommentsByArticleId = async (req, res) => {
  try {
    const comments = await db.Comment.findAll({
      where: { articleId: req.params.id },
      order: [['createdAt', 'ASC']]
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

const createComment = async (req, res) => {
  const { author, text } = req.body;

  if (!author || !author.trim()) {
    return res.status(400).json({ error: 'Author is required' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const article = await db.Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const comment = await db.Comment.create({
      articleId: req.params.id,
      author: author.trim(),
      text: text.trim()
    });

    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'comment_added',
        articleId: req.params.id,
        comment: comment
      });
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

const updateComment = async (req, res) => {
  const { author, text } = req.body;

  if (!author || !author.trim()) {
    return res.status(400).json({ error: 'Author is required' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const comment = await db.Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.author = author.trim();
    comment.text = text.trim();
    await comment.save();

    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'comment_updated',
        comment: comment
      });
    }

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await db.Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = {
  getCommentsByArticleId,
  createComment,
  updateComment,
  deleteComment
};

