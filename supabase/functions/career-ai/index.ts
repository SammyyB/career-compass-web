import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite",
] as const;
const GEMINI_RETRY_DELAYS_MS = [700, 1500];
const MAX_ANSWER_LENGTH = 8_000;
const MAX_CONTEXT_LENGTH = 8_000;
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_PDF_BASE64_LENGTH = Math.ceil(MAX_PDF_BYTES / 3) * 4 + 16;

type Action =
  | "interview_questions"
  | "interview_feedback"
  | "resume_analysis"
  | "resume_builder";

type ProfileContext = {
  first_name: string;
  last_name: string;
  program: string;
  career_target: string;
  interests: string[];
  technologies: string[];
};

type GeminiSchema = Record<string, unknown>;

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

function getBearerToken(request: Request) {
  const header = request.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

function text(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function stringArray(value: unknown, maximumItems = 10) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, maximumItems);
}

function parseAction(value: unknown): Action | null {
  if (
    value === "interview_questions" ||
    value === "interview_feedback" ||
    value === "resume_analysis" ||
    value === "resume_builder"
  ) {
    return value;
  }

  return null;
}

function extractGeminiText(payload: Record<string, unknown>) {
  const candidates = Array.isArray(payload.candidates)
    ? payload.candidates
    : [];
  const firstCandidate = candidates[0] as Record<string, unknown> | undefined;
  const content = firstCandidate?.content as Record<string, unknown> | undefined;
  const parts = Array.isArray(content?.parts) ? content.parts : [];
  const firstPart = parts[0] as Record<string, unknown> | undefined;

  return typeof firstPart?.text === "string" ? firstPart.text : "";
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function callGemini(
  apiKey: string,
  contents: Array<Record<string, unknown>>,
  responseSchema: GeminiSchema
) {
  let lastError = "Gemini could not complete the request.";

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt <= GEMINI_RETRY_DELAYS_MS.length; attempt += 1) {
      const result = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema,
            },
          }),
        }
      );

      if (result.ok) {
        const payload = (await result.json()) as Record<string, unknown>;
        const rawText = extractGeminiText(payload);

        if (!rawText) throw new Error("Gemini returned an empty response.");

        try {
          return JSON.parse(rawText) as Record<string, unknown>;
        } catch {
          throw new Error("Gemini returned an invalid structured response.");
        }
      }

      let message = "Gemini could not complete the request.";
      try {
        const errorPayload = (await result.json()) as {
          error?: { message?: unknown };
        };
        const providerMessage = errorPayload.error?.message;
        if (typeof providerMessage === "string" && providerMessage.trim()) {
          message = providerMessage.trim().slice(0, 500);
        }
      } catch {
        // Keep the safe fallback when Gemini does not return JSON.
      }

      lastError = `Gemini error (${result.status}): ${message}`;

      // 503 means temporary capacity pressure. 429 may also recover after a
      // short wait. Retry the current model, then move to the next fallback.
      if (result.status !== 503 && result.status !== 429 && result.status !== 404) {
        throw new Error(lastError);
      }

      if (attempt < GEMINI_RETRY_DELAYS_MS.length) {
        await wait(GEMINI_RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  throw new Error(lastError);
}

function profileContext(row: Record<string, unknown> | null): ProfileContext {
  return {
    first_name: text(row?.first_name, 120),
    last_name: text(row?.last_name, 120),
    program: text(row?.program, 160),
    career_target: text(row?.career_target, 160),
    interests: stringArray(row?.interests),
    technologies: stringArray(row?.technologies, 20),
  };
}

function decodePdfSignature(base64: string) {
  try {
    const bytes = Uint8Array.from(atob(base64.slice(0, 16)), (character) =>
      character.charCodeAt(0)
    );
    return new TextDecoder().decode(bytes).startsWith("%PDF-");
  } catch {
    return false;
  }
}

async function main(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return response({ error: "Only POST requests are supported." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const token = getBearerToken(request);

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !geminiKey) {
    return response({ error: "The AI service is not configured." }, 503);
  }

  if (!token) {
    return response({ error: "Authentication is required." }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return response({ error: "Your session is invalid or expired." }, 401);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profileRow, error: profileError } = await serviceClient
    .from("profiles")
    .select("first_name, last_name, program, career_target, interests, technologies")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return response({ error: "Unable to load your career profile." }, 500);
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = parseAction(body.action);

  if (!action) {
    return response({ error: "Unsupported AI action." }, 400);
  }

  const quotaKind = action.startsWith("interview") ? "interview" : "resume";
  const { data: quotaAllowed, error: quotaError } = await serviceClient.rpc(
    "consume_career_ai_quota",
    { p_user_id: user.id, p_kind: quotaKind }
  );

  if (quotaError) {
    return response({ error: "AI usage limits are not installed yet." }, 503);
  }

  if (!quotaAllowed) {
    return response(
      { error: "You have reached the daily AI request limit. Please try again tomorrow." },
      429
    );
  }

  const careerProfile = profileContext(profileRow as Record<string, unknown> | null);

  if (action === "interview_questions") {
    const moduleName = text(body.module, 160) || "IT career preparation";
    const moduleContext = text(body.approved_module_context, MAX_CONTEXT_LENGTH);
    const requestSeed = text(body.request_seed, 100) || crypto.randomUUID();

    return response(
      await callGemini(
        geminiKey,
        [
          {
            role: "user",
            parts: [
              {
                text: `Create exactly 5 different interview questions for the student's target career. Use only the approved module context. Do not invent topics outside the module. Return concise questions suitable for a student. Avoid repeating common questions when possible. This is a new generation request with seed ${requestSeed}; use it to vary the question set. Module: ${moduleName}. Approved module context: ${moduleContext}. Career profile: ${JSON.stringify(careerProfile)}`,
              },
            ],
          },
        ],
        {
          type: "object",
          properties: {
            questions: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  module: { type: "string" },
                },
                required: ["question", "module"],
              },
            },
          },
          required: ["questions"],
        }
      )
    );
  }

  if (action === "interview_feedback") {
    const question = text(body.question, 1_000);
    const answer = text(body.answer, MAX_ANSWER_LENGTH);
    const moduleName = text(body.module, 160);
    const moduleContext = text(body.approved_module_context, MAX_CONTEXT_LENGTH);

    if (!question || !answer || !moduleContext) {
      return response({ error: "Question, answer, and module context are required." }, 400);
    }

    return response(
      await callGemini(
        geminiKey,
        [
          {
            role: "user",
            parts: [
              {
                text: `Evaluate this interview answer only against the approved module content. Do not judge knowledge outside the module. Give specific, encouraging feedback and a score from 0 to 100. Module: ${moduleName}. Approved module content: ${moduleContext}. Question: ${question}. Student answer: ${answer}. Career profile: ${JSON.stringify(careerProfile)}`,
              },
            ],
          },
        ],
        {
          type: "object",
          properties: {
            feedback: { type: "string" },
            score: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["feedback", "score"],
        }
      )
    );
  }

  if (action === "resume_builder") {
    return response(
      await callGemini(
        geminiKey,
        [
          {
            role: "user",
            parts: [
              {
                text: `Create an honest one-page resume draft using only this student's profile context. Include the student's first and last name at the top of the draft. Use the program, career target, interests, and technologies to personalize the draft. Do not invent employers, dates, grades, certificates, projects, or achievements. Use clear placeholders for any resume sections that are not provided. Make the draft suitable for an IT student targeting the stated career. Profile context: ${JSON.stringify(careerProfile)}`,
              },
            ],
          },
        ],
        {
          type: "object",
          properties: {
            resume_markdown: { type: "string" },
            suggestions: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["resume_markdown", "suggestions"],
        }
      )
    );
  }

  const fileName = text(body.file_name, 180);
  const mimeType = text(body.mime_type, 80);
  const pdfBase64 = text(body.pdf_base64, MAX_PDF_BASE64_LENGTH);

  if (
    !fileName.toLowerCase().endsWith(".pdf") ||
    mimeType !== "application/pdf" ||
    !pdfBase64 ||
    pdfBase64.length > MAX_PDF_BASE64_LENGTH ||
    !decodePdfSignature(pdfBase64)
  ) {
    return response({ error: "Upload a valid, unencrypted PDF resume up to 10 MB." }, 400);
  }

  return response(
    await callGemini(
      geminiKey,
      [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this resume for the student's target IT career. Refer only to the actual document and the career-related profile context. Do not invent information. Identify strengths, missing or unclear sections, skills to improve, and concrete next steps. A score is coaching guidance, not a hiring probability. Profile context: ${JSON.stringify(careerProfile)}`,
            },
            {
              inline_data: {
                mime_type: "application/pdf",
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      {
        type: "object",
        properties: {
          analysis: { type: "string" },
          alignment_score: { type: "number", minimum: 0, maximum: 100 },
          warnings: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["analysis", "alignment_score", "warnings"],
      }
    )
  );
}

Deno.serve(async (request) => {
  try {
    return await main(request);
  } catch (error) {
    console.error("career-ai request failed:", error instanceof Error ? error.message : "unknown error");
    return response(
      {
        error:
          error instanceof Error
            ? error.message.slice(0, 500)
            : "The AI request could not be completed.",
      },
      500
    );
  }
});