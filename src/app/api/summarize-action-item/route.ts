import { NextResponse } from "next/server";

const SYSTEM =
  "You output only a short task title: start with an imperative verb, maximum 8 words, no quotes or punctuation at the ends.";

export async function POST(req: Request) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const mock = mockSummarize(text);
    return NextResponse.json({ taskName: mock });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Summarize this action item as a short task name starting with a verb, max 8 words:\n\n${text}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 60,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "LLM request failed", detail: err.slice(0, 500) },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const taskName = raw.replace(/^["“”]+|["“”]+$/g, "").slice(0, 200);
    if (!taskName) {
      return NextResponse.json(
        { error: "Empty completion" },
        { status: 502 },
      );
    }
    return NextResponse.json({ taskName });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function mockSummarize(line: string): string {
  const words = line.split(/\s+/).filter(Boolean).slice(0, 8);
  const core = words.join(" ");
  return core ? `Review ${core}` : "Review follow-up";
}
