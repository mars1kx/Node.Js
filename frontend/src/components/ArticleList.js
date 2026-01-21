import React, { useState, useEffect } from 'react';
import './ArticleList.css';

function ArticleList({ articles, onView, onSearch, searchQuery }) {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
  };

  return (
    <div className="article-list">
      <h2>All Articles</h2>
      
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search articles by title or content..."
            value={localSearch}
            onChange={handleSearchChange}
          />
          {localSearch && (
            <button className="search-clear" onClick={handleClearSearch} title="Clear search">
              ×
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="search-results-info">
            Found {articles.length} article{articles.length !== 1 ? 's' : ''} 
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="empty">
          {searchQuery ? `No articles found matching "${searchQuery}"` : 'No articles yet'}
        </div>
      ) : (
        articles.map(article => (
          <div key={article.id} className="article-item" onClick={() => onView(article.id)}>
            <h3>{article.title}</h3>
            <p className="date">{new Date(article.createdAt).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ArticleList;

