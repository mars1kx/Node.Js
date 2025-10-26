import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ArticleCreate.css';

function ArticleCreate({ onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      setError('Content is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create article');
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      setError('Failed to create article');
      setLoading(false);
    }
  };

  return (
    <div className="article-create">
      <h2>Create New Article</h2>
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
            {loading ? 'Saving...' : 'Save Article'}
          </button>
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArticleCreate;

