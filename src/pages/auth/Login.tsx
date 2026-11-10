import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Lock, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../../assets/images/career-compass-logo.png";
import {
  PROFILE_SETUP_PENDING_KEY,
  useAuth,
} from "../../context/AuthContext";

export default function Login() {
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

      if (profile.role !== "student") {
        await signOut();
        throw new Error(
          "This is an administrator account. Use the separate admin portal.",
        );
      }

      const pendingSetupUserId = window.localStorage.getItem(
        PROFILE_SETUP_PENDING_KEY,
      );

      navigate(
        pendingSetupUserId === profile.id
          ? "/profile?setup=1"
          : "/dashboard",
        { replace: true },
      );
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
      <header className="border-b border-teal-100 bg-white/90 shadow-sm backdrop-blur">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5 lg:px-12">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 sm:gap-4"
          >
            <img
              src={logo}
              alt="Career Compass Logo"
              className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-16"
            />
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-[#16806d] sm:text-2xl">
                Career Compass
              </h1>
              <p className="text-xs text-slate-500">Navigate your future</p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#eaf8f5] px-3 py-2 text-sm font-bold text-[#16806d] transition hover:bg-teal-100 sm:px-6 sm:py-3 sm:text-base"
          >
            <ArrowLeft size={16} />
            Back to Landing
          </Link>
        </div>
      </header>

      <main className="flex min-h-[85vh] items-center justify-center px-4 py-6 sm:py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-xl"
        >
          <div className="border-b border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] px-5 py-6 text-center sm:px-8 sm:py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f8f78] to-[#55b497] text-white shadow">
              <Lock size={30} />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
              Student Login
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to continue your career journey.
            </p>
          </div>

          <div className="space-y-5 p-5 sm:p-8">
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"
              >
                {error}
              </p>
            )}

            <label className="block text-sm font-bold text-slate-700">
              Email Address
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Mail
                  size={18}
                  className="shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full min-w-0 py-3 outline-none"
                  placeholder="example@email.com"
                />
              </span>
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Password
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Lock
                  size={18}
                  className="shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full min-w-0 py-3 outline-none"
                  placeholder="Enter your password"
                />
              </span>
            </label>

            <Link
              to="/forgot-password"
              className="block text-sm font-semibold text-blue-700 hover:underline"
            >
              Forgot Password?
            </Link>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] py-4 font-bold text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserRound size={18} />
              {busy ? "Signing in..." : "Login as Student"}
            </button>

            <p className="pt-2 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-bold text-blue-700">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}