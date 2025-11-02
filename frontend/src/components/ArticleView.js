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

  return (
    <div className="article-view">
      <button onClick={onBack} className="back-btn">← Back</button>
      <div className="actions">
        <button onClick={() => onEdit(article)} className="edit-btn">Edit</button>
        <button onClick={handleDelete} className="delete-btn">Delete</button>
      </div>
      <h2>{article.title}</h2>
      <p className="date">{new Date(article.createdAt).toLocaleDateString()}</p>
      <div className="content" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
}

export default ArticleView;

