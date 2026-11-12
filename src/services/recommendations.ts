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
  skillScore: number;
  interestScore: number;
  totalGap: number;
  comparisons: SkillComparison[];
};

export function getCareerLevel(
  academicYear: string | null | undefined,
): CareerLevel {
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
  studentSkills: StudentSkill[],
) {
  const skill = skills.find(
    (item) => item.name.toLowerCase() === skillName.toLowerCase(),
  );

  if (!skill) return 0;

  const studentSkill = studentSkills.find((item) => item.skill_id === skill.id);
  return Math.max(0, Math.min(100, Number(studentSkill?.score ?? 0)));
}

export function calculateCareerMatch(
  career: Career,
  level: CareerLevel,
  skills: Skill[],
  studentSkills: StudentSkill[],
  interests: string[] = [],
): CareerMatch {
  const thresholds = getThresholds(career, level);
  const comparisons = Object.entries(thresholds).map(
    ([skillName, rawRequired]) => {
      const required = Math.max(0, Math.min(100, Number(rawRequired)));
      const current = getCurrentSkillScore(skillName, skills, studentSkills);
      const gap = Math.max(0, required - current);
      const readiness =
        required === 0 ? 100 : Math.min(100, (current / required) * 100);

      return {
        skillName,
        current,
        required,
        gap,
        readiness,
      };
    },
  );

  const skillScore = comparisons.length
    ? Math.round(
        comparisons.reduce((total, item) => total + item.readiness, 0) /
          comparisons.length,
      )
    : 0;

  const careerText =
    `${career.name} ${career.category} ${career.description}`.toLowerCase();
  const normalizedInterests = interests
    .map((interest) => interest.trim().toLowerCase())
    .filter(Boolean);
  const matchedInterests = normalizedInterests.filter((interest) => {
    if (careerText.includes(interest)) return true;

    return interest
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 3)
      .some((word) => careerText.includes(word));
  });
  const interestScore = normalizedInterests.length
    ? Math.round((matchedInterests.length / normalizedInterests.length) * 100)
    : 0;
  const score = normalizedInterests.length
    ? Math.round(skillScore * 0.8 + interestScore * 0.2)
    : skillScore;

  return {
    career,
    level,
    score,
    skillScore,
    interestScore,
    totalGap: comparisons.reduce((total, item) => total + item.gap, 0),
    comparisons,
  };
}

export function rankCareers(
  careers: Career[],
  skills: Skill[],
  studentSkills: StudentSkill[],
  academicYear: string | null | undefined,
  interests: string[] = [],
) {
  const level = getCareerLevel(academicYear);

  return careers
    .map((career) =>
      calculateCareerMatch(career, level, skills, studentSkills, interests),
    )
    .sort((left, right) => {
      return (
        right.score - left.score ||
        right.skillScore - left.skillScore ||
        left.career.name.localeCompare(right.career.name)
      );
    });
}
