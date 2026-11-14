import { supabase, requireSupabaseConfiguration } from "../lib/supabase";
import type {
  ApprovedStudentId,
  AuditLog,
  Career,
  DataQualitySummary,
  Elective,
  ElectiveMapping,
  InterviewSession,
  Profile,
  ResumeFile,
  Skill,
  Specialization,
  StudentSkill,
  StudentElective,
  UserNotification,
  PaginatedResult,
} from "../lib/types";

export type StudentProfileQuery = {
  search?: string;
  studentId?: string;
  academicYear?: string;
  program?: string;
  page?: number;
  pageSize?: number;
};

async function writeAuditLog(
  actorId: string,
  action: string,
  entityTable: string,
  entityId: string,
) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_table: entityTable,
    entity_id: entityId,
  });

  if (error) console.error("Audit log could not be written:", error.message);
}

export async function getProfile(userId: string) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

function sanitizeSearch(value: string) {
  return value
    .trim()
    .replace(/[%,_()"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toPageResult<T>(
  data: T[] | null,
  count: number | null,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const total = count ?? 0;

  return {
    data: data ?? [],
    count: total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function listStudentProfiles(): Promise<Profile[]>;
export function listStudentProfiles(search: string): Promise<Profile[]>;
export function listStudentProfiles(
  options: StudentProfileQuery,
): Promise<PaginatedResult<Profile>>;
export async function listStudentProfiles(
  input: string | StudentProfileQuery = "",
): Promise<Profile[] | PaginatedResult<Profile>> {
  requireSupabaseConfiguration();

  const legacyCall = typeof input === "string";
  const options: StudentProfileQuery = legacyCall ? { search: input } : input;
  const page = Math.max(1, options.page ?? 1);
  const pageSize = legacyCall
    ? 100
    : Math.min(100, Math.max(1, options.pageSize ?? 10));
  const safeSearch = sanitizeSearch(options.search ?? "");

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "student");

  if (options.studentId) {
    query = query.eq("id", options.studentId);
  }

  if (safeSearch) {
    query = query.or(
      [
        `first_name.ilike.%${safeSearch}%`,
        `last_name.ilike.%${safeSearch}%`,
        `email.ilike.%${safeSearch}%`,
        `student_id.ilike.%${safeSearch}%`,
        `username.ilike.%${safeSearch}%`,
        `program.ilike.%${safeSearch}%`,
      ].join(","),
    );
  }

  if (options.academicYear && options.academicYear !== "all") {
    query = query.eq("academic_year", options.academicYear);
  }

  if (options.program && options.program !== "all") {
    query = query.eq("program", options.program);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  if (legacyCall) return (data ?? []) as Profile[];

  return toPageResult(data as Profile[] | null, count, page, pageSize);
}

export async function listStudentFilterOptions() {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("profiles")
    .select("academic_year, program")
    .eq("role", "student");

  if (error) throw error;

  const rows = (data ?? []) as Array<{
    academic_year: string | null;
    program: string | null;
  }>;

  return {
    academicYears: Array.from(
      new Set(
        rows
          .map((row) => row.academic_year)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort(),
    programs: Array.from(
      new Set(
        rows
          .map((row) => row.program)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort(),
  };
}

export async function isApprovedStudentId(studentId: string) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase.rpc("is_approved_student_id", {
    candidate_id: studentId.trim().toUpperCase(),
  });

  if (error) throw error;
  return Boolean(data);
}

export async function listApprovedStudentIds(search = "") {
  requireSupabaseConfiguration();

  const safeSearch = sanitizeSearch(search);
  let query = supabase
    .from("approved_student_ids")
    .select("*")
    .order("created_at", { ascending: false });

  if (safeSearch) {
    query = query.or(
      [
        `student_id.ilike.%${safeSearch}%`,
        `program.ilike.%${safeSearch}%`,
        `notes.ilike.%${safeSearch}%`,
      ].join(","),
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ApprovedStudentId[];
}

export async function saveApprovedStudentId(
  userId: string,
  studentId: string,
  values: Pick<
    ApprovedStudentId,
    "program" | "academic_year" | "is_active" | "notes"
  >,
) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("approved_student_ids")
    .upsert(
      {
        student_id: studentId.trim().toUpperCase(),
        ...values,
        created_by: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id" },
    )
    .select("*")
    .single();

  if (error) throw error;
  await writeAuditLog(
    userId,
    "upsert",
    "approved_student_ids",
    data.student_id,
  );
  return data as ApprovedStudentId;
}

export async function deleteApprovedStudentId(
  userId: string,
  studentId: string,
) {
  requireSupabaseConfiguration();

  const { error } = await supabase
    .from("approved_student_ids")
    .delete()
    .eq("student_id", studentId);

  if (error) throw error;
  await writeAuditLog(userId, "delete", "approved_student_ids", studentId);
}

export async function getDataQualitySummary(): Promise<DataQualitySummary> {
  requireSupabaseConfiguration();

  const [
    studentsResult,
    careersResult,
    electivesResult,
    mappingsResult,
    scoresResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, student_id, email, program, interests, technologies, academic_year",
      )
      .eq("role", "student"),
    supabase
      .from("careers")
      .select(
        "id, name, entry_thresholds, junior_thresholds, senior_thresholds",
      ),
    supabase.from("electives").select("id, name"),
    supabase.from("elective_mappings").select("elective_id"),
    supabase.from("student_skills").select("student_id"),
  ]);

  for (const result of [
    studentsResult,
    careersResult,
    electivesResult,
    mappingsResult,
    scoresResult,
  ]) {
    if (result.error) throw result.error;
  }

  const students = (studentsResult.data ?? []) as Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    student_id: string | null;
    email: string | null;
    program: string | null;
    interests: string[] | null;
    technologies: string[] | null;
    academic_year: string | null;
  }>;

  const incompleteProfiles = students
    .filter(
      (student) =>
        !student.first_name ||
        !student.last_name ||
        !student.student_id ||
        !student.email ||
        !student.program ||
        !student.academic_year ||
        !student.interests?.length ||
        !student.technologies?.length,
    )
    .map((student) => ({
      id: student.id,
      label:
        [student.first_name, student.last_name].filter(Boolean).join(" ") ||
        student.email ||
        "Unnamed student",
      detail: "One or more required profile fields are incomplete.",
    }));

  const careers = (careersResult.data ?? []) as Array<{
    id: string;
    name: string;
    entry_thresholds: Record<string, unknown> | null;
    junior_thresholds: Record<string, unknown> | null;
    senior_thresholds: Record<string, unknown> | null;
  }>;
  const electives = (electivesResult.data ?? []) as Array<{
    id: string;
    name: string;
  }>;
  const mappings = (mappingsResult.data ?? []) as Array<{
    elective_id: string;
  }>;
  const scores = (scoresResult.data ?? []) as Array<{ student_id: string }>;

  const missingThresholds = careers
    .filter((career) => {
      const thresholds = [
        career.entry_thresholds,
        career.junior_thresholds,
        career.senior_thresholds,
      ];
      return thresholds.some(
        (value) =>
          !value || Object.keys(value as Record<string, unknown>).length === 0,
      );
    })
    .map((career) => ({
      id: String(career.id),
      label: String(career.name),
      detail: "One or more level thresholds are missing.",
    }));

  const mappedElectiveIds = new Set(
    mappings.map((mapping) => String(mapping.elective_id)),
  );
  const unmappedElectives = electives
    .filter((elective) => !mappedElectiveIds.has(String(elective.id)))
    .map((elective) => ({
      id: String(elective.id),
      label: String(elective.name),
      detail: "No skill mapping is configured.",
    }));

  const scoredStudentIds = new Set(
    scores.map((score) => String(score.student_id)),
  );
  const studentsWithoutSkillScores = students
    .filter((student) => !scoredStudentIds.has(student.id))
    .map((student) => ({
      id: student.id,
      label:
        [student.first_name, student.last_name].filter(Boolean).join(" ") ||
        student.email ||
        "Unnamed student",
      detail: "No student skill scores have been saved.",
    }));

  return {
    incompleteProfiles,
    missingThresholds,
    unmappedElectives,
    studentsWithoutSkillScores,
  };
}

export async function listRecentAuditLogs(limit = 20) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_id, action, entity_table, entity_id, details, created_at, actor:profiles!audit_logs_actor_id_fkey(first_name, middle_name, last_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(Math.min(50, Math.max(1, limit)));

  if (error) throw error;

  type AuditActor = Pick<
    Profile,
    "first_name" | "middle_name" | "last_name" | "email"
  >;

  type SupabaseAuditRow = Omit<AuditLog, "actor"> & {
    actor: AuditActor[] | null;
  };

  const rows = (data ?? []) as SupabaseAuditRow[];

  return rows.map(
    (row): AuditLog => ({
      ...row,
      actor: row.actor?.[0] ?? null,
    }),
  );
}

export async function listCareers() {
  requireSupabaseConfiguration();
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Career[];
}

export async function listSkills() {
  requireSupabaseConfiguration();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Skill[];
}

export async function listSpecializations() {
  requireSupabaseConfiguration();
  const { data, error } = await supabase
    .from("specializations")
    .select("*, career:careers(name)")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Specialization[];
}

export async function listElectives() {
  requireSupabaseConfiguration();
  const { data, error } = await supabase
    .from("electives")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Elective[];
}

export async function listElectiveMappings() {
  requireSupabaseConfiguration();
  const { data, error } = await supabase
    .from("elective_mappings")
    .select("*, elective:electives(name), skill:skills(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ElectiveMapping[];
}

export async function listStudentSkills(studentId: string) {
  requireSupabaseConfiguration();
  const { data, error } = await supabase
    .from("student_skills")
    .select("*, skill:skills(name, default_weight)")
    .eq("student_id", studentId);

  if (error) throw error;
  return (data ?? []) as StudentSkill[];
}

export async function listCompletedStudentElectives(studentId: string) {
  requireSupabaseConfiguration();
  const { data, error } = await supabase
    .from("student_electives")
    .select("student_id, elective_id, completed_at")
    .eq("student_id", studentId);

  if (error) throw error;
  return (data ?? []) as StudentElective[];
}

export async function setStudentElectiveCompleted(
  studentId: string,
  electiveId: string,
  completed: boolean,
) {
  requireSupabaseConfiguration();

  if (completed) {
    const { data, error } = await supabase
      .from("student_electives")
      .upsert(
        { student_id: studentId, elective_id: electiveId },
        { onConflict: "student_id,elective_id" },
      )
      .select("student_id, elective_id, completed_at")
      .single();

    if (error) throw error;
    return data as StudentElective;
  }

  const { error } = await supabase
    .from("student_electives")
    .delete()
    .eq("student_id", studentId)
    .eq("elective_id", electiveId);

  if (error) throw error;
  return null;
}

export async function listStudentResumeFiles(studentId: string) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("resume_files")
    .select("id, user_id, storage_path, file_name, analysis, created_at")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResumeFile[];
}

export async function listStudentInterviewSessions(studentId: string) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("interview_sessions")
    .select("id, user_id, question, answer, feedback, score, created_at")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as InterviewSession[];
}

export async function saveStudentInterviewSession(
  userId: string,
  question: string,
  answer: string,
  feedback: string,
  score: number,
) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({ user_id: userId, question, answer, feedback, score })
    .select("id, user_id, question, answer, feedback, score, created_at")
    .single();

  if (error) throw error;
  return data as InterviewSession;
}

export async function saveStudentSkill(
  studentId: string,
  skillId: string,
  score: number,
) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("student_skills")
    .upsert(
      {
        student_id: studentId,
        skill_id: skillId,
        score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,skill_id" },
    )
    .select("*, skill:skills(name, default_weight)")
    .single();

  if (error) throw error;
  return data as StudentSkill;
}

export async function listNotifications(userId: string) {
  requireSupabaseConfiguration();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as UserNotification[];
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
) {
  requireSupabaseConfiguration();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function saveProfile(userId: string, values: Partial<Profile>) {
  requireSupabaseConfiguration();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function saveCareer(
  userId: string,
  id: string | null,
  values: Pick<
    Career,
    | "name"
    | "category"
    | "description"
    | "entry_thresholds"
    | "junior_thresholds"
    | "senior_thresholds"
  >,
) {
  requireSupabaseConfiguration();
  const payload = { ...values, updated_at: new Date().toISOString() };
  const query = id
    ? supabase.from("careers").update(payload).eq("id", id)
    : supabase.from("careers").insert({ ...payload, created_by: userId });
  const { data, error } = await query.select("*").single();

  if (error) throw error;
  await writeAuditLog(userId, id ? "update" : "create", "careers", data.id);
  return data as Career;
}

export async function saveSkill(
  userId: string,
  id: string | null,
  values: Pick<Skill, "name" | "category" | "default_weight">,
) {
  requireSupabaseConfiguration();
  const payload = { ...values, updated_at: new Date().toISOString() };
  const query = id
    ? supabase.from("skills").update(payload).eq("id", id)
    : supabase.from("skills").insert({ ...payload, created_by: userId });
  const { data, error } = await query.select("*").single();

  if (error) throw error;
  await writeAuditLog(userId, id ? "update" : "create", "skills", data.id);
  return data as Skill;
}

export async function saveSpecialization(
  userId: string,
  id: string | null,
  values: Pick<
    Specialization,
    "name" | "career_id" | "required_skills" | "recommended_electives"
  >,
) {
  requireSupabaseConfiguration();
  const payload = { ...values, updated_at: new Date().toISOString() };
  const query = id
    ? supabase.from("specializations").update(payload).eq("id", id)
    : supabase
        .from("specializations")
        .insert({ ...payload, created_by: userId });
  const { data, error } = await query
    .select("*, career:careers(name)")
    .single();

  if (error) throw error;
  await writeAuditLog(
    userId,
    id ? "update" : "create",
    "specializations",
    data.id,
  );
  return data as Specialization;
}

export async function saveElectiveMapping(
  userId: string,
  id: string | null,
  values: Pick<
    ElectiveMapping,
    "elective_id" | "skill_id" | "boost_percentage" | "formula"
  >,
) {
  requireSupabaseConfiguration();
  const payload = { ...values, updated_at: new Date().toISOString() };
  const query = id
    ? supabase.from("elective_mappings").update(payload).eq("id", id)
    : supabase
        .from("elective_mappings")
        .insert({ ...payload, created_by: userId });
  const { data, error } = await query
    .select("*, elective:electives(name), skill:skills(name)")
    .single();

  if (error) throw error;
  await writeAuditLog(
    userId,
    id ? "update" : "create",
    "elective_mappings",
    data.id,
  );
  return data as ElectiveMapping;
}

export async function getCount(table: string) {
  requireSupabaseConfiguration();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}