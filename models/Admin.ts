import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true, collection: "users" }
);

if (mongoose.models.Admin) delete mongoose.models.Admin;
if (mongoose.models.User) delete mongoose.models.User;

export const Admin = mongoose.model("User", AdminSchema, "users");
