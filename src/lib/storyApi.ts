import type { StartRequest, StepRequest, StoryResponse } from "../types/game.ts";

// آدرس پایه از env
const BASE = import.meta.env.VITE_N8N_URL as string;
if (!BASE) {
  // بهتره لاگ کنیم تا اگر env فراموش شد، سریع معلوم شود
  // eslint-disable-next-line no-console
  console.warn("VITE_N8N_URL is not set. Please add it to .env.local");
}

// کمک‌تابع POST JSON
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// شروع بازی
export function startGame(payload: StartRequest) {
  return postJson<StoryResponse>(`${BASE}/webhook/game/start`, payload);
}

// قدم بعدی/انتخاب بعدی
export function stepGame(payload: StepRequest) {
  return postJson<StoryResponse>(`${BASE}/webhook/game/step`, payload);
}
