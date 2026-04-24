import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { getFeedPosts } from "../services/postService";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await getFeedPosts();
      setPosts(res.data.posts);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <CreatePost onPostCreated={handlePostCreated} />

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-300">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
          <h2 className="text-xl font-bold">No posts yet</h2>
          <p className="mt-2 text-slate-400">
            Create your first post or follow users to see their posts.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
          />
        ))
      )}
    </div>
  );
}

export default Home;