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
        <div className="w-full px-4 py-3 sm:px-8 sm:py-5 lg:px-12">
          <Link to="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img
              src={logo}
              alt="Career Compass Logo"
              className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-16"
            />

            <div>
              <h1 className="text-lg font-extrabold text-[#16806d] sm:text-2xl">
                Career Compass
              </h1>
              <p className="text-xs text-slate-500">Navigate your future</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-16">
        <section className="relative grid min-w-0 items-center gap-8 overflow-hidden rounded-[2rem] border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-5 shadow-sm sm:gap-10 sm:p-8 lg:grid-cols-2 lg:p-10">
          <div className="relative z-10 min-w-0">
            <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
              Decision-support tool
            </p>

            <h2 className="mt-3 max-w-full break-words text-4xl font-extrabold leading-[1.08] sm:text-5xl">
              Personalized Career Guidance for IT Students
            </h2>

            <p className="mt-5 max-w-xl break-words text-base leading-relaxed text-slate-600 sm:text-lg">
              Career Compass helps students discover suitable IT career paths
              through skill gap analysis, elective recommendations, resume
              support, and interview preparation.
            </p>

            <div className="mt-7 flex max-w-full flex-wrap gap-3">
              {["Career Matching", "Skill Gap Analysis", "Resume Support"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm sm:px-4"
                  >
                    <CheckCircle2 size={16} className="text-[#16806d]" />
                    {item}
                  </span>
                ),
              )}
            </div>

            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] px-6 py-4 font-bold text-white shadow-lg transition hover:scale-105 sm:w-auto sm:px-8"
              >
                Create Account
                <ArrowRight size={20} />
              </Link>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-6 py-4 font-bold text-[#16806d] transition hover:bg-[#eaf8f5] sm:w-auto sm:px-8"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="relative z-10 min-w-0">
            <div className="rounded-[2rem] border border-teal-100 bg-white p-4 shadow-xl sm:p-7">
              <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
                <div className="min-w-0 rounded-3xl bg-[#eaf8f5] p-4 sm:p-6">
                  <Target className="text-[#16806d] mb-5" size={34} />
                  <h3 className="text-xl font-extrabold">88%</h3>
                  <p className="break-words text-sm text-slate-500">
                    Top Career Match
                  </p>
                </div>

                <div className="min-w-0 rounded-3xl bg-purple-50 p-4 sm:p-6">
                  <GraduationCap className="text-purple-600 mb-5" size={34} />
                  <h3 className="text-xl font-extrabold">5</h3>
                  <p className="text-sm text-slate-500">
                    Recommended Electives
                  </p>
                </div>

                <div className="min-w-0 rounded-3xl bg-blue-50 p-4 sm:p-6">
                  <FileText className="text-blue-600 mb-5" size={34} />
                  <h3 className="text-xl font-extrabold">72%</h3>
                  <p className="text-sm text-slate-500">Resume Alignment</p>
                </div>

                <div className="min-w-0 rounded-3xl bg-orange-50 p-4 sm:p-6">
                  <MessageSquareText
                    className="text-orange-500 mb-5"
                    size={34}
                  />
                  <h3 className="text-xl font-extrabold">AI</h3>
                  <p className="text-sm text-slate-500">Interview Coach</p>
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