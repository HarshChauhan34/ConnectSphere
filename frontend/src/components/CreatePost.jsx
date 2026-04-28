import { useState } from "react";
import { Image, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { createPost } from "../services/postService";
import { useAuth } from "../context/useAuth";
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
    <div className="border-b border-neutral-800 bg-black">
      <form onSubmit={handleSubmit} className="px-4 py-4">
        <div className="flex gap-3">
          <div className="shrink-0">
            <Avatar user={user} size={42} />
          </div>

          <div className="min-w-0 flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind${user?.name ? `, ${user.name}` : ""}?`}
              rows="3"
              className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-neutral-500"
            />

            {preview && (
              <div className="relative mt-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-105 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition hover:bg-neutral-800"
                  title="Remove image"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-neutral-900 pt-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold text-[#0095f6] transition hover:bg-[#0095f6]/10">
                <Image size={20} />
                Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImage}
                />
              </label>

              <button
                disabled={loading || (!content.trim() && !image)}
                className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition ${
                  loading || (!content.trim() && !image)
                    ? "cursor-not-allowed bg-[#0095f6]/40 text-white/70"
                    : "bg-[#0095f6] text-white hover:bg-[#1877f2] active:scale-95"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Posting
                  </span>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
