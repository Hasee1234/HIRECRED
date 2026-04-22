import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    fromClientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rawText: {
      type: String,
      required: [true, "Feedback text is required"],
      minlength: 10,
      maxlength: 1000,
    },
    aiProcessed: {
      skillRating: { type: Number, default: 0, min: 0, max: 5 },
      communicationRating: { type: Number, default: 0, min: 0, max: 5 },
      reliabilityRating: { type: Number, default: 0, min: 0, max: 5 },
      summary: { type: String, default: "" },
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    projectTitle: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

export default Feedback;