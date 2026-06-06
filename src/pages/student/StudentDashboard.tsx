import StudentLayout from "../../components/StudentLayout";
import {
  TrendingUp,
  Target,
  BookOpen,
  Briefcase,
  Code,
  Database,
  Cloud,
  Star,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Overall Match Score",
    value: "82%",
    note: "12% this week",
    icon: TrendingUp,
    color: "text-[#16806d]",
    bg: "bg-[#d9f3ee]",
  },
  {
    title: "Skills Assessed",
    value: "24",
    note: "of 36",
    icon: Target,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    title: "Recommended Electives",
    value: "5",
    note: "new suggestions",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Career Matches",
    value: "3",
    note: "top matches",
    icon: Briefcase,
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
];

const matches = [
  {
    number: "01",
    career: "Web Developer",
    score: "88%",
    description: "Design, build, and maintain websites and web applications.",
    skills: ["HTML", "CSS", "JavaScript", "+3 more"],
    icon: Code,
    theme: "teal",
  },
  {
    number: "02",
    career: "Data Analyst",
    score: "79%",
    description: "Analyze data to help organizations make informed decisions.",
    skills: ["SQL", "Excel", "Python", "+2 more"],
    icon: Database,
    theme: "purple",
  },
  {
    number: "03",
    career: "Cloud Engineer",
    score: "74%",
    description: "Design and manage cloud infrastructure and services.",
    skills: ["AWS", "Linux", "Docker", "+2 more"],
    icon: Cloud,
    theme: "orange",
  },
];

const progress = [
  ["Skills Assessment", "80%"],
  ["Elective Recommendations", "65%"],
  ["Career Exploration", "70%"],
  ["Interview Preparation", "75%"],
];

const activities = [
  ["Completed Skills Assessment", "2 hours ago"],
  ["Explored Data Analyst career path", "Yesterday"],
  ["Added Python to your skills", "2 days ago"],
  ["Viewed Web Developer career details", "3 days ago"],
];

export default function StudentDashboard() {
  return (
    <StudentLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 shadow-sm border border-teal-100 relative overflow-hidden">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">
            Welcome back, Student
          </h1>

          <p className="text-slate-600 text-lg mt-3">
            Track your progress and discover the best career paths for you.
          </p>
        </div>

        <div className="absolute right-10 bottom-0 opacity-10">
          <Target size={150} />
        </div>
      </section>

      <section className="grid xl:grid-cols-4 md:grid-cols-2 gap-6 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5"
            >
              <div
                className={`w-16 h-16 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}
              >
                <Icon size={30} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-600">
                  {stat.title}
                </p>

                <div className="flex items-end gap-2 mt-1">
                  <h2 className="text-4xl font-extrabold text-slate-900">
                    {stat.value}
                  </h2>
                  <span className="text-slate-500 mb-1">{stat.note}</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
            <Star size={24} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">Top Career Matches</h2>
            <p className="text-slate-500">
              Based on your skills, interests, and goals
            </p>
          </div>
        </div>

        <button className="border border-teal-200 text-[#16806d] px-5 py-3 rounded-xl font-bold hover:bg-teal-50">
          View All Matches
        </button>
      </section>

      <section className="grid xl:grid-cols-3 gap-6 mb-8">
        {matches.map((match, index) => {
          const Icon = match.icon;

          const isFirst = index === 0;
          const isSecond = index === 1;

          const accent = isFirst
            ? "text-[#16806d] border-[#55b497]"
            : isSecond
            ? "text-purple-600 border-purple-300"
            : "text-orange-500 border-orange-300";

          const scoreColor = isFirst
            ? "text-[#16806d]"
            : isSecond
            ? "text-purple-600"
            : "text-orange-500";

          const button = isFirst
            ? "bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white"
            : isSecond
            ? "border border-purple-300 text-purple-700"
            : "border border-orange-300 text-orange-500";

          const iconBg = isFirst
            ? "bg-[#55b497]"
            : isSecond
            ? "bg-purple-600"
            : "bg-orange-500";

          return (
            <div
              key={match.career}
              className={`bg-white rounded-3xl p-8 shadow-sm border ${accent} hover:shadow-lg transition`}
            >
              <span
                className={`${iconBg} text-white px-3 py-1 rounded-md text-sm font-bold`}
              >
                {match.number}
              </span>

              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-4">
                  <div
                    className={`${iconBg} text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow`}
                  >
                    <Icon size={28} />
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {match.career}
                  </h3>
                </div>

                <div className="text-right">
                  <p className={`text-4xl font-extrabold ${scoreColor}`}>
                    {match.score}
                  </p>
                  <p className="text-sm text-slate-600">Match</p>
                </div>
              </div>

              <p className="text-slate-600 mt-8 leading-relaxed">
                {match.description}
              </p>

              <div className="mt-8">
                <p className="font-bold mb-3">Top Skills</p>

                <div className="flex flex-wrap gap-2">
                  {match.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-[#f2f8f7] px-4 py-2 rounded-full text-sm font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className={`w-full mt-8 py-4 rounded-xl font-bold ${button}`}
              >
                View Career Details
              </button>
            </div>
          );
        })}
      </section>

      <section className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-extrabold mb-6">Your Progress</h2>

          <div className="flex items-center gap-10">
            <div className="w-32 h-32 rounded-full border-[14px] border-[#55b497] flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-extrabold">72%</p>
                <p className="text-xs text-slate-500">Overall</p>
              </div>
            </div>

            <div className="flex-1 space-y-5">
              {progress.map(([label, value]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>

                  <div className="h-3 bg-[#e8f3f1] rounded-full">
                    <div
                      className="h-3 bg-[#55b497] rounded-full"
                      style={{ width: value }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-extrabold mb-6">Recent Activity</h2>

          <div className="space-y-5">
            {activities.map(([activity, time]) => (
              <div key={activity} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#55b497] text-white rounded-full flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </span>
                  <p>{activity}</p>
                </div>

                <p className="text-sm text-slate-400">{time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StudentLayout>
  );
}