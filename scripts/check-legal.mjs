// Fails while any legal detail in src/legal/legalConfig.js is still unconfirmed.
// Run before publishing the privacy and cookie policies: npm run check:legal
import { pendingItems } from "../src/legal/legalConfig.js";
const left = pendingItems();
if (left.length) {
  console.error("Legal details still need owner confirmation:\n - " + left.join("\n - "));
  process.exit(1);
}
console.log("All legal details confirmed.");
