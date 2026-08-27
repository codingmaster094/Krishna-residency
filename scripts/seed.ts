import { dbConnect } from "../lib/db";
import { ensureSocietyData } from "../lib/ensure-society";

async function main() {
  await dbConnect();
  await ensureSocietyData();
  console.log("Society data ready: 44 galas, ₹400 maintenance, expense categories");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
