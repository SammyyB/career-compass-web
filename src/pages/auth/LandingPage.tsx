import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  GraduationCap,
  FileText,
  MessageSquareText,
} from "lucide-react";

import logo from "../../assets/images/career-compass-logo.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4fbfa] text-slate-900">
      <header className="bg-white/90 backdrop-blur border-b border-teal-100 shadow-sm">
        <div className="w-full px-8 lg:px-12 py-5 flex items-center">
          <Link to="/" className="flex items-center gap-4">
            <img
              src={logo}
              alt="Career Compass Logo"
              className="w-16 h-16 object-contain"
            />

            <div>
              <h1 className="text-2xl font-extrabold text-[#16806d]">
                Career Compass
              </h1>
              <p className="text-xs text-slate-500">
                Navigate your future
              </p>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 py-16">
        <section className="grid lg:grid-cols-2 gap-10 items-center bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-[2rem] p-10 border border-teal-100 shadow-sm overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
              Decision-support tool
            </p>

            <h2 className="text-5xl font-extrabold leading-tight mt-3">
              Personalized Career Guidance for IT Students
            </h2>

            <p className="text-slate-600 text-lg mt-5 max-w-xl leading-relaxed">
              Career Compass helps students discover suitable IT career paths
              through skill gap analysis, elective recommendations, resume
              support, and interview preparation.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              {["Career Matching", "Skill Gap Analysis", "Resume Support"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    <CheckCircle2 size={16} className="text-[#16806d]" />
                    {item}
                  </span>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition"
              >
                Create Account
                <ArrowRight size={20} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-[#16806d] px-8 py-4 rounded-2xl font-bold border border-teal-100 hover:bg-[#eaf8f5] transition"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="relative z-10">
            <div className="bg-white rounded-[2rem] p-7 shadow-xl border border-teal-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#eaf8f5] rounded-3xl p-6">
                  <Target className="text-[#16806d] mb-5" size={34} />
                  <h3 className="text-xl font-extrabold">88%</h3>
                  <p className="text-sm text-slate-500">
                    Top Career Match
                  </p>
                </div>

                <div className="bg-purple-50 rounded-3xl p-6">
                  <GraduationCap className="text-purple-600 mb-5" size={34} />
                  <h3 className="text-xl font-extrabold">5</h3>
                  <p className="text-sm text-slate-500">
                    Recommended Electives
                  </p>
                </div>

                <div className="bg-blue-50 rounded-3xl p-6">
                  <FileText className="text-blue-600 mb-5" size={34} />
                  <h3 className="text-xl font-extrabold">72%</h3>
                  <p className="text-sm text-slate-500">
                    Resume Alignment
                  </p>
                </div>

                <div className="bg-orange-50 rounded-3xl p-6">
                  <MessageSquareText
                    className="text-orange-500 mb-5"
                    size={34}
                  />
                  <h3 className="text-xl font-extrabold">AI</h3>
                  <p className="text-sm text-slate-500">
                    Interview Coach
                  </p>
                </div>
              </div>
            </div>
          </div>

          <img
            src={logo}
            alt=""
            className="absolute -right-20 -bottom-24 w-96 opacity-5"
          />
        </section>
      </main>
    </div>
  );
}