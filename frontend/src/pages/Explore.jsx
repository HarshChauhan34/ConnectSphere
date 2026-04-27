import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Compass, Search, Users, Newspaper, Loader2 } from "lucide-react";
import UserCard from "../components/UserCard";
import PostCard from "../components/PostCard";
import { getAllUsers } from "../services/userService";
import { getExplorePosts } from "../services/postService";

function Explore() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  const fetchExploreData = useCallback(async () => {
    try {
      setLoading(true);

      const [usersRes, postsRes] = await Promise.all([
        getAllUsers(search),
        getExplorePosts(),
      ]);

      setUsers(usersRes.data.users);
      setPosts(postsRes.data.posts);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load explore");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchExploreData();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchExploreData]);

  const handleFollowChange = (personId, isFollowing) => {
    setUsers((prev) =>
      prev.map((person) => {
        if (person._id !== personId) return person;

        return {
          ...person,
          followers: isFollowing
            ? [...(person.followers || []), "me"]
            : (person.followers || []).slice(0, -1),
        };
      })
    );
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
      <div className="mx-auto min-h-screen max-w-[975px] border-x border-neutral-800 bg-black pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-neutral-800 bg-black/90 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4">
            <Compass size={24} />
            <h1 className="text-xl font-bold tracking-tight">Explore</h1>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                type="text"
                placeholder="Search users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 pl-11 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center justify-center gap-2 border-b py-3 text-sm font-semibold transition ${
                activeTab === "posts"
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <Newspaper size={17} />
              Posts
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center justify-center gap-2 border-b py-3 text-sm font-semibold transition ${
                activeTab === "users"
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <Users size={17} />
              Users
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-neutral-400">
              <Loader2 size={22} className="animate-spin" />
              Loading explore...
            </div>
          </div>
        ) : activeTab === "users" ? (
          users.length === 0 ? (
            <EmptyState message="No users found." />
          ) : (
            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((person) => (
                <div
                  key={person._id}
                  className="border-b border-neutral-800 p-3 sm:border-r"
                >
                  <UserCard
                    person={person}
                    onFollowChange={handleFollowChange}
                  />
                </div>
              ))}
            </div>
          )
        ) : posts.length === 0 ? (
          <EmptyState message="No posts found." />
        ) : (
          <div className="mx-auto max-w-[630px]">
            {posts.map((post) => (
              <div key={post._id} className="border-b border-neutral-800">
                <PostCard
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-[430px] items-center justify-center px-6 text-center">
      <div>
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-neutral-700">
          <Search size={34} className="text-neutral-400" />
        </div>

        <h2 className="text-xl font-bold text-white">{message}</h2>

        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-neutral-400">
          Try searching something else or check back later.
        </p>
      </div>
    </div>
  );
}

export default Explore;
