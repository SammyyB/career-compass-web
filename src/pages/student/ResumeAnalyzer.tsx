import StudentLayout from "../../components/StudentLayout";
import { FileText, Upload, BarChart3 } from "lucide-react";

export default function ResumeAnalyzer() {
  return (
    <StudentLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Resume Builder & Analyzer
        </p>
        <h1 className="text-4xl font-extrabold mt-2">
          Resume Editor and Preview
        </h1>
        <p className="text-slate-600 mt-3">
          Resume analysis is currently a placeholder and will be connected later.
        </p>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Resume Editor</h2>
          </div>

          <div className="space-y-4">
            {["Skills", "Projects", "Education"].map((item) => (
              <input
                key={item}
                placeholder={item}
                className="w-full bg-[#f4fbfa] border border-teal-100 rounded-xl p-4 outline-none"
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Resume Preview</h2>
          </div>

          <div className="bg-[#f4fbfa] rounded-2xl p-6 space-y-5">
            <div className="h-6 bg-slate-300 rounded-full w-3/4"></div>
            <div className="h-6 bg-slate-300 rounded-full w-full"></div>
            <div className="h-6 bg-slate-300 rounded-full w-5/6"></div>
            <div className="h-32 bg-white border border-teal-100 rounded-xl"></div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Resume Analysis Results</h2>
          </div>
          <p>• Improvement tips</p>
          <p>• Missing skills</p>
          <p>• Overall resume alignment score</p>
        </div>

        <button className="bg-[#55b497] text-white px-10 py-4 rounded-2xl font-bold">
          Analyze Resume
        </button>
      </section>
    </StudentLayout>
  );
}