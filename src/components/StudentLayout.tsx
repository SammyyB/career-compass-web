import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/career-compass-logo.png";
import {
  LayoutDashboard,
  TrendingUp,
  GraduationCap,
  Briefcase,
  MessageSquareText,
  FileText,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Skill Gap Analysis",
    path: "/skill-gap",
    icon: TrendingUp,
  },
  {
    label: "Elective Recommendation",
    path: "/elective-recommendations",
    icon: GraduationCap,
  },
  {
    label: "Career Path Recommendations",
    path: "/career-recommendations",
    icon: Briefcase,
  },
  {
    label: "Interview Coach",
    path: "/interview-coach",
    icon: MessageSquareText,
  },
  {
    label: "Resume Builder & Analyzer",
    path: "/resume-analyzer",
    icon: FileText,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-slate-800 flex">
      <aside className="w-[300px] min-h-screen bg-gradient-to-b from-[#dff6f2] to-[#eefaf8] border-r border-teal-100 px-5 py-8 fixed left-0 top-0">
        <div className="flex items-center gap-4 mb-10">
          <img
            src={logo}
            alt="Career Compass Logo"
            className="w-16 h-16 object-contain shrink-0"
          />

          <div className="leading-tight">
            <h1 className="text-2xl font-extrabold text-[#16806d] whitespace-nowrap">
              Career Compass
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Navigate your future
            </p>
          </div>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-4 rounded-xl font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white shadow-md"
                      : "text-slate-700 hover:bg-white"
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-8 left-5 right-5 flex items-center gap-3 px-5 py-4 rounded-xl text-slate-700 hover:bg-red-50 hover:text-red-600 font-semibold"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="ml-[300px] flex-1">
        <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button className="text-[#16806d]">
              <Menu size={28} />
            </button>

            <div className="hidden md:flex items-center gap-3 bg-[#f4fbfa] border border-slate-200 px-5 py-3 rounded-xl w-[360px]">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Search anything..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={24} className="text-slate-700" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1f8f78] text-white flex items-center justify-center font-bold">
                ST
              </div>

              <div>
                <p className="font-bold">Student User</p>
                <p className="text-sm text-slate-500">Logged in as Student</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-10">{children}</main>
      </div>
    </div>
  );
}