import mongoose, { Schema, models } from "mongoose";

const VehicleSchema = new Schema(
  {
    flatId: { type: Schema.Types.ObjectId, ref: "Flat", required: true },
    type: { type: String, enum: ["car", "bike", "rickshaw", "auto"], required: true },
    number: { type: String, required: true },
    occupant: { type: String, enum: ["owner", "renter"], default: "owner" },
    ownerName: { type: String, default: "" },
    stickerIssued: { type: Boolean, default: false },
    stickerNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Vehicle = models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
