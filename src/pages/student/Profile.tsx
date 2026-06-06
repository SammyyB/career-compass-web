import { useRef, useState } from "react";
import StudentLayout from "../../components/StudentLayout";
import {
  User,
  GraduationCap,
  Code2,
  Trophy,
  Target,
  Save,
  Camera,
} from "lucide-react";

const interestsList = [
  "Web Development",
  "Networking",
  "Data Analytics",
  "Cloud Computing",
  "Cybersecurity",
  "UI/UX Design",
];

const technologiesList = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Firebase",
  "Python",
  "SQL",
];

export default function Profile() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("Juan Dela Cruz");
  const [academicYear, setAcademicYear] = useState("1st Year");
  const [experience, setExperience] = useState("Entry");
  const [careerTarget, setCareerTarget] = useState("Web Developer");

  const [interests, setInterests] = useState(["Web Development", "Networking"]);
  const [technologies, setTechnologies] = useState(["HTML", "JavaScript"]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file only.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  const toggleItem = (
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

  const saveProfile = () => {
    alert("Profile saved successfully!");
  };

  return (
    <StudentLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Edit Profile
        </p>

        <h1 className="text-4xl font-extrabold mt-2">
          Student Profile Settings
        </h1>

        <p className="text-slate-600 mt-3">
          Update your academic details, target career, skills, and achievements.
        </p>
      </section>

      <section className="grid xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="w-40 h-40 rounded-full bg-[#eaf8f5] mx-auto flex items-center justify-center relative overflow-hidden border border-teal-100">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={72} className="text-[#16806d]" />
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-[#55b497] text-white p-3 rounded-full shadow hover:bg-[#459b83]"
            >
              <Camera size={18} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="mt-8">
            <label className="text-sm font-bold text-slate-700">
              Full Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
              placeholder="Enter full name"
            />
          </div>

          <button
            onClick={saveProfile}
            className="mt-6 w-full bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Profile
          </button>
        </div>

        <div className="xl:col-span-2 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <GraduationCap className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">
                Personal Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Experience Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                >
                  <option>Entry</option>
                  <option>Junior</option>
                  <option>Senior</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <Target className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">Career Target</h2>
            </div>

            <label className="text-sm font-semibold">Current Career</label>
            <select
              value={careerTarget}
              onChange={(e) => setCareerTarget(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
            >
              <option>Web Developer</option>
              <option>Data Analyst</option>
              <option>Cloud Engineer</option>
              <option>Cybersecurity Analyst</option>
            </select>

            <div className="mt-5 bg-[#eaf8f5] p-4 rounded-2xl">
              <p className="text-sm text-slate-500">Selected Track</p>
              <p className="text-xl font-bold text-[#16806d]">
                {careerTarget}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <Code2 className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">
                Interests & Technologies
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Interests
                </label>

                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {interestsList.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        interests.includes(item)
                          ? "bg-[#eaf8f5] border-[#55b497] text-[#16806d]"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={interests.includes(item)}
                        onChange={() =>
                          toggleItem(item, interests, setInterests)
                        }
                        className="accent-[#55b497]"
                      />
                      <span className="text-sm font-semibold">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Technologies
                </label>

                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {technologiesList.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        technologies.includes(item)
                          ? "bg-[#eaf8f5] border-[#55b497] text-[#16806d]"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={technologies.includes(item)}
                        onChange={() =>
                          toggleItem(item, technologies, setTechnologies)
                        }
                        className="accent-[#55b497]"
                      />
                      <span className="text-sm font-semibold">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <GraduationCap className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">Academic Records</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Cloud Computing",
                "Cybersecurity",
                "Data Science",
                "Database Management",
                "Networking",
                "Programming",
                "Web Development",
              ].map((subject) => (
                <div key={subject}>
                  <label className="text-sm font-semibold">{subject}</label>
                  <select className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]">
                    <option>95-100</option>
                    <option>85-89</option>
                    <option>80-84</option>
                    <option>75-79</option>
                    <option>Below 75</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <Trophy className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">
                Progress & Achievements
              </h2>
            </div>

            <textarea
              rows={5}
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
              defaultValue={`Completed DevOps Fundamentals
Portfolio: Personal Portfolio Website
Project: REST API Integration Project`}
            />
          </div>
        </div>
      </section>
    </StudentLayout>
  );
}