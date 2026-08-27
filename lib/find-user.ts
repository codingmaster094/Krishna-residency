import { Admin } from "@/models/Admin";
import { digitsOnly } from "@/lib/format";

export async function findLoginUser(identifier: string) {
  const email = identifier.trim().toLowerCase();
  const mobile = digitsOnly(identifier);
  return Admin.findOne({
    $or: [{ email }, ...(mobile.length === 10 ? [{ mobile }] : [])],
  });
}
