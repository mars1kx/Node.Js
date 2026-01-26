const db = require('../models');
const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');
const { UPLOAD_DIR } = require('../middleware/upload');
const PDFDocument = require('pdfkit');

const getAllArticles = async (req, res) => {
  try {
    const { workspaceId, search } = req.query;
    
    const where = { isLatest: true };
    
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }
    
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: searchTerm } },
        { content: { [Op.like]: searchTerm } }
      ];
    }
    
    const articles = await db.Article.findAll({
      where,
      attributes: ['id', 'title', 'createdAt', 'workspaceId', 'version'],
      order: [['createdAt', 'DESC']]
    });
    res.json(articles);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await db.Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const originalId = article.originalArticleId || article.id;

    const comments = await db.Comment.findAll({
      where: { originalArticleId: originalId },
      order: [['createdAt', 'ASC']]
    });

    const articleWithComments = article.toJSON();
    articleWithComments.comments = comments;

    res.json(articleWithComments);
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
      workspaceId: workspaceId || null,
      version: 1,
      isLatest: true,
      originalArticleId: null,
      authorId: req.user.id
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
    const currentArticle = await db.Article.findByPk(req.params.id);
    if (!currentArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (!currentArticle.isLatest) {
      return res.status(400).json({ error: 'Cannot edit old version. Please edit the latest version.' });
    }

    if (currentArticle.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to edit this article' });
    }

    const originalId = currentArticle.originalArticleId || currentArticle.id;

    await currentArticle.update({ isLatest: false });

    let attachments = [...currentArticle.attachments];

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
      attachments = attachments.filter(
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
      attachments = [...attachments, ...newAttachments];
    }

    const newVersion = await db.Article.create({
      title: title.trim(),
      content: content,
      attachments: attachments,
      workspaceId: currentArticle.workspaceId,
      version: currentArticle.version + 1,
      originalArticleId: originalId,
      isLatest: true,
      authorId: currentArticle.authorId
    });

    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({
        type: 'article_updated',
        article: { id: newVersion.id, title: newVersion.title, version: newVersion.version }
      });
    }

    res.json(newVersion);
  } catch (err) {
    console.error(err);
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

const getArticleVersions = async (req, res) => {
  try {
    const article = await db.Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const originalId = article.originalArticleId || article.id;

    const versions = await db.Article.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { id: originalId },
          { originalArticleId: originalId }
        ]
      },
      attributes: ['id', 'title', 'version', 'createdAt', 'updatedAt', 'isLatest'],
      order: [['version', 'DESC']]
    });

    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article versions' });
  }
};

const getArticleVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    
    const article = await db.Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const versionArticle = await db.Article.findByPk(versionId);

    if (!versionArticle) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const originalId = article.originalArticleId || article.id;
    const versionOriginalId = versionArticle.originalArticleId || versionArticle.id;

    if (originalId !== versionOriginalId) {
      return res.status(400).json({ error: 'Version does not belong to this article' });
    }

    const comments = await db.Comment.findAll({
      where: { originalArticleId: originalId },
      order: [['createdAt', 'ASC']]
    });

    const versionWithComments = versionArticle.toJSON();
    versionWithComments.comments = comments;

    res.json(versionWithComments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article version' });
  }
};

const stripHtmlTags = (html) => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const exportToPdf = async (req, res) => {
  try {
    const article = await db.Article.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['email']
        }
      ]
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 72,
        bottom: 72,
        left: 72,
        right: 72
      },
      bufferPages: true
    });

    const filename = `article-${article.id}-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc
      .strokeColor('#007bff')
      .lineWidth(3)
      .moveTo(72, 50)
      .lineTo(523, 50)
      .stroke();

    doc
      .fillColor('#333333')
      .font('Helvetica-Bold')
      .fontSize(24)
      .text(article.title, 72, 80, {
        width: 451,
        align: 'left'
      });

    let currentY = doc.y + 20;

    doc
      .fillColor('#666666')
      .font('Helvetica')
      .fontSize(10);

    const metadataItems = [];

    if (article.author && article.author.email) {
      metadataItems.push(`Author: ${article.author.email}`);
    }

    metadataItems.push(`Created: ${new Date(article.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`);

    if (article.updatedAt && article.updatedAt !== article.createdAt) {
      metadataItems.push(`Updated: ${new Date(article.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`);
    }

    metadataItems.push(`Version: ${article.version}`);

    doc.text(metadataItems.join('  |  '), 72, currentY, {
      width: 451
    });

    currentY = doc.y + 15;

    doc
      .strokeColor('#dddddd')
      .lineWidth(1)
      .moveTo(72, currentY)
      .lineTo(523, currentY)
      .stroke();

    currentY += 20;

    const plainContent = stripHtmlTags(article.content);

    doc
      .fillColor('#333333')
      .font('Helvetica')
      .fontSize(12)
      .text(plainContent, 72, currentY, {
        width: 451,
        align: 'justify',
        lineGap: 4
      });

    currentY = doc.y + 30;

    if (article.attachments && article.attachments.length > 0) {
      if (currentY > 700) {
        doc.addPage();
        currentY = 72;
      }

      doc
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('Attachments', 72, currentY);

      currentY = doc.y + 10;

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#666666');

      article.attachments.forEach((file, index) => {
        const fileSize = Math.round(file.size / 1024);
        doc.text(`${index + 1}. ${file.originalName} (${fileSize} KB)`, 72, currentY);
        currentY = doc.y + 5;
      });
    }

    const range = doc.bufferedPageRange();
    const exportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);

      const savedY = doc.y;

      doc
        .strokeColor('#dddddd')
        .lineWidth(1)
        .moveTo(72, 770)
        .lineTo(523, 770)
        .stroke();

      const pageText = `Page ${i + 1} of ${range.count}`;
      const pageTextWidth = doc.widthOfString(pageText, { font: 'Helvetica', size: 9 });
      const centerX = 72 + (451 - pageTextWidth) / 2;

      doc
        .fillColor('#999999')
        .font('Helvetica')
        .fontSize(9);

      doc.y = 780;
      doc.x = centerX;
      doc._fragment(pageText, centerX, 780, {});

      const dateTextWidth = doc.widthOfString(`Exported on ${exportDate}`, { font: 'Helvetica', size: 9 });
      const rightX = 523 - dateTextWidth;
      doc._fragment(`Exported on ${exportDate}`, rightX, 780, {});


      doc.y = savedY;
    }

    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'Failed to export article as PDF' });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleVersions,
  getArticleVersion,
  exportToPdf
};

