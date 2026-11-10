export type Role = "student" | "admin";

export type PaginatedResult<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type Profile = {
  id: string;
  email: string | null;
  role: Role;
  username: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  student_id: string | null;
  academic_year: string | null;
  program: string | null;
  department: string | null;
  position: string | null;
  interests: string[];
  technologies: string[];
  career_target: string | null;
  profile_image_path: string | null;
  academic_records: Record<string, string>;
  achievements: string | null;
  created_at: string;
  updated_at: string;
};

export type Career = {
  id: string;
  name: string;
  category: string;
  description: string;
  entry_thresholds: Record<string, number>;
  junior_thresholds: Record<string, number>;
  senior_thresholds: Record<string, number>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  default_weight: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Specialization = {
  id: string;
  name: string;
  career_id: string;
  required_skills: string[];
  recommended_electives: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  career?: Pick<Career, "name"> | null;
};

export type Elective = {
  id: string;
  name: string;
  description: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ElectiveMapping = {
  id: string;
  elective_id: string;
  skill_id: string;
  boost_percentage: number;
  formula: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  elective?: Pick<Elective, "name"> | null;
  skill?: Pick<Skill, "name"> | null;
};

export type StudentSkill = {
  student_id: string;
  skill_id: string;
  score: number;
  updated_at: string;
  skill?: Pick<Skill, "name" | "default_weight"> | null;
};

export type StudentElective = {
  student_id: string;
  elective_id: string;
  completed_at: string;
};

export type UserNotification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type InterviewSession = {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  feedback: string | null;
  score: number | null;
  created_at: string;
};

export type ResumeFile = {
  id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  analysis: Record<string, unknown> | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_table: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  actor?: Pick<Profile, "first_name" | "middle_name" | "last_name" | "email"> | null;
};

export type ApprovedStudentId = {
  student_id: string;
  program: string | null;
  academic_year: string | null;
  is_active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DataQualityRecord = {
  id: string;
  label: string;
  detail: string;
};

export type DataQualitySummary = {
  incompleteProfiles: DataQualityRecord[];
  missingThresholds: DataQualityRecord[];
  unmappedElectives: DataQualityRecord[];
  studentsWithoutSkillScores: DataQualityRecord[];
};