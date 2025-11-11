import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { postService } from '../services/api';

export default function PostView() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    postService
      .getPost(id)
      .then((res) => setPost(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const addComment = async (e) => {
    e.preventDefault();
    try {
      await postService.addComment(post._id, { content: comment });
      setComment('');
      const res = await postService.getPost(post._id);
      setPost(res.data);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!post) return null;

  return (
    <div>
      <h1>{post.title}</h1>
      <div style={{ color: '#666' }}>{post.excerpt}</div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      <h3>Comments</h3>
      <ul>
        {(post.comments || []).map((c, idx) => (
          <li key={idx}>{c.content}</li>
        ))}
      </ul>
      <form onSubmit={addComment} style={{ display: 'flex', gap: 8 }}>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment"
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}


