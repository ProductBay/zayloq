import type { SimulatorScenario } from "../types";

export function classifyPrompt(
  prompt: string
): SimulatorScenario {
  const text = prompt.toLowerCase();

  if (
    text.includes("restaurant") ||
    text.includes("food") ||
    text.includes("menu") ||
    text.includes("pizza") ||
    text.includes("cafe") ||
    text.includes("jerk") ||
    text.includes("dining")
  ) {
    return "restaurant";
  }

  if (
    text.includes("fashion") ||
    text.includes("clothing") ||
    text.includes("store") ||
    text.includes("shop") ||
    text.includes("boutique") ||
    text.includes("products")
  ) {
    return "fashion";
  }

  if (
    text.includes("villa") ||
    text.includes("hotel") ||
    text.includes("guesthouse") ||
    text.includes("booking") ||
    text.includes("property") ||
    text.includes("resort") ||
    text.includes("hospitality")
  ) {
    return "villa";
  }

  if (
    text.includes("saas") ||
    text.includes("software") ||
    text.includes("dashboard") ||
    text.includes("subscription") ||
    text.includes("platform") ||
    text.includes("accounting app")
  ) {
    return "saas";
  }

  return "business";
}
