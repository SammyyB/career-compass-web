import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Mail, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import logo from "../../assets/images/career-compass-logo.png";
import InlineNotice from "../../components/InlineNotice";
import { useAuth } from "../../context/AuthContext";

const focusClass =
  "focus:outline-none focus:ring-2 focus:ring-[#55b497] focus:ring-offset-1";

export default function Register() {
  const { beginStudentRegistration } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);

    try {
      const needsEmailConfirmation = await beginStudentRegistration({
        email: normalizedEmail,
      });

      if (needsEmailConfirmation) {
        setMessage(
          "Account started. Check your email, verify your address, create your password, and complete your student profile afterward."
        );
      } else {
        window.location.hash = "/update-password?flow=signup";
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to start registration."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-slate-900">
      <header className="border-b border-teal-100 bg-white/90 shadow-sm backdrop-blur">
        <div className="flex w-full items-center justify-between px-8 py-5 lg:px-12">
          <Link to="/" className={`flex items-center gap-4 ${focusClass}`}>
            <img
              src={logo}
              alt="Career Compass Logo"
              className="h-16 w-16 object-contain"
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
            className={`inline-flex items-center gap-2 rounded-full bg-[#eaf8f5] px-6 py-3 font-bold text-[#16806d] hover:bg-teal-100 ${focusClass}`}
          >
            <ArrowLeft size={18} />
            Back to Landing
          </Link>
        </div>
      </header>

      <main className="flex min-h-[85vh] items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-md overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-xl"
        >
          <div className="border-b border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] px-8 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f8f78] to-[#55b497] text-white shadow">
              <UserPlus size={30} />
            </div>
            <h1 className="mt-5 text-3xl font-extrabold">Create Account</h1>
            <p className="mt-2 text-sm text-slate-600">
              Start with your email. You will complete your student details after
              verification.
            </p>
          </div>

          <div className="space-y-5 p-8">
            {error && (
              <InlineNotice
                type="error"
                message={error}
                onDismiss={() => setError("")}
              />
            )}

            {message && <InlineNotice type="success" message={message} />}

            <label className="block text-sm font-bold" htmlFor="register-email">
              Email Address
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Mail size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  id="register-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                  className="w-full py-3 outline-none"
                  placeholder="example@email.com"
                />
              </span>
            </label>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-extrabold">What happens next?</p>
              <p className="mt-1">
                Verify your email, create a secure password, then fill in your
                name, Student ID, academic year, program, interests, and skills in
                your Profile page.
              </p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] py-4 font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
            >
              <CheckCircle2 size={20} />
              {busy ? "Sending verification email..." : "Continue with Email"}
            </button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className={`font-bold text-blue-700 ${focusClass}`}>
                Login
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}