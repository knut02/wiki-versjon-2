import { siteConfig } from "@/config/site";
import { nb, type Messages } from "./nb";

const dictionaries: Record<string, Messages> = {
  nb,
};

export const ui: Messages = dictionaries[siteConfig.language] ?? nb;
export type { Messages };
