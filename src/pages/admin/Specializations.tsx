import { useEffect, useMemo, useState } from "react";
import { Layers, Pencil, Plus, Save, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";
import InlineNotice from "../../components/InlineNotice";
import SearchableMultiSelect from "../../components/SearchableMultiSelect";
import TablePagination from "../../components/TablePagination";
import { useAuth } from "../../context/AuthContext";
import type { Career, Elective, Skill, Specialization } from "../../lib/types";
import {
  listCareers,
  listElectives,
  listSkills,
  listSpecializations,
  saveSpecialization,
} from "../../services/repository";

const pageSize = 8;
const focusClass =
  "focus:outline-none focus:ring-2 focus:ring-[#55b497] focus:ring-offset-1";

export default function Specializations() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [electives, setElectives] = useState<Elective[]>([]);
  const [items, setItems] = useState<Specialization[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    careerId: "",
    requiredSkills: [] as string[],
    recommendedElectives: [] as string[],
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [careerData, skillData, electiveData, specializationData] =
        await Promise.all([
          listCareers(),
          listSkills(),
          listElectives(),
          listSpecializations(),
        ]);
      setCareers(careerData);
      setSkills(skillData);
      setElectives(electiveData);
      setItems(specializationData);
      const target = searchParams.get("id")
        ? specializationData.find((item) => item.id === searchParams.get("id"))
        : undefined;
      if (target) openEditForm(target);
      setForm((current) => ({
        ...current,
        careerId: current.careerId || careerData[0]?.id || "",
      }));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load specializations.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) =>
      `${item.name} ${item.career?.name ?? ""} ${item.required_skills.join(" ")} ${item.recommended_electives.join(" ")}`
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  function resetForm() {
    setEditing(null);
    setShowForm(false);
    setForm({
      name: "",
      careerId: careers[0]?.id ?? "",
      requiredSkills: [],
      recommendedElectives: [],
    });
  }
  function openAddForm() {
    setError("");
    setEditing(null);
    setShowForm(true);
    setForm({
      name: "",
      careerId: careers[0]?.id ?? "",
      requiredSkills: [],
      recommendedElectives: [],
    });
  }
  function openEditForm(item: Specialization) {
    setEditing(item.id);
    setShowForm(true);
    setForm({
      name: item.name,
      careerId: item.career_id,
      requiredSkills: item.required_skills,
      recommendedElectives: item.recommended_electives,
    });
  }

  const save = async () => {
    if (!profile) return;
    if (!form.name.trim() || !form.careerId) {
      setError("Specialization name and career are required.");
      return;
    }
    if (form.requiredSkills.length === 0) {
      setError("Select at least one required skill.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveSpecialization(profile.id, editing, {
        name: form.name.trim(),
        career_id: form.careerId,
        required_skills: form.requiredSkills,
        recommended_electives: form.recommendedElectives,
      });
      resetForm();
      setNotice(
        editing ? "Specialization updated." : "Specialization created.",
      );
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save specialization.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Specializations
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Manage Career Specializations
        </h1>
        <p className="mt-3 text-slate-600">
          Connect specializations to careers using searchable skill and elective
          selections.
        </p>
      </section>
      <section className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="text-[#16806d]" />
            <div>
              <h2 className="text-2xl font-extrabold">Specialization Table</h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep career paths, required skills, and electives linked to the
                same Supabase records.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="sr-only" htmlFor="specialization-search">
              Search specializations
            </label>
            <input
              id="specialization-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search specializations..."
              className={`rounded-xl border border-slate-200 p-3 ${focusClass}`}
            />
            <button
              type="button"
              onClick={openAddForm}
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] px-5 py-3 font-bold text-white ${focusClass}`}
            >
              <Plus size={18} />
              Add Specialization
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
                {editing ? "Edit Specialization" : "Add Specialization"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className={`text-slate-400 hover:text-slate-700 ${focusClass}`}
                aria-label="Close specialization form"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold">
                Specialization Name
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                  placeholder="Frontend Developer"
                />
              </label>
              <label className="text-sm font-bold">
                Career Path
                <select
                  value={form.careerId}
                  onChange={(event) =>
                    setForm({ ...form, careerId: event.target.value })
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                >
                  <option value="">Select a career</option>
                  {careers.map((career) => (
                    <option key={career.id} value={career.id}>
                      {career.name}
                    </option>
                  ))}
                </select>
              </label>
              <SearchableMultiSelect
                label="Required Skills"
                options={skills.map((skill) => skill.name)}
                values={form.requiredSkills}
                onChange={(values) =>
                  setForm({ ...form, requiredSkills: values })
                }
                max={Math.max(skills.length, 1)}
              />
              <SearchableMultiSelect
                label="Recommended Electives"
                options={electives.map((elective) => elective.name)}
                values={form.recommendedElectives}
                onChange={(values) =>
                  setForm({ ...form, recommendedElectives: values })
                }
                max={Math.max(electives.length, 1)}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className={`inline-flex items-center gap-2 rounded-xl bg-[#55b497] px-6 py-3 font-bold text-white disabled:opacity-60 ${focusClass}`}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Specialization"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-700 ${focusClass}`}
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Career specializations</caption>
            <thead>
              <tr className="bg-[#eaf8f5]">
                <th className="p-4">Specialization</th>
                <th className="p-4">Career</th>
                <th className="p-4">Required Skills</th>
                <th className="p-4">Recommended Electives</th>
                <th className="p-4">Record Info</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading specializations...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No specializations match the current search.
                  </td>
                </tr>
              ) : (
                visible.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="p-4 font-bold">{item.name}</td>
                    <td className="p-4">{item.career?.name ?? "-"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.required_skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-teal-100 bg-[#f8fcfb] px-2 py-1 text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.recommended_electives.map((elective) => (
                          <span
                            key={elective}
                            className="rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-700"
                          >
                            {elective}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <p>Created by administrator</p>
                      <p>
                        Updated:{" "}
                        {new Date(item.updated_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        className={`inline-flex items-center gap-2 rounded-xl bg-[#eaf8f5] px-4 py-2 font-bold text-[#16806d] ${focusClass}`}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <TablePagination
            page={page}
            pageCount={pageCount}
            count={filtered.length}
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
            Retry loading specializations
          </button>
        )}
      </section>
    </AdminLayout>
  );
}