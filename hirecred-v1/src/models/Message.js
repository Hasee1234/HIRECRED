import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    fromId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: 2000,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
MessageSchema.index({ fromId: 1, toId: 1, createdAt: -1 });
MessageSchema.index({ toId: 1, read: 1 });

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;