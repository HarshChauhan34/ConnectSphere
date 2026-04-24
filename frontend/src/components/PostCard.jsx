import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deletePost, likeUnlikePost } from "../services/postService";
import { useAuth } from "../context/AuthContext";
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
    onPostUpdated?.({
      ...post,
      commentsCount: count,
    });
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <Avatar user={post.user} size={48} />

          <div>
            <h3 className="font-semibold">{post.user?.name}</h3>
            <p className="text-sm text-slate-400">@{post.user?.username}</p>
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={handleDelete}
            className="rounded-full p-2 text-red-300 transition hover:bg-red-500/20"
          >
            <Trash2 size={18} />
          </button>
        ) : (
          <MoreHorizontal className="text-slate-400" size={20} />
        )}
      </div>

      {post.content && (
        <p className="px-5 pb-4 leading-relaxed text-slate-100">
          {post.content}
        </p>
      )}

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="max-h-[520px] w-full object-cover"
        />
      )}

      <div className="flex items-center gap-6 border-t border-white/10 px-5 py-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 rounded-2xl px-3 py-2 transition ${
            isLiked
              ? "bg-pink-500/20 text-pink-300"
              : "text-slate-300 hover:bg-white/10"
          }`}
        >
          <Heart size={19} fill={isLiked ? "currentColor" : "none"} />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-2 rounded-2xl px-3 py-2 text-slate-300 transition hover:bg-white/10"
        >
          <MessageCircle size={19} />
          <span>{post.commentsCount || 0}</span>
        </button>
      </div>

      {showComments && (
        <CommentBox
          post={post}
          onClose={() => setShowComments(false)}
          onCommentCountChange={handleCommentCountChange}
        />
      )}
    </div>
  );
}

export default PostCard;