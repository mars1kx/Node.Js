const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const commentController = require('../controllers/commentController');
const { upload } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, articleController.getAllArticles);
router.get('/:id', authenticateToken, articleController.getArticleById);
router.post('/', authenticateToken, upload.array('files', 5), articleController.createArticle);
router.put('/:id', authenticateToken, upload.array('files', 5), articleController.updateArticle);
router.delete('/:id', authenticateToken, articleController.deleteArticle);

router.get('/:id/versions', authenticateToken, articleController.getArticleVersions);
router.get('/:id/versions/:versionId', authenticateToken, articleController.getArticleVersion);

router.get('/:id/export/pdf', authenticateToken, articleController.exportToPdf);

router.get('/:id/comments', authenticateToken, commentController.getCommentsByArticleId);
router.post('/:id/comments', authenticateToken, commentController.createComment);

module.exports = router;

