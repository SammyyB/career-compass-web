import { useEffect, useRef, useState } from "react";
import { BarChart3, Download, FileText, Info, Sparkles, Upload, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import { invokeCareerAI } from "../../lib/careerAi";

type ResumeAnalysisResponse = {
  analysis?: string;
  alignment_score?: number;
  warnings?: string[];
};

type ResumeBuilderResponse = {
  resume_markdown?: string;
  suggestions?: string[];
};

const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024;
const focusClass =
  "focus:outline-none focus:ring-2 focus:ring-[#55b497] focus:ring-offset-2";

function validateResumeFile(file: File) {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF resumes are accepted.";
  }

  if (file.type && file.type !== "application/pdf") {
    return "The selected file must be a PDF document.";
  }

  if (file.size > MAX_RESUME_SIZE_BYTES) {
    return "The PDF resume must be 10 MB or smaller.";
  }

  return "";
}

async function fileToBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

export default function ResumeAnalyzer() {
  const { profile } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [alignmentScore, setAlignmentScore] = useState<number | null>(null);
  const [resumeDraft, setResumeDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);

  const profileComplete = Boolean(
    profile?.first_name?.trim() &&
      profile?.last_name?.trim() &&
      profile?.program?.trim() &&
      profile?.career_target?.trim() &&
      profile?.interests?.length &&
      profile?.technologies?.length
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const chooseFile = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const fileError = validateResumeFile(selectedFile);

    if (fileError) {
      setFile(null);
      setError(fileError);
      return;
    }

    setFile(selectedFile);
    setError("");
    setStatus("");
    setAnalysis("");
    setAlignmentScore(null);
  };

  const analyzeResume = async () => {
    if (!file) {
      setError("Choose a PDF resume first.");
      return;
    }

    if (!online) {
      setError("Resume analysis requires an internet connection.");
      return;
    }

    const fileError = validateResumeFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setBusy(true);
    setError("");
    setStatus("Analyzing the selected resume securely...");

    try {
      const pdfBase64 = await fileToBase64(file);
      const result = await invokeCareerAI<ResumeAnalysisResponse>({
            action: "resume_analysis",
            file_name: file.name,
            mime_type: "application/pdf",
            pdf_base64: pdfBase64,
      });
      const nextAnalysis = result.analysis?.trim();
      const nextScore =
        typeof result.alignment_score === "number"
          ? Math.max(0, Math.min(100, Math.round(result.alignment_score)))
          : null;

      if (!nextAnalysis || nextScore === null) {
        throw new Error("The AI returned incomplete resume analysis.");
      }

      setAnalysis(nextAnalysis);
      setAlignmentScore(nextScore);
      setSuggestions(result.warnings ?? []);
      setStatus("Resume analysis completed.");
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to analyze the resume."
      );
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  const generateResumeDraft = async () => {
    if (!profileComplete) {
      setError(
        "Complete your first name, last name, program, career target, interests, and technologies in your Profile before generating a resume."
      );
      return;
    }

    if (!online) {
      setError("Resume building requires an internet connection.");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("Creating a resume draft from your saved profile...");

    try {
      const result = await invokeCareerAI<ResumeBuilderResponse>({
        action: "resume_builder",
      });

      if (!result.resume_markdown?.trim()) {
        throw new Error("The AI returned an empty resume draft.");
      }

      setResumeDraft(result.resume_markdown.trim());
      setSuggestions(result.suggestions ?? []);
      setStatus("Resume draft generated. Review every section before using it.");
    } catch (builderError) {
      setError(
        builderError instanceof Error
          ? builderError.message
          : "Unable to generate the resume draft."
      );
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  const downloadDraft = () => {
    if (!resumeDraft) return;

    const blob = new Blob([resumeDraft], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "career-compass-resume-draft.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StudentLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Resume Builder & Analyzer
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Build and improve your resume
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Generate an honest resume draft from your saved career profile, or
          analyze an existing PDF. The AI does not invent experience, and results
          stay in this screen session.
        </p>
      </section>

      {!online && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          <WifiOff className="mt-0.5 shrink-0" size={18} />
          <p>You are offline. Resume AI actions will be available after reconnecting.</p>
        </div>
      )}

      {error && <p className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {status && <p className="mb-5 rounded-2xl bg-[#eaf8f5] p-4 text-sm font-semibold text-[#16806d]">{status}</p>}

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">AI Resume Builder</h2>
          </div>
          <p className="text-slate-600">
            Complete your career profile first so the generated draft is based
            on your actual information.
          </p>
          <button
            type="button"
            onClick={() => void generateResumeDraft()}
            disabled={busy || !online || !profileComplete}
            className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#55b497] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
          >
            <Sparkles size={18} />
            {busy ? "Generating..." : "Generate Resume Draft"}
          </button>
          <Link
            to="/profile"
            className={`mt-3 block text-center text-sm font-bold text-[#16806d] underline ${focusClass}`}
          >
            {profileComplete
              ? "Update profile information if needed"
              : "Complete your profile before generating a draft"}
          </Link>
        </div>

        <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <FileText className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Analyze Existing Resume</h2>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`w-full rounded-2xl border-2 border-dashed border-teal-200 p-8 font-bold text-[#16806d] hover:bg-[#f4fbfa] ${focusClass}`}
          >
            <Upload className="mx-auto mb-3" />
            {file ? file.name : "Choose a PDF resume"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            PDF only · Maximum 10 MB · Sent securely for this analysis request
          </p>

          <button
            type="button"
            onClick={() => void analyzeResume()}
            disabled={!file || busy || !online}
            className={`mt-5 w-full rounded-xl bg-[#1f8f78] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
          >
            {busy ? "Analyzing..." : "Analyze Resume"}
          </button>

          <div className="mt-5 flex gap-3 rounded-2xl bg-[#f4fbfa] p-4 text-sm text-slate-600">
            <Info className="mt-0.5 shrink-0 text-[#16806d]" size={19} />
            <p>Your PDF is not uploaded to a public bucket or stored by this page.</p>
          </div>
        </div>
      </section>

      {resumeDraft && (
        <section className="mb-6 rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="text-[#16806d]" />
              <h2 className="text-2xl font-extrabold">Generated Resume Draft</h2>
            </div>
            <button
              type="button"
              onClick={downloadDraft}
              className={`inline-flex items-center gap-2 rounded-xl bg-[#eaf8f5] px-4 py-3 font-bold text-[#16806d] ${focusClass}`}
            >
              <Download size={18} />
              Download Draft
            </button>
          </div>
          <pre className="whitespace-pre-wrap rounded-2xl bg-[#f4fbfa] p-6 text-sm leading-relaxed text-slate-700">
            {resumeDraft}
          </pre>
        </section>
      )}

      <section className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 lg:flex-row">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <BarChart3 className="text-[#16806d]" />
              <h2 className="text-2xl font-extrabold">Analysis Results</h2>
            </div>

            {alignmentScore !== null && (
              <p className="text-4xl font-extrabold text-[#16806d]">
                {alignmentScore}%
                <span className="ml-2 text-base font-semibold text-slate-500">
                  alignment
                </span>
              </p>
            )}

            <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-slate-600">
              {analysis || "Select a PDF and choose Analyze Resume to receive AI feedback."}
            </p>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <h3 className="font-extrabold text-orange-900">Review these suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-orange-900">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </StudentLayout>
  );
}