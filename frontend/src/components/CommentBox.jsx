import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  addComment,
  deleteComment,
  getPostComments,
} from "../services/commentService";
import { useAuth } from "../context/useAuth";
import Avatar from "./Avatar";

function CommentBox({ post, onCommentCountChange }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await getPostComments(post._id);
      setComments(res.data.comments);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [post._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchComments();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.error("Write a comment");
      return;
    }

    try {
      const res = await addComment(post._id, { text });
      setComments((prev) => [res.data.comment, ...prev]);
      setText("");
      onCommentCountChange?.(post._id, res.data.commentsCount);
    } catch (error) {
      toast.error(error.response?.data?.message || "Comment failed");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      onCommentCountChange?.(post._id, res.data.commentsCount);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="border-t border-neutral-800 bg-black">
      {/* Add Comment */}
      <form
        onSubmit={handleAddComment}
        className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3"
      >
        <div className="shrink-0">
          <Avatar user={user} size={34} />
        </div>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
        />

        <button
          disabled={!text.trim()}
          className={`text-sm font-semibold transition ${
            text.trim()
              ? "text-[#0095f6] hover:text-white"
              : "cursor-not-allowed text-[#0095f6]/40"
          }`}
        >
          Post
        </button>
      </form>

      {/* Comments */}
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 py-3 text-sm text-neutral-400">
            <Loader2 size={16} className="animate-spin" />
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <p className="py-3 text-center text-sm text-neutral-500">
            No comments yet.
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="shrink-0">
                  <Avatar user={comment.user} size={34} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="wrap-break-word text-sm leading-5 text-neutral-200">
                    <span className="mr-1 font-semibold text-white">
                      {comment.user?.username || comment.user?.name}
                    </span>
                    {comment.text}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {comment.user?.name}
                  </p>
                </div>

                {comment.user?._id === user?._id && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-900 hover:text-red-500"
                    title="Delete comment"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentBox;
