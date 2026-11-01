import { z } from "zod";

/** AI özellikleri: istemcinin gönderdiği en az veri ve modelden beklenen yapılandırılmış yanıt. */

export const weeklyInput = z.object({
  range: z.string().max(60),
  totalMinutes: z.number().int().min(0),
  targetMinutes: z.number().int().min(0),
  completedTasks: z.number().int().min(0),
  completedTopics: z.number().int().min(0),
  attendanceRate: z.number().int().min(0).max(100).nullable(),
  streak: z.number().int().min(0),
  perCourse: z.array(z.object({ name: z.string().max(80), minutes: z.number().int(), target: z.number().int() })).max(20),
});
export const weeklyOutput = z.object({
  comment: z.string().describe("2-4 cümlelik, sıcak ama abartısız haftalık değerlendirme"),
  suggestions: z.array(z.string()).max(3).describe("Gelecek hafta için en fazla 3 somut öneri"),
});

export const focusInput = z.object({
  now: z.string().max(60),
  sessionsToday: z.array(z.object({ course: z.string().max(80), time: z.string().max(20), done: z.boolean() })).max(20),
  overdue: z.array(z.object({ title: z.string().max(200), course: z.string().max(80).nullable(), due: z.string().max(30), priority: z.string().max(10) })).max(30),
  dueToday: z.array(z.object({ title: z.string().max(200), course: z.string().max(80).nullable(), due: z.string().max(30), priority: z.string().max(10) })).max(30),
  courses: z.array(z.object({ name: z.string().max(80), weekMinutes: z.number().int(), target: z.number().int() })).max(20),
});
export const focusOutput = z.object({
  headline: z.string().describe("Tek cümlelik ana odak"),
  items: z.array(z.object({ title: z.string(), reason: z.string() })).max(3).describe("Sıralı en fazla 3 odak maddesi"),
});

export const suggestInput = z.object({
  courseName: z.string().max(80).nullable(),
  existingTopics: z.array(z.string().max(200)).max(60),
  sourceTitle: z.string().max(200),
  text: z.string().min(20).max(12000),
});
export const suggestOutput = z.object({
  topics: z.array(z.object({ title: z.string(), why: z.string() })).max(5),
  tasks: z.array(z.object({ title: z.string(), priority: z.enum(["low", "medium", "high"]) })).max(5),
});

export const outlineInput = z.object({
  name: z.string().max(80),
  goal: z.string().max(600).nullable(),
  description: z.string().max(600).nullable(),
  existingTopics: z.array(z.string().max(200)).max(60),
});
export const outlineOutput = z.object({
  topics: z.array(z.object({ title: z.string(), note: z.string() })).min(3).max(10).describe("Sıralı konu listesi"),
});

export const AI_FEATURES = {
  weekly: { input: weeklyInput, output: weeklyOutput },
  focus: { input: focusInput, output: focusOutput },
  suggest: { input: suggestInput, output: suggestOutput },
  outline: { input: outlineInput, output: outlineOutput },
} as const;

export type AiFeature = keyof typeof AI_FEATURES;
export type AiInput<F extends AiFeature> = z.infer<(typeof AI_FEATURES)[F]["input"]>;
export type AiOutput<F extends AiFeature> = z.infer<(typeof AI_FEATURES)[F]["output"]>;
