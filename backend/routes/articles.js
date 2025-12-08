const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const commentController = require('../controllers/commentController');
const { upload } = require('../middleware/upload');

router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);
router.post('/', upload.array('files', 5), articleController.createArticle);
router.put('/:id', upload.array('files', 5), articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

router.get('/:id/versions', articleController.getArticleVersions);
router.get('/:id/versions/:versionId', articleController.getArticleVersion);

router.get('/:id/comments', commentController.getCommentsByArticleId);
router.post('/:id/comments', commentController.createComment);

module.exports = router;

