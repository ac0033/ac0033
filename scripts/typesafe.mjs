// 极简 TypeSafe System One 客户端（用 Node 内置 fetch，不引入依赖）。
// 文档：https://docs.typesafe.ai/api
export const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
export const DEFAULT_MODEL = process.env.TYPESAFE_MODEL || "jev-latest";

export const noul = (instructions, criteria) => ({ type: "noul", instructions, ...(criteria ? { criteria } : {}) });
export const choice = (instructions, criteria) => ({ type: "choice", instructions, criteria });
export const score = (instructions, criteria) => ({ type: "score", instructions, criteria });

export async function systemOne({ state, questions, model = DEFAULT_MODEL, apiKey = process.env.TYPESAFE_API_KEY }) {
  if (!apiKey) throw new Error("缺少 TYPESAFE_API_KEY");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ state, model, questions }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TypeSafe ${res.status} ${res.statusText}: ${body.slice(0, 500)}`);
  }
  return res.json();
}
