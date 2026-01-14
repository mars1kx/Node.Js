import React, { useState } from 'react';
import './ArticleView.css';

function ArticleView({ article, onBack, onEdit, onDelete, currentUser }) {
  const [author, setAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(article?.comments || []);
  const [error, setError] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editAuthor, setEditAuthor] = useState('');
  const [editText, setEditText] = useState('');
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(article);
  const [isViewingOldVersion, setIsViewingOldVersion] = useState(false);

  if (!article) return <div>Loading...</div>;

  const canEdit = currentUser && (
    currentUser.id === article.authorId || 
    currentUser.role === 'admin'
  );

  const handleDelete = async () => {
    if (!window.confirm('Delete this article?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/articles/${article.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/articles/${article.id}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/comments/${commentId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  const loadVersions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/articles/${article.id}/versions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setVersions(data);
      setShowVersions(true);
    } catch (err) {
      alert('Failed to load versions');
    }
  };

  const viewVersion = async (versionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/articles/${article.id}/versions/${versionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCurrentVersion(data);
      setComments(data.comments || []);
      setIsViewingOldVersion(!data.isLatest);
      setShowVersions(false);
    } catch (err) {
      alert('Failed to load version');
    }
  };

  const backToLatest = () => {
    setCurrentVersion(article);
    setComments(article.comments || []);
    setIsViewingOldVersion(false);
  };

  return (
    <div className="article-view">
      <button onClick={onBack} className="back-btn">← Back</button>
      
      {isViewingOldVersion && (
        <div className="old-version-banner">
          ⚠️ You are viewing version {currentVersion.version} (read-only). 
          <button onClick={backToLatest} className="back-to-latest-btn">View Latest Version</button>
        </div>
      )}

      <div className="actions">
        {!isViewingOldVersion && canEdit && (
          <>
            <button onClick={() => onEdit(currentVersion)} className="edit-btn">Edit</button>
            <button onClick={handleDelete} className="delete-btn">Delete</button>
          </>
        )}
        <button onClick={loadVersions} className="versions-btn">📋 View History</button>
      </div>

      {showVersions && (
        <div className="versions-modal">
          <div className="versions-content">
            <h3>Version History</h3>
            <button onClick={() => setShowVersions(false)} className="close-modal">×</button>
            <div className="versions-list">
              {versions.map(v => (
                <div key={v.id} className={`version-item ${v.isLatest ? 'latest' : ''}`}>
                  <div className="version-info">
                    <strong>Version {v.version}</strong>
                    {v.isLatest && <span className="latest-badge">Latest</span>}
                    <span className="version-date">
                      {new Date(v.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <button onClick={() => viewVersion(v.id)} className="view-version-btn">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2>{currentVersion.title}</h2>
      <p className="date">
        Version {currentVersion.version} • {new Date(currentVersion.createdAt).toLocaleDateString()}
      </p>
      
      {currentVersion.attachments && currentVersion.attachments.length > 0 && (
        <div className="attachments">
          <h3>Attachments</h3>
          <div className="attachments-list">
            {currentVersion.attachments.map((file, index) => (
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
      
      <div className="content" dangerouslySetInnerHTML={{ __html: currentVersion.content }} />

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        {!isViewingOldVersion && (
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
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment">
                {editingComment === comment.id && !isViewingOldVersion ? (
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
                      {!isViewingOldVersion && (
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
                      )}
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

