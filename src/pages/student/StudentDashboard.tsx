import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StudentLayout from "../../components/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import type { Career, Skill, StudentSkill } from "../../lib/types";
import { rankCareers } from "../../services/recommendations";
import { listCareers, listSkills, listStudentSkills } from "../../services/repository";

export default function StudentDashboard() {
  const { profile, session } = useAuth();
  const navigate = useNavigate();
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id) return;

    const load = async () => {
      setLoading(true);

      try {
        const [careerData, skillData, studentSkillData] = await Promise.all([
          listCareers(),
          listSkills(),
          listStudentSkills(session.user.id),
        ]);

        setCareers(careerData);
        setSkills(skillData);
        setStudentSkills(studentSkillData);
      } catch (error) {
        console.error("Unable to load student dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.user.id]);

  const matches = useMemo(
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

  const displayName = profile?.first_name || "Student";
  const profileFields = [
    profile?.first_name,
    profile?.last_name,
    profile?.student_id,
    profile?.academic_year,
    profile?.program,
    profile?.career_target,
  ];
  const profileCompletion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  const cards = [
    {
      title: "Career Profiles",
      value: careers.length,
      Icon: Briefcase,
      note: "Available paths",
    },
    {
      title: "Skills Available",
      value: skills.length,
      Icon: Target,
      note: "Tracked by the system",
    },
    {
      title: "Your Interests",
      value: profile?.interests.length ?? 0,
      Icon: BookOpen,
      note: "Selected interests",
    },
    {
      title: "Career Matches",
      value: matches.length,
      Icon: GraduationCap,
      note: "Calculated from thresholds",
    },
  ];

  const primary = matches[0];

  return (
    <StudentLayout>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Student Dashboard
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Welcome back, {displayName}</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Track your skill progress and discover the career paths that best fit
          your saved scores and academic year.
        </p>
        <TrendingUp className="absolute bottom-0 right-10 opacity-10" size={150} />
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, Icon, note }) => (
          <div
            key={title}
            className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#d9f3ee] text-[#16806d]">
              <Icon size={30} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">{title}</p>
              <h2 className="text-4xl font-extrabold text-slate-900">{value}</h2>
              <span className="text-sm text-slate-500">{note}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Career Match Overview</h2>
          <p className="text-slate-500">
            Primary and secondary paths are calculated from your saved skill scores.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/career-recommendations")}
          className="rounded-xl border border-teal-200 px-5 py-3 font-bold text-[#16806d] hover:bg-teal-50"
        >
          View Full Results
        </button>
      </section>

      {loading ? (
        <div className="mb-8 rounded-3xl border border-teal-100 bg-white p-8 text-slate-500 shadow-sm">
          Loading your dashboard...
        </div>
      ) : !primary ? (
        <div className="mb-8 rounded-3xl border border-teal-100 bg-white p-8 text-slate-500 shadow-sm">
          Career recommendations will appear after an administrator adds career
          thresholds.
        </div>
      ) : (
        <section className="mb-8 grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl bg-gradient-to-br from-[#1f8f78] to-[#36a889] p-8 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <AwardIcon />
              <p className="font-bold uppercase tracking-wide">Primary career</p>
            </div>
            <h3 className="mt-5 text-3xl font-extrabold">{primary.career.name}</h3>
            <p className="mt-2 text-emerald-50">{primary.career.description}</p>
            <div className="mt-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-50">Match score</p>
                <p className="text-5xl font-extrabold">{primary.score}%</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/career-recommendations")}
                className="rounded-xl bg-white px-5 py-3 font-bold text-[#16806d]"
              >
                Explore path
              </button>
            </div>
            <div className="mt-6 h-4 rounded-full bg-white/25">
              <div
                className="h-4 rounded-full bg-white"
                style={{ width: `${primary.score}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <TrendingUp className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">Secondary paths</h2>
            </div>
            <div className="space-y-5">
              {matches.slice(1, 4).map((match) => (
                <div key={match.career.id}>
                  <div className="flex justify-between gap-3 text-sm font-bold">
                    <span>{match.career.name}</span>
                    <span className="text-[#16806d]">{match.score}%</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-[#55b497]"
                      style={{ width: `${match.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-extrabold">Profile Completion</h2>
          <div className="h-4 rounded-full bg-[#e8f3f1]">
            <div
              className="h-4 rounded-full bg-[#55b497] transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {profileCompletion}% complete. Add your academic details, interests,
            and career target to improve your recommendations.
          </p>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="mt-5 rounded-xl bg-[#eaf8f5] px-5 py-3 font-bold text-[#16806d]"
          >
            Update Profile
          </button>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-extrabold">Next Steps</h2>
          <div className="space-y-4">
            <p className="flex gap-3">
              <CheckCircle2 className="shrink-0 text-[#16806d]" size={20} />
              Set your current skill scores in Skill Gap Analysis.
            </p>
            <p className="flex gap-3">
              <CheckCircle2 className="shrink-0 text-[#16806d]" size={20} />
              Review the primary career graph and secondary paths.
            </p>
            <p className="flex gap-3">
              <CheckCircle2 className="shrink-0 text-[#16806d]" size={20} />
              Explore electives that can close your largest gaps.
            </p>
          </div>
        </div>
      </section>
    </StudentLayout>
  );
}

function AwardIcon() {
  return <Target size={28} />;
}