import mongoose, { Schema, models } from "mongoose";

const NoticeSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const Notice = models.Notice || mongoose.model("Notice", NoticeSchema);
