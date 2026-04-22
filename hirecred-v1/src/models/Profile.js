import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "expert"],
    default: "intermediate",
  },
});

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  years: { type: Number, required: true },
  description: { type: String, default: "" },
});

const PortfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: "" },
  screenshot: { type: String, default: "" },
  description: { type: String, default: "" },
});

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    skills: [SkillSchema],
    experience: [ExperienceSchema],
    portfolio: [PortfolioSchema],
    proofSignals: {
      githubUrl: { type: String, default: "" },
      linkedinUrl: { type: String, default: "" },
      clientReferences: [
        {
          name: { type: String },
          email: { type: String },
          verified: { type: Boolean, default: false },
        },
      ],
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    credScore: {
      score: { type: Number, default: 0 },
      strengths: [{ type: String }],
      risks: [{ type: String }],
      lastUpdated: { type: Date, default: null },
    },
    ratings: {
      skill: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      reliability: { type: Number, default: 0 },
      totalFeedbacks: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);

export default Profile;