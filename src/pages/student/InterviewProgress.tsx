import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpenCheck,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";

import StudentLayout from "../../components/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import type {
  Career,
  InterviewSession,
  Skill,
  StudentSkill,
} from "../../lib/types";
import {
  listCareers,
  listSkills,
  listStudentInterviewSessions,
  listStudentSkills,
} from "../../services/repository";
import {
  getRecommendationReadiness,
  rankCareers,
} from "../../services/recommendations";

function extractSection(feedback: string, heading: string) {
  const headings = ["Strengths", "Improvement areas", "Practice steps"];
  const nextHeading = headings
    .filter((item) => item !== heading)
    .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const expression = new RegExp(
    `${heading}:\\s*([\\s\\S]*?)(?=\\n\\n(?:${nextHeading}):|$)`,
    "i",
  );
  const match = feedback.match(expression);
  if (!match?.[1]) return [];

  return match[1]
    .split("\n")
    .map((item) => item.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

function feedbackSummary(feedback: string) {
  return feedback.split("\n\n")[0]?.trim() ?? "No written feedback was saved.";
}

export default function InterviewProgress() {
  const { profile, session } = useAuth();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user.id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [interviewData, careerData, skillData, studentSkillData] =
          await Promise.all([
            listStudentInterviewSessions(session.user.id),
            listCareers(),
            listSkills(),
            listStudentSkills(session.user.id),
          ]);
        setInterviews(interviewData);
        setCareers(careerData);
        setSkills(skillData);
        setStudentSkills(studentSkillData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load interview progress.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.user.id]);

  const readiness = useMemo(
    () => getRecommendationReadiness(profile, careers, skills, studentSkills),
    [careers, profile, skills, studentSkills],
  );
  const recommendedCareer = readiness.ready
    ? rankCareers(
        careers,
        skills,
        studentSkills,
        profile?.academic_year,
        profile?.interests,
      )[0]?.career.name
    : "";
  const averageScore = interviews.length
    ? Math.round(
        interviews.reduce((total, item) => total + Number(item.score ?? 0), 0) /
          interviews.length,
      )
    : 0;

  return (
    <StudentLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Interview Progress
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Your Practice History</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Review your previous answers, scores, feedback, and practice steps so
          every interview session contributes to your career preparation.
        </p>
        <div className="mt-5 rounded-2xl bg-white/80 p-4 text-sm text-slate-700">
          <strong>System-recommended career:</strong>{" "}
          {recommendedCareer || "Complete your profile and skill scores first"}
        </div>
      </section>

      {error && (
        <p className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <section className="mb-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm">
          <MessageSquareText className="text-[#16806d]" />
          <p className="mt-4 text-sm text-slate-500">Answered questions</p>
          <p className="text-4xl font-extrabold">{interviews.length}</p>
        </div>
        <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm">
          <Award className="text-[#16806d]" />
          <p className="mt-4 text-sm text-slate-500">Average feedback score</p>
          <p className="text-4xl font-extrabold text-[#16806d]">
            {averageScore}%
          </p>
        </div>
        <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm">
          <TrendingUp className="text-[#16806d]" />
          <p className="mt-4 text-sm text-slate-500">Next action</p>
          <p className="mt-1 font-extrabold text-slate-900">
            {interviews.length
              ? "Review your practice steps"
              : "Start Interview Coach"}
          </p>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-teal-100 bg-white p-8 text-slate-500 shadow-sm">
          Loading your interview progress...
        </div>
      ) : interviews.length === 0 ? (
        <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
          <BookOpenCheck className="text-[#16806d]" />
          <h2 className="mt-4 text-2xl font-extrabold">
            No interview history yet
          </h2>
          <p className="mt-2 text-slate-600">
            Complete your profile and skill scores, then use Interview Coach to
            answer questions for your system-recommended career.
          </p>
          <a
            href="#/interview-coach"
            className="mt-5 inline-block rounded-xl bg-[#1f8f78] px-5 py-3 font-bold text-white"
          >
            Open Interview Coach
          </a>
        </div>
      ) : (
        <section className="space-y-5">
          {interviews.map((interview) => {
            const feedback = interview.feedback ?? "";
            const strengths = extractSection(feedback, "Strengths");
            const improvements = extractSection(feedback, "Improvement areas");
            const practiceSteps = extractSection(feedback, "Practice steps");

            return (
              <article
                key={interview.id}
                className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      {new Date(interview.created_at).toLocaleString()}
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold">
                      {interview.question}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#eaf8f5] px-4 py-2 font-extrabold text-[#16806d]">
                    {interview.score ?? 0}%
                  </span>
                </div>
                <div className="mt-5 rounded-2xl bg-[#f4fbfa] p-5">
                  <p className="text-sm font-bold text-slate-500">
                    Your answer
                  </p>
                  <p className="mt-2 whitespace-pre-line text-slate-700">
                    {interview.answer}
                  </p>
                </div>
                <div className="mt-5">
                  <p className="font-extrabold text-[#16806d]">Feedback</p>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">
                    {feedbackSummary(feedback)}
                  </p>
                </div>
                {(strengths.length > 0 ||
                  improvements.length > 0 ||
                  practiceSteps.length > 0) && (
                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
                    {[
                      ["Strengths", strengths],
                      ["Improve next", improvements],
                      ["Practice steps", practiceSteps],
                    ].map(([title, items]) => (
                      <div key={title as string}>
                        <p className="font-extrabold text-[#16806d]">
                          {title as string}
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {(items as string[]).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </StudentLayout>
  );
}