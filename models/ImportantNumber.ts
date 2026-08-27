import mongoose, { Schema, models } from "mongoose";

const ImportantNumberSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

export const ImportantNumber =
  models.ImportantNumber || mongoose.model("ImportantNumber", ImportantNumberSchema);
