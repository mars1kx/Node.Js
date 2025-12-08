import React, { useState } from 'react';
import './ArticleView.css';

function ArticleView({ article, onBack, onEdit, onDelete }) {
  const [author, setAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(article?.comments || []);
  const [error, setError] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editAuthor, setEditAuthor] = useState('');
  const [editText, setEditText] = useState('');

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!author.trim()) {
      setError('Author name is required');
      return;
    }

    if (!commentText.trim()) {
      setError('Comment text is required');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/articles/${article.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text: commentText })
      });

      if (!response.ok) {
        setError('Failed to add comment');
        return;
      }

      const newComment = await response.json();
      setComments([...comments, newComment]);
      setAuthor('');
      setCommentText('');
    } catch (err) {
      setError('Error adding comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:3001/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      alert('Error deleting comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditAuthor(comment.author);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditAuthor('');
    setEditText('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editAuthor.trim()) {
      alert('Author name is required');
      return;
    }

    if (!editText.trim()) {
      alert('Comment text is required');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: editAuthor, text: editText })
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(comments.map(c => c.id === commentId ? updatedComment : c));
        setEditingComment(null);
        setEditAuthor('');
        setEditText('');
      } else {
        alert('Failed to update comment');
      }
    } catch (err) {
      alert('Error updating comment');
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

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
          />
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
          />
          {error && <div className="error">{error}</div>}
          <button type="submit">Add Comment</button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment">
                {editingComment === comment.id ? (
                  <div className="comment-edit-form">
                    <input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      placeholder="Author name"
                    />
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Comment text"
                      rows="3"
                    />
                    <div className="comment-edit-buttons">
                      <button onClick={() => handleUpdateComment(comment.id)} className="save-btn">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-header">
                      <strong>{comment.author}</strong>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      <div className="comment-actions">
                        <button 
                          onClick={() => handleEditComment(comment)}
                          className="edit-comment-btn"
                          title="Edit comment"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="delete-comment-btn"
                          title="Delete comment"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <p>{comment.text}</p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleView;

