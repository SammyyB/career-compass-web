import StudentLayout from "../../components/StudentLayout";
import { Target, CheckCircle2, BriefcaseBusiness } from "lucide-react";

export default function CareerRecommendations() {
  return (
    <StudentLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Career Path Recommendation
        </p>
        <h1 className="text-4xl font-extrabold mt-2">
          Career Path Results
        </h1>
        <p className="text-slate-600 mt-3">
          Overall match score for your selected path.
        </p>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Matching Criteria</h2>
          </div>

          <h3 className="font-bold mb-3">Skills to Master</h3>
          <ul className="space-y-3 mb-8">
            {["Git collaboration", "Basic deployment", "API consumption"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#16806d]" />
                {item}
              </li>
            ))}
          </ul>

          <h3 className="font-bold mb-3">Recommended Actions</h3>
          <ul className="space-y-3">
            {[
              "Complete Advanced Web Systems elective",
              "Build 2–3 portfolio projects",
              "Contribute to open-source projects",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#16806d]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BriefcaseBusiness className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Career Details</h2>
          </div>

          <div className="bg-[#eaf8f5] rounded-3xl p-6 mb-6">
            <h3 className="text-3xl font-extrabold text-[#16806d]">88%</h3>
            <p className="text-slate-600">Overall Match Score</p>
          </div>

          <p className="text-slate-700 leading-relaxed">
            Web developers create, build, and maintain websites and web applications,
            handling the technical aspects to ensure high performance, speed, and security.
          </p>

          <ul className="mt-6 space-y-3">
            <li>• Build simple web interfaces</li>
            <li>• Fix bugs and implement UI features</li>
            <li>• Work under supervision</li>
          </ul>
        </div>
      </section>
    </StudentLayout>
  );
}