import React from 'react';
import './ArticleList.css';

function ArticleList({ articles, onView }) {
  if (articles.length === 0) {
    return <div className="empty">No articles yet</div>;
  }

  return (
    <div className="article-list">
      <h2>All Articles</h2>
      {articles.map(article => (
        <div key={article.id} className="article-item" onClick={() => onView(article.id)}>
          <h3>{article.title}</h3>
          <p className="date">{new Date(article.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

export default ArticleList;

