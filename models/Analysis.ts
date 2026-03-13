import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
  diff?: string;
}

export interface IAIResult {
  suspected_commit_sha: string;
  suspected_commit_message: string;
  reason: string;
  suggested_fix: string;
}

export interface IAnalysis extends Document {
  userId?: mongoose.Types.ObjectId;
  repoUrl: string;
  errorMessage: string;
  branch?: string;
  analyzedCommits: ICommitInfo[];
  aiResult: IAIResult;
  isPublic: boolean;
  createdAt: Date;
}

const CommitInfoSchema = new Schema<ICommitInfo>(
  {
    sha: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String, required: true },
    diff: { type: String },
  },
  { _id: false }
);

const AIResultSchema = new Schema<IAIResult>(
  {
    suspected_commit_sha: { type: String, required: true },
    suspected_commit_message: { type: String, required: true },
    reason: { type: String, required: true },
    suggested_fix: { type: String, required: true },
  },
  { _id: false }
);

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    repoUrl: { type: String, required: true },
    errorMessage: { type: String, required: true },
    branch: { type: String },
    analyzedCommits: [CommitInfoSchema],
    aiResult: { type: AIResultSchema, required: true },
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Analysis: Model<IAnalysis> =
  mongoose.models.Analysis || mongoose.model<IAnalysis>("Analysis", AnalysisSchema);

export default Analysis;
