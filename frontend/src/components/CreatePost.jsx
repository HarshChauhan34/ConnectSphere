import { useState } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { createPost } from "../services/postService";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

function CreatePost({ onPostCreated }) {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image) {
      toast.error("Write something or select image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      const res = await createPost(formData);

      setContent("");
      removeImage();

      toast.success("Post created");
      onPostCreated?.(res.data.post);
    } catch (error) {
      toast.error(error.response?.data?.message || "Post failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Avatar user={user} size={48} />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's happening, ${user?.name}?`}
            rows="3"
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-400"
          />
        </div>

        {preview && (
          <div className="relative mt-4 overflow-hidden rounded-3xl border border-white/10">
            <img
              src={preview}
              alt="Preview"
              className="max-h-96 w-full object-cover"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/20">
            <Image size={18} />
            Photo
            <input type="file" accept="image/*" hidden onChange={handleImage} />
          </label>

          <button
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-600 disabled:opacity-60"
          >
            <Send size={18} />
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;