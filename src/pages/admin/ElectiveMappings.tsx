import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { ListChecks, Plus, Pencil, Save, X } from "lucide-react";

type Skill = {
  id: number;
  name: string;
  category: string;
  weight: string;
};

export default function SkillRequirements() {
  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: "Programming", category: "Technical Core", weight: "0.40" },
    { id: 2, name: "Web Development", category: "Technical Core", weight: "0.30" },
    { id: 3, name: "Database Management", category: "Data Systems", weight: "0.20" },
    { id: 4, name: "Version Control", category: "Collaboration", weight: "0.05" },
    { id: 5, name: "Deployment", category: "Infrastructure", weight: "0.05" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    weight: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      weight: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      name: "",
      category: "",
      weight: "",
    });
  };

  const handleEdit = (skill: Skill) => {
    setShowForm(true);
    setEditingId(skill.id);
    setFormData({
      name: skill.name,
      category: skill.category,
      weight: skill.weight,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.category.trim() || !formData.weight.trim()) {
      alert("Please complete all fields.");
      return;
    }

    if (editingId) {
      setSkills((prev) =>
        prev.map((skill) =>
          skill.id === editingId
            ? {
                ...skill,
                name: formData.name,
                category: formData.category,
                weight: formData.weight,
              }
            : skill
        )
      );
    } else {
      setSkills((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: formData.name,
          category: formData.category,
          weight: formData.weight,
        },
      ]);
    }

    resetForm();
  };

  return (
    <AdminLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Skill Requirements
        </p>
        <h1 className="text-4xl font-extrabold mt-2">Manage Skill Weights</h1>
        <p className="text-slate-600 mt-3">
          Add, edit, and update skill categories and default matching weights.
        </p>
      </section>

      <section className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <ListChecks className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Skill List</h2>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white px-5 py-3 rounded-xl font-bold"
          >
            <Plus size={18} />
            Add New Skill
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-[#f8fcfb] border border-teal-100 rounded-2xl p-6">
            <h3 className="text-xl font-extrabold mb-5">
              {editingId ? "Edit Skill" : "Add New Skill"}
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Skill Name"
                className="p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
              />

              <input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Category"
                className="p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
              />

              <input
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="Default Weight e.g. 0.30"
                className="p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 bg-[#55b497] text-white px-5 py-3 rounded-xl font-bold"
              >
                <Save size={18} />
                Save
              </button>

              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#eaf8f5]">
                <th className="p-4 rounded-l-xl">Skill Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Default Weight</th>
                <th className="p-4 rounded-r-xl">Action</th>
              </tr>
            </thead>

            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b border-slate-100">
                  <td className="p-4 font-bold">{skill.name}</td>
                  <td className="p-4">{skill.category}</td>
                  <td className="p-4">{skill.weight}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="inline-flex items-center gap-2 bg-[#eaf8f5] text-[#16806d] px-4 py-2 rounded-xl font-bold"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}