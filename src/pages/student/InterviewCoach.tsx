import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquareText,
  Mic,
  Send,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import { invokeCareerAI } from "../../lib/careerAi";

type InterviewQuestion = {
  question: string;
  module: string;
  context: string;
};

type InterviewResponse = {
  feedback?: string;
  score?: number;
};

type QuestionsResponse = {
  questions?: Array<{
    question?: string;
    module?: string;
  }>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const fallbackQuestions: InterviewQuestion[] = [
  {
    question:
      "Explain the difference between client-side and server-side rendering.",
    module: "Web Application Fundamentals",
    context:
      "Client-side rendering builds the interface in the browser. Server-side rendering generates the initial HTML on the server. The choice affects performance, SEO, and application architecture.",
  },
  {
    question: "How would you secure a REST API?",
    module: "RESTful API Development",
    context:
      "API security topics include authentication, authorization, input validation, HTTPS, rate limiting, safe error messages, and protection of sensitive data.",
  },
  {
    question: "Describe a project where you solved a technical problem.",
    module: "Software Development Practice",
    context:
      "A strong technical explanation identifies the problem, constraints, approach, implementation, testing, result, and what the student learned.",
  },
  {
    question: "Why is version control important when building software?",
    module: "Software Development Practice",
    context:
      "Version control records changes, supports collaboration, enables rollback, and helps developers review the history of a project.",
  },
  {
    question: "What should you test before deploying a web application?",
    module: "Web Application Fundamentals",
    context:
      "Deployment preparation includes functional testing, validation of user input, responsive checks, security checks, error handling, and verification of the production configuration.",
  },
];

const focusClass =
  "focus:outline-none focus:ring-2 focus:ring-[#55b497] focus:ring-offset-2";

export default function InterviewCoach() {
  const { profile, session } = useAuth();
  const [questions, setQuestions] = useState(fallbackQuestions);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const currentQuestion = questions[questionIndex];
  const careerTarget = profile?.career_target?.trim() ?? "";
  const currentAnswer = answers[questionIndex] ?? "";
  const currentFeedback = feedbacks[questionIndex];
  const currentScore = scores[questionIndex];

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

  const updateAnswer = (value: string) => {
    setAnswers((current) => ({ ...current, [questionIndex]: value }));
    setFeedbacks((current) => {
      const next = { ...current };
      delete next[questionIndex];
      return next;
    });
    setScores((current) => {
      const next = { ...current };
      delete next[questionIndex];
      return next;
    });
    setError("");
  };

  const generateQuestions = async () => {
    if (!careerTarget) {
      setError(
        "Choose a career target in your Profile before generating questions.",
      );
      setStatus("");
      return;
    }

    if (!session?.user.id) {
      setError("Please sign in again before using Interview Coach.");
      return;
    }

    if (!online) {
      setQuestions(fallbackQuestions);
      setQuestionIndex(0);
      setStatus("You are offline. Built-in interview questions are available.");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("Generating five questions from the approved modules...");

    try {
      const result = await invokeCareerAI<QuestionsResponse>({
        action: "interview_questions",
        module: careerTarget,
        request_seed: crypto.randomUUID(),
        approved_module_context: fallbackQuestions
          .map((item) => `${item.module}: ${item.context}`)
          .concat(`\nCareer target: ${careerTarget}`),
      });
      const generated = (result.questions ?? [])
        .filter(
          (item): item is { question: string; module: string } =>
            typeof item.question === "string" &&
            typeof item.module === "string",
        )
        .slice(0, 5)
        .map((item) => ({
          question: item.question,
          module: item.module,
          context:
            fallbackQuestions.find(
              (fallback) => fallback.module === item.module,
            )?.context ??
            "Answer only using the concepts covered by the selected IT module.",
        }));

      if (generated.length !== 5) {
        throw new Error("The AI returned an incomplete question set.");
      }

      setQuestions(generated);
      setQuestionIndex(0);
      setAnswers({});
      setFeedbacks({});
      setScores({});
      setStatus("Five AI interview questions are ready.");
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Unable to generate AI questions.",
      );
      setStatus(
        "The built-in questions remain available. Fix the AI service and try again to generate a new set.",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentAnswer.trim()) {
      setError("Write an answer before requesting feedback.");
      return;
    }

    if (!online) {
      setError(
        "AI feedback requires an internet connection. Your answer remains on this page.",
      );
      return;
    }

    setBusy(true);
    setError("");
    setStatus("Checking your answer against the selected module...");

    try {
      const result = await invokeCareerAI<InterviewResponse>({
        action: "interview_feedback",
        question: currentQuestion.question,
        answer: currentAnswer.trim(),
        module: currentQuestion.module,
        approved_module_context: currentQuestion.context,
      });
      const nextFeedback = result.feedback?.trim();
      const nextScore =
        typeof result.score === "number"
          ? Math.max(0, Math.min(100, Math.round(result.score)))
          : null;

      if (!nextFeedback || nextScore === null) {
        throw new Error("The AI returned incomplete feedback.");
      }

      setFeedbacks((current) => ({
        ...current,
        [questionIndex]: nextFeedback,
      }));
      setScores((current) => ({ ...current, [questionIndex]: nextScore }));
      setStatus("AI feedback generated from the approved module content.");
    } catch (feedbackError) {
      setError(
        feedbackError instanceof Error
          ? feedbackError.message
          : "Unable to generate AI feedback.",
      );
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  const startVoiceInput = () => {
    const browserWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported by this browser. You can type your answer instead.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ");
      updateAnswer(`${currentAnswer} ${transcript}`.trim());
    };
    recognition.onerror = () => {
      setListening(false);
      setError(
        "Microphone input could not be started. Check your browser permission.",
      );
    };
    recognition.onend = () => setListening(false);

    setError("");
    setListening(true);
    recognition.start();
  };

  return (
    <StudentLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Interview Coach
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Practice for your target career
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Generate five questions and receive module-limited AI feedback.
          Answers and feedback remain in this screen session and are not
          automatically saved.
        </p>
      </section>

      {!online && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          <WifiOff className="mt-0.5 shrink-0" size={18} />
          <p>
            You are offline. Built-in interview questions still work, but AI
            actions require a connection.
          </p>
        </div>
      )}

      {error && (
        <p className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      {status && (
        <p className="mb-5 rounded-2xl bg-[#eaf8f5] p-4 text-sm font-semibold text-[#16806d]">
          {status}
        </p>
      )}

      <section className="space-y-6">
        <div className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">AI Question Set</h2>
          </div>
          <p className="text-slate-600">
            Career target: {careerTarget || "Not selected"}
          </p>
          {!careerTarget && (
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              Select a career target in your{" "}
              <Link to="/profile" className="font-bold underline">
                Profile
              </Link>{" "}
              before generating questions.
            </p>
          )}
          <button
            type="button"
            onClick={() => void generateQuestions()}
            disabled={busy || !online || !careerTarget}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#55b497] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
          >
            <Sparkles size={18} />
            {busy ? "Working..." : "Generate 5 AI Questions"}
          </button>
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f4fbfa] p-4 text-sm text-slate-600">
            <Info className="mt-0.5 shrink-0 text-[#16806d]" size={18} />
            <p>
              AI uses only the selected module context and career-related
              profile details.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
            Question {questionIndex + 1} of {questions.length}
          </p>
          <h2 className="mt-3 text-2xl font-extrabold">
            {currentQuestion.question}
          </h2>
          <p className="mt-3 text-sm font-semibold text-[#16806d]">
            Module: {currentQuestion.module}
          </p>
        </div>
        <div className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <MessageSquareText className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Your Answer</h2>
          </div>

          <form onSubmit={submitAnswer}>
            <textarea
              required
              value={currentAnswer}
              onChange={(event) => updateAnswer(event.target.value)}
              className="h-56 w-full rounded-2xl border border-teal-100 bg-[#f4fbfa] p-4 outline-none focus:ring-2 focus:ring-[#55b497]"
              placeholder="Type your answer here..."
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={listening || busy}
                className={`inline-flex items-center gap-2 rounded-xl border border-teal-200 px-4 py-3 font-bold text-[#16806d] disabled:opacity-60 ${focusClass}`}
              >
                <Mic size={18} />
                {listening ? "Listening..." : "Use microphone"}
              </button>
              <button
                type="submit"
                disabled={busy || !online}
                className={`inline-flex items-center gap-2 rounded-xl bg-[#55b497] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
              >
                <Send size={18} />
                {busy ? "Checking..." : "Get AI Feedback"}
              </button>
            </div>
          </form>

          {currentFeedback && (
            <div className="mt-6 rounded-2xl border border-teal-100 bg-[#f4fbfa] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-extrabold text-[#16806d]">AI Feedback</h3>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-[#16806d]">
                  {currentScore}%
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">
                {currentFeedback}
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                setQuestionIndex((current) => Math.max(0, current - 1))
              }
              disabled={questionIndex === 0}
              className={`inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700 disabled:opacity-40 ${focusClass}`}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setQuestionIndex((current) =>
                  Math.min(questions.length - 1, current + 1),
                )
              }
              disabled={questionIndex === questions.length - 1}
              className={`inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700 disabled:opacity-40 ${focusClass}`}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </StudentLayout>
  );
}