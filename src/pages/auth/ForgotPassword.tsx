import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail } from "lucide-react";
import logo from "../../assets/images/career-compass-logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert("Temporary password reset successful!");
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
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
            to="/login"
            className="inline-flex items-center gap-2 bg-[#eaf8f5] text-[#16806d] px-6 py-3 rounded-full font-bold hover:bg-teal-100 transition"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
      </header>

      <main className="min-h-[85vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-teal-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] px-8 py-8 text-center border-b border-teal-100">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1f8f78] to-[#55b497] text-white rounded-2xl mx-auto flex items-center justify-center shadow">
              <KeyRound size={30} />
            </div>

            <h1 className="text-3xl font-extrabold mt-5">Forgot Password</h1>

            <p className="text-sm mt-2 text-slate-600">
              Reset your temporary account password.
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="w-full py-3 outline-none"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                New Password
              </label>

              <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Lock size={18} className="text-slate-400" />
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  className="w-full py-3 outline-none"
                  placeholder="Minimum of 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Confirm Password
              </label>

              <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Lock size={18} className="text-slate-400" />
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  className="w-full py-3 outline-none"
                  placeholder="Re-enter your new password"
                />
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white py-4 rounded-xl font-bold shadow hover:opacity-90 transition"
            >
              <CheckCircle2 size={20} />
              Update Password
            </button>

            <p className="text-center text-sm pt-2">
              Remembered your password?{" "}
              <Link to="/login" className="text-blue-700 font-bold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}