import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  X,
  Camera,
  Save,
  Loader2,
  ImagePlus,
  Grid3X3,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import {
  followUnfollowUser,
  getUserProfile,
  updateProfile,
} from "../services/userService";
import { deletePost, getUserPosts } from "../services/postService";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);

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

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

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
          ? [...(prev.followers || []), user._id]
          : (prev.followers || []).filter((follower) => {
              const followerId = follower._id || follower;
              return followerId !== user._id;
            }),
      }));

      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Follow failed");
    }
  };

  const openPost = (post) => {
    setSelectedPost(post);
  };

  const handleDeleteOwnPost = async () => {
    if (!selectedPost?._id) return;

    try {
      await deletePost(selectedPost._id);
      setPosts((prev) => prev.filter((post) => post._id !== selectedPost._id));
      setSelectedPost(null);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-243.75 items-center justify-center border-x border-neutral-900">
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
      <main className="mx-auto min-h-screen max-w-243.75 border-x border-neutral-900 bg-black pb-24">
        {/* Mobile Username Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-900 bg-black/95 px-4 backdrop-blur-xl sm:hidden">
          <h1 className="max-w-57.5 truncate text-xl font-bold">
            {profile.username}
          </h1>

          <button className="rounded-full p-2 active:bg-neutral-900">
            <MoreHorizontal size={24} />
          </button>
        </header>

        {/* Profile Section */}
        <section className="px-4 pb-0 pt-5 sm:px-10 sm:pb-10 sm:pt-10">
          <div className="grid grid-cols-[86px_1fr] gap-5 sm:grid-cols-[170px_1fr] sm:gap-12">
            {/* Avatar */}
            <div className="flex justify-center sm:pt-1">
              <div className="relative h-21.5 w-21.5 sm:h-37.5 sm:w-37.5">
                <div className="rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                  <div className="rounded-full bg-black p-0.75">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Avatar Preview"
                        className="h-19 w-19 rounded-full object-cover sm:h-35 sm:w-35"
                      />
                    ) : (
                      <>
                        <div className="sm:hidden">
                          <Avatar user={profile} size={76} />
                        </div>
                        <div className="hidden sm:block">
                          <Avatar user={profile} size={140} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {editMode && (
                  <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-black bg-[#0095f6] text-white transition active:scale-95">
                    <Camera size={16} />
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

            {/* Profile Info */}
            <div className="min-w-0">
              {!editMode ? (
                <>
                  <div className="hidden items-center gap-4 sm:flex">
                    <h2 className="truncate text-xl font-normal">
                      {profile.name}
                    </h2>

                    {isOwnProfile ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="rounded-lg bg-[#363636] px-4 py-1.5 text-sm font-semibold transition hover:bg-[#4a4a4a]"
                      >
                        Edit profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleFollow}
                          className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition ${
                            isFollowing
                              ? "bg-[#363636] hover:bg-[#4a4a4a]"
                              : "bg-[#0095f6] hover:bg-[#1877f2]"
                          }`}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </button>

                        {isFollowing && (
                          <button
                            onClick={() => navigate(`/messages/${profile._id}`)}
                            className="rounded-lg bg-[#363636] px-5 py-1.5 text-sm font-semibold transition hover:bg-[#4a4a4a]"
                          >
                            Message
                          </button>
                        )}
                      </>
                    )}

                    <button className="rounded-full p-1.5 transition hover:bg-neutral-900">
                      <MoreHorizontal size={24} />
                    </button>
                  </div>

                  {/* Mobile Buttons */}
                  <div className="sm:hidden">
                    <h2 className="truncate text-xl font-semibold">
                      {profile.name}
                    </h2>

                    <div className="mt-3 flex gap-2">
                      {isOwnProfile ? (
                        <button
                          onClick={() => setEditMode(true)}
                          className="flex-1 rounded-lg bg-[#363636] py-1.5 text-sm font-semibold"
                        >
                          Edit profile
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleFollow}
                            className={`flex-1 rounded-lg py-1.5 text-sm font-semibold ${
                              isFollowing ? "bg-[#363636]" : "bg-[#0095f6]"
                            }`}
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </button>

                          {isFollowing && (
                            <button
                              onClick={() =>
                                navigate(`/messages/${profile._id}`)
                              }
                              className="flex-1 rounded-lg bg-[#363636] py-1.5 text-sm font-semibold"
                            >
                              Message
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Desktop Stats */}
                  <div className="mt-6 hidden gap-10 text-base sm:flex">
                    <p>
                      <span className="font-semibold">{posts.length}</span>{" "}
                      posts
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/profile/${profile._id}/followers`)
                      }
                    >
                      <span className="font-semibold">
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
                      <span className="font-semibold">
                        {profile.following?.length || 0}
                      </span>{" "}
                      following
                    </button>
                  </div>

                  {/* Desktop Bio */}
                  <div className="mt-5 hidden text-sm leading-5 sm:block">
                    <h3 className="font-semibold">{profile.username}</h3> 
                    <p className="mt-1 max-w-105 whitespace-pre-line text-neutral-100">
                      {profile.bio || "No bio added yet."}
                    </p>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={handleUpdateProfile}
                  className="rounded-2xl border border-neutral-800 bg-[#121212] p-4"
                >
                  <label className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#363636] px-4 py-2 text-sm font-semibold transition hover:bg-[#4a4a4a]">
                    <ImagePlus size={17} />
                    Change Avatar
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                  </label>

                  <div className="space-y-3">
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Name"
                      className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-2.5 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-400"
                    />

                    <input
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                      placeholder="Username"
                      className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-2.5 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-400"
                    />

                    <textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm({ ...form, bio: e.target.value })
                      }
                      placeholder="Bio"
                      rows="3"
                      className="w-full resize-none rounded-lg border border-neutral-700 bg-black px-4 py-2.5 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-400"
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
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
                      className="rounded-lg bg-[#363636] px-5 py-2 text-sm font-semibold transition hover:bg-[#4a4a4a]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Mobile Bio */}
          {!editMode && (
            <div className="mt-4 text-sm leading-5 sm:hidden">
              {/* <h3 className="font-semibold">{profile.name}</h3> */}
              <p className="mt-1 whitespace-pre-line text-neutral-100">
                {profile.bio || "No bio added yet."}
              </p>
            </div>
          )}

          {/* Mobile Stats */}
          {!editMode && (
            <div className="mt-5 grid grid-cols-3 border-y border-neutral-800 py-3 text-center text-sm sm:hidden">
              <div>
                <p className="font-semibold">{posts.length}</p>
                <p className="text-neutral-400">posts</p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/profile/${profile._id}/followers`)}
              >
                <p className="font-semibold">
                  {profile.followers?.length || 0}
                </p>
                <p className="text-neutral-400">followers</p>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/profile/${profile._id}/following`)}
              >
                <p className="font-semibold">
                  {profile.following?.length || 0}
                </p>
                <p className="text-neutral-400">following</p>
              </button>
            </div>
          )}
        </section>

        {/* Tabs */}
        <div className="mt-0 flex items-center justify-center border-t border-neutral-800 sm:border-t">
          <button className="flex h-12 items-center gap-2 border-t border-white px-8 text-xs font-semibold uppercase tracking-[0.16em] text-white">
            <Grid3X3 size={13} />
            Posts
          </button>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-neutral-500">
                <Camera size={36} />
              </div>
              <h2 className="text-2xl font-bold">No posts yet</h2>
              <p className="mt-2 text-sm text-neutral-400">
                When posts are shared, they will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {posts.map((post) => {
              const image =
                post.image ||
                post.imageUrl ||
                post.media ||
                post.photo ||
                post.fileUrl;

              return (
                <button
                  key={post._id}
                  type="button"
                  className="group relative aspect-square overflow-hidden bg-neutral-900"
                  onClick={() => openPost(post)}
                >
                  {image ? (
                    <img
                      src={image}
                      alt="Post"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-75"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-900 p-3 text-center text-xs text-neutral-400">
                      {post.caption || post.content || "Post"}
                    </div>
                  )}

                  <div className="absolute inset-0 hidden items-center justify-center bg-black/40 opacity-0 transition group-hover:flex group-hover:opacity-100">
                    <p className="text-sm font-semibold text-white">
                      View Post
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Post Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-140 overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar user={profile} size={34} />
                <p className="truncate text-sm font-semibold">
                  {profile.username}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {isOwnProfile && (
                  <button
                    onClick={() => setShowDeletePostConfirm(true)}
                    className="rounded-full p-2 text-neutral-300 transition hover:bg-neutral-900 hover:text-red-500"
                    title="Delete post"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full p-2 transition hover:bg-neutral-900"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[72vh] overflow-y-auto">
              {(selectedPost.image ||
                selectedPost.imageUrl ||
                selectedPost.media ||
                selectedPost.photo ||
                selectedPost.fileUrl) && (
                <img
                  src={
                    selectedPost.image ||
                    selectedPost.imageUrl ||
                    selectedPost.media ||
                    selectedPost.photo ||
                    selectedPost.fileUrl
                  }
                  alt="Post"
                  className="h-auto w-full object-cover"
                />
              )}

              <div className="px-4 py-3">
                <p className="whitespace-pre-line text-sm text-neutral-200">
                  {selectedPost.caption || selectedPost.content || "Post"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeletePostConfirm}
        title="Delete Post?"
        message="This post will be removed permanently."
        confirmText="Delete"
        danger
        onCancel={() => setShowDeletePostConfirm(false)}
        onConfirm={() => {
          setShowDeletePostConfirm(false);
          void handleDeleteOwnPost();
        }}
      />
    </div>
  );
}

export default Profile;
