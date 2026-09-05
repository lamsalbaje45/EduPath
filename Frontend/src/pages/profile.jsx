import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  LoadingSpinner,
} from "../components/ui";

/**
 * Profile Page
 * Gated behind ProtectedRoute
 *
 * Features:
 * - Editable studentProfile fields from Backend/models/user.js:
 *   educationLevel, currentCourse, preferredCourses[], preferredCities[],
 *   skills[], careerInterests[], preferredOpportunityType, portfolioLinks[],
 *   bio, address, profileImage
 * - Tabbed navigation: Profile Overview, Saved Colleges, Saved Opportunities, Saved Classes, My Applications
 * - Pulls saved items from localStorage save adapters and renders list cards
 * - My Applications tab displaying application status badges
 * - Save profile action wired to api.updateProfile (mock adapter stub ready for PATCH /users/:id)
 * - Logout button using AuthContext.logout()
 */

function Field({ label, value, name, onChange, editing, multiline = false, placeholder = "" }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      {editing ? (
        multiline ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#5472FC] focus:ring-2 focus:ring-[#E7EEFF]"
          />
        ) : (
          <input
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#5472FC] focus:ring-2 focus:ring-[#E7EEFF]"
          />
        )
      ) : (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {value || <span className="text-slate-400 italic">Not specified</span>}
        </p>
      )}
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active Tab: "profile" | "saved_colleges" | "saved_jobs" | "saved_classes" | "applications"
  const [activeTab, setActiveTab] = useState("profile");

  // User Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    profileImage: user?.profileImage || "",
    address: user?.studentProfile?.address || "Kathmandu, Nepal",
    bio:
      user?.studentProfile?.bio ||
      "Aspiring software engineer who enjoys building useful products and learning new technologies.",
    educationLevel: user?.studentProfile?.educationLevel || "Undergraduate",
    currentCourse: user?.studentProfile?.currentCourse || "Bachelor of Science in Computer Science",
    preferredCourses: user?.studentProfile?.preferredCourses || ["Computer Science", "Information Technology"],
    preferredCities: user?.studentProfile?.preferredCities || ["Kathmandu", "Pokhara", "Remote"],
    skills: user?.studentProfile?.skills || ["React", "JavaScript", "Tailwind CSS", "Node.js"],
    careerInterests: user?.studentProfile?.careerInterests || ["Web Development", "UI/UX Design", "Software Engineering"],
    preferredOpportunityType: user?.studentProfile?.preferredOpportunityType || "Internship / Entry-level",
    portfolioLinks: user?.studentProfile?.portfolioLinks || ["https://github.com/"],
  });

  const [draft, setDraft] = useState(profileData);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Saved Data States
  const [savedColleges, setSavedColleges] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedClasses, setSavedClasses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      const initial = {
        firstName: user.firstName || profileData.firstName,
        lastName: user.lastName || profileData.lastName,
        email: user.email || profileData.email,
        phone: user.phoneNumber || profileData.phone,
        profileImage: user.profileImage || profileData.profileImage,
        address: user.studentProfile?.address || profileData.address,
        bio: user.studentProfile?.bio || profileData.bio,
        educationLevel: user.studentProfile?.educationLevel || profileData.educationLevel,
        currentCourse: user.studentProfile?.currentCourse || profileData.currentCourse,
        preferredCourses: user.studentProfile?.preferredCourses || profileData.preferredCourses,
        preferredCities: user.studentProfile?.preferredCities || profileData.preferredCities,
        skills: user.studentProfile?.skills || profileData.skills,
        careerInterests: user.studentProfile?.careerInterests || profileData.careerInterests,
        preferredOpportunityType: user.studentProfile?.preferredOpportunityType || profileData.preferredOpportunityType,
        portfolioLinks: user.studentProfile?.portfolioLinks || profileData.portfolioLinks,
      };
      setProfileData(initial);
      setDraft(initial);
    }
  }, [user]);

  // Load Saved Colleges, Opportunities, Classes and Applications
  const loadTabContent = useCallback(async () => {
    if (!user?.id) return;
    setLoadingItems(true);

    try {
      if (activeTab === "saved_colleges") {
        const storedIds = JSON.parse(localStorage.getItem(`saved_colleges_${user.id}`) || "[]");
        if (storedIds.length > 0) {
          const res = await api.listColleges({ limit: 100 });
          const items = res.data?.filter((c) => storedIds.includes(c._id)) || [];
          setSavedColleges(items);
        } else {
          setSavedColleges([]);
        }
      } else if (activeTab === "saved_jobs") {
        const storedIds = JSON.parse(localStorage.getItem(`saved_jobs_${user.id}`) || "[]");
        if (storedIds.length > 0) {
          const res = await api.listOpportunities({ limit: 100 });
          const items = res.data?.filter((j) => storedIds.includes(j._id)) || [];
          setSavedJobs(items);
        } else {
          setSavedJobs([]);
        }
      } else if (activeTab === "saved_classes") {
        const storedIds = JSON.parse(localStorage.getItem(`saved_classes_${user.id}`) || "[]");
        if (storedIds.length > 0) {
          const res = await api.listClasses({ limit: 100 });
          const items = res.data?.filter((c) => storedIds.includes(c._id)) || [];
          setSavedClasses(items);
        } else {
          setSavedClasses([]);
        }
      } else if (activeTab === "applications") {
        const res = await api.getApplications();
        setApplications(res.data || []);
      }
    } catch (err) {
      console.error(`Failed to load content for ${activeTab}:`, err);
    } finally {
      setLoadingItems(false);
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab !== "profile") {
      loadTabContent();
    }
  }, [activeTab, loadTabContent]);

  // Form Editing Logic
  const startEditing = () => {
    setDraft(profileData);
    setEditing(true);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const cancelEditing = () => {
    setDraft(profileData);
    setEditing(false);
    setSaveError(null);
  };

  const updateDraftField = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const updateDraftArray = (fieldName, commaSeparatedString) => {
    const arr = commaSeparatedString.split(",").map((s) => s.trim()).filter(Boolean);
    setDraft((prev) => ({ ...prev, [fieldName]: arr }));
  };

  // Save Profile Handler wired to api.updateProfile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const payload = {
      firstName: draft.firstName,
      lastName: draft.lastName,
      phoneNumber: draft.phone,
      profileImage: draft.profileImage,
      studentProfile: {
        educationLevel: draft.educationLevel,
        currentCourse: draft.currentCourse,
        preferredCourses: Array.isArray(draft.preferredCourses) ? draft.preferredCourses : [],
        preferredCities: Array.isArray(draft.preferredCities) ? draft.preferredCities : [],
        skills: Array.isArray(draft.skills) ? draft.skills : [],
        careerInterests: Array.isArray(draft.careerInterests) ? draft.careerInterests : [],
        preferredOpportunityType: draft.preferredOpportunityType,
        portfolioLinks: Array.isArray(draft.portfolioLinks) ? draft.portfolioLinks : [],
        bio: draft.bio,
        address: draft.address,
      },
    };

    try {
      // TODO: Swapping in real PATCH /users/:id or /students/:id call is configured right inside api.updateProfile
      await api.updateProfile(user?.id || "current", payload);
      setProfileData(draft);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSaveError(err?.message || "Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() || "Student User";
  const initials = `${(profileData.firstName[0] || "S").toUpperCase()}${(profileData.lastName[0] || "U").toUpperCase()}`;
  const displayData = editing ? draft : profileData;

  // Helper formatting for status badges in My Applications
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "shortlisted":
        return "success";
      case "reviewing":
      case "submitted":
        return "primary";
      case "draft":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] pb-16 text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-0">
        {/* Top Header Banner */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5472FC]">
              Student Portal
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your career preferences, saved items, and applications
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!editing && activeTab === "profile" && (
              <button
                type="button"
                onClick={startEditing}
                className="rounded-xl bg-[#5472FC] px-5 py-3 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#435DDE]"
              >
                Edit profile
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-xs font-black text-rose-700 transition-colors hover:bg-rose-100"
            >
              Sign out ➔
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#D9E2FF] bg-white shadow-sm">
          <div className="h-28 bg-[radial-gradient(circle_at_82%_15%,rgba(255,255,255,0.38),transparent_28%),linear-gradient(120deg,#2551D9,#5472FC)]" />
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt={fullName}
                    className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#E7EEFF] text-2xl font-black text-[#2551D9] shadow-sm">
                    {initials}
                  </div>
                )}
                <div className="pb-1">
                  <h2 className="text-2xl font-black text-slate-950">{fullName}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {profileData.currentCourse}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#D9E2FF] bg-[#F6F8FF] px-4 py-3 sm:mb-1">
                <div className="flex items-center justify-between gap-6">
                  <p className="text-xs font-black text-slate-700">Profile strength</p>
                  <p className="text-xs font-black text-[#2551D9]">90%</p>
                </div>
                <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-[#D9E2FF]">
                  <div className="h-full w-11/12 rounded-full bg-[#5472FC]" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Role
                </p>
                <p className="mt-1.5 text-sm font-bold text-slate-700">Student</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Location
                </p>
                <p className="mt-1.5 text-sm font-bold text-slate-700">
                  {profileData.address}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Career Goal
                </p>
                <p className="mt-1.5 text-sm font-bold text-slate-700">
                  {profileData.preferredOpportunityType}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="mb-6 flex border-b border-slate-200 overflow-x-auto">
          {[
            { id: "profile", label: "Profile Overview" },
            { id: "saved_colleges", label: "Saved Colleges" },
            { id: "saved_jobs", label: "Saved Opportunities" },
            { id: "saved_classes", label: "Saved Classes" },
            { id: "applications", label: "My Applications" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setEditing(false);
              }}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-black transition-colors ${
                activeTab === tab.id
                  ? "border-[#5472FC] text-[#5472FC]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {saveSuccess && (
          <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 border border-emerald-200">
            ✓ Profile details updated successfully!
          </div>
        )}
        {saveError && (
          <ErrorBanner message={saveError} onClose={() => setSaveError(null)} className="mb-6" />
        )}

        {/* Tab 1: Profile Overview & Editable Fields */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile}>
            <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
              <div className="space-y-6">
                {/* Personal Information */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-black text-slate-950">About me</h2>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <Field
                      label="First Name"
                      name="firstName"
                      value={displayData.firstName}
                      onChange={updateDraftField}
                      editing={editing}
                    />
                    <Field
                      label="Last Name"
                      name="lastName"
                      value={displayData.lastName}
                      onChange={updateDraftField}
                      editing={editing}
                    />
                    <Field
                      label="Email Address"
                      name="email"
                      value={displayData.email}
                      onChange={updateDraftField}
                      editing={editing}
                    />
                    <Field
                      label="Phone Number"
                      name="phone"
                      value={displayData.phone}
                      onChange={updateDraftField}
                      editing={editing}
                    />
                    <Field
                      label="Location / Address"
                      name="address"
                      value={displayData.address}
                      onChange={updateDraftField}
                      editing={editing}
                    />
                    <Field
                      label="Profile Avatar URL"
                      name="profileImage"
                      value={displayData.profileImage}
                      onChange={updateDraftField}
                      editing={editing}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="mt-5">
                    <Field
                      label="Bio & Summary"
                      name="bio"
                      value={displayData.bio}
                      onChange={updateDraftField}
                      editing={editing}
                      multiline
                    />
                  </div>
                </section>

                {/* Education & Career Preferences */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-black text-slate-950">
                    Education & Career Preferences
                  </h2>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Education Level"
                      name="educationLevel"
                      value={displayData.educationLevel}
                      onChange={updateDraftField}
                      editing={editing}
                    />
                    <Field
                      label="Current Course / Degree"
                      name="currentCourse"
                      value={displayData.currentCourse}
                      onChange={updateDraftField}
                      editing={editing}
                    />
                    <Field
                      label="Preferred Opportunity Type"
                      name="preferredOpportunityType"
                      value={displayData.preferredOpportunityType}
                      onChange={updateDraftField}
                      editing={editing}
                    />
                  </div>

                  {/* Multi-value fields */}
                  <div className="mt-5 space-y-5">
                    {editing ? (
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Preferred Courses (comma-separated)
                        </p>
                        <input
                          value={(draft.preferredCourses || []).join(", ")}
                          onChange={(e) => updateDraftArray("preferredCourses", e.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#5472FC] focus:ring-2 focus:ring-[#E7EEFF]"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Preferred Courses
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(displayData.preferredCourses || []).map((c) => (
                            <Badge key={c} variant="secondary" size="md">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {editing ? (
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Preferred Cities (comma-separated)
                        </p>
                        <input
                          value={(draft.preferredCities || []).join(", ")}
                          onChange={(e) => updateDraftArray("preferredCities", e.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#5472FC] focus:ring-2 focus:ring-[#E7EEFF]"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Preferred Cities
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(displayData.preferredCities || []).map((city) => (
                            <span
                              key={city}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"
                            >
                              📍 {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Skills Section */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-black text-slate-950">Skills</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Skills used to match suitable jobs and courses.
                  </p>
                  {editing ? (
                    <div className="mt-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Skills (comma-separated)
                      </p>
                      <input
                        value={(draft.skills || []).join(", ")}
                        onChange={(e) => updateDraftArray("skills", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#5472FC] focus:ring-2 focus:ring-[#E7EEFF]"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(displayData.skills || []).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[#E7EEFF] px-3 py-1.5 text-xs font-black text-[#2551D9]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                {/* Career Interests Section */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-black text-slate-950">Career Interests</h2>
                  {editing ? (
                    <div className="mt-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Interests (comma-separated)
                      </p>
                      <input
                        value={(draft.careerInterests || []).join(", ")}
                        onChange={(e) => updateDraftArray("careerInterests", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#5472FC] focus:ring-2 focus:ring-[#E7EEFF]"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(displayData.careerInterests || []).map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                {/* CV Maker Promo Card */}
                <section className="rounded-2xl border border-[#D9E2FF] bg-[#F6F8FF] p-5 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2551D9]">
                    Resume & Portfolio
                  </p>
                  <h2 className="mt-3 text-lg font-black leading-6 text-slate-950">
                    Build your professional CV to stand out in job applications.
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate("/cv-maker")}
                    className="mt-5 rounded-xl bg-[#5472FC] px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-[#435DDE]"
                  >
                    Open CV Maker ↗
                  </button>
                </section>
              </aside>
            </div>

            {/* Save / Cancel Action Bar */}
            {editing && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#5472FC] px-5 py-3 text-xs font-black text-white transition-colors hover:bg-[#435DDE]"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Saved Colleges */}
        {activeTab === "saved_colleges" && (
          <section aria-live="polite">
            {loadingItems ? (
              <LoadingSpinner size="lg" message="Loading saved colleges..." />
            ) : savedColleges.length === 0 ? (
              <EmptyState
                title="No saved colleges yet"
                message="Bookmark colleges while exploring to easily find and compare them here."
                action="Explore Colleges"
                onAction={() => navigate("/colleges")}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {savedColleges.map((college) => (
                  <Card key={college._id} hover onClick={() => navigate(`/colleges/${college._id}`)}>
                    <h3 className="text-lg font-black text-slate-950">{college.collegeName}</h3>
                    <p className="mt-1 text-sm font-semibold text-gray-600">
                      {college.city} {college.affiliation && `• ${college.affiliation}`}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        variant={college.admissionStatus === "open" ? "success" : "danger"}
                        size="sm"
                      >
                        {college.admissionStatus === "open" ? "Open" : "Closed"}
                      </Badge>
                      <span className="text-xs font-bold text-amber-500">
                        ★ {college.rating}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Saved Opportunities / Jobs */}
        {activeTab === "saved_jobs" && (
          <section aria-live="polite">
            {loadingItems ? (
              <LoadingSpinner size="lg" message="Loading saved opportunities..." />
            ) : savedJobs.length === 0 ? (
              <EmptyState
                title="No saved opportunities"
                message="Save jobs and internships you're interested in to apply when ready."
                action="Explore Jobs"
                onAction={() => navigate("/jobs")}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {savedJobs.map((job) => (
                  <Card key={job._id} hover onClick={() => navigate(`/jobs/${job._id}`)}>
                    <p className="text-xs font-bold text-gray-500">{job.companyName}</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="primary" size="sm">
                        {job.type}
                      </Badge>
                      {job.workMode && (
                        <Badge variant="secondary" size="sm">
                          {job.workMode}
                        </Badge>
                      )}
                    </div>
                    {job.stipendOrSalaryRange && (
                      <p className="mt-3 text-xs font-bold text-slate-900">
                        {job.stipendOrSalaryRange}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 4: Saved Classes */}
        {activeTab === "saved_classes" && (
          <section aria-live="polite">
            {loadingItems ? (
              <LoadingSpinner size="lg" message="Loading saved classes..." />
            ) : savedClasses.length === 0 ? (
              <EmptyState
                title="No saved classes"
                message="Save online courses and workshops to track your learning journey."
                action="Explore Online Classes"
                onAction={() => navigate("/online-classes")}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {savedClasses.map((cls) => (
                  <Card key={cls._id} hover onClick={() => navigate(`/online-classes/${cls._id}`)}>
                    <p className="text-xs font-bold text-gray-500">{cls.instructorOrOrganization}</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">{cls.classTitle}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {cls.mode && <Badge variant="primary" size="sm">{cls.mode}</Badge>}
                      {cls.level && <Badge variant="secondary" size="sm">{cls.level}</Badge>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 5: My Applications */}
        {activeTab === "applications" && (
          <section aria-live="polite">
            {loadingItems ? (
              <LoadingSpinner size="lg" message="Loading your applications..." />
            ) : applications.length === 0 ? (
              <EmptyState
                title="No applications submitted yet"
                message="Apply to open job and internship positions to track your application statuses here."
                action="Browse Opportunities"
                onAction={() => navigate("/jobs")}
              />
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id || app._id} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        {app.opportunityTitle || app.title || `Opportunity #${app.opportunityId}`}
                      </h3>
                      {app.coverMessage && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          "{app.coverMessage}"
                        </p>
                      )}
                      <p className="mt-2 text-xs font-medium text-gray-500">
                        Applied on: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "Recent"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadgeVariant(app.status)} size="md">
                        {app.status ? app.status.toUpperCase() : "SUBMITTED"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default Profile;
