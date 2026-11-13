import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpenCheck,
  Briefcase,
  Clock3,
  Layers,
  ListChecks,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  LayoutDashboard,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import logo from "../assets/images/career-compass-logo.png";
import { useAuth } from "../context/AuthContext";
import type {
  Career,
  Elective,
  ElectiveMapping,
  Skill,
  Specialization,
} from "../lib/types";
import {
  listCareers,
  listElectiveMappings,
  listElectives,
  listRecentAuditLogs,
  listSkills,
  listSpecializations,
  listStudentProfiles,
} from "../services/repository";

const isWideSidebarLayout = () =>
  window.matchMedia("(min-width: 1280px)").matches;

const navItems = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Student Records", "/admin/students", Users],
  ["Career Profiles", "/admin/career-profiles", Briefcase],
  ["Skill Requirements", "/admin/skill-requirements", ListChecks],
  ["Specializations", "/admin/specializations", Layers],
  ["Elective Mappings", "/admin/elective-mappings", BookOpenCheck],
] as const;

type SearchResult = {
  id: string;
  label: string;
  type: string;
  detail: string;
  path: string;
};
type AdminUpdate = {
  id: string;
  action: string;
  entity_table: string;
  created_at: string;
  actor?: {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

const formatEntityName = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const focusClass =
  "focus:outline-none focus:ring-2 focus:ring-[#55b497] focus:ring-offset-2";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRecords, setSearchRecords] = useState<SearchResult[]>([]);
  const [studentSearchRecords, setStudentSearchRecords] = useState<
    SearchResult[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [updates, setUpdates] = useState<AdminUpdate[]>([]);
  const [online, setOnline] = useState(() => navigator.onLine);

  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "Administrator";

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setUpdates((await listRecentAuditLogs(8)) as AdminUpdate[]);
    } catch (error) {
      console.error("Unable to load admin notifications:", error);
      return;
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadSearchRecords = async () => {
      try {
        const [careers, skills, electives, specializations, mappings] =
          await Promise.all([
            listCareers(),
            listSkills(),
            listElectives(),
            listSpecializations(),
            listElectiveMappings(),
          ]);
        if (!mounted) return;
        setSearchRecords([
          ...(careers as Career[]).map((career) => ({
            id: career.id,
            label: career.name,
            type: "Career",
            detail: career.category,
            path: `/admin/career-profiles?id=${encodeURIComponent(career.id)}`,
          })),
          ...(skills as Skill[]).map((skill) => ({
            id: skill.id,
            label: skill.name,
            type: "Skill",
            detail: skill.category,
            path: `/admin/skill-requirements?id=${encodeURIComponent(skill.id)}`,
          })),
          ...(electives as Elective[]).map((elective) => ({
            id: elective.id,
            label: elective.name,
            type: "Elective",
            detail: elective.description,
            path: `/admin/elective-mappings?electiveId=${encodeURIComponent(elective.id)}`,
          })),
          ...(specializations as Specialization[]).map((item) => ({
            id: item.id,
            label: item.name,
            type: "Specialization",
            detail: item.career?.name ?? "Career specialization",
            path: `/admin/specializations?id=${encodeURIComponent(item.id)}`,
          })),
          ...(mappings as ElectiveMapping[]).map((mapping) => ({
            id: mapping.id,
            label: `${mapping.elective?.name ?? "Elective"} → ${mapping.skill?.name ?? "Skill"}`,
            type: "Elective Mapping",
            detail: `+${mapping.boost_percentage}% boost`,
            path: `/admin/elective-mappings?id=${encodeURIComponent(mapping.id)}`,
          })),
        ]);
      } catch (error) {
        console.error("Unable to load admin search records:", error);
      }
    };
    void loadSearchRecords();
    void loadNotifications();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setStudentSearchRecords([]);
      setSearchLoading(false);
      return undefined;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setSearchLoading(true);
      void listStudentProfiles({ search: query, page: 1, pageSize: 8 })
        .then((result) => {
          if (!active) return;
          setStudentSearchRecords(
            result.data.map((student) => ({
              id: student.id,
              label:
                [student.first_name, student.last_name]
                  .filter(Boolean)
                  .join(" ") ||
                student.username ||
                student.email ||
                "Unnamed student",
              type: "Student",
              detail: student.student_id || student.email || "Student record",
              path: `/admin/students?studentId=${encodeURIComponent(student.id)}`,
            })),
          );
        })
        .catch((error) => {
          if (active) console.error("Unable to search student records:", error);
        })
        .finally(() => {
          if (active) setSearchLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredSearchRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const referenceRecords = searchRecords.filter((record) =>
      (record.label + " " + record.type + " " + record.detail)
        .toLowerCase()
        .includes(query),
    );
    return [...studentSearchRecords, ...referenceRecords]
      .filter(
        (record, index, all) =>
          all.findIndex(
            (candidate) =>
              candidate.type + candidate.id === record.type + record.id,
          ) === index,
      )
      .slice(0, 8);
  }, [searchQuery, searchRecords, studentSearchRecords]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/", { replace: true });
    }
  };

  const handleSearchResult = (path: string) => {
    setSearchQuery("");
    navigate(path);
  };
  const handleNotificationToggle = () => {
    const nextValue = !notificationOpen;
    setNotificationOpen(nextValue);
    if (nextValue) void loadNotifications();
  };
  const toggleSidebar = () => {
    if (isWideSidebarLayout()) {
      setDesktopSidebarCollapsed((current) => !current);
    } else {
      setMenuOpen((current) => !current);
    }
  };
  const sidebarClassName = menuOpen
    ? "translate-x-0"
    : desktopSidebarCollapsed
      ? "-translate-x-full"
      : "-translate-x-full xl:translate-x-0";

  return (
    <div className="admin-theme flex min-h-screen bg-[#f1f5f9] text-slate-800">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 xl:hidden"
        />
      )}

      <aside
        id="admin-navigation"
        className={`${sidebarClassName} fixed left-0 top-0 z-50 flex h-screen h-[100dvh] min-h-screen w-[min(300px,calc(100vw-1rem))] max-w-full flex-col overflow-x-hidden overflow-y-auto border-r border-slate-700 bg-gradient-to-b from-[#0f1b33] to-[#17243d] px-4 py-8 pb-24 text-white transition-transform duration-200 sm:px-5`}
        aria-label="Administrator navigation"
      >
        <div className="relative mb-10 min-w-0 pr-10">
          <NavLink
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className={`flex min-w-0 items-center gap-2 ${focusClass}`}
          >
            <img
              src={logo}
              alt="Career Compass Logo"
              className="h-12 w-12 shrink-0 object-contain"
            />
            <div className="min-w-0 leading-tight">
              <h1 className="whitespace-nowrap text-xl font-extrabold text-white">
                Career Compass
              </h1>
              <p className="mt-1 text-sm text-slate-300">Admin Portal</p>
            </div>
          </NavLink>
          {menuOpen && (
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className={`absolute right-0 top-0 z-10 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white xl:hidden ${focusClass}`}
              aria-label="Close admin menu"
            >
              <X size={22} aria-hidden="true" />
            </button>
          )}
        </div>

        <nav className="space-y-3">
          {navItems.map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/admin"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-5 py-4 font-semibold transition ${focusClass} ${isActive ? "bg-[#334155] text-white shadow-md" : "text-slate-200 hover:bg-white/10"}`
              }
            >
              <Icon size={20} aria-hidden="true" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-16 border-t border-slate-600/70 pt-4">
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className={`flex w-full shrink-0 items-center gap-3 rounded-xl px-5 py-4 font-semibold text-slate-200 hover:bg-white/10 hover:text-white disabled:opacity-60 ${focusClass}`}
          >
            <LogOut size={20} aria-hidden="true" />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      <div
        className={`w-full min-w-0 flex-1 transition-[margin] duration-200 ${desktopSidebarCollapsed ? "xl:ml-0" : "xl:ml-[300px]"}`}
      >
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-slate-700 bg-[#0f1b33] px-3 text-white shadow-sm sm:min-h-20 sm:gap-4 sm:px-5 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className={`shrink-0 rounded-lg p-1 text-white hover:bg-white/10 ${focusClass}`}
              aria-label="Toggle admin menu"
              aria-expanded={
                !desktopSidebarCollapsed && (menuOpen || isWideSidebarLayout())
              }
              aria-controls="admin-navigation"
            >
              <Menu size={28} />
            </button>
            <div className="relative min-w-0 w-[clamp(7rem,42vw,16rem)] lg:w-[360px]">
              <label htmlFor="admin-global-search" className="sr-only">
                Search admin records
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-600 bg-[#1e2a42] px-4 py-3">
                <Search
                  size={18}
                  className="shrink-0 text-slate-300"
                  aria-hidden="true"
                />
                <input
                  id="admin-global-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search admin records..."
                  className={`w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400 ${focusClass}`}
                />
              </div>
              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {searchLoading && filteredSearchRecords.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">
                      Searching Supabase records...
                    </p>
                  ) : filteredSearchRecords.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">
                      No admin records found.
                    </p>
                  ) : (
                    filteredSearchRecords.map((record) => (
                      <button
                        type="button"
                        key={record.type + "-" + record.id}
                        onClick={() => handleSearchResult(record.path)}
                        className={`w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-[#f4fbfa] ${focusClass}`}
                      >
                        <span className="block text-sm font-bold text-slate-800">
                          {record.label}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {record.type} · {record.detail}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3 lg:gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`relative rounded-xl p-2 text-white hover:bg-white/10 ${focusClass}`}
                aria-label="Open admin notifications"
                aria-expanded={notificationOpen}
                aria-controls="admin-notifications"
              >
                <Bell size={24} aria-hidden="true" />
                {updates.length > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white"
                    aria-label={`${updates.length} recent updates`}
                  >
                    {updates.length > 9 ? "9+" : updates.length}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <div
                  id="admin-notifications"
                  className="absolute right-0 top-10 z-50 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="font-extrabold">Recent Updates</h2>
                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      className={`text-slate-400 hover:text-slate-700 ${focusClass}`}
                      aria-label="Close notifications"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {updates.length === 0 ? (
                    <p className="p-5 text-sm text-slate-500">
                      No audit updates yet.
                    </p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {updates.map((update) => {
                        const actorName =
                          [
                            update.actor?.first_name,
                            update.actor?.middle_name,
                            update.actor?.last_name,
                          ]
                            .filter(Boolean)
                            .join(" ") ||
                          update.actor?.email ||
                          "System administrator";
                        return (
                          <div
                            key={update.id}
                            className="border-b border-slate-100 px-5 py-4 last:border-b-0"
                          >
                            <p className="text-sm font-bold">
                              {formatEntityName(update.action)} on{" "}
                              {formatEntityName(update.entity_table)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Created by {actorName}
                            </p>
                            <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                              <Clock3 size={13} aria-hidden="true" />
                              {new Date(update.created_at).toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#334155] font-bold text-white sm:h-12 sm:w-12">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-white">{name}</p>
                <p className="text-sm text-slate-300">Administrator account</p>
              </div>
            </div>
          </div>
        </header>
        <main className="min-w-0 p-4 sm:p-5 lg:p-10">
          {!online && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900"
            >
              <WifiOff className="mt-0.5 shrink-0" size={18} />
              <p>
                You are offline. Existing page content remains visible, but
                Supabase records cannot refresh until you reconnect.
              </p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}