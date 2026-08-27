import { Flat } from "@/models/Flat";
import { ExpenseCategory } from "@/models/ExpenseCategory";
import { PaymentPurpose } from "@/models/PaymentPurpose";
import { COLLECTION_KINDS, TOTAL_PLOTS } from "./constants";

export async function ensureSocietyData() {
  if ((await Flat.countDocuments()) === 0) {
    await Flat.insertMany(
      Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
        number: i + 1,
        status: "sold",
        ownerName: "",
        ownerMobile: "",
      }))
    );
  } else {
    const existing = await Flat.find().select("number").lean();
    const have = new Set(existing.map((f) => f.number));
    const missing = Array.from({ length: TOTAL_PLOTS }, (_, i) => i + 1).filter((n) => !have.has(n));
    if (missing.length) {
      await Flat.insertMany(missing.map((number) => ({ number, status: "sold", ownerName: "", ownerMobile: "" })));
    }
  }

  if ((await ExpenseCategory.countDocuments()) === 0) {
    await ExpenseCategory.insertMany([
      { name: "બોરિંગ મોટર", includeInCommonExpense: true, commonRole: "normal" },
      { name: "સ્ટ્રીટ લાઈટ", includeInCommonExpense: true, commonRole: "normal" },
      { name: "અન્ય ખર્ચ", includeInCommonExpense: false, commonRole: "normal" },
    ]);
  }

  for (const p of COLLECTION_KINDS) {
    const found = await PaymentPurpose.findOne({ title: p.title });
    if (!found) {
      await PaymentPurpose.create({
        title: p.title,
        amountPerFlat: p.amount,
        description: p.description,
        active: true,
        scope: "all",
      });
    }
  }
}
