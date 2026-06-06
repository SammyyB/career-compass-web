import StudentLayout from "../../components/StudentLayout";
import { MessageSquareText, Mic, Send, ChevronRight } from "lucide-react";

export default function InterviewCoach() {
  return (
    <StudentLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Interview Coach
        </p>
        <h1 className="text-4xl font-extrabold mt-2">
          AI Interview Coach Placeholder
        </h1>
        <p className="text-slate-600 mt-3">
          This is a simulated interview module. AI feedback will be added later.
        </p>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquareText className="text-[#16806d]" />
              <h2 className="text-2xl font-extrabold">Question 1 of 5</h2>
            </div>
            <p className="text-slate-600">Career: Web Developer</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Response Input Area</h2>
            <textarea
              className="w-full h-48 bg-[#f4fbfa] border border-teal-100 rounded-2xl p-4 outline-none"
              placeholder="Type your answer here..."
            />

            <div className="flex gap-3 mt-5">
              <button className="flex items-center gap-2 bg-[#55b497] text-white px-6 py-3 rounded-xl font-bold">
                <Send size={18} /> Submit
              </button>

              <button className="flex items-center gap-2 border border-teal-200 px-6 py-3 rounded-xl font-bold text-[#16806d]">
                <Mic size={18} /> Voice Simulation
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
            <h2 className="text-2xl font-extrabold mb-4">Interview Question</h2>
            <p className="text-slate-700 text-lg">
              Explain the difference between client-side and server-side rendering.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
            <h2 className="text-2xl font-extrabold mb-4">Feedback Panel</h2>
            <ul className="space-y-3 text-slate-700">
              <li>• Strengths</li>
              <li>• Areas for improvement</li>
              <li>• Relevance score</li>
            </ul>
          </div>

          <button className="flex items-center justify-center gap-2 w-full bg-[#55b497] text-white px-6 py-4 rounded-2xl font-bold">
            Next Question <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </StudentLayout>
  );
}