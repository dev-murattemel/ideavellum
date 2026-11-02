import type { CatalogGroup } from "./types";

/** Hazır hareket listesi: kuvvet hareketleri set/tekrar/kg, kardiyo dakika/km ile izlenir */
export const EXERCISES: CatalogGroup[] = [
  { name: "Göğüs", metric: "strength", items: ["Bench press", "Eğimli bench press", "Dambıl press", "Eğimli dambıl press", "Dambıl fly", "Kablo crossover", "Şınav", "Dips", "Pec deck", "Göğüs press makinesi"] },
  { name: "Sırt", metric: "strength", items: ["Barfiks", "Lat pulldown", "Barbell row", "Dambıl row", "Seated cable row", "T-bar row", "Deadlift", "Face pull", "Pullover", "Hiperekstansiyon"] },
  { name: "Bacak", metric: "strength", items: ["Squat", "Front squat", "Leg press", "Romanian deadlift", "Lunge", "Bulgarian split squat", "Leg extension", "Leg curl", "Hip thrust", "Calf raise", "Goblet squat", "Step-up"] },
  { name: "Omuz", metric: "strength", items: ["Overhead press", "Dambıl omuz press", "Lateral raise", "Front raise", "Rear delt fly", "Arnold press", "Upright row", "Shrug"] },
  { name: "Kol", metric: "strength", items: ["Barbell curl", "Dambıl curl", "Hammer curl", "Preacher curl", "Triceps pushdown", "Skull crusher", "Overhead triceps extension", "Close-grip bench press", "Kablo curl"] },
  { name: "Karın", metric: "strength", items: ["Plank", "Crunch", "Leg raise", "Russian twist", "Cable crunch", "Ab wheel", "Mountain climber", "Dead bug", "Side plank"] },
  { name: "Kardiyo", metric: "cardio", items: ["Koşu", "Tempolu koşu", "Interval koşu", "Yürüyüş", "Bisiklet", "Kondisyon bisikleti", "Yüzme", "Kürek makinesi", "Eliptik", "İp atlama", "Merdiven makinesi"] },
  { name: "Mobilite", metric: "cardio", items: ["Isınma", "Esneme", "Kalça mobilitesi", "Omuz mobilitesi", "Foam roller", "Yoga akışı", "Soğuma yürüyüşü"] },
];
