import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/career-compass-logo.png";
import {
  LayoutDashboard,
  Briefcase,
  ListChecks,
  Layers,
  BookOpenCheck,
  LogOut,
  Bell,
  Search,
  Menu,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Career Profiles",
    path: "/admin/career-profiles",
    icon: Briefcase,
  },
  {
    label: "Skill Requirements",
    path: "/admin/skill-requirements",
    icon: ListChecks,
  },
  {
    label: "Specializations",
    path: "/admin/specializations",
    icon: Layers,
  },
  {
    label: "Elective Mappings",
    path: "/admin/elective-mappings",
    icon: BookOpenCheck,
  },
];

export default function AdminLayout({
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
            <p className="text-sm text-slate-500 mt-1">Admin Portal</p>
          </div>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
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
                placeholder="Search admin records..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={24} className="text-slate-700" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                2
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="font-bold">Admin User</p>
                <p className="text-sm text-slate-500">Logged in as Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-10">{children}</main>
      </div>
    </div>
  );
}