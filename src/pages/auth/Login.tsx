import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  Mail,
  ArrowLeft,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import logo from "../../assets/images/career-compass-logo.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    login("student");
    navigate("/dashboard", { replace: true });
  };

  const handleAdminLogin = () => {
    login("admin");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-slate-900">
      <header className="bg-white/90 backdrop-blur border-b border-teal-100 shadow-sm">
        <div className="w-full px-8 lg:px-12 py-5 flex items-center justify-between">
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
              <p className="text-xs text-slate-500">Navigate your future</p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#eaf8f5] text-[#16806d] px-6 py-3 rounded-full font-bold hover:bg-teal-100 transition"
          >
            <ArrowLeft size={18} />
            Back to Landing
          </Link>
        </div>
      </header>

      <main className="min-h-[85vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-teal-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] px-8 py-8 text-center border-b border-teal-100">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1f8f78] to-[#55b497] text-white rounded-2xl mx-auto flex items-center justify-center shadow">
              <Lock size={30} />
            </div>

            <h1 className="text-3xl font-extrabold mt-5">Login Form</h1>

            <p className="text-sm mt-2 text-slate-600">
              Choose the correct temporary role for testing.
            </p>
          </div>

          <div className="p-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Username / Email
              </label>

              <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Mail size={18} className="text-slate-400" />
                <input
                  className="w-full py-3 outline-none"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>

              <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Lock size={18} className="text-slate-400" />
                <input
                  type="password"
                  className="w-full py-3 outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Link
              to="/forgot-password"
              className="block text-sm text-blue-700 hover:underline font-semibold"
            >
              Forgot Password?
            </Link>

            <button
              onClick={handleStudentLogin}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white py-3 rounded-xl font-bold shadow hover:opacity-90 transition"
            >
              <UserRound size={18} />
              Login as Student
            </button>

            <button
              onClick={handleAdminLogin}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
            >
              <ShieldCheck size={18} />
              Login as Admin
            </button>

            <p className="text-center text-sm pt-2">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-700 font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}