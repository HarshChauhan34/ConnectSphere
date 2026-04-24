import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: 1000,
    },

    image: {
      type: String,
      default: "",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ content: "text" });

const Post = mongoose.model("Post", postSchema);

export default Post;