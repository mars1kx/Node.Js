import React, { useState, useEffect } from 'react';
import './App.css';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import ArticleCreate from './components/ArticleCreate';
import ArticleEdit from './components/ArticleEdit';

function App() {
  const [view, setView] = useState('list');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (view === 'list') {
      loadArticles();
    }
  }, [view]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'article_created') {
        setNotification(`New article created: "${data.article.title}"`);
        if (view === 'list') loadArticles();
      } else if (data.type === 'article_updated') {
        setNotification(`Article updated: "${data.article.title}"`);
        if (view === 'list') loadArticles();
      }
      
      setTimeout(() => setNotification(null), 5000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [view]);

  const loadArticles = async () => {
    const response = await fetch('http://localhost:3001/articles');
    const data = await response.json();
    setArticles(data);
  };

  const handleViewArticle = async (id) => {
    const response = await fetch(`http://localhost:3001/articles/${id}`);
    const data = await response.json();
    setSelectedArticle(data);
    setView('view');
  };

  const handleCreateSuccess = () => {
    setView('list');
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setView('edit');
  };

  const handleEditSuccess = () => {
    setView('list');
  };

  return (
    <div className="App">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      <header>
        <h1 onClick={() => setView('list')}>Articles</h1>
        {(view === 'list' || view === 'view') && (
          <nav>
            <button onClick={() => setView('create')}>Create New</button>
          </nav>
        )}
      </header>

      <main>
        {view === 'list' && (
          <ArticleList articles={articles} onView={handleViewArticle} />
        )}
        {view === 'view' && (
          <ArticleView 
            article={selectedArticle} 
            onBack={() => setView('list')}
            onEdit={handleEdit}
          />
        )}
        {view === 'create' && (
          <ArticleCreate onSuccess={handleCreateSuccess} onCancel={() => setView('list')} />
        )}
        {view === 'edit' && (
          <ArticleEdit 
            article={selectedArticle}
            onSuccess={handleEditSuccess}
            onCancel={() => setView('view')}
          />
        )}
      </main>
    </div>
  );
}

export default App;

