import mongoose, { Schema, models } from "mongoose";

const ExpenseCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    includeInCommonExpense: { type: Boolean, default: false },
    commonRole: { type: String, enum: ["normal", "common_credit", "common_debit"], default: "normal" },
  },
  { timestamps: true }
);

export const ExpenseCategory =
  models.ExpenseCategory || mongoose.model("ExpenseCategory", ExpenseCategorySchema);
