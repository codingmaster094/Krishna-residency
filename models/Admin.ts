import mongoose, { Schema, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true, collection: "users" }
);

export type UserDoc = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: "admin";
};

export const Admin: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", UserSchema, "users");
