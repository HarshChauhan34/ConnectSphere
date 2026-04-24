import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;