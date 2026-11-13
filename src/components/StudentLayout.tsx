import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  Briefcase,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Search,
  TrendingUp,
  User,
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
  UserNotification,
} from "../lib/types";
import {
  listCareers,
  listElectiveMappings,
  listElectives,
  listNotifications,
  listSkills,
  listSpecializations,
  markNotificationRead,
} from "../services/repository";

const isWideSidebarLayout = () =>
  window.matchMedia("(min-width: 1280px)").matches;

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Skill Gap Analysis", path: "/skill-gap", icon: TrendingUp },
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
  { label: "Profile", path: "/profile", icon: User },
] as const;

type SearchRecord = {
  id: string;
  label: string;
  type: string;
  detail: string;
  path: string;
};

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { profile, session, signOut } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRecords, setSearchRecords] = useState<SearchRecord[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);

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

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.username ||
    "Student";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const unreadCount = notifications.filter((item) => !item.read_at).length;

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
          ...(careers as Career[]).map((item) => ({
            id: item.id,
            label: item.name,
            type: "Career path",
            detail: item.category,
            path: `/career-recommendations?careerId=${encodeURIComponent(item.id)}`,
          })),
          ...(skills as Skill[]).map((item) => ({
            id: item.id,
            label: item.name,
            type: "Skill",
            detail: item.category,
            path: `/skill-gap?skillId=${encodeURIComponent(item.id)}`,
          })),
          ...(electives as Elective[]).map((item) => ({
            id: item.id,
            label: item.name,
            type: "Elective",
            detail: item.description,
            path: `/elective-recommendations?electiveId=${encodeURIComponent(item.id)}`,
          })),
          ...(specializations as Specialization[]).map((item) => ({
            id: item.id,
            label: item.name,
            type: "Specialization",
            detail: item.career?.name ?? "Career specialization",
            path: `/career-recommendations?specializationId=${encodeURIComponent(item.id)}`,
          })),
          ...(mappings as ElectiveMapping[]).map((item) => ({
            id: item.id,
            label: item.elective?.name ?? "Elective mapping",
            type: "Elective mapping",
            detail: `${item.skill?.name ?? "Skill"} +${item.boost_percentage}%`,
            path: `/elective-recommendations?mappingId=${encodeURIComponent(item.id)}`,
          })),
        ]);
      } catch (error) {
        console.error("Unable to load student search data:", error);
      }
    };

    void loadSearchRecords();

    return () => {
      mounted = false;
    };
  }, []);

  const loadStudentNotifications = async () => {
    if (!session?.user.id) return;

    setLoadingNotifications(true);

    try {
      const data = await listNotifications(session.user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Unable to load student notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    void loadStudentNotifications();
  }, [session?.user.id]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    return searchRecords
      .filter((record) =>
        `${record.label} ${record.type} ${record.detail}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8);
  }, [searchQuery, searchRecords]);

  const toggleSidebar = () => {
    if (isWideSidebarLayout()) {
      setDesktopSidebarCollapsed((current) => !current);
    } else {
      setMobileMenuOpen((current) => !current);
    }
  };

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

  const handleNotificationClick = async (notification: UserNotification) => {
    if (!notification.read_at && session?.user.id) {
      try {
        await markNotificationRead(session.user.id, notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item,
          ),
        );
      } catch (error) {
        console.error("Unable to mark notification as read:", error);
      }
    }
  };

  const sidebarClassName = mobileMenuOpen
    ? "translate-x-0"
    : desktopSidebarCollapsed
      ? "-translate-x-full"
      : "-translate-x-full xl:translate-x-0";

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-slate-800 flex">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 xl:hidden"
        />
      )}

      <aside
        id="student-navigation"
        className={`fixed left-0 top-0 z-50 flex h-screen h-[100dvh] min-h-screen w-[min(300px,calc(100vw-1rem))] max-w-full flex-col overflow-x-hidden overflow-y-auto border-r border-teal-100 bg-gradient-to-b from-[#dff6f2] to-[#eefaf8] px-4 py-8 pb-24 sm:px-5 transition-transform duration-200 ${sidebarClassName}`}
      >
        <div className="relative mb-10 flex min-w-0 items-center gap-2 pr-10">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex min-w-0 items-center gap-2"
          >
            <img
              src={logo}
              alt="Career Compass Logo"
              className="h-12 w-12 shrink-0 object-contain"
            />

            <div className="leading-tight">
              <h1 className="whitespace-nowrap text-xl font-extrabold text-[#16806d]">
                Career Compass
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Navigate your future
              </p>
            </div>
          </NavLink>

          {mobileMenuOpen && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-0 top-0 z-10 rounded-lg p-2 text-slate-600 hover:bg-white/70 hover:text-slate-900 xl:hidden"
              aria-label="Close sidebar"
            >
              <X size={22} />
            </button>
          )}
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-5 py-4 font-semibold transition ${
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

        <div className="mt-auto border-t border-teal-200/70 pt-4">
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="flex w-full shrink-0 items-center gap-3 rounded-xl px-5 py-4 font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            <LogOut size={20} />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      <div
        className={`min-w-0 flex-1 transition-[margin] duration-200 ${
          desktopSidebarCollapsed ? "xl:ml-0" : "xl:ml-[300px]"
        }`}
      >
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-slate-100 bg-white/90 px-3 backdrop-blur sm:min-h-20 sm:gap-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:gap-5">
            <button
              type="button"
              onClick={toggleSidebar}
              className="shrink-0 text-[#16806d]"
              aria-label="Toggle student menu"
              aria-expanded={
                !desktopSidebarCollapsed &&
                (mobileMenuOpen || isWideSidebarLayout())
              }
              aria-controls="student-navigation"
            >
              <Menu className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>

            <div className="relative min-w-0 w-[clamp(7rem,42vw,16rem)] lg:w-[360px]">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f4fbfa] px-3 py-2.5 sm:px-5 sm:py-3">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  id="student-global-search"
                  aria-label="Search Career Compass records"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search anything..."
                  className="w-full min-w-0 bg-transparent text-sm outline-none"
                />
              </div>

              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-teal-100 bg-white p-2 shadow-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        onClick={() => handleSearchResult(result.path)}
                        className="w-full rounded-xl px-3 py-3 text-left hover:bg-[#eaf8f5]"
                      >
                        <p className="font-bold text-slate-800">
                          {result.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {result.type} · {result.detail || "Career Compass"}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-4 text-sm text-slate-500">
                      No matching Career Compass records found.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3 lg:gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const nextValue = !notificationOpen;
                  setNotificationOpen(nextValue);
                  if (nextValue) void loadStudentNotifications();
                }}
                className="relative rounded-xl p-2 text-slate-700 hover:bg-[#eaf8f5]"
                aria-label="Open notifications"
                aria-expanded={notificationOpen}
                aria-controls="student-notifications"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  id="student-notifications"
                  className="absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-teal-100 bg-white p-3 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-3">
                    <h2 className="font-extrabold">Notifications</h2>
                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      className="text-slate-400 hover:text-slate-700"
                      aria-label="Close notifications"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto pt-2">
                    {loadingNotifications ? (
                      <p className="px-2 py-5 text-sm text-slate-500">
                        Loading notifications...
                      </p>
                    ) : notifications.length === 0 ? (
                      <p className="px-2 py-5 text-sm text-slate-500">
                        You have no notifications yet.
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            void handleNotificationClick(notification)
                          }
                          className={`w-full rounded-xl px-3 py-3 text-left hover:bg-[#eaf8f5] ${
                            notification.read_at ? "" : "bg-[#f4fbfa]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-bold text-slate-800">
                              {notification.title}
                            </p>
                            {!notification.read_at && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#16806d]" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {notification.body}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {formatNotificationDate(notification.created_at)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f8f78] text-sm font-bold text-white sm:h-12 sm:w-12 sm:text-base">
                {initials}
              </div>

              <div className="hidden sm:block">
                <p className="font-bold">{displayName}</p>
                <p className="text-sm text-slate-500">Student account</p>
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
                You are offline. Saved pages remain available, but live data and
                AI features will work after reconnecting.
              </p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}