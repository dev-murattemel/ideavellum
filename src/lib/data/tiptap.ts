import type { TiptapDoc } from "./types";

const text = (t: string) => ({ type: "text", text: t });

export const p = (t: string) => ({ type: "paragraph", content: t ? [text(t)] : [] });
export const h = (level: 2 | 3, t: string) => ({ type: "heading", attrs: { level }, content: [text(t)] });
export const ul = (items: string[]) => ({
  type: "bulletList",
  content: items.map((i) => ({ type: "listItem", content: [p(i)] })),
});
export const todo = (items: [boolean, string][]) => ({
  type: "taskList",
  content: items.map(([checked, t]) => ({ type: "taskItem", attrs: { checked }, content: [p(t)] })),
});
export const doc = (...content: unknown[]): TiptapDoc => ({ type: "doc", content });

/** Not önizlemesi için düz metin */
export function docToText(d: TiptapDoc | null | undefined, max = 160): string {
  const out: string[] = [];
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    const node = n as { text?: string; content?: unknown[]; type?: string };
    if (node.text) out.push(node.text);
    node.content?.forEach(walk);
    if (node.type && /paragraph|heading|listItem|taskItem/.test(node.type)) out.push(" ");
  };
  walk(d);
  const s = out.join("").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
