import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Camera,
  Save,
  UserPlus,
  UserMinus,
  Loader2,
  ImagePlus,
  Edit3,
  Grid3X3,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import {
  followUnfollowUser,
  getUserProfile,
  updateProfile,
} from "../services/userService";
import { getUserPosts } from "../services/postService";
import PostCard from "../components/PostCard";
import Avatar from "../components/Avatar";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const fetchProfile = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProfile();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchProfile]);

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
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-[935px] items-center justify-center border-x border-neutral-800">
          <div className="flex items-center gap-3 text-sm font-medium text-neutral-400">
            <Loader2 size={22} className="animate-spin" />
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-[935px] border-x border-neutral-800 bg-black pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-neutral-800 bg-black/90 px-4 py-3 backdrop-blur-xl">
          <h1 className="text-xl font-bold">{profile.username}</h1>
        </div>

        {/* Profile Info */}
        <section className="border-b border-neutral-800 px-4 py-6 sm:px-8">
          <div className="flex gap-6 sm:gap-10">
            <div className="shrink-0">
              <div className="relative rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]">
                <div className="rounded-full bg-black p-[3px]">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Avatar Preview"
                      className="h-24 w-24 rounded-full object-cover sm:h-36 sm:w-36"
                    />
                  ) : (
                    <>
                      <div className="sm:hidden">
                        <Avatar user={profile} size={96} />
                      </div>
                      <div className="hidden sm:block">
                        <Avatar user={profile} size={144} />
                      </div>
                    </>
                  )}
                </div>

                {editMode && (
                  <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#0095f6] text-white shadow-lg transition hover:bg-[#1877f2]">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {!editMode ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <h2 className="truncate text-xl font-normal text-white sm:text-2xl">
                      {profile.username}
                    </h2>

                    {isOwnProfile ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
                      >
                        <Edit3 size={15} />
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                          isFollowing
                            ? "bg-neutral-800 text-white hover:bg-neutral-700"
                            : "bg-[#0095f6] text-white hover:bg-[#1877f2]"
                        }`}
                      >
                        {isFollowing ? (
                          <UserMinus size={15} />
                        ) : (
                          <UserPlus size={15} />
                        )}
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>

                  <div className="mt-5 flex gap-6 text-sm sm:gap-10">
                    <p>
                      <span className="font-bold">{posts.length}</span> posts
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/profile/${profile._id}/followers`)
                      }
                    >
                      <span className="font-bold">
                        {profile.followers?.length || 0}
                      </span>{" "}
                      followers
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/profile/${profile._id}/following`)
                      }
                    >
                      <span className="font-bold">
                        {profile.following?.length || 0}
                      </span>{" "}
                      following
                    </button>
                  </div>

                  <div className="mt-5 text-sm">
                    <h3 className="font-bold text-white">{profile.name}</h3>
                    <p className="mt-1 whitespace-pre-line text-neutral-200">
                      {profile.bio || "No bio added yet."}
                    </p>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-700">
                    <ImagePlus size={17} />
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
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Name"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
                  />

                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    placeholder="Username"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
                  />

                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Bio"
                    rows="3"
                    className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
                  />

                  <div className="flex gap-3">
                    <button className="inline-flex items-center gap-2 rounded-lg bg-[#0095f6] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1877f2]">
                      <Save size={17} />
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setAvatarFile(null);
                        setPreview("");
                      }}
                      className="rounded-lg bg-neutral-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Posts Title */}
        <div className="flex items-center justify-center gap-2 border-b border-neutral-800 py-3 text-xs font-bold uppercase tracking-widest text-white">
          <Grid3X3 size={14} />
          Posts
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-neutral-700">
                <Camera size={34} className="text-neutral-400" />
              </div>

              <h2 className="text-xl font-bold text-white">No posts yet</h2>
            </div>
          </div>
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

export default Profile;
