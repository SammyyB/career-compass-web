import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  IdCard,
  Lock,
  CheckCircle2,
} from "lucide-react";

import logo from "../../assets/images/career-compass-logo.png";

const interestOptions = [
  "Web Development",
  "Data Analytics",
  "Cloud Computing",
  "Cybersecurity",
  "UI/UX Design",
  "Mobile Development",
];

const technologyOptions = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "SQL",
  "Firebase",
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<"student" | "admin">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  const cleanName = (value: string) => {
    return value
      .replace(/[^a-zA-Z\s.-]/g, "")
      .replace(/\s+/g, " ")
      .trimStart();
  };

  const cleanId = (value: string) => {
    return value.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();
  };

  const toggleSelection = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleRegister = () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 3) {
      alert("Full name must be at least 3 characters.");
      return;
    }

    if (!/^[a-zA-Z\s.-]+$/.test(trimmedName)) {
      alert("Full name can only contain letters, spaces, dots, and hyphens.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (idNumber.trim().length < 4) {
      alert("Student/Admin ID must be at least 4 characters.");
      return;
    }

    if (role === "student" && selectedInterests.length === 0) {
      alert("Please select at least one interest.");
      return;
    }

    if (role === "student" && selectedTechnologies.length === 0) {
      alert("Please select at least one technology.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    login(role);
    navigate(role === "student" ? "/dashboard" : "/admin");
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

      <main className="py-10 px-4 flex justify-center">
        <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-xl border border-teal-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] px-8 py-8 text-center border-b border-teal-100">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1f8f78] to-[#55b497] text-white rounded-2xl mx-auto flex items-center justify-center shadow">
              <UserPlus size={30} />
            </div>

            <h1 className="text-3xl font-extrabold mt-5">Register Form</h1>

            <p className="text-sm mt-2 text-slate-600">
              Create your Career Compass account
            </p>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(cleanName(e.target.value))}
                maxLength={60}
                className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                placeholder="Example: Juan Dela Cruz"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Email Address
              </label>
              <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Mail size={18} className="text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  type="email"
                  className="w-full py-3 outline-none"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Student/Admin ID
              </label>
              <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <IdCard size={18} className="text-slate-400" />
                <input
                  value={idNumber}
                  onChange={(e) => setIdNumber(cleanId(e.target.value))}
                  maxLength={20}
                  className="w-full py-3 outline-none"
                  placeholder="Example: 2024-00123"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Account Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "admin")}
                className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
              >
                <option value="student">Register as Student</option>
                <option value="admin">Register as Admin</option>
              </select>
            </div>

            {role === "student" && (
              <>
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Academic Year
                  </label>
                  <select className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]">
                    <option value="">Select academic year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Experience Level
                  </label>
                  <select className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]">
                    <option value="">Select experience level</option>
                    <option>Entry</option>
                    <option>Junior</option>
                    <option>Senior</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">
                    Program / Course
                  </label>
                  <input
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Example: BS Information Technology"
                    maxLength={80}
                  />
                </div>

                <div className="md:col-span-2 bg-[#f8fcfb] border border-teal-100 rounded-2xl p-5">
                  <label className="text-sm font-bold text-slate-700">
                    Career Interests
                  </label>
                  <p className="text-xs text-slate-500 mb-4">
                    Choose one or more areas you are interested in.
                  </p>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {interestOptions.map((interest) => (
                      <label
                        key={interest}
                        className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition ${
                          selectedInterests.includes(interest)
                            ? "bg-[#eaf8f5] border-[#55b497] text-[#16806d]"
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(interest)}
                          onChange={() =>
                            toggleSelection(
                              interest,
                              selectedInterests,
                              setSelectedInterests
                            )
                          }
                          className="accent-[#55b497]"
                        />
                        <span className="text-sm font-semibold">
                          {interest}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 bg-[#f8fcfb] border border-teal-100 rounded-2xl p-5">
                  <label className="text-sm font-bold text-slate-700">
                    Technologies / Skills
                  </label>
                  <p className="text-xs text-slate-500 mb-4">
                    Select technologies you already know or want to improve.
                  </p>

                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {technologyOptions.map((technology) => (
                      <label
                        key={technology}
                        className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition ${
                          selectedTechnologies.includes(technology)
                            ? "bg-[#eaf8f5] border-[#55b497] text-[#16806d]"
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTechnologies.includes(technology)}
                          onChange={() =>
                            toggleSelection(
                              technology,
                              selectedTechnologies,
                              setSelectedTechnologies
                            )
                          }
                          className="accent-[#55b497]"
                        />
                        <span className="text-sm font-semibold">
                          {technology}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {role === "admin" && (
              <>
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Department / Office
                  </label>
                  <input
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Example: IT Department"
                    maxLength={80}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Admin Position
                  </label>
                  <input
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Example: Career Coordinator"
                    maxLength={60}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">
                    Authorization Code
                  </label>
                  <input
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Enter assigned admin authorization code"
                    maxLength={30}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>
              <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
                <Lock size={18} className="text-slate-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  placeholder="Re-enter your password"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleRegister}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white py-4 rounded-xl font-bold shadow hover:opacity-90 transition"
              >
                <CheckCircle2 size={20} />
                Sign Up
              </button>

              <p className="text-center text-sm mt-5">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-700 font-bold">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}