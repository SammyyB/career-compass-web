import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Code2,
  GraduationCap,
  Mail,
  Save,
  Target,
  Upload,
  User,
} from "lucide-react";

import StudentLayout from "../../components/StudentLayout";
import SearchableMultiSelect from "../../components/SearchableMultiSelect";
import {
  isStudentProfileComplete,
  PROFILE_SETUP_PENDING_KEY,
  useAuth,
} from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Career } from "../../lib/types";
import { listCareers, saveProfile } from "../../services/repository";

const interestsList = [
  "Web Development",
  "Networking",
  "Data Analytics",
  "Cloud Computing",
  "Cybersecurity",
  "UI/UX Design",
  "Mobile Development",
];

const technologiesList = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Supabase",
  "Python",
  "MySQL",
  "Git",
];

const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

type ProfileForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  studentId: string;
  academicYear: string;
  program: string;
  careerTarget: string;
};

const emptyForm: ProfileForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  studentId: "",
  academicYear: "",
  program: "",
  careerTarget: "",
};

function validateProfileImage(file: File) {
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    return "Profile pictures must be PNG or JPG/JPEG files.";
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    return "The profile picture must be 2 MB or smaller.";
  }

  return "";
}

export default function Profile() {
  const { profile, session, refreshProfile, requestEmailChange } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setupMode = searchParams.get("setup") === "1";
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const setupSavedRef = useRef(false);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [interests, setInterests] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  useEffect(() => {
    if (
      setupMode &&
      !setupSavedRef.current &&
      isStudentProfileComplete(profile)
    ) {
      if (
        profile?.id &&
        window.localStorage.getItem(PROFILE_SETUP_PENDING_KEY) === profile.id
      ) {
        window.localStorage.removeItem(PROFILE_SETUP_PENDING_KEY);
      }
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, profile, setupMode]);

  useEffect(() => {
    if (!profile) return;

    setForm({
      firstName: profile.first_name ?? "",
      middleName: profile.middle_name ?? "",
      lastName: profile.last_name ?? "",
      studentId: profile.student_id ?? "",
      academicYear: profile.academic_year ?? "",
      program: profile.program ?? "",
      careerTarget: profile.career_target ?? "",
    });
    setInterests(profile.interests ?? []);
    setTechnologies(profile.technologies ?? []);
  }, [profile]);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    let mounted = true;

    const loadProfileImage = async () => {
      if (!profile?.profile_image_path) {
        setProfileImagePreview("");
        return;
      }

      const { data, error: signedUrlError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(profile.profile_image_path, 60 * 60);

      if (signedUrlError) {
        console.error(
          "Unable to load profile picture:",
          signedUrlError.message,
        );
        return;
      }

      if (mounted) {
        setProfileImagePreview(data.signedUrl);
      }
    };

    void loadProfileImage();

    return () => {
      mounted = false;
    };
  }, [profile?.profile_image_path]);

  useEffect(() => {
    return () => {
      if (profileImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  useEffect(() => {
    const loadCareers = async () => {
      try {
        setCareers(await listCareers());
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load career paths.",
        );
      }
    };

    void loadCareers();
  }, []);

  const update = (key: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  };

  const handleEmailChange = async () => {
    setError("");
    setMessage("");
    setEmailBusy(true);

    try {
      await requestEmailChange(newEmail);
      setMessage(
        "Check your new email address for a confirmation link. If secure email change is enabled, confirm from both the old and new addresses.",
      );
      setNewEmail("");
    } catch (emailError) {
      setError(
        emailError instanceof Error
          ? emailError.message
          : "Unable to request an email change.",
      );
    } finally {
      setEmailBusy(false);
    }
  };

  const handleImageSelected = (file: File | null) => {
    if (!file) return;

    const fileError = validateProfileImage(file);

    if (fileError) {
      setProfileImageFile(null);
      setError(fileError);
      return;
    }

    setError("");
    setMessage("");
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const uploadProfileImage = async () => {
    if (!profile || !profileImageFile) {
      setError("Choose a PNG or JPG profile picture first.");
      return;
    }

    const fileError = validateProfileImage(profileImageFile);
    if (fileError) {
      setError(fileError);
      return;
    }

    setImageBusy(true);
    setError("");
    setMessage("");

    try {
      const extension = profileImageFile.type === "image/png" ? "png" : "jpg";
      const path = `${profile.id}/profile-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, profileImageFile, {
          upsert: false,
          contentType: profileImageFile.type,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      await saveProfile(profile.id, {
        profile_image_path: path,
      });

      const { data: signedImage, error: signedUrlError } =
        await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);

      if (signedUrlError) throw signedUrlError;

      setProfileImagePreview(signedImage.signedUrl);
      setProfileImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      await refreshProfile();
      setMessage("Profile picture uploaded successfully.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload the profile picture.",
      );
    } finally {
      setImageBusy(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    if (setupMode) {
      const missingFields = [
        !form.firstName.trim() && "First name",
        !form.lastName.trim() && "Last name",
        !form.program.trim() && "Program",
        !form.careerTarget.trim() && "Career target",
        interests.length === 0 && "At least one interest",
        technologies.length === 0 && "At least one technology",
      ].filter(Boolean);

      if (missingFields.length > 0) {
        setError(
          `Complete these required fields: ${missingFields.join(", ")}.`,
        );
        return;
      }
    }

    const normalizedStudentId = form.studentId.trim().toUpperCase();

    if (!/^[A-Z0-9-]{4,20}$/.test(normalizedStudentId)) {
      setError(
        "Student ID must contain 4–20 letters, numbers, or hyphens. Example: 2024-00123.",
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await saveProfile(profile.id, {
        first_name: form.firstName.trim(),
        middle_name: form.middleName.trim(),
        last_name: form.lastName.trim(),
        student_id: normalizedStudentId,
        academic_year: form.academicYear,
        program: form.program.trim(),
        career_target: form.careerTarget || null,
        interests,
        technologies,
      });
      await refreshProfile();
      setMessage("Profile updated successfully.");
      if (setupMode) {
        setupSavedRef.current = true;
        window.localStorage.removeItem(PROFILE_SETUP_PENDING_KEY);
        window.setTimeout(() => navigate("/dashboard", { replace: true }), 900);
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          {setupMode ? "Welcome to Career Compass" : "Edit Profile"}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          {setupMode ? "Complete Your Profile" : "Student Profile Settings"}
        </h1>
        <p className="mt-3 text-slate-600">
          {setupMode
            ? "Add your student details and career interests to finish setting up your account."
            : "Keep your academic details, goals, interests, technologies, and profile picture current."}
        </p>
      </section>

      {setupMode && (
        <section
          className="mb-6 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm sm:p-6"
          role="status"
        >
          <h2 className="font-extrabold text-[#16806d]">
            A few details are needed
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Complete your first and last name, Student ID, program, career
            target, at least one interest, and at least one technology. Your
            dashboard will open after you save a complete profile.
          </p>
        </section>
      )}

      {error && (
        <p className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-5 z-[100] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-green-200 bg-white px-5 py-4 text-sm font-bold text-green-700 shadow-xl"
        >
          {message}
        </div>
      )}

      <section className="grid min-w-0 items-start gap-6 xl:grid-cols-3">
        <div className="min-w-0 rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-teal-100 bg-[#eaf8f5]">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Student profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={72} className="text-[#16806d]" />
            )}
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,.png,.jpg,.jpeg"
            capture="user"
            onChange={(event) =>
              handleImageSelected(event.target.files?.[0] ?? null)
            }
            className="hidden"
          />

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="mt-6 w-full rounded-xl border border-teal-200 px-4 py-3 font-bold text-[#16806d] hover:bg-[#eaf8f5]"
          >
            Choose Profile Picture
          </button>

          <button
            type="button"
            onClick={() => void uploadProfileImage()}
            disabled={!profileImageFile || imageBusy}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#55b497] py-3 font-bold text-white disabled:opacity-50"
          >
            <Upload size={18} />
            {imageBusy ? "Uploading..." : "Upload Picture"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            PNG or JPG/JPEG only · Maximum 2 MB · Square image recommended
          </p>

          <p className="mt-8 text-sm text-slate-500">Student ID</p>
          <p className="font-bold">{profile?.student_id ?? "Not set"}</p>

          <p className="mt-5 text-sm text-slate-500">Email</p>
          <p className="break-all font-bold">
            {session?.user.email ?? profile?.email ?? "Not set"}
          </p>

          <div className="mt-4 rounded-2xl bg-[#f4fbfa] p-4">
            <label htmlFor="new-account-email" className="text-sm font-bold">
              Change account email
            </label>
            <input
              id="new-account-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="New email address"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-[#55b497]"
            />
            <button
              type="button"
              onClick={() => void handleEmailChange()}
              disabled={emailBusy || !newEmail.trim()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 px-4 py-3 font-bold text-[#16806d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mail size={17} />
              {emailBusy
                ? "Sending confirmation..."
                : "Send email change confirmation"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] py-3 font-bold text-white disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:contents">
          <div className="min-w-0 rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <User className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                First Name
                <input
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"
                />
              </label>
              <label className="block text-sm font-semibold">
                Middle Name
                <input
                  value={form.middleName}
                  onChange={(event) => update("middleName", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"
                />
              </label>
              <label className="block text-sm font-semibold">
                Surname
                <input
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"
                />
              </label>
              <label className="block text-sm font-semibold">
                Student ID
                <input
                  value={form.studentId}
                  onChange={(event) =>
                    update(
                      "studentId",
                      event.target.value
                        .replace(/[^A-Za-z0-9-]/g, "")
                        .toUpperCase(),
                    )
                  }
                  placeholder="Example: 2024-00123"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"
                />
              </label>
              <label className="block text-sm font-semibold">
                Academic Year
                <select
                  value={form.academicYear}
                  onChange={(event) =>
                    update("academicYear", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"
                >
                  <option value="">Select academic year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Program / Course
                <select
                  value={form.program}
                  onChange={(event) => update("program", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"
                >
                  <option value="">Select program / course</option>
                  <option value="Bachelor of Science in Information Technology">
                    Bachelor of Science in Information Technology
                  </option>
                </select>
              </label>
            </div>
          </div>

          <div className="self-start rounded-3xl border border-teal-100 bg-white p-7 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Target className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">Career Target</h2>
            </div>

            <label className="text-sm font-semibold">
              Current Career Target
              <select
                value={form.careerTarget}
                onChange={(event) => update("careerTarget", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-[#55b497]"
              >
                <option value="">Select a target</option>
                {careers.map((career) => (
                  <option key={career.id} value={career.name}>
                    {career.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 rounded-2xl bg-[#eaf8f5] p-4">
              <p className="text-sm text-slate-500">Selected Track</p>
              <p className="text-xl font-bold text-[#16806d]">
                {form.careerTarget || "Not selected"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-teal-100 bg-white p-7 shadow-sm md:col-span-2 xl:col-span-3">
            <div className="mb-5 flex items-center gap-3">
              <Code2 className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">
                Interests & Technologies
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SearchableMultiSelect
                label="Career Interests"
                options={interestsList}
                values={interests}
                onChange={setInterests}
                max={3}
              />
              <SearchableMultiSelect
                label="Technologies"
                options={technologiesList}
                values={technologies}
                onChange={setTechnologies}
                max={5}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-teal-100 bg-white p-7 shadow-sm md:col-span-2 xl:col-span-3">
            <div className="mb-5 flex items-center gap-3">
              <GraduationCap className="text-[#16806d]" />
              <h2 className="text-xl font-extrabold">Academic Records</h2>
            </div>
            <p className="text-sm text-slate-500">
              Academic records are optional supporting information and are not
              currently used by the AI career tools.
            </p>
          </div>
        </div>
      </section>
    </StudentLayout>
  );
}