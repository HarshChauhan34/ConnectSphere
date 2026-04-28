import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deletePost, likeUnlikePost } from "../services/postService";
import { useAuth } from "../context/useAuth";
import { followUnfollowUser } from "../services/userService";
import CommentBox from "./CommentBox";
import Avatar from "./Avatar";
import ConfirmDialog from "./ConfirmDialog";

function PostCard({
  post,
  onPostDeleted,
  onPostUpdated,
  showFollowAction = false,
}) {
  const { user, setUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwner = post.user?._id === user?._id;
  const isTextOnlyPost = !post.image && Boolean(post.content);
  const postUserId = post.user?._id;

  const isFollowingPostUser = (user?.following || []).some((followId) => {
    const resolvedId = typeof followId === "string" ? followId : followId?._id;
    return resolvedId === postUserId;
  });

  const isLiked = post.likes?.some((like) => {
    const likeId = like._id || like;
    return likeId === user?._id;
  });

  const handleLike = async () => {
    try {
      const res = await likeUnlikePost(post._id);

      const updatedLikes = res.data.liked
        ? [...(post.likes || []), user._id]
        : (post.likes || []).filter((like) => {
            const likeId = like._id || like;
            return likeId !== user._id;
          });

      onPostUpdated?.({
        ...post,
        likes: updatedLikes,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Like failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id);
      toast.success("Post deleted");
      onPostDeleted?.(post._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleCommentCountChange = (postId, count) => {
    void postId;
    onPostUpdated?.({
      ...post,
      commentsCount: count,
    });
  };

  const handleFollowToggle = async () => {
    if (!postUserId || postUserId === user?._id || followLoading) return;

    try {
      setFollowLoading(true);
      const res = await followUnfollowUser(postUserId);

      const updatedFollowing = res.data.isFollowing
        ? [...(user?.following || []), postUserId]
        : (user?.following || []).filter((followId) => {
            const resolvedId =
              typeof followId === "string" ? followId : followId?._id;
            return resolvedId !== postUserId;
          });

      const updatedUser = {
        ...user,
        following: updatedFollowing,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <article className="bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
            <div className="rounded-full bg-black p-0.5">
              <Avatar user={post.user} size={38} />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {post.user?.username || post.user?.name}
            </h3>
            <p className="truncate text-xs text-neutral-500">
              {post.user?.name}
            </p>
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-900 hover:text-red-500"
            title="Delete post"
          >
            <Trash2 size={18} />
          </button>
        ) : showFollowAction ? (
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
              isFollowingPostUser
                ? "bg-neutral-800 text-white hover:bg-neutral-700"
                : "bg-[#0095f6] text-white hover:bg-[#1877f2]"
            } ${followLoading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {followLoading
              ? "..."
              : isFollowingPostUser
                ? "Following"
                : "Follow"}
          </button>
        ) : (
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-neutral-900">
            <MoreHorizontal size={22} />
          </button>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div className="border-y border-neutral-800 bg-neutral-950">
          <img
            src={post.image}
            alt="Post"
            className="max-h-180 w-full object-cover"
          />
        </div>
      )}

      {/* Caption */}
      {post.content && (
        <div className="px-4 pt-2">
          <p className="wrap-break-word text-sm leading-5 text-neutral-200">
            {!isTextOnlyPost && (
              <span className="mr-1 font-semibold text-white">
                {post.user?.username || post.user?.name}
              </span>
            )}
            {post.content}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 pb-2 pt-3">
        <button
          onClick={handleLike}
          className={`transition hover:scale-110 ${
            isLiked ? "text-red-500" : "text-white"
          }`}
          title="Like"
        >
          <Heart size={26} fill={isLiked ? "currentColor" : "none"} />
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="text-white transition hover:scale-110"
          title="Comments"
        >
          <MessageCircle size={26} />
        </button>
      </div>

      {/* Likes */}
      <div className="px-4">
        <p className="text-sm font-semibold text-white">
          {post.likes?.length || 0} likes
        </p>
      </div>

      {/* Comment count */}
      <button
        onClick={() => setShowComments((prev) => !prev)}
        className="px-4 pt-2 text-sm text-neutral-500 transition hover:text-neutral-300"
      >
        View {post.commentsCount || 0} comments
      </button>

      {showComments && (
        <CommentBox
          post={post}
          onCommentCountChange={handleCommentCountChange}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Post?"
        message="This post will be removed permanently."
        confirmText="Delete"
        danger
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          void handleDelete();
        }}
      />
    </article>
  );
}

export default PostCard;
