import StudentLayout from "../../components/StudentLayout";
import { GraduationCap, AlertCircle, BookOpen } from "lucide-react";

export default function ElectiveRecommendations() {
  return (
    <StudentLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Elective Recommendation
        </p>
        <h1 className="text-4xl font-extrabold mt-2">
          Based on Skill Gap Analysis
        </h1>
        <p className="text-slate-600 mt-3">
          Recommended electives are based on your weak skill areas.
        </p>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="text-orange-500" />
            <h2 className="text-2xl font-extrabold">Skill Gap Analyses</h2>
          </div>

          <ul className="space-y-4">
            {[
              "Limited experience with Git collaboration",
              "Minimal exposure to deployment processes",
              "No project using REST APIs",
            ].map((item) => (
              <li key={item} className="bg-[#fff7ed] p-4 rounded-2xl text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Recommended Electives</h2>
          </div>

          <div className="space-y-4">
            {[
              "Advanced Web Systems",
              "RESTful API Development",
              "DevOps Fundamentals",
              "Cloud Deployment Basics",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between bg-[#eaf8f5] p-4 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-[#16806d]" />
                  <span className="font-semibold">{item}</span>
                </div>
                <span className="text-sm bg-white px-3 py-1 rounded-full text-[#16806d] font-bold">
                  Suggested
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StudentLayout>
  );
}