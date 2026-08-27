import mongoose, { Schema, models } from "mongoose";

const ExpenseSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "ExpenseCategory", required: true },
    expenseType: { type: String, enum: ["general", "common"], required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    paymentMethod: { type: String, enum: ["cash", "bank", "upi", "cheque"], required: true },
    notes: { type: String, default: "" },
    bills: [{ url: String, name: String, contentType: String }],
    whatsappShared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Expense = models.Expense || mongoose.model("Expense", ExpenseSchema);
