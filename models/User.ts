import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  githubId?: string;
  githubAccessToken?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    name: { type: String },
    image: { type: String },
    githubId: { type: String },
    githubAccessToken: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ githubId: 1 }, { sparse: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
