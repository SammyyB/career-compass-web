import { supabase } from "./supabase";

type EdgeFunctionError = Error & { context?: Response };

async function getUserMessage(error: EdgeFunctionError) {
  const context = error.context;

  if (context?.status === 401) return "Your session expired. Please sign in again.";
  if (context?.status === 429) return "You have reached the daily AI usage limit. Please try again tomorrow.";
  return "The AI service is temporarily unavailable. Please try again later.";
}

export async function invokeCareerAI<T>(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("career-ai", { body });

  if (error) {
    console.error("Career AI request failed:", error);
    throw new Error(await getUserMessage(error as EdgeFunctionError));
  }

  if (!data) throw new Error("The AI service returned an empty response.");

  return data as T;
}
