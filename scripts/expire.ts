import { expirePending } from "../lib/reservations";
import { db } from "../lib/db";
expirePending()
  .then((n) => console.log(`${n} expired pending reservations processed.`))
  .finally(() => db.$disconnect());
