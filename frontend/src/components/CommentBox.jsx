import { useEffect, useState } from "react";
import { Send, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  addComment,
  deleteComment,
  getPostComments,
} from "../services/commentService";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

function CommentBox({ post, onClose, onCommentCountChange }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await getPostComments(post._id);
      setComments(res.data.comments);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post._id]);

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
    <div className="border-t border-white/10 bg-slate-950/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Comments</h3>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-300 hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleAddComment} className="mb-5 flex gap-3">
        <Avatar user={user} size={40} />

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />

        <button className="rounded-2xl bg-indigo-500 px-4 hover:bg-indigo-600">
          <Send size={18} />
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Avatar user={comment.user} size={36} />

              <div className="flex-1 rounded-2xl bg-white/10 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {comment.user?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      @{comment.user?.username}
                    </p>
                  </div>

                  {comment.user?._id === user?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-300 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-200">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentBox;