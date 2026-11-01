import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Tasarım sistemindeki özel yazı boyutu (text-13) birleştiriciye tanıtılır;
 * yoksa renk sınıfı sanılıp "text-primary-foreground" gibi renkleri siler.
 */
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["13"] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
