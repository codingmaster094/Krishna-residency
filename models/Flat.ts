import mongoose, { Schema, models } from "mongoose";

const FlatSchema = new Schema(
  {
    number: { type: Number, required: true, unique: true, min: 1, max: 44 },
    status: { type: String, enum: ["sold", "rent", "available"], default: "available" },
    ownerName: { type: String, default: "" },
    ownerMobile: { type: String, default: "" },
    renterName: { type: String, default: "" },
    renterMobile: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Flat = models.Flat || mongoose.model("Flat", FlatSchema);
