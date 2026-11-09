import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

import StudentLayout from "../../components/StudentLayout";
import GraphLegend from "../../components/GraphLegend";
import { useAuth } from "../../context/AuthContext";
import type {
  Career,
  ElectiveMapping,
  Skill,
  StudentSkill,
} from "../../lib/types";
import { rankCareers } from "../../services/recommendations";
import {
  listCareers,
  listElectiveMappings,
  listSkills,
  listStudentSkills,
} from "../../services/repository";

export default function ElectiveRecommendations() {
  const [searchParams] = useSearchParams();
  const { profile, session } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [mappings, setMappings] = useState<ElectiveMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user.id) return;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [careerData, skillData, studentSkillData, mappingData] =
          await Promise.all([
            listCareers(),
            listSkills(),
            listStudentSkills(session.user.id),
            listElectiveMappings(),
          ]);

        setCareers(careerData);
        setSkills(skillData);
        setStudentSkills(studentSkillData);
        setMappings(mappingData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load elective recommendations."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.user.id]);

  const rankedCareers = useMemo(
    () =>
      rankCareers(
        careers,
        skills,
        studentSkills,
        profile?.academic_year,
        profile?.career_target
      ),
    [careers, profile?.academic_year, profile?.career_target, skills, studentSkills]
  );

  const primary = rankedCareers[0];
  const requestedMappingId = searchParams.get("mappingId");
  const requestedElectiveId = searchParams.get("electiveId");

  const recommendations = useMemo(() => {
    if (!primary) return [];

    return mappings
      .map((mapping) => {
        const comparison = primary.comparisons.find(
          (item) =>
            item.skillName.toLowerCase() ===
            (mapping.skill?.name ?? "").toLowerCase()
        );

        if (!comparison) return null;

        const boost = Math.max(0, Number(mapping.boost_percentage) || 0);
        const projected = Math.min(100, comparison.current + boost);
        const gapClosed = Math.min(comparison.gap, boost);
        const priority = comparison.gap
          ? Math.round((gapClosed / comparison.gap) * 100)
          : 0;

        return {
          mapping,
          comparison,
          boost,
          projected,
          gapClosed,
          priority,
        };
      })
      .filter((item) => item !== null && item.comparison.gap > 0)
      .sort(
        (left, right) => {
          const leftRequested = left!.mapping.id === requestedMappingId || left!.mapping.elective_id === requestedElectiveId;
          const rightRequested = right!.mapping.id === requestedMappingId || right!.mapping.elective_id === requestedElectiveId;
          return Number(rightRequested) - Number(leftRequested) || right!.priority - left!.priority || right!.comparison.gap - left!.comparison.gap;
        }
      );
  }, [mappings, primary, requestedElectiveId, requestedMappingId]);

  return (
    <StudentLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Elective Recommendation
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Electives That Address Your Skill Gaps
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Recommendations are connected to the primary career result and use
          the boost percentages configured by an administrator.
        </p>
      </section>

      {error && (
        <p className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-3xl border border-teal-100 bg-white p-8 text-slate-500 shadow-sm">
          Loading elective recommendations...
        </div>
      ) : !primary ? (
        <div className="rounded-3xl border border-teal-100 bg-white p-8 text-slate-500 shadow-sm">
          Career and skill data are not available yet. Ask an administrator to
          configure career thresholds first.
        </div>
      ) : (
        <>
          <section className="mb-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <AlertCircle className="text-orange-500" />
                <div>
                  <h2 className="text-2xl font-extrabold">Skill Gap Graph</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Primary career: {primary.career.name}
                  </p>
                </div>
              </div>

              <GraphLegend />

              <div className="space-y-6">
                {primary.comparisons.map((comparison) => (
                    <div key={comparison.skillName} className={searchParams.get("mappingId") || searchParams.get("electiveId") ? "rounded-2xl p-2" : ""}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-bold">{comparison.skillName}</span>
                      <span className="text-slate-500">
                        Skill gap {Math.round(comparison.gap)} percentage points
                      </span>
                    </div>
                    <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="absolute h-4 rounded-full bg-slate-300"
                        style={{ width: `${comparison.required}%` }}
                      />
                      <div
                        className="absolute h-4 rounded-full bg-[#55b497]"
                        style={{ width: `${comparison.current}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Current {Math.round(comparison.current)}% · Required threshold {comparison.required}% · Skill gap {Math.round(comparison.gap)} percentage points
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <GraduationCap className="text-[#16806d]" />
                <h2 className="text-2xl font-extrabold">Recommended Electives</h2>
              </div>

              {recommendations.length === 0 ? (
                <div className="rounded-2xl bg-[#eaf8f5] p-5 text-slate-700">
                  <p className="font-bold text-[#16806d]">
                    No mapped elective is needed yet.
                  </p>
                  <p className="mt-2 text-sm">
                    Either your required skills already meet their thresholds or
                    an administrator has not created the relevant elective mapping.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((item) => (
                    <div
                      key={item!.mapping.id}
                      className={`rounded-2xl bg-[#eaf8f5] p-5 ${item!.mapping.id === requestedMappingId || item!.mapping.elective_id === requestedElectiveId ? "ring-4 ring-orange-200" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <BookOpen size={21} className="mt-1 shrink-0 text-[#16806d]" />
                          <div>
                            <h3 className="font-extrabold text-slate-900">
                              {item!.mapping.elective?.name ?? "Elective"}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              Improves {item!.mapping.skill?.name ?? "the selected skill"}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-[#16806d]">
                          Primary action · {item!.priority}% priority
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <p>
                          <span className="text-slate-500">Boost</span>
                          <br />
                          <strong>+{item!.boost} percentage points</strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Projected score</span>
                          <br />
                          <strong>{Math.round(item!.projected)}%</strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Gap closed</span>
                          <br />
                          <strong>{Math.round(item!.gapClosed)} percentage points</strong>
                        </p>
                      </div>

                      <p className="mt-4 text-xs text-slate-500">
                        Mapping formula: {item!.mapping.formula}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <TrendingUp className="text-[#16806d]" />
              <h2 className="text-2xl font-extrabold">Elective Mapping Formula</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#f4fbfa] p-5">
                <p className="font-extrabold text-[#16806d]">Projected score</p>
                <p className="mt-2 text-sm text-slate-700">
                  Current score + mapped boost percentage, capped at 100.
                </p>
                <p className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-slate-800">
                  P = min(100, C + B)
                </p>
                <p className="mt-2 text-xs text-slate-600">Example: 60 current + 10 boost = 70 projected.</p>
              </div>

              <div className="rounded-2xl bg-[#f4fbfa] p-5">
                <p className="font-extrabold text-[#16806d]">Recommendation priority</p>
                <p className="mt-2 text-sm text-slate-700">
                  The percentage of the current skill gap that the elective can
                  close.
                </p>
                <p className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-slate-800">
                  Priority = min(G, B) ÷ G × 100
                </p>
                <p className="mt-2 text-xs text-slate-600">Example: min(20 gap, 10 boost) ÷ 20 × 100 = 50% priority.</p>
              </div>
            </div>

            <p className="mt-5 flex gap-3 text-sm text-slate-600">
              <CheckCircle2 className="shrink-0 text-[#16806d]" />
              C = current score, B = administrator-defined boost, G = required
              score − current score. The mapping values are stored in Supabase,
              so the same calculation can be used by the mobile application.
            </p>
          </section>
        </>
      )}
    </StudentLayout>
  );
}