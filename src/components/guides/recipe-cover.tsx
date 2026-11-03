import {
  Apple, Bean, Beef, Carrot, Cherry, Citrus, CookingPot, Drumstick, Egg, EggFried, Fish, Leaf, Milk, Nut,
  Salad, Sandwich, Shrimp, Soup, Sprout, Wheat, type LucideIcon,
} from "lucide-react";

import { styleInfo, type Recipe, type RecipeIcon } from "@/lib/guides";
import { cn } from "@/lib/utils";

const ICONS: Record<RecipeIcon, LucideIcon> = {
  beef: Beef, fish: Fish, salad: Salad, egg: Egg, "egg-fried": EggFried, soup: Soup, drumstick: Drumstick,
  wheat: Wheat, sandwich: Sandwich, pot: CookingPot, carrot: Carrot, apple: Apple, leaf: Leaf, milk: Milk,
  citrus: Citrus, cherry: Cherry, shrimp: Shrimp, bean: Bean, sprout: Sprout, nut: Nut,
};

/**
 * Tarif kapağı: stilin pastel renginde, büyük bir yemek simgesi ve yumuşak daireler.
 * (Telifli fotoğraf kullanmamak için çizim tabanlı.)
 */
export function RecipeCover({ recipe, className, size = "md" }: { recipe: Recipe; className?: string; size?: "md" | "lg" }) {
  const Icon = ICONS[recipe.icon];
  return (
    <div data-course={styleInfo(recipe.style).color} aria-hidden className={cn("relative overflow-hidden bg-course text-course-fg", className)}>
      <span className="absolute -top-8 -right-8 size-32 rounded-full border-[18px] border-course-solid/15" />
      <span className="absolute -bottom-10 -left-6 size-28 rounded-full bg-course-solid/10" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className={cn("flex items-center justify-center rounded-full bg-surface/70 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)]", size === "lg" ? "size-24" : "size-16")}>
          <Icon className={size === "lg" ? "size-11" : "size-8"} strokeWidth={1.6} />
        </span>
      </span>
    </div>
  );
}
