import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deletePost, likeUnlikePost } from "../services/postService";
import { useAuth } from "../context/useAuth";
import CommentBox from "./CommentBox";
import Avatar from "./Avatar";

function PostCard({ post, onPostDeleted, onPostUpdated }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const isOwner = post.user?._id === user?._id;

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
    const confirmDelete = window.confirm("Delete this post?");
    if (!confirmDelete) return;

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

  return (
    <article className="bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="rounded-full bg-black p-[2px]">
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
            onClick={handleDelete}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-900 hover:text-red-500"
            title="Delete post"
          >
            <Trash2 size={18} />
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
            className="max-h-[720px] w-full object-cover"
          />
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

      {/* Caption */}
      {post.content && (
        <div className="px-4 pt-2">
          <p className="break-words text-sm leading-5 text-neutral-200">
            <span className="mr-1 font-semibold text-white">
              {post.user?.username || post.user?.name}
            </span>
            {post.content}
          </p>
        </div>
      )}

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
    </article>
  );
}

export default PostCard;
