import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ArticleCreate.css';

function ArticleCreate({ onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPG, PNG and PDF files allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return false;
      }
      return true;
    });
    setFiles([...files, ...validFiles]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:3001/articles', {
        method: 'POST',
        body: formData
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

        <div className="form-group">
          <label>Attachments (JPG, PNG, PDF only)</label>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  {file.type.startsWith('image/') ? (
                    <img src={getFilePreview(file)} alt={file.name} className="file-preview-img" />
                  ) : (
                    <div className="file-preview-pdf">📄</div>
                  )}
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                  <button type="button" onClick={() => removeFile(index)} className="remove-file">×</button>
                </div>
              ))}
            </div>
          )}
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

