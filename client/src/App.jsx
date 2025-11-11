import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import PostList from './components/PostList.jsx';
import PostView from './components/PostView.jsx';
import PostForm from './components/PostForm.jsx';

export default function App() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #eee' }}>
        <Link to="/">Posts</Link>
        <button onClick={() => navigate('/create')}>New Post</button>
      </nav>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostView />} />
        <Route path="/create" element={<PostForm />} />
        <Route path="/edit/:id" element={<PostForm />} />
      </Routes>
    </div>
  );
}


