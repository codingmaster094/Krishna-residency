import mongoose, { Schema, models } from "mongoose";

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    place: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Event = models.Event || mongoose.model("Event", EventSchema);
