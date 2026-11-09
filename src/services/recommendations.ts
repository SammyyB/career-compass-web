import type { Career, Skill, StudentSkill } from "../lib/types";

export type CareerLevel = "entry" | "junior" | "senior";

export type SkillComparison = {
  skillName: string;
  current: number;
  required: number;
  gap: number;
  readiness: number;
};

export type CareerMatch = {
  career: Career;
  level: CareerLevel;
  score: number;
  totalGap: number;
  comparisons: SkillComparison[];
};

export function getCareerLevel(academicYear: string | null | undefined): CareerLevel {
  const value = (academicYear ?? "").toLowerCase();

  if (value.includes("4") || value.includes("senior")) return "senior";
  if (value.includes("2") || value.includes("3") || value.includes("junior")) {
    return "junior";
  }

  return "entry";
}

export function getThresholds(career: Career, level: CareerLevel) {
  if (level === "senior") return career.senior_thresholds;
  if (level === "junior") return career.junior_thresholds;
  return career.entry_thresholds;
}

export function getCurrentSkillScore(
  skillName: string,
  skills: Skill[],
  studentSkills: StudentSkill[]
) {
  const skill = skills.find(
    (item) => item.name.toLowerCase() === skillName.toLowerCase()
  );

  if (!skill) return 0;

  const studentSkill = studentSkills.find((item) => item.skill_id === skill.id);
  return Math.max(0, Math.min(100, Number(studentSkill?.score ?? 0)));
}

export function calculateCareerMatch(
  career: Career,
  level: CareerLevel,
  skills: Skill[],
  studentSkills: StudentSkill[]
): CareerMatch {
  const thresholds = getThresholds(career, level);
  const comparisons = Object.entries(thresholds).map(
    ([skillName, rawRequired]) => {
      const required = Math.max(0, Math.min(100, Number(rawRequired)));
      const current = getCurrentSkillScore(skillName, skills, studentSkills);
      const gap = Math.max(0, required - current);
      const readiness = required === 0 ? 100 : Math.min(100, (current / required) * 100);

      return {
        skillName,
        current,
        required,
        gap,
        readiness,
      };
    }
  );

  const score = comparisons.length
    ? Math.round(
        comparisons.reduce((total, item) => total + item.readiness, 0) /
          comparisons.length
      )
    : 0;

  return {
    career,
    level,
    score,
    totalGap: comparisons.reduce((total, item) => total + item.gap, 0),
    comparisons,
  };
}

export function rankCareers(
  careers: Career[],
  skills: Skill[],
  studentSkills: StudentSkill[],
  academicYear: string | null | undefined,
  careerTarget?: string | null
) {
  const level = getCareerLevel(academicYear);

  return careers
    .map((career) => calculateCareerMatch(career, level, skills, studentSkills))
    .sort((left, right) => {
      const leftTarget = left.career.name === careerTarget ? 1 : 0;
      const rightTarget = right.career.name === careerTarget ? 1 : 0;
      return right.score - left.score || rightTarget - leftTarget || left.career.name.localeCompare(right.career.name);
    });
}