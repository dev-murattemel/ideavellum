/** Ders paleti. Veritabanında sadece anahtar ("mint") saklanır, hex değil. */
export const COURSE_COLORS = [
  { key: "lavender", label: "Lavanta" },
  { key: "sky", label: "Gök" },
  { key: "mint", label: "Nane" },
  { key: "peach", label: "Şeftali" },
  { key: "rose", label: "Gül" },
  { key: "butter", label: "Tereyağı" },
  { key: "sage", label: "Adaçayı" },
  { key: "slate", label: "Arduvaz" },
] as const;

export type CourseColor = (typeof COURSE_COLORS)[number]["key"];

export const COURSE_COLOR_KEYS = COURSE_COLORS.map((c) => c.key) as [
  CourseColor,
  ...CourseColor[],
];

export function isCourseColor(value: string): value is CourseColor {
  return (COURSE_COLOR_KEYS as string[]).includes(value);
}

/**
 * Bir öğeye ders rengini vermek için: <div {...courseColorProps("mint")} className="bg-course text-course-fg" />
 */
export function courseColorProps(color: CourseColor) {
  return { "data-course": color } as const;
}
