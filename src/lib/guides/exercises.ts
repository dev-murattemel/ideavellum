import { LOWER_GUIDES } from "./exercises-lower";
import { UPPER_GUIDES } from "./exercises-upper";
import type { ExerciseGuide } from "./types";

/** Hareket rehberi: nasıl yapılır, duruş, sık hatalar, önerilen set */
export const EXERCISE_GUIDES: ExerciseGuide[] = [...UPPER_GUIDES, ...LOWER_GUIDES];

export const GUIDE_GROUPS = ["Göğüs", "Sırt", "Bacak", "Omuz", "Kol", "Karın", "Kardiyo", "Mobilite"];
