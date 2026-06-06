import StudentLayout from "../../components/StudentLayout";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

const skills = [
  ["Programming", "95%", "80%", "meets"],
  ["Web Development", "87%", "75%", "meets"],
  ["Database Management", "82%", "70%", "meets"],
  ["Version Control", "60%", "65%", "near"],
  ["Deployment", "55%", "60%", "below"],
];

export default function SkillGapAnalysis() {
  return (
    <StudentLayout>
      <section className="mb-8">
        <div className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 border border-teal-100 shadow-sm">
          <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
            Skill Gap Analysis
          </p>
          <h1 className="text-4xl font-extrabold mt-2">
            Selected Career Path: Web Developer
          </h1>
          <p className="text-slate-600 mt-3">
            Compare your current skills against the required threshold.
          </p>
        </div>
      </section>

      <section className="grid xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Career Stage</h2>
          <div className="bg-[#eaf8f5] rounded-2xl p-6 text-center">
            <p className="font-bold">Web Developer</p>
            <div className="my-6 text-slate-600">
              <p>Senior</p>
              <p>↑</p>
              <p>Junior</p>
              <p>↑</p>
              <p className="font-bold text-[#16806d]">Entry</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-[#16806d]" />
            <h2 className="text-xl font-bold">Gap Indicators</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#eaf8f5]">
                  <th className="p-4 rounded-l-xl">Skill</th>
                  <th className="p-4">Current</th>
                  <th className="p-4">Required</th>
                  <th className="p-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {skills.map(([skill, current, required, status]) => (
                  <tr key={skill} className="border-b border-slate-100">
                    <td className="p-4 font-semibold">{skill}</td>
                    <td className="p-4">{current}</td>
                    <td className="p-4">{required}</td>
                    <td className="p-4">
                      {status === "meets" && (
                        <span className="inline-flex items-center gap-2 text-green-600 font-bold">
                          <CheckCircle2 size={18} /> Meets Requirement
                        </span>
                      )}
                      {status === "near" && (
                        <span className="inline-flex items-center gap-2 text-orange-500 font-bold">
                          <AlertTriangle size={18} /> Near Threshold
                        </span>
                      )}
                      {status === "below" && (
                        <span className="inline-flex items-center gap-2 text-red-500 font-bold">
                          <XCircle size={18} /> Below Required
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </StudentLayout>
  );
}