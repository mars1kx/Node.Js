import React from 'react';
import './ArticleView.css';

function ArticleView({ article, onBack, onEdit, onDelete }) {
  if (!article) return <div>Loading...</div>;

  const handleDelete = async () => {
    if (!window.confirm('Delete this article?')) return;

    try {
      const response = await fetch(`http://localhost:3001/articles/${article.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onBack();
      } else {
        alert('Failed to delete article');
      }
    } catch (err) {
      alert('Error deleting article');
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div className="article-view">
      <button onClick={onBack} className="back-btn">← Back</button>
      <div className="actions">
        <button onClick={() => onEdit(article)} className="edit-btn">Edit</button>
        <button onClick={handleDelete} className="delete-btn">Delete</button>
      </div>
      <h2>{article.title}</h2>
      <p className="date">{new Date(article.createdAt).toLocaleDateString()}</p>
      
      {article.attachments && article.attachments.length > 0 && (
        <div className="attachments">
          <h3>Attachments</h3>
          <div className="attachments-list">
            {article.attachments.map((file, index) => (
              <a 
                key={index} 
                href={`http://localhost:3001/uploads/${file.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-item"
              >
                <span className="file-icon">{getFileIcon(file.type)}</span>
                <span className="file-name">{file.originalName}</span>
                <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
              </a>
            ))}
          </div>
        </div>
      )}
      
      <div className="content" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
}

export default ArticleView;

