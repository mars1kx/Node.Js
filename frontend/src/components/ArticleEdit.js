import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ArticleCreate.css';

function ArticleEdit({ article, onSuccess, onCancel }) {
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      setError('Content is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update article');
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      setError('Failed to update article');
      setLoading(false);
    }
  };

  return (
    <div className="article-create">
      <h2>Edit Article</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <ReactQuill
            value={content}
            onChange={setContent}
            placeholder="Write your article here..."
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div className="buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Update Article'}
          </button>
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArticleEdit;

