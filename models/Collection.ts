import mongoose, { Schema, models } from "mongoose";

const CollectionSchema = new Schema(
  {
    purposeId: { type: Schema.Types.ObjectId, ref: "PaymentPurpose", required: true },
    flatId: { type: Schema.Types.ObjectId, ref: "Flat" },
    kind: { type: String, enum: ["member", "builder"], default: "member" },
    amount: { type: Number, required: true, min: 0 },
    mode: { type: String, enum: ["cash", "bank", "upi", "cheque"], required: true },
    date: { type: Date, required: true },
    notes: { type: String, default: "" },
    reference: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Collection = models.Collection || mongoose.model("Collection", CollectionSchema);
