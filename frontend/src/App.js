import React, { useState, useEffect } from 'react';
import './App.css';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import ArticleCreate from './components/ArticleCreate';

function App() {
  const [view, setView] = useState('list');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (view === 'list') {
      loadArticles();
    }
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

  return (
    <div className="App">
      <header>
        <h1 onClick={() => setView('list')}>Articles</h1>
        <nav>
          <button onClick={() => setView('create')}>Create New</button>
        </nav>
      </header>

      <main>
        {view === 'list' && (
          <ArticleList articles={articles} onView={handleViewArticle} />
        )}
        {view === 'view' && (
          <ArticleView article={selectedArticle} onBack={() => setView('list')} />
        )}
        {view === 'create' && (
          <ArticleCreate onSuccess={handleCreateSuccess} onCancel={() => setView('list')} />
        )}
      </main>
    </div>
  );
}

export default App;

