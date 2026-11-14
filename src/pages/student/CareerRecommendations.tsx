import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  Layers,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import GraphLegend from "../../components/GraphLegend";
import { useAuth } from "../../context/AuthContext";
import type {
  Career,
  Elective,
  Skill,
  Specialization,
  StudentSkill,
} from "../../lib/types";
import {
  getRecommendationReadiness,
  rankCareers,
} from "../../services/recommendations";
import {
  listCareers,
  listElectives,
  listSkills,
  listSpecializations,
  listStudentSkills,
} from "../../services/repository";

export default function CareerRecommendations() {
  const { profile, session } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user.id) return;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          careerData,
          skillData,
          studentSkillData,
          specializationData,
          electiveData,
        ] = await Promise.all([
          listCareers(),
          listSkills(),
          listStudentSkills(session.user.id),
          listSpecializations(),
          listElectives(),
        ]);

        setCareers(careerData);
        setSkills(skillData);
        setStudentSkills(studentSkillData);
        setSpecializations(specializationData);
        setElectives(electiveData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to calculate career recommendations.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.user.id]);

  const recommendationReadiness = useMemo(
    () => getRecommendationReadiness(profile, careers, skills, studentSkills),
    [careers, profile, skills, studentSkills],
  );
  const rankedResults = useMemo(
    () =>
      recommendationReadiness.ready
        ? rankCareers(
            careers,
            skills,
            studentSkills,
            profile?.academic_year,
            profile?.interests,
          )
        : [],
    [
      careers,
      profile?.academic_year,
      profile?.interests,
      recommendationReadiness.ready,
      skills,
      studentSkills,
    ],
  );

  const primary = rankedResults[0];
  const results = primary
    ? [
        primary,
        ...rankedResults.filter((item) => item.career.id !== primary.career.id),
      ]
    : [];
  const primarySpecializations = specializations.filter(
    (item) => item.career_id === primary?.career.id,
  );
  const primaryElectiveNames = new Set(
    primarySpecializations
      .flatMap((item) => item.recommended_electives)
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean),
  );
  const primaryElectives = electives.filter((elective) =>
    primaryElectiveNames.has(elective.name.trim().toLowerCase()),
  );

  return (
    <StudentLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Career Path Recommendation
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Career Path Results</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          The primary path is ranked using your saved skill scores, interests,
          and the administrator&apos;s thresholds. Secondary paths remain
          visible for comparison.
        </p>
        <div className="mt-5 rounded-2xl bg-white/80 p-4 text-sm leading-relaxed text-slate-700">
          <strong>When will a career be recommended?</strong> After you save
          your academic details, interests, technologies, and relevant skill
          scores. The system then compares your scores with each configured
          career and displays the highest-scoring path as your primary
          recommendation.
        </div>
        {profile?.career_target && (
          <div className="mt-6 flex w-full min-w-0 items-start gap-4 rounded-2xl border border-teal-200 border-l-4 border-l-[#16806d] bg-white p-5 shadow-sm sm:max-w-lg">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf8f5] text-[#16806d]">
              <Target size={24} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                Preferred Career Goal
              </p>
              <p className="mt-1 break-words text-xl font-extrabold text-[#16806d] sm:text-2xl">
                {profile.career_target}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Used as your stated preference; it does not change the system
                ranking.
              </p>
            </div>
          </div>
        )}
      </section>

      {error && (
        <p className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-3xl border border-teal-100 bg-white p-8 text-slate-500 shadow-sm">
          Calculating your career matches...
        </div>
      ) : !recommendationReadiness.ready ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Complete your career profile first
          </h2>
          <p className="mt-2 text-slate-700">
            The system will show a recommendation only after it has enough
            verified information to calculate a meaningful match.
          </p>
          <p className="mt-4 font-bold text-slate-800">Still needed:</p>
          <ul className="mt-2 list-inside list-disc text-slate-700">
            {recommendationReadiness.missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/profile"
              className="rounded-xl bg-[#1f8f78] px-5 py-3 font-bold text-white"
            >
              Complete Profile
            </Link>
            <Link
              to="/skill-gap"
              className="rounded-xl border border-teal-200 bg-white px-5 py-3 font-bold text-[#16806d]"
            >
              Enter Skill Scores
            </Link>
          </div>
        </div>
      ) : !primary ? (
        <div className="rounded-3xl border border-teal-100 bg-white p-8 text-slate-500 shadow-sm">
          No administrator-configured career paths are available yet.
        </div>
      ) : (
        <>
          <section className="mb-6 rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold">
              How your ranking is calculated
            </h2>
            <p className="mt-3 text-slate-600">
              Each career is ranked using 80% skill readiness and 20% interest
              alignment. Skill readiness compares your saved scores with the
              administrator&apos;s threshold for your academic year. Careers
              without configured thresholds are excluded.
            </p>
          </section>
          <section className="mb-6 space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-[#1f8f78] to-[#36a889] p-9 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <Award size={28} />
                <span className="font-bold uppercase tracking-wide">
                  Primary Recommendation
                </span>
              </div>

              <h2 className="mt-6 text-4xl font-extrabold">
                {primary.career.name}
              </h2>
              <p className="mt-3 max-w-2xl text-emerald-50">
                {primary.career.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/15 p-4">
                  <p className="text-sm text-emerald-50">Match score</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {primary.score}%
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4">
                  <p className="text-sm text-emerald-50">Target level</p>
                  <p className="mt-1 text-3xl font-extrabold capitalize">
                    {primary.level}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4">
                  <p className="text-sm text-emerald-50">Remaining gap</p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {Math.round(primary.totalGap)} percentage points
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>Overall readiness</span>
                  <span>{primary.score}%</span>
                </div>
                <div className="h-5 rounded-full bg-white/25">
                  <div
                    className="h-5 rounded-full bg-white transition-all"
                    style={{ width: `${primary.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Secondary career paths remain visible for comparison. */}
            <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <BriefcaseBusiness className="text-[#16806d]" />
                <h2 className="text-2xl font-extrabold">Secondary Paths</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.slice(1, 4).length === 0 ? (
                  <p className="text-slate-500">
                    No secondary paths available.
                  </p>
                ) : (
                  results.slice(1, 4).map((result) => (
                    <div key={result.career.id}>
                      <div className="flex justify-between gap-3 font-bold">
                        <span>
                          <span className="mr-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-600">
                            Secondary
                          </span>
                          {result.career.name}
                        </span>
                        <span className="text-[#16806d]">{result.score}%</span>
                      </div>
                      <div className="mt-2 h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-[#55b497] transition-all"
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {result.career.category}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <BarChart3 className="text-[#16806d]" />
              <div>
                <h2 className="text-2xl font-extrabold">
                  Primary Career Skill Graph
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  The score is the average of current skill readiness against
                  the selected academic-year threshold.
                </p>
              </div>
            </div>

            <GraphLegend />

            <div className="space-y-6">
              {primary.comparisons.map((comparison) => (
                <div key={comparison.skillName}>
                  <div className="mb-2 flex flex-wrap justify-between gap-3">
                    <span className="font-bold">{comparison.skillName}</span>
                    <span className="text-sm text-slate-500">
                      {Math.round(comparison.current)}% / {comparison.required}%
                    </span>
                  </div>
                  <div className="relative h-5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="absolute h-5 rounded-full bg-slate-300"
                      style={{ width: `${comparison.required}%` }}
                    />
                    <div
                      className="absolute h-5 rounded-full bg-[#55b497]"
                      style={{ width: `${comparison.current}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Readiness: {Math.round(comparison.readiness)}% · Skill gap:{" "}
                    {Math.round(comparison.gap)} percentage points
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Layers className="text-[#16806d]" />
                <h2 className="text-2xl font-extrabold">Specializations</h2>
              </div>

              {primarySpecializations.length === 0 ? (
                <p className="text-slate-500">
                  No specializations have been linked to this career yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {primarySpecializations.map((specialization) => (
                    <div
                      key={specialization.id}
                      className="rounded-2xl bg-[#eaf8f5] p-5"
                    >
                      <h3 className="font-extrabold text-[#16806d]">
                        {specialization.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Skills:{" "}
                        {specialization.required_skills.join(", ") ||
                          "Not specified"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/*
            <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Target className="text-[#16806d]" />
                <h2 className="text-2xl font-extrabold">How the result is calculated</h2>
              </div>
              <div className="space-y-4 text-sm text-slate-700">
                <p className="flex gap-3">
                  <CheckCircle2 className="shrink-0 text-[#16806d]" />
                  Each required skill is compared with your saved score.
                </p>
                <p className="flex gap-3">
                  <CheckCircle2 className="shrink-0 text-[#16806d]" />
                  Skill readiness = current score ÷ required score × 100.
                </p>
                <p className="flex gap-3">
                  <CheckCircle2 className="shrink-0 text-[#16806d]" />
                  Career match = average readiness across the career&apos;s required skills.
                </p>
              </div>
              <p className="mt-5 rounded-2xl bg-[#f4fbfa] p-4 text-sm font-semibold text-slate-700">
                Example: 60 current ÷ 80 required × 100 = 75% readiness.
              </p>
              <p className="mt-5 rounded-2xl bg-[#f4fbfa] p-4 text-sm text-slate-600">
                Update your scores on the Skill Gap Analysis page to recalculate
                this graph and the primary/secondary ranking.
              </p>
            </div>
            */}

            <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Layers className="text-[#16806d]" />
                <h2 className="text-2xl font-extrabold">Relevant Electives</h2>
              </div>
              {primaryElectives.length === 0 ? (
                <p className="text-slate-500">
                  No electives have been linked to this career path yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {primaryElectives.map((elective) => (
                    <div
                      key={elective.id}
                      className="rounded-2xl bg-[#eaf8f5] p-4"
                    >
                      <p className="font-extrabold text-[#16806d]">
                        {elective.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {elective.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </StudentLayout>
  );
}