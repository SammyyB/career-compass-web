import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, KeyRound, Lock } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import logo from "../../assets/images/career-compass-logo.png";
import InlineNotice from "../../components/InlineNotice";
import {
  getPasswordRuleMessage,
  isStrongPassword,
  useAuth,
} from "../../context/AuthContext";

function getChecks(value: string) {
  return {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value),
  };
}

export default function UpdatePassword() {
  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flow = searchParams.get("flow") === "signup" ? "signup" : "reset";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const checks = getChecks(password);
  const passwordStarted = password.length > 0;
  const confirmStarted = confirmPassword.length > 0;
  const matches = confirmStarted && password === confirmPassword;
  const valid = isStrongPassword(password) && matches;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isStrongPassword(password)) {
      setError(getPasswordRuleMessage());
      return;
    }

    if (!matches) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      await updatePassword(password);

      if (flow === "signup") {
        setMessage("Password created. Complete your student profile next.");
        window.setTimeout(() => navigate("/profile?setup=1", { replace: true }), 900);
      } else {
        await signOut();
        setMessage("Password updated successfully. You may now log in.");
        window.setTimeout(() => navigate("/login", { replace: true }), 900);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update password."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-slate-900">
      <header className="border-b border-teal-100 bg-white/90 px-8 py-5 shadow-sm backdrop-blur">
        <Link to="/" className="flex w-fit items-center gap-4">
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
      </header>

      <main className="flex min-h-[85vh] items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5 rounded-[2rem] border border-teal-100 bg-white p-8 shadow-xl"
        >
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f8f78] to-[#55b497] text-white">
              <KeyRound size={30} />
            </div>
            <h1 className="mt-5 text-3xl font-extrabold">Create New Password</h1>
            <p className="mt-2 text-sm text-slate-600">
              {flow === "signup"
                ? "Your email is verified. Create a password before completing your profile."
                : "Create a new password for your Career Compass account."}
            </p>
          </div>

          {error && (
            <InlineNotice
              type="error"
              message={error}
              onDismiss={() => setError("")}
            />
          )}
          {message && <InlineNotice type="success" message={message} />}

          <label className="block text-sm font-bold" htmlFor="new-password">
            New Password
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
              <Lock size={18} className="text-slate-400" aria-hidden="true" />
              <input
                id="new-password"
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                className="w-full py-3 outline-none"
                placeholder="Create a strong password"
                aria-invalid={passwordStarted && !isStrongPassword(password)}
              />
            </span>
          </label>

          <div className="grid gap-2 text-xs sm:grid-cols-2" aria-live="polite">
            <Rule valid={checks.length} text="At least 8 characters" started={passwordStarted} />
            <Rule valid={checks.uppercase} text="One uppercase letter" started={passwordStarted} />
            <Rule valid={checks.number} text="One number" started={passwordStarted} />
            <Rule valid={checks.special} text="One special character" started={passwordStarted} />
          </div>

          <label className="block text-sm font-bold" htmlFor="confirm-password">
            Confirm Password
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
              <Lock size={18} className="text-slate-400" aria-hidden="true" />
              <input
                id="confirm-password"
                required
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                className="w-full py-3 outline-none"
                placeholder="Re-enter your password"
                aria-invalid={confirmStarted && !matches}
              />
            </span>
          </label>

          {confirmStarted && !matches && (
            <p className="text-xs font-bold text-red-700" role="alert">
              Passwords do not match yet.
            </p>
          )}

          {matches && (
            <p className="text-xs font-bold text-emerald-700" role="status">
              Passwords match.
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !valid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] py-4 font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={20} />
            {busy ? "Saving password..." : "Save Password"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Rule({
  valid,
  text,
  started,
}: {
  valid: boolean;
  text: string;
  started: boolean;
}) {
  return (
    <p className={started && !valid ? "font-semibold text-red-700" : "font-semibold text-emerald-700"}>
      <span className="mr-2">{started ? (valid ? "✓" : "✕") : "•"}</span>
      {text}
    </p>
  );
}