import { Flat } from "@/models/Flat";
import { ExpenseCategory } from "@/models/ExpenseCategory";
import { PaymentPurpose } from "@/models/PaymentPurpose";
import { MONTHLY_MAINTENANCE, TOTAL_GALAS } from "./constants";

export async function ensureSocietyData() {
  if ((await Flat.countDocuments()) === 0) {
    await Flat.insertMany(
      Array.from({ length: TOTAL_GALAS }, (_, i) => ({
        number: i + 1,
        status: "sold",
        ownerName: "",
        ownerMobile: "",
      }))
    );
  }

  if ((await ExpenseCategory.countDocuments()) === 0) {
    await ExpenseCategory.insertMany([
      { name: "બોરિંગ મોટર", includeInCommonExpense: true, commonRole: "normal" },
      { name: "સ્ટ્રીટ લાઈટ", includeInCommonExpense: true, commonRole: "normal" },
      { name: "અન્ય ખર્ચ", includeInCommonExpense: false, commonRole: "normal" },
    ]);
  }

  const maint = await PaymentPurpose.findOne({ title: "માસિક મેન્ટેનન્સ" });
  if (!maint) {
    await PaymentPurpose.create({
      title: "માસિક મેન્ટેનન્સ",
      amountPerFlat: MONTHLY_MAINTENANCE,
      description: "કોમન બોરિંગ મોટર અને સ્ટ્રીટ લાઈટ — દર મહિને ₹400 પ્રતિ ઘર નંબર",
      active: true,
      scope: "all",
    });
  }
}
