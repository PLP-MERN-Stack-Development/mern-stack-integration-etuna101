import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService, categoryService } from '../services/api';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [query, setQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    categoryService.getAllCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    postService
      .getAllPosts(page, 10, selectedCategory || null)
      .then((res) => {
        setPosts(res.data);
        setPagination(res.pagination);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, selectedCategory]);

  const onSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await postService.searchPosts(query.trim());
      setPosts(res.data);
      setPagination({ page: 1, pages: 1, total: res.data.length });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
        />
        <button type="submit">Search</button>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </form>
      <ul style={{ display: 'grid', gap: 12 }}>
        {posts.map((p) => (
          <li key={p._id} style={{ border: '1px solid #eee', padding: 12 }}>
            <Link to={`/posts/${p._id}`}>{p.title}</Link>
            {p.category && <div style={{ fontSize: 12, color: '#666' }}>{p.category.name}</div>}
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
          Prev
        </button>
        <span>
          Page {pagination.page} / {pagination.pages}
        </span>
        <button disabled={page >= pagination.pages} onClick={() => setPage((n) => n + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}


