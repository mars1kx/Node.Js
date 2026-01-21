import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import ArticleCreate from './components/ArticleCreate';
import ArticleEdit from './components/ArticleEdit';
import UserManagement from './components/UserManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [view, setView] = useState('list');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyUser(token);
    }
  }, []);

  const verifyUser = async (token) => {
    try {
      const response = await fetch('http://localhost:3001/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspaces();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && view === 'list') {
      loadArticles();
    }
  }, [isAuthenticated, view, selectedWorkspace, searchQuery]);

  useEffect(() => {
    if (!isAuthenticated) return;

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
      } else if (data.type === 'comment_added') {
        setNotification('New comment added');
      }
      
      setTimeout(() => setNotification(null), 5000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [isAuthenticated, view]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      return true;
    }
    return false;
  };

  const loadWorkspaces = async () => {
    try {
      const response = await fetch('http://localhost:3001/workspaces', {
        headers: getAuthHeaders()
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      setWorkspaces(data);
    } catch (err) {
      console.error('Failed to load workspaces');
    }
  };

  const loadArticles = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWorkspace) {
        params.append('workspaceId', selectedWorkspace);
      }
      if (searchQuery && searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      const queryString = params.toString();
      const url = queryString 
        ? `http://localhost:3001/articles?${queryString}` 
        : 'http://localhost:3001/articles';
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error('Failed to load articles');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleViewArticle = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/articles/${id}`, {
        headers: getAuthHeaders()
      });
      if (handleAuthError(response)) return;
      const data = await response.json();
      setSelectedArticle(data);
      setView('view');
    } catch (err) {
      console.error('Failed to load article');
    }
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

  const handleLogin = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await verifyUser(token);
    }
  };

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await verifyUser(token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setView('list');
  };

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
      />
    ) : (
      <Register 
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  return (
    <div className="App">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      <header>
        <h1 onClick={() => setView('list')}>Articles</h1>
        <nav>
          {(view === 'list' || view === 'view') && (
            <button onClick={() => setView('create')}>Create New</button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => setView('users')} className="admin-btn">
              User Management
            </button>
          )}
        </nav>
        <div className="user-info">
          <span>{user?.email}</span>
          {user?.role === 'admin' && <span className="admin-badge">Admin</span>}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {view === 'list' && (
        <div className="workspace-filter">
          <label>Workspace: </label>
          <select 
            value={selectedWorkspace || ''} 
            onChange={(e) => setSelectedWorkspace(e.target.value || null)}
          >
            <option value="">All</option>
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </div>
      )}

      <main>
        {view === 'list' && (
          <ArticleList 
            articles={articles} 
            onView={handleViewArticle}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
        )}
        {view === 'view' && (
          <ArticleView 
            article={selectedArticle} 
            onBack={() => setView('list')}
            onEdit={handleEdit}
            currentUser={user}
          />
        )}
        {view === 'create' && (
          <ArticleCreate 
            onSuccess={handleCreateSuccess} 
            onCancel={() => setView('list')}
            workspaces={workspaces}
          />
        )}
        {view === 'edit' && (
          <ArticleEdit 
            article={selectedArticle}
            onSuccess={handleEditSuccess}
            onCancel={() => setView('view')}
          />
        )}
        {view === 'users' && user?.role === 'admin' && (
          <UserManagement currentUser={user} />
        )}
      </main>
    </div>
  );
}

export default App;

