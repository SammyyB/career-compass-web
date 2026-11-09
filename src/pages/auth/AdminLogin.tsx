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
              <p className="text-xs text-slate-500">Administrator portal</p>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#eaf8f5] text-[#16806d] px-6 py-3 rounded-full font-bold hover:bg-teal-100 transition"
          >
            <ArrowLeft size={18} /> Back to Landing
          </Link>
        </div>
      </header>

      <main className="min-h-[85vh] flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-teal-100 overflow-hidden"
        >
          <div className="bg-slate-900 text-white px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center">
              <ShieldCheck size={30} />
            </div>
            <h1 className="text-3xl font-extrabold mt-5">Admin Login</h1>
            <p className="text-sm mt-2 text-slate-300">
              Authorized administrators only
            </p>
          </div>
          <div className="p-8 space-y-5">
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