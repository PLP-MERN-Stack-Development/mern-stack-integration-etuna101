import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postService, categoryService } from '../services/api';

export default function PostForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    excerpt: '',
    tags: [],
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    categoryService.getAllCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    postService.getPost(id).then((res) => {
      const p = res.data;
      setForm({
        title: p.title || '',
        content: p.content || '',
        category: p.category?.slug || '',
        excerpt: p.excerpt || '',
        tags: p.tags || [],
      });
    });
  }, [isEdit, id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await postService.updatePost(id, form);
      } else {
        await postService.createPost(form);
      }
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      <h2>{isEdit ? 'Edit Post' : 'Create Post'}</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Excerpt"
        value={form.excerpt}
        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        maxLength={200}
      />
      <textarea
        placeholder="Content (supports HTML)"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        required
        rows={8}
      />
      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        required
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c._id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        placeholder="Comma separated tags"
        value={form.tags.join(',')}
        onChange={(e) =>
          setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
        }
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}


