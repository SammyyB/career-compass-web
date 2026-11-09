import { useEffect, useMemo, useState } from "react";
import { ListChecks, Pencil, Plus, Save, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";
import InlineNotice from "../../components/InlineNotice";
import TablePagination from "../../components/TablePagination";
import { useAuth } from "../../context/AuthContext";
import type { Skill } from "../../lib/types";
import { listSkills, saveSkill } from "../../services/repository";

const pageSize = 10;
const focusClass =
  "focus:outline-none focus:ring-2 focus:ring-[#55b497] focus:ring-offset-1";

export default function SkillRequirements() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", weight: "0.10" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listSkills();
      setSkills(data);
      const targetId = searchParams.get("id");
      const target = targetId
        ? data.find((skill) => skill.id === targetId)
        : undefined;
      if (target) openEditForm(target);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load skills.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase();
    return skills.filter((skill) =>
      `${skill.name} ${skill.category}`.toLowerCase().includes(query),
    );
  }, [search, skills]);
  const pageCount = Math.max(1, Math.ceil(filteredSkills.length / pageSize));
  const visibleSkills = filteredSkills.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  function openAddForm() {
    setEditing(null);
    setForm({ name: "", category: "", weight: "0.10" });
    setShowForm(true);
    setError("");
  }
  function openEditForm(skill: Skill) {
    setEditing(skill.id);
    setForm({
      name: skill.name,
      category: skill.category,
      weight: String(skill.default_weight),
    });
    setShowForm(true);
  }
  function closeForm() {
    setEditing(null);
    setForm({ name: "", category: "", weight: "0.10" });
    setShowForm(false);
  }

  const save = async () => {
    if (!profile) return;
    if (!form.name.trim() || !form.category.trim()) {
      setError("Skill name and category are required.");
      return;
    }
    const weight = Number(form.weight);
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
      setError("Default weight must be a number from 0 to 1.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveSkill(profile.id, editing, {
        name: form.name.trim(),
        category: form.category.trim(),
        default_weight: weight,
      });
      closeForm();
      setNotice(editing ? "Skill updated." : "Skill created.");
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save skill.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Skill Requirements
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Manage Skill Weights</h1>
        <p className="mt-3 text-slate-600">
          Add searchable skills and assign numeric weights used by career
          matching and skill-gap calculations.
        </p>
      </section>
      <section className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ListChecks className="text-[#16806d]" />
            <div>
              <h2 className="text-2xl font-extrabold">Skill Table</h2>
              <p className="mt-1 text-sm text-slate-500">
                Weights are decimals from 0 to 1.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="sr-only" htmlFor="skill-search">
              Search skills
            </label>
            <input
              id="skill-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search skills..."
              className={`rounded-xl border border-slate-200 p-3 ${focusClass}`}
            />
            <button
              type="button"
              onClick={openAddForm}
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] px-5 py-3 font-bold text-white ${focusClass}`}
            >
              <Plus size={18} />
              Add Skill
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-5">
            <InlineNotice
              type="error"
              message={error}
              onDismiss={() => setError("")}
            />
          </div>
        )}
        {notice && (
          <div className="mb-5">
            <InlineNotice
              type="success"
              message={notice}
              onDismiss={() => setNotice("")}
            />
          </div>
        )}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-teal-100 bg-[#f8fcfb] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">
                {editing ? "Edit Skill" : "Add Skill"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className={`text-slate-400 hover:text-slate-700 ${focusClass}`}
                aria-label="Close skill form"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-bold">
                Skill Name
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Example: Programming"
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                />
              </label>
              <label className="text-sm font-bold">
                Category
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  placeholder="Example: Technical Core"
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                />
              </label>
              <label className="text-sm font-bold">
                Default Weight
                <input
                  value={form.weight}
                  onChange={(event) =>
                    setForm({ ...form, weight: event.target.value })
                  }
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="0.10"
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Example: 0.30 means 30% of the matching score.
                </span>
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className={`inline-flex items-center gap-2 rounded-xl bg-[#55b497] px-5 py-3 font-bold text-white disabled:opacity-60 ${focusClass}`}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className={`inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 ${focusClass}`}
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Skill requirements</caption>
            <thead>
              <tr className="bg-[#eaf8f5]">
                <th className="rounded-l-xl p-4">Skill</th>
                <th className="p-4">Category</th>
                <th className="p-4">Default Weight</th>
                <th className="p-4">Record Info</th>
                <th className="rounded-r-xl p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading skills...
                  </td>
                </tr>
              ) : visibleSkills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No skills match the current search.
                  </td>
                </tr>
              ) : (
                visibleSkills.map((skill) => {
                  const creatorName =
                    skill.created_by === profile?.id
                      ? [profile.first_name, profile.last_name]
                          .filter(Boolean)
                          .join(" ") || "You"
                      : "Administrator";
                  return (
                    <tr key={skill.id} className="border-b border-slate-100">
                      <td className="p-4 font-bold">{skill.name}</td>
                      <td className="p-4">{skill.category}</td>
                      <td className="p-4 font-bold text-[#16806d]">
                        {skill.default_weight.toFixed(2)}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        <p>Created by: {creatorName}</p>
                        <p>
                          Updated: {new Date(skill.updated_at).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => openEditForm(skill)}
                          className={`inline-flex items-center gap-2 rounded-xl bg-[#eaf8f5] px-4 py-2 font-bold text-[#16806d] ${focusClass}`}
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredSkills.length > 0 && (
          <TablePagination
            page={page}
            pageCount={pageCount}
            count={filteredSkills.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        )}
        {error && !loading && (
          <button
            type="button"
            onClick={() => void load()}
            className={`mt-4 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white ${focusClass}`}
          >
            Retry loading skills
          </button>
        )}
      </section>
    </AdminLayout>
  );
}