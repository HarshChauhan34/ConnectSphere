import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Camera, HomeIcon, Loader2, PenLine } from "lucide-react";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { getExplorePosts } from "../services/postService";
import { useAuth } from "../context/useAuth";

function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await getExplorePosts();
      const filteredPosts = (res.data.posts || []).filter(
        (post) => post.user?._id !== user?._id
      );
      setPosts(filteredPosts);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchFeed();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchFeed]);

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
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-157.5 border-x border-neutral-800 bg-black pb-24">
        {/* Instagram Style Header */}
        <div className="sticky top-14 z-40 border-b border-neutral-800 bg-black/90 backdrop-blur-xl md:top-16 lg:top-0">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <HomeIcon size={24} />
              <h1 className="text-xl font-bold tracking-tight">Home</h1>
            </div>

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-900 active:scale-95"
              title="Create post"
            >
              <Camera size={22} />
            </button>
          </div>
        </div>

        {/* Create Post */}
        <div className="border-b border-neutral-800">
          <CreatePost onPostCreated={handlePostCreated} />
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex min-h-87.5 items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-neutral-400">
              <Loader2 size={22} className="animate-spin" />
              Loading posts...
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex min-h-107.5 items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-neutral-700">
                <PenLine size={34} className="text-neutral-400" />
              </div>

              <h2 className="text-xl font-bold text-white">No posts yet</h2>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-neutral-400">
                Create your first post or follow users to see their posts.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <div key={post._id} className="border-b border-neutral-800">
                <PostCard
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                  showFollowAction
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
