// Lists legal details that are still missing from src/legal/legalConfig.js. Informational: always exits 0.
import { pendingItems } from "../src/legal/legalConfig.js";
const left = pendingItems();
console.log(left.length ? "Still worth adding:\n - " + left.join("\n - ") : "All legal details filled in.");
