import AdminLayout from "../../components/AdminLayout";
import {
  Users,
  Briefcase,
  GraduationCap,
  ListChecks,
  Activity,
  TrendingUp,
} from "lucide-react";

const summaryCards = [
  { label: "Total Students", value: "128", icon: Users },
  { label: "Career Profiles", value: "6", icon: Briefcase },
  { label: "Electives Available", value: "14", icon: GraduationCap },
  { label: "Skills Tracked", value: "18", icon: ListChecks },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Admin Dashboard
        </p>

        <h1 className="text-4xl font-extrabold mt-2">System Overview</h1>

        <p className="text-slate-600 mt-3">
          Manage career profiles, skill requirements, specializations, and
          elective mappings.
        </p>
      </section>

      <section className="grid xl:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-white rounded-3xl p-7 border border-teal-100 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#eaf8f5] text-[#16806d] flex items-center justify-center mb-5">
                <Icon size={26} />
              </div>

              <p className="text-sm text-slate-500">{card.label}</p>

              <h2 className="text-4xl font-extrabold text-slate-900 mt-2">
                {card.value}
              </h2>
            </div>
          );
        })}
      </section>

      <section className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">System Insights</h2>
          </div>

          <div className="space-y-4">
            <p>
              Most Selected Career: <strong>Web Developer (42%)</strong>
            </p>
            <p>
              Average Career Match Score: <strong>81%</strong>
            </p>
            <p>
              Entry Students: <strong>72</strong>
            </p>
            <p>
              Junior Students: <strong>41</strong>
            </p>
            <p>
              Senior Students: <strong>15</strong>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Activity className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Recent System Updates</h2>
          </div>

          <div className="space-y-4">
            <p>• Adrian Cruz completed DevOps Fundamentals</p>
            <p>• Maria Santos advanced to Junior Web Developer</p>
            <p>• New elective added: Secure API Development</p>
            <p>• Skill threshold updated for Cloud Engineer</p>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}