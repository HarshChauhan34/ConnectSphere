import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UserCard from "../components/UserCard";
import PostCard from "../components/PostCard";
import { getAllUsers } from "../services/userService";
import { getExplorePosts } from "../services/postService";

function Explore() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  const fetchExploreData = async () => {
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
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExploreData();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="mt-2 text-slate-400">
          Discover new people and latest public posts.
        </p>

        <input
          type="text"
          placeholder="Search users by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-indigo-400"
        />

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-2xl px-5 py-2 text-sm font-semibold ${
              activeTab === "users"
                ? "bg-indigo-500 text-white"
                : "bg-white/10 text-slate-300"
            }`}
          >
            Users
          </button>

          <button
            onClick={() => setActiveTab("posts")}
            className={`rounded-2xl px-5 py-2 text-sm font-semibold ${
              activeTab === "posts"
                ? "bg-indigo-500 text-white"
                : "bg-white/10 text-slate-300"
            }`}
          >
            Posts
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
          Loading explore...
        </div>
      ) : activeTab === "users" ? (
        users.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
            No users found.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((person) => (
              <UserCard
                key={person._id}
                person={person}
                onFollowChange={handleFollowChange}
              />
            ))}
          </div>
        )
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Explore; 