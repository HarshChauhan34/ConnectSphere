import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, Save, UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { followUnfollowUser, getUserProfile, updateProfile } from "../services/userService";
import { getUserPosts } from "../services/postService";
import PostCard from "../components/PostCard";
import Avatar from "../components/Avatar";

function Profile() {
  const { id } = useParams();
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
  });

  const isOwnProfile = user?._id === id;

  const isFollowing = profile?.followers?.some((follower) => {
    const followerId = follower._id || follower;
    return followerId === user?._id;
  });

  const fetchProfile = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        getUserProfile(id),
        getUserPosts(id),
      ]);

      setProfile(profileRes.data.user);
      setPosts(postsRes.data.posts);

      setForm({
        name: profileRes.data.user.name || "",
        username: profileRes.data.user.username || "",
        bio: profileRes.data.user.bio || "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("bio", form.bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await updateProfile(formData);

      const updatedUser = {
        ...res.data.user,
        token: user.token,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfile(res.data.user);

      setEditMode(false);
      setAvatarFile(null);
      setPreview("");

      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleFollow = async () => {
    try {
      const res = await followUnfollowUser(profile._id);

      setProfile((prev) => ({
        ...prev,
        followers: res.data.isFollowing
          ? [...prev.followers, user._id]
          : prev.followers.filter((follower) => {
              const followerId = follower._id || follower;
              return followerId !== user._id;
            }),
      }));

      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Follow failed");
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  if (!profile) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
        <div className="h-44 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col items-center gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="rounded-full bg-black p-[3px] shadow-xl shadow-black/35 ring-2 ring-white/85">
              <div className="sm:hidden">
                <Avatar user={profile} size={96} />
              </div>
              <div className="hidden sm:block">
                <Avatar user={profile} size={120} />
              </div>
            </div>

            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold sm:w-auto ${
                  isFollowing
                    ? "bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
              >
                {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          {!editMode ? (
            <div className="mt-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <p className="text-slate-400">@{profile.username}</p>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/20"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <p className="mt-4 text-slate-200">
                {profile.bio || "No bio added yet."}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-xl font-bold">{posts.length}</p>
                  <p className="text-xs text-slate-400">Posts</p>
                </div>

                <div className="rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-xl font-bold">
                    {profile.followers?.length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Followers</p>
                </div>

                <div className="rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-xl font-bold">
                    {profile.following?.length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Following</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
                <Camera size={18} />
                Change Avatar
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </label>

              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-indigo-400"
              />

              <input
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                placeholder="Username"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-indigo-400"
              />

              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Bio"
                rows="3"
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-indigo-400"
              />

              <div className="flex gap-3">
                <button className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-2.5 font-semibold hover:bg-indigo-600">
                  <Save size={18} />
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="rounded-2xl bg-white/10 px-5 py-2.5 font-semibold hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Posts</h2>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-400">
            No posts yet.
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
    </div>
  );
}

export default Profile;
