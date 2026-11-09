import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Save,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import StudentLayout from "../../components/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import type { Career, Skill, StudentSkill } from "../../lib/types";
import {
  getCareerLevel,
  getCurrentSkillScore,
  getThresholds,
} from "../../services/recommendations";
import {
  listCareers,
  listSkills,
  listStudentSkills,
  saveStudentSkill,
} from "../../services/repository";

type ScoreValues = Record<string, string>;

export default function SkillGapAnalysis() {
  const { profile, session } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [scores, setScores] = useState<ScoreValues>({});
  const [loading, setLoading] = useState(true);
  const [savingSkillId, setSavingSkillId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user.id) return;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [careerData, skillData, studentSkillData] = await Promise.all([
          listCareers(),
          listSkills(),
          listStudentSkills(session.user.id),
        ]);

        setCareers(careerData);
        setSkills(skillData);
        setStudentSkills(studentSkillData);

        const nextScores: ScoreValues = {};
        studentSkillData.forEach((item) => {
          nextScores[item.skill_id] = String(item.score);
        });
        setScores(nextScores);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your skill data."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.user.id]);

  const selectedCareer =
    careers.find((career) => career.name === profile?.career_target) ??
    careers[0];
  const careerLevel = getCareerLevel(profile?.academic_year);

  const rows = useMemo(() => {
    if (!selectedCareer) return [];

    const thresholds = getThresholds(selectedCareer, careerLevel);

    return Object.entries(thresholds).map(([skillName, rawRequired]) => {
      const skill = skills.find(
        (item) => item.name.toLowerCase() === skillName.toLowerCase()
      );
      const savedScore = skill ? scores[skill.id] : undefined;
      const current =
        savedScore === undefined
          ? getCurrentSkillScore(skillName, skills, studentSkills)
          : Math.max(0, Math.min(100, Number(savedScore) || 0));
      const required = Math.max(0, Math.min(100, Number(rawRequired)));
      const gap = Math.max(0, required - current);
      const readiness = required === 0 ? 100 : Math.min(100, (current / required) * 100);
      const status =
        current >= required
          ? "meets"
          : current >= required - 10
            ? "near"
            : "below";

      return {
        skill,
        skillName,
        current,
        required,
        gap,
        readiness,
        status,
      };
    });
  }, [careerLevel, scores, selectedCareer, skills, studentSkills]);

  const summary = useMemo(() => {
    if (!rows.length) return { readiness: 0, gap: 0 };

    return {
      readiness: Math.round(
        rows.reduce((total, row) => total + row.readiness, 0) / rows.length
      ),
      gap: Math.round(rows.reduce((total, row) => total + row.gap, 0)),
    };
  }, [rows]);

  const handleScoreChange = (skillId: string | undefined, value: string) => {
    if (!skillId) return;

    setScores((current) => ({ ...current, [skillId]: value }));
    setMessage("");
  };

  const handleSaveScore = async (skillId: string | undefined) => {
    if (!skillId || !session?.user.id) return;

    const numericScore = Number(scores[skillId]);

    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
      setError("Skill scores must be numbers from 0 to 100.");
      return;
    }

    setSavingSkillId(skillId);
    setError("");
    setMessage("");

    try {
      const saved = await saveStudentSkill(
        session.user.id,
        skillId,
        numericScore
      );

      setStudentSkills((current) => [
        ...current.filter((item) => item.skill_id !== skillId),
        saved,
      ]);
      setMessage("Skill score saved. Your graphs and recommendations are updated.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save this skill score."
      );
    } finally {
      setSavingSkillId(null);
    }
  };

  return (
    <StudentLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Skill Gap Analysis
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Current Skills vs Required Skills
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Set your current score for each skill. The system compares it with
          the administrator-defined threshold for your academic year and target
          career.
        </p>
      </section>

      {error && (
        <p className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-6 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">
          {message}
        </p>
      )}

      <section className="mb-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-teal-100 bg-white p-7 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <TrendingUp className="text-[#16806d]" />
            <p className="font-bold text-slate-600">Overall readiness</p>
          </div>
          <p className="text-4xl font-extrabold text-[#16806d]">
            {summary.readiness}%
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Average current score compared with required scores
          </p>
        </div>

        <div className="rounded-3xl border border-teal-100 bg-white p-7 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <Target className="text-orange-500" />
            <p className="font-bold text-slate-600">Total skill gap</p>
          </div>
          <p className="text-4xl font-extrabold text-orange-500">
            {summary.gap} points
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Points still needed across this career&apos;s required skills
          </p>
        </div>

        <div className="rounded-3xl border border-teal-100 bg-white p-7 shadow-sm">
          <p className="text-sm text-slate-500">Career and level used</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {selectedCareer?.name ?? "Not selected"}
          </p>
          <p className="mt-2 font-semibold capitalize text-[#16806d]">
            {careerLevel} threshold
          </p>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-teal-100 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <TrendingUp className="text-[#16806d]" />
          <div>
            <h2 className="text-2xl font-extrabold">Graph-Based Skill Comparison</h2>
            <p className="mt-1 text-sm text-slate-500">
              Teal shows your current score. Gray shows the required threshold.
            </p>
          </div>
        </div>

        {!selectedCareer ? (
          <p className="rounded-2xl bg-[#f4fbfa] p-5 text-slate-600">
            No career profiles are available yet. An administrator must add a
            career profile before the skill-gap graph can be calculated.
          </p>
        ) : loading ? (
          <p className="text-slate-500">Loading your skill data...</p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl bg-[#f4fbfa] p-5 text-slate-600">
            This career does not have configured skill thresholds yet.
          </p>
        ) : (
          <div className="space-y-7">
            {rows.map((row) => (
              <div key={row.skillName}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-slate-800">{row.skillName}</p>
                    <p className="text-xs text-slate-500">
                      Current {Math.round(row.current)}% · Required {row.required}% ·
                      Gap {Math.round(row.gap)}%
                    </p>
                  </div>

                  {row.skill ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[row.skill.id] ?? String(row.current)}
                        onChange={(event) =>
                          handleScoreChange(row.skill?.id, event.target.value)
                        }
                        className="w-24 rounded-xl border border-slate-200 p-2 text-center font-bold outline-none focus:ring-2 focus:ring-[#55b497]"
                        aria-label={`${row.skillName} current score`}
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveScore(row.skill?.id)}
                        disabled={savingSkillId === row.skill.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#55b497] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
                      >
                        <Save size={16} />
                        {savingSkillId === row.skill.id ? "Saving" : "Save"}
                      </button>
                    </div>
                  ) : (
                    <span className="rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600">
                      Skill not configured in the Skills table
                    </span>
                  )}
                </div>

                <div className="relative h-6 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="absolute h-6 rounded-full bg-slate-300"
                    style={{ width: `${row.required}%` }}
                  />
                  <div
                    className="absolute h-6 rounded-full bg-[#55b497] transition-all"
                    style={{ width: `${row.current}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs">
                  <span className="font-semibold text-[#16806d]">Current score</span>
                  <span className="font-semibold text-slate-500">Required threshold</span>
                </div>

                <div className="mt-2">
                  {row.status === "meets" && (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-green-600">
                      <CheckCircle2 size={17} /> Meets requirement
                    </span>
                  )}
                  {row.status === "near" && (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-orange-500">
                      <AlertTriangle size={17} /> Near threshold
                    </span>
                  )}
                  {row.status === "below" && (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-red-500">
                      <XCircle size={17} /> Below required score
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-teal-100 bg-white p-7 shadow-sm">
        <h2 className="text-xl font-extrabold">Calculation used</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <p className="rounded-2xl bg-[#f4fbfa] p-4 text-sm text-slate-700">
            <strong>Skill gap</strong>
            <br />
            Required score − current score, never below zero.
          </p>
          <p className="rounded-2xl bg-[#f4fbfa] p-4 text-sm text-slate-700">
            <strong>Skill readiness</strong>
            <br />
            Current score ÷ required score × 100.
          </p>
          <p className="rounded-2xl bg-[#f4fbfa] p-4 text-sm text-slate-700">
            <strong>Overall readiness</strong>
            <br />
            Average of all required-skill readiness percentages.
          </p>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Scores are saved in Supabase&apos;s <code>student_skills</code> table, so
          the web and mobile applications use the same skill data.
        </p>
      </section>
    </StudentLayout>
  );
}