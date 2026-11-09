import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  FileText,
  GraduationCap,
  Mail,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";
import GraphLegend from "../../components/GraphLegend";
import TablePagination from "../../components/TablePagination";
import { supabase } from "../../lib/supabase";
import type {
  Career,
  InterviewSession,
  Profile,
  ResumeFile,
  Skill,
  StudentSkill,
} from "../../lib/types";
import { rankCareers } from "../../services/recommendations";
import {
  listCareers,
  listSkills,
  listStudentFilterOptions,
  listStudentInterviewSessions,
  listStudentProfiles,
  listStudentResumeFiles,
  listStudentSkills,
} from "../../services/repository";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
};

const getStudentName = (student: Profile) =>
  [student.first_name, student.middle_name, student.last_name]
    .filter(Boolean)
    .join(" ") ||
  student.username ||
  student.email ||
  "Unnamed student";

const getInitials = (student: Profile) =>
  [student.first_name, student.last_name]
    .filter(Boolean)
    .map((value) => value?.[0]?.toUpperCase())
    .join("") || "ST";

const getProfileCompletion = (student: Profile) => {
  const fields = [
    student.first_name,
    student.last_name,
    student.student_id,
    student.academic_year,
    student.program,
    student.career_target,
    student.interests.length > 0,
    student.technologies.length > 0,
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

export default function StudentRecords() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<Profile[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
  const [interviewSessions, setInterviewSessions] = useState<
    InterviewSession[]
  >([]);

  useEffect(() => {
    let active = true;

    const timer = window.setTimeout(() => {
      const loadStudents = async () => {
        setListLoading(true);
        setError("");

        try {
          const result = await listStudentProfiles({
            search: searchQuery,
            studentId: searchParams.get("studentId") ?? undefined,
            academicYear: academicYearFilter,
            program: programFilter,
            page,
            pageSize,
          });

          if (!active) return;

          setStudents(result.data);
          setTotalCount(result.count);
          setSelectedStudentId((currentId) =>
            currentId && result.data.some((student) => student.id === currentId)
              ? currentId
              : searchParams.get("studentId") && result.data.some((student) => student.id === searchParams.get("studentId"))
                ? searchParams.get("studentId")
                : result.data[0]?.id ?? null
          );
        } catch (loadError) {
          if (!active) return;
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load student records."
          );
        } finally {
          if (active) setListLoading(false);
        }
      };

      void loadStudents();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [realtimeVersion, searchQuery, academicYearFilter, programFilter, page, searchParams]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-student-records-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => setRealtimeVersion((value) => value + 1)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_skills" },
        () => setRealtimeVersion((value) => value + 1)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, academicYearFilter, programFilter]);

  useEffect(() => {
    let active = true;

    const loadReferenceData = async () => {
      try {
        const [careerData, skillData, filterOptions] = await Promise.all([
          listCareers(),
          listSkills(),
          listStudentFilterOptions(),
        ]);

        if (!active) return;
        setCareers(careerData);
        setSkills(skillData);
        setAcademicYears(filterOptions.academicYears);
        setPrograms(filterOptions.programs);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load career and skill data."
        );
      }
    };

    void loadReferenceData();

    return () => {
      active = false;
    };
  }, []);

  const filteredStudents = useMemo(() => students, [students]);
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? null;

  useEffect(() => {
    let active = true;

    if (!selectedStudentId) {
      setStudentSkills([]);
      setResumeFiles([]);
      setInterviewSessions([]);
      return;
    }

    const loadStudentDetails = async () => {
      setDetailLoading(true);

      try {
        const [skillData, resumeData, interviewData] = await Promise.all([
          listStudentSkills(selectedStudentId),
          listStudentResumeFiles(selectedStudentId),
          listStudentInterviewSessions(selectedStudentId),
        ]);

        if (!active) return;
        setStudentSkills(skillData);
        setResumeFiles(resumeData);
        setInterviewSessions(interviewData);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this student's details."
        );
      } finally {
        if (active) setDetailLoading(false);
      }
    };

    void loadStudentDetails();

    return () => {
      active = false;
    };
  }, [selectedStudentId]);

  const careerMatches = useMemo(() => {
    if (!selectedStudent) return [];

    return rankCareers(
      careers,
      skills,
      studentSkills,
      selectedStudent.academic_year,
      selectedStudent.career_target
    );
  }, [careers, selectedStudent, skills, studentSkills]);

  const primaryMatch = careerMatches[0];

  return (
    <AdminLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
              Student Management
            </p>
            <h1 className="mt-2 text-4xl font-extrabold">Student Records</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Search student profiles, inspect readiness, and review feature
              usage. This page is read-only for student records.
            </p>
          </div>

          <span className="rounded-xl border border-teal-100 bg-white px-4 py-3 text-sm font-bold text-[#16806d]">
            Live updates enabled
          </span>
        </div>
      </section>

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold">Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                {totalCount} record
                {totalCount === 1 ? "" : "s"} found
              </p>
            </div>
            <UserRound className="text-[#16806d]" />
          </div>

          <label htmlFor="student-directory-search" className="mb-2 block text-sm font-bold">Search students</label>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              id="student-directory-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full py-3 outline-none"
              placeholder="Name, ID, email, or program"
            />
          </div>

          <div className="mt-4 grid gap-3">
            <label className="text-sm font-bold">Academic year<select aria-label="Filter by academic year" value={academicYearFilter} onChange={(event) => setAcademicYearFilter(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"><option value="all">All academic years</option>{academicYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
            <label className="text-sm font-bold">Program<select aria-label="Filter by program" value={programFilter} onChange={(event) => setProgramFilter(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"><option value="all">All programs</option>{programs.map((program) => <option key={program} value={program}>{program}</option>)}</select></label>
          </div>

          <div className="mt-5 max-h-[620px] space-y-3 overflow-y-auto pr-1">
            {listLoading ? (
              <p className="rounded-2xl bg-[#f8fcfb] p-5 text-sm text-slate-500">
                Loading student records...
              </p>
            ) : filteredStudents.length === 0 ? (
              <p className="rounded-2xl bg-[#f8fcfb] p-5 text-sm text-slate-500">
                No students match the current search and filters.
              </p>
            ) : (
              filteredStudents.map((student) => (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={
                    "w-full rounded-2xl border p-4 text-left transition " +
                    (selectedStudentId === student.id
                      ? "border-[#1f8f78] bg-[#eaf8f5]"
                      : "border-slate-100 hover:border-teal-200 hover:bg-[#f8fcfb]")
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f8f78] text-sm font-extrabold text-white">
                      {getInitials(student)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-slate-900">
                        {getStudentName(student)}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {student.student_id || "No student ID"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {student.program || "Program not set"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {!listLoading && totalCount > 0 && (
            <TablePagination
              page={page}
              pageCount={pageCount}
              count={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}

          {error && !listLoading && (
            <button
              type="button"
              onClick={() => setRealtimeVersion((value) => value + 1)}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#55b497]"
            >
              Retry loading student records
            </button>
          )}
        </div>

        <div className="min-w-0 rounded-3xl border border-teal-100 bg-white p-6 shadow-sm lg:p-8">
          {!selectedStudent ? (
            <div className="flex min-h-[500px] items-center justify-center text-center text-slate-500">
              <div>
                <UserRound className="mx-auto mb-4 text-[#16806d]" size={42} />
                <p className="font-semibold">Select a student to inspect the record.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1f8f78] text-xl font-extrabold text-white">
                    {getInitials(selectedStudent)}
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
                      Student profile
                    </p>
                    <h2 className="mt-1 text-3xl font-extrabold">
                      {getStudentName(selectedStudent)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedStudent.student_id || "No student ID"} · {selectedStudent.program || "Program not set"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8fcfb] px-4 py-3 text-sm">
                  <p className="font-bold text-[#16806d]">Last profile update</p>
                  <p className="mt-1 text-slate-500">{formatDate(selectedStudent.updated_at)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Profile completion"
                  value={`${getProfileCompletion(selectedStudent)}%`}
                  icon={<UserRound size={19} />}
                />
                <MetricCard
                  label="Primary match"
                  value={primaryMatch ? `${primaryMatch.score}%` : "—"}
                  icon={<BarChart3 size={19} />}
                />
                <MetricCard
                  label="Resume files"
                  value={String(resumeFiles.length)}
                  icon={<FileText size={19} />}
                />
                <MetricCard
                  label="Interview attempts"
                  value={String(interviewSessions.length)}
                  icon={<Activity size={19} />}
                />
              </div>

              {detailLoading ? (
                <div className="mt-8 rounded-2xl bg-[#f8fcfb] p-6 text-slate-500">
                  Loading this student&apos;s readiness and activity...
                </div>
              ) : (
                <>
                  <section className="mt-8 grid gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-teal-100 bg-[#f8fcfb] p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <GraduationCap className="text-[#16806d]" />
                        <h3 className="text-xl font-extrabold">Profile details</h3>
                      </div>

                      <div className="grid gap-4 text-sm sm:grid-cols-2">
                        <Detail label="Email" value={selectedStudent.email || "Not set"} icon={<Mail size={16} />} />
                        <Detail label="Academic year" value={selectedStudent.academic_year || "Not set"} icon={<CalendarDays size={16} />} />
                        <Detail label="Username" value={selectedStudent.username || "Not set"} icon={<UserRound size={16} />} />
                        <Detail label="Career target" value={selectedStudent.career_target || "Not set"} icon={<BarChart3 size={16} />} />
                      </div>

                      <div className="mt-5 border-t border-teal-100 pt-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Interests</p>
                        <p className="mt-2 text-sm text-slate-700">
                          {selectedStudent.interests.length > 0
                            ? selectedStudent.interests.join(", ")
                            : "No interests recorded"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-teal-100 bg-[#f8fcfb] p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <BarChart3 className="text-[#16806d]" />
                        <div>
                          <h3 className="text-xl font-extrabold">Career matches</h3>
                          <p className="mt-1 text-xs text-slate-500">Primary and secondary paths from saved skill scores.</p>
                        </div>
                      </div>

                      <GraphLegend />

                      {careerMatches.length === 0 ? (
                        <p className="text-sm text-slate-500">No career thresholds are configured yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {careerMatches.slice(0, 4).map((match, index) => (
                            <div key={match.career.id}>
                              <div className="flex justify-between gap-3 text-sm font-bold">
                                <span>
                                  <span className={`mr-2 inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${index === 0 ? "bg-[#d8f3ec] text-[#16806d]" : "bg-slate-100 text-slate-600"}`}>
                                    {index === 0 ? "Primary" : "Secondary"}
                                  </span>
                                  {match.career.name}
                                </span>
                                <span className="text-[#16806d]">{match.score}%</span>
                              </div>
                              <div className="mt-2 h-3 rounded-full bg-slate-200">
                                <div
                                  className={index === 0 ? "h-3 rounded-full bg-[#1f8f78]" : "h-3 rounded-full bg-[#55b497]"}
                                  style={{ width: `${match.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="mt-5 text-xs text-slate-500">
                        Formula: average of each required skill&apos;s readiness,
                        where readiness = current score ÷ required score × 100.
                      </p>
                    </div>
                  </section>

                  <section className="mt-6 rounded-2xl border border-teal-100 bg-white">
                    <div className="border-b border-slate-100 p-6">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="text-[#16806d]" />
                        <div>
                          <h3 className="text-xl font-extrabold">Primary skill readiness</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Current saved score versus the threshold for the primary career.
                          </p>
                          <div className="mt-4">
                            <GraphLegend />
                          </div>
                        </div>
                      </div>
                    </div>

                    {!primaryMatch ? (
                      <p className="p-6 text-sm text-slate-500">No primary career is available.</p>
                    ) : primaryMatch.comparisons.length === 0 ? (
                      <p className="p-6 text-sm text-slate-500">The primary career has no skill thresholds.</p>
                    ) : (
                      <div className="space-y-5 p-6">
                        {primaryMatch.comparisons.map((comparison) => (
                          <div key={comparison.skillName}>
                            <div className="flex justify-between gap-3 text-sm font-bold">
                              <span>{comparison.skillName}</span>
                              <span className="text-slate-500">
                                {comparison.current}% / {comparison.required}% required
                              </span>
                            </div>
                            <div className="relative mt-2 h-3 rounded-full bg-slate-100">
                              <div
                                className="h-3 rounded-full bg-[#55b497]"
                                style={{ width: `${comparison.readiness}%` }}
                              />
                              <div
                                className="absolute top-[-3px] h-5 w-1 rounded-full bg-slate-800"
                                style={{ left: `${comparison.required}%` }}
                                title="Required threshold"
                              />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              Gap: {comparison.gap.toFixed(1)} percentage points
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="mt-6 grid gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-teal-100 bg-[#f8fcfb] p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <FileText className="text-[#16806d]" />
                        <h3 className="text-xl font-extrabold">Resume activity</h3>
                      </div>
                      {resumeFiles.length === 0 ? (
                        <p className="text-sm text-slate-500">No PDF resume uploaded.</p>
                      ) : (
                        <div className="space-y-3">
                          {resumeFiles.slice(0, 4).map((resume) => (
                            <div key={resume.id} className="rounded-xl bg-white p-4">
                              <p className="font-bold">{resume.file_name}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {resume.analysis ? "Analysis available" : "Awaiting analysis"} · {formatDate(resume.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-teal-100 bg-[#f8fcfb] p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <Activity className="text-[#16806d]" />
                        <h3 className="text-xl font-extrabold">Interview activity</h3>
                      </div>
                      {interviewSessions.length === 0 ? (
                        <p className="text-sm text-slate-500">No interview attempts recorded.</p>
                      ) : (
                        <div className="space-y-3">
                          {interviewSessions.slice(0, 4).map((session) => (
                            <div key={session.id} className="rounded-xl bg-white p-4">
                              <p className="line-clamp-2 font-bold">{session.question}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Score: {session.score === null ? "Not scored" : `${session.score}%`} · {formatDate(session.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#f8fcfb] p-4">
      <div className="flex items-center gap-2 text-[#16806d]">{icon}</div>
      <p className="mt-3 text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 break-words font-semibold text-slate-700">{value}</p>
    </div>
  );
}