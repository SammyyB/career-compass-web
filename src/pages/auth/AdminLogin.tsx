import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/career-compass-logo.png";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const profile = await signIn(email, password);
      if (profile.role !== "admin") {
        await signOut();
        throw new Error(
          "This account is a student account. Use the student login.",
        );
      }
      navigate("/admin", { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900">
      <header className="border-b border-slate-700 bg-[#0f1b33] shadow-sm">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5 lg:px-12">
          <Link to="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img
              src={logo}
              alt="Career Compass Logo"
              className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-16"
            />
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-white sm:text-2xl">
                Career Compass
              </h1>
              <p className="text-xs text-slate-300">Administrator portal</p>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#334155] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#475569] sm:px-6 sm:py-3 sm:text-base"
          >
            <ArrowLeft size={16} /> Back to Landing
          </Link>
        </div>
      </header>

      <main className="flex min-h-[85vh] items-center justify-center px-4 py-6 sm:py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-teal-100 overflow-hidden"
        >
          <div className="bg-slate-900 px-5 py-6 text-center text-white sm:px-8 sm:py-8">
            <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center">
              <ShieldCheck size={30} />
            </div>
            <h1 className="text-3xl font-extrabold mt-5">Admin Login</h1>
            <p className="text-sm mt-2 text-slate-300">
              Authorized administrators only
            </p>
          </div>
          <div className="space-y-5 p-5 sm:p-8">
            {error && (
              <p className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-semibold">
                {error}
              </p>
            )}
            <label className="block text-sm font-bold text-slate-700">
              Admin Email
              <span className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Mail size={18} className="text-slate-400" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="w-full py-3 outline-none"
                  placeholder="admin@example.com"
                />
              </span>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Password
              <span className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Lock size={18} className="text-slate-400" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  className="w-full py-3 outline-none"
                  placeholder="Enter your password"
                />
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="block text-sm text-blue-700 hover:underline font-semibold"
            >
              Forgot Password?
            </Link>
            <button
              disabled={busy}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Enter Admin Portal"}
            </button>
            <p className="text-center text-xs text-slate-500">
              Admin accounts are created by the system administrator.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}