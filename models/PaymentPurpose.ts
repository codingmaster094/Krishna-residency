import mongoose, { Schema, models } from "mongoose";

const PaymentPurposeSchema = new Schema(
  {
    title: { type: String, required: true },
    amountPerFlat: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },
    scope: { type: String, enum: ["sold", "all"], default: "sold" },
  },
  { timestamps: true }
);

export const PaymentPurpose =
  models.PaymentPurpose || mongoose.model("PaymentPurpose", PaymentPurposeSchema);
