import React from 'react';
import './ArticleView.css';

function ArticleView({ article, onBack }) {
  if (!article) return <div>Loading...</div>;

  return (
    <div className="article-view">
      <button onClick={onBack} className="back-btn">← Back</button>
      <h2>{article.title}</h2>
      <p className="date">{new Date(article.createdAt).toLocaleDateString()}</p>
      <div className="content" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
}

export default ArticleView;

