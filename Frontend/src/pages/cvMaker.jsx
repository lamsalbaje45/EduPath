import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import {
  Badge,
  Button,
  Card,
  ErrorBanner,
  Input,
  LoadingSpinner,
} from "../components/ui";

/**
 * CV Maker Page
 * Multi-section live-preview form matching Backend/models/cv.js schema
 * Features:
 * - Editable form with add/remove entry controls for education, experience, projects, certifications
 * - Tag-style inputs for skills and languages
 * - Live-updating preview with 3 visual templates (Modern, Classic, Minimal)
 * - Autosave with 1000ms debounce + manual save via mock/stub adapter
 * - Print-to-PDF via window.print() and print-only CSS
 * - Protected route requirement
 */

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern Sidebar",
    description: "Sleek dual-column layout with colored sidebar",
  },
  {
    id: "classic",
    name: "Classic Elegant",
    description: "Traditional centered header with clear section dividers",
  },
  {
    id: "minimal",
    name: "Minimalist Tech",
    description: "Clean single-column layout with compact typography",
  },
];

const DEFAULT_CV = {
  personalDetails: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
  },
  educationEntries: [
    {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      gradeOrScore: "",
    },
  ],
  skillList: [],
  experienceEntries: [
    {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  projectEntries: [
    {
      name: "",
      description: "",
      link: "",
    },
  ],
  certifications: [
    {
      name: "",
      issuer: "",
      date: "",
      link: "",
    },
  ],
  languages: [],
  templatePreference: "modern",
  publicShareStatus: false,
};

function CvMaker() {
  const { user } = useAuth();

  // CV Data state
  const [cvData, setCvData] = useState(DEFAULT_CV);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Save status: "saved" | "saving" | "unsaved" | "error"
  const [saveStatus, setSaveStatus] = useState("saved");

  // Tag inputs
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newLanguageInput, setNewLanguageInput] = useState("");

  // Mobile view toggle ("form" or "preview")
  const [mobileView, setMobileView] = useState("form");

  // Active form section accordion
  const [activeSection, setActiveSection] = useState("personal");

  // Ref to track first load
  const isInitialMount = useRef(true);

  // Fetch CV data on mount
  const fetchCv = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getCv();
      if (response?.data) {
        const fetched = response.data;
        setCvData({
          personalDetails: {
            fullName:
              fetched.personalDetails?.fullName ||
              (user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : ""),
            email: fetched.personalDetails?.email || user?.email || "",
            phone: fetched.personalDetails?.phone || "",
            address: fetched.personalDetails?.address || "",
            summary: fetched.personalDetails?.summary || "",
          },
          educationEntries: fetched.educationEntries?.length
            ? fetched.educationEntries
            : DEFAULT_CV.educationEntries,
          skillList: fetched.skillList || [],
          experienceEntries: fetched.experienceEntries?.length
            ? fetched.experienceEntries
            : DEFAULT_CV.experienceEntries,
          projectEntries: fetched.projectEntries?.length
            ? fetched.projectEntries
            : DEFAULT_CV.projectEntries,
          certifications: fetched.certifications?.length
            ? fetched.certifications
            : DEFAULT_CV.certifications,
          languages: fetched.languages || [],
          templatePreference: fetched.templatePreference || "modern",
          publicShareStatus: Boolean(fetched.publicShareStatus),
        });
      }
    } catch (err) {
      console.error("Failed to load CV:", err);
      setError("Could not load your saved CV. Starting with default template.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCv();
  }, [fetchCv]);

  // Save CV function
  const saveCvData = useCallback(async (dataToSave) => {
    setSaveStatus("saving");
    try {
      await api.saveCv(dataToSave);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Failed to save CV:", err);
      setSaveStatus("error");
    }
  }, []);

  // Autosave debouncer (1000ms after changes)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus("unsaved");
    const timer = setTimeout(() => {
      saveCvData(cvData);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cvData, saveCvData]);

  // Handle manual save click
  const handleManualSave = () => {
    saveCvData(cvData);
  };

  // Helper function to handle print/download PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Form input update helpers
  const updatePersonalDetails = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [field]: value,
      },
    }));
  };

  // Array fields helpers (Education, Experience, Projects, Certifications)
  const updateArrayEntry = (arrayName, index, field, value) => {
    setCvData((prev) => {
      const updated = [...prev[arrayName]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [arrayName]: updated };
    });
  };

  const addArrayEntry = (arrayName, defaultObject) => {
    setCvData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultObject],
    }));
  };

  const removeArrayEntry = (arrayName, index) => {
    setCvData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  // Skill tag handlers
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !cvData.skillList.includes(trimmed)) {
      setCvData((prev) => ({
        ...prev,
        skillList: [...prev.skillList, trimmed],
      }));
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCvData((prev) => ({
      ...prev,
      skillList: prev.skillList.filter((s) => s !== skillToRemove),
    }));
  };

  // Language tag handlers
  const handleAddLanguage = () => {
    const trimmed = newLanguageInput.trim();
    if (trimmed && !cvData.languages.includes(trimmed)) {
      setCvData((prev) => ({
        ...prev,
        languages: [...prev.languages, trimmed],
      }));
      setNewLanguageInput("");
    }
  };

  const handleRemoveLanguage = (langToRemove) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== langToRemove),
    }));
  };

  if (loading) {
    return (
      <main className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-5">
          <LoadingSpinner size="lg" message="Loading CV Maker..." />
        </div>
      </main>
    );
  }

  const {
    personalDetails,
    educationEntries,
    skillList,
    experienceEntries,
    projectEntries,
    certifications,
    languages,
    templatePreference,
    publicShareStatus,
  } = cvData;

  return (
    <main className="min-h-screen bg-gray-100 py-6">
      {/* Print-only CSS block to hide non-CV elements during print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cv-preview-document, #cv-preview-document * {
            visibility: visible !important;
          }
          #cv-preview-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Control Bar */}
        <div className="no-print mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-950">CV Maker</h1>
            <p className="mt-1 text-sm text-gray-600">
              Build and customize your professional resume with real-time live preview
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Save indicator badge */}
            <div className="flex items-center gap-2 text-sm font-semibold">
              {saveStatus === "saved" && (
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Saved
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="inline-flex items-center gap-1.5 text-amber-700">
                  <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
                  Saving...
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="inline-flex items-center gap-1.5 text-blue-700">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Unsaved changes
                </span>
              )}
              {saveStatus === "error" && (
                <span className="inline-flex items-center gap-1.5 text-rose-700">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Save error
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={handleManualSave}
              disabled={saveStatus === "saving"}
            >
              Save CV
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handlePrintPdf}
              className="bg-[#5472FC] hover:bg-[#435DDE]"
            >
              🖨️ Download PDF
            </Button>
          </div>
        </div>

        {/* Mobile View Toggle (Form vs Preview) */}
        <div className="no-print mb-4 flex rounded-xl bg-gray-200 p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileView("form")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              mobileView === "form"
                ? "bg-white text-[#5472FC] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📝 Edit Form
          </button>
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              mobileView === "preview"
                ? "bg-white text-[#5472FC] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            👁️ Live Preview
          </button>
        </div>

        {error && (
          <ErrorBanner
            message={error}
            onClose={() => setError(null)}
            className="no-print mb-6"
          />
        )}

        {/* Main Grid: Form Left (7 cols), Live Preview Right (5 cols) */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Form Pane */}
          <div
            className={`no-print space-y-4 lg:col-span-6 xl:col-span-5 ${
              mobileView === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Template Selector Card */}
            <Card>
              <h2 className="mb-3 text-lg font-black text-slate-950">
                Choose Template
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() =>
                      setCvData((prev) => ({
                        ...prev,
                        templatePreference: tpl.id,
                      }))
                    }
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                      templatePreference === tpl.id
                        ? "border-[#5472FC] bg-blue-50/50 ring-2 ring-[#5472FC]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-black text-slate-950">
                      {tpl.name}
                    </span>
                    <span className="mt-1 text-xs text-gray-500 leading-tight">
                      {tpl.description}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Accordion Sections Navigation */}
            <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-2">
              {[
                { id: "personal", label: "Personal" },
                { id: "education", label: `Education (${educationEntries.length})` },
                { id: "experience", label: `Experience (${experienceEntries.length})` },
                { id: "skills", label: `Skills (${skillList.length})` },
                { id: "projects", label: `Projects (${projectEntries.length})` },
                { id: "certs", label: `Certifications (${certifications.length})` },
                { id: "languages", label: `Languages (${languages.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeSection === tab.id
                      ? "bg-[#5472FC] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Section 1: Personal Details */}
            {activeSection === "personal" && (
              <Card>
                <h3 className="mb-4 text-xl font-black text-slate-950">
                  Personal Details
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    value={personalDetails.fullName}
                    onChange={(e) =>
                      updatePersonalDetails("fullName", e.target.value)
                    }
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={personalDetails.email}
                      onChange={(e) =>
                        updatePersonalDetails("email", e.target.value)
                      }
                    />
                    <Input
                      label="Phone"
                      placeholder="e.g. +977 9801234567"
                      value={personalDetails.phone}
                      onChange={(e) =>
                        updatePersonalDetails("phone", e.target.value)
                      }
                    />
                  </div>
                  <Input
                    label="Address / Location"
                    placeholder="e.g. Kathmandu, Nepal"
                    value={personalDetails.address}
                    onChange={(e) =>
                      updatePersonalDetails("address", e.target.value)
                    }
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-900">
                      Professional Summary
                    </label>
                    <textarea
                      rows="4"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none"
                      placeholder="A brief overview of your background, key strengths, and career objective..."
                      value={personalDetails.summary}
                      onChange={(e) =>
                        updatePersonalDetails("summary", e.target.value)
                      }
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Section 2: Education */}
            {activeSection === "education" && (
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">
                    Education
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addArrayEntry("educationEntries", {
                        institution: "",
                        degree: "",
                        fieldOfStudy: "",
                        startDate: "",
                        endDate: "",
                        gradeOrScore: "",
                      })
                    }
                  >
                    + Add Education
                  </Button>
                </div>

                <div className="space-y-6">
                  {educationEntries.map((edu, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-xs font-bold uppercase text-gray-500">
                          Education #{idx + 1}
                        </span>
                        {educationEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayEntry("educationEntries", idx)
                            }
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <Input
                        label="Institution / School"
                        placeholder="e.g. Tribhuvan University"
                        value={edu.institution}
                        onChange={(e) =>
                          updateArrayEntry(
                            "educationEntries",
                            idx,
                            "institution",
                            e.target.value,
                          )
                        }
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Degree"
                          placeholder="e.g. Bachelor of Science"
                          value={edu.degree}
                          onChange={(e) =>
                            updateArrayEntry(
                              "educationEntries",
                              idx,
                              "degree",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          label="Field of Study"
                          placeholder="e.g. Computer Science"
                          value={edu.fieldOfStudy}
                          onChange={(e) =>
                            updateArrayEntry(
                              "educationEntries",
                              idx,
                              "fieldOfStudy",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <Input
                          label="Start Date"
                          placeholder="e.g. 2021"
                          value={edu.startDate}
                          onChange={(e) =>
                            updateArrayEntry(
                              "educationEntries",
                              idx,
                              "startDate",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          label="End Date"
                          placeholder="e.g. 2025"
                          value={edu.endDate}
                          onChange={(e) =>
                            updateArrayEntry(
                              "educationEntries",
                              idx,
                              "endDate",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          label="Grade / Score"
                          placeholder="e.g. 3.8 GPA"
                          value={edu.gradeOrScore}
                          onChange={(e) =>
                            updateArrayEntry(
                              "educationEntries",
                              idx,
                              "gradeOrScore",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Section 3: Experience */}
            {activeSection === "experience" && (
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">
                    Work Experience
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addArrayEntry("experienceEntries", {
                        title: "",
                        organization: "",
                        startDate: "",
                        endDate: "",
                        description: "",
                      })
                    }
                  >
                    + Add Experience
                  </Button>
                </div>

                <div className="space-y-6">
                  {experienceEntries.map((exp, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-xs font-bold uppercase text-gray-500">
                          Experience #{idx + 1}
                        </span>
                        {experienceEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayEntry("experienceEntries", idx)
                            }
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <Input
                        label="Job Title"
                        placeholder="e.g. Frontend Developer Intern"
                        value={exp.title}
                        onChange={(e) =>
                          updateArrayEntry(
                            "experienceEntries",
                            idx,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        label="Company / Organization"
                        placeholder="e.g. TechCorp Nepal"
                        value={exp.organization}
                        onChange={(e) =>
                          updateArrayEntry(
                            "experienceEntries",
                            idx,
                            "organization",
                            e.target.value,
                          )
                        }
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Start Date"
                          placeholder="e.g. June 2023"
                          value={exp.startDate}
                          onChange={(e) =>
                            updateArrayEntry(
                              "experienceEntries",
                              idx,
                              "startDate",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          label="End Date"
                          placeholder="e.g. Present"
                          value={exp.endDate}
                          onChange={(e) =>
                            updateArrayEntry(
                              "experienceEntries",
                              idx,
                              "endDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-900">
                          Description & Key Achievements
                        </label>
                        <textarea
                          rows="3"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none"
                          placeholder="Describe your responsibilities, technologies used, and key outcomes..."
                          value={exp.description}
                          onChange={(e) =>
                            updateArrayEntry(
                              "experienceEntries",
                              idx,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Section 4: Skills */}
            {activeSection === "skills" && (
              <Card>
                <h3 className="mb-4 text-xl font-black text-slate-950">
                  Skills & Competencies
                </h3>

                <div className="mb-4 flex gap-2">
                  <Input
                    placeholder="e.g. React, Python, UI Design..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="primary" size="md" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skillList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-[#5472FC]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-400 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Section 5: Projects */}
            {activeSection === "projects" && (
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">
                    Key Projects
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addArrayEntry("projectEntries", {
                        name: "",
                        description: "",
                        link: "",
                      })
                    }
                  >
                    + Add Project
                  </Button>
                </div>

                <div className="space-y-6">
                  {projectEntries.map((proj, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-xs font-bold uppercase text-gray-500">
                          Project #{idx + 1}
                        </span>
                        {projectEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayEntry("projectEntries", idx)
                            }
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <Input
                        label="Project Name"
                        placeholder="e.g. EduPath Portal"
                        value={proj.name}
                        onChange={(e) =>
                          updateArrayEntry(
                            "projectEntries",
                            idx,
                            "name",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        label="Project Link (URL)"
                        placeholder="e.g. https://github.com/..."
                        value={proj.link}
                        onChange={(e) =>
                          updateArrayEntry(
                            "projectEntries",
                            idx,
                            "link",
                            e.target.value,
                          )
                        }
                      />

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-900">
                          Description
                        </label>
                        <textarea
                          rows="3"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none"
                          placeholder="Brief description of project goal and features..."
                          value={proj.description}
                          onChange={(e) =>
                            updateArrayEntry(
                              "projectEntries",
                              idx,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Section 6: Certifications */}
            {activeSection === "certs" && (
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950">
                    Certifications
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addArrayEntry("certifications", {
                        name: "",
                        issuer: "",
                        date: "",
                        link: "",
                      })
                    }
                  >
                    + Add Certification
                  </Button>
                </div>

                <div className="space-y-6">
                  {certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-xs font-bold uppercase text-gray-500">
                          Certification #{idx + 1}
                        </span>
                        {certifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayEntry("certifications", idx)
                            }
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <Input
                        label="Certification Name"
                        placeholder="e.g. AWS Certified Cloud Practitioner"
                        value={cert.name}
                        onChange={(e) =>
                          updateArrayEntry(
                            "certifications",
                            idx,
                            "name",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        label="Issuer / Organization"
                        placeholder="e.g. Amazon Web Services"
                        value={cert.issuer}
                        onChange={(e) =>
                          updateArrayEntry(
                            "certifications",
                            idx,
                            "issuer",
                            e.target.value,
                          )
                        }
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Date Issued"
                          placeholder="e.g. August 2023"
                          value={cert.date}
                          onChange={(e) =>
                            updateArrayEntry(
                              "certifications",
                              idx,
                              "date",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          label="Credential Link"
                          placeholder="e.g. https://..."
                          value={cert.link}
                          onChange={(e) =>
                            updateArrayEntry(
                              "certifications",
                              idx,
                              "link",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Section 7: Languages & Settings */}
            {activeSection === "languages" && (
              <Card>
                <h3 className="mb-4 text-xl font-black text-slate-950">
                  Languages & Public Sharing
                </h3>

                <div className="mb-6 space-y-3">
                  <label className="block text-sm font-medium text-gray-900">
                    Languages Spoken
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. English, Nepali, Hindi..."
                      value={newLanguageInput}
                      onChange={(e) => setNewLanguageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddLanguage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleAddLanguage}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-800"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-950">
                        Public Share Status
                      </span>
                      <p className="text-xs text-gray-500">
                        Allow employers to discover this CV when searching candidates
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publicShareStatus}
                      onChange={(e) =>
                        setCvData((prev) => ({
                          ...prev,
                          publicShareStatus: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 cursor-pointer accent-[#5472FC]"
                    />
                  </label>
                </div>
              </Card>
            )}
          </div>

          {/* Live Preview Pane (Right 7 cols) */}
          <div
            className={`lg:col-span-6 xl:col-span-7 ${
              mobileView === "form" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="sticky top-4">
              <div className="no-print mb-2 flex items-center justify-between text-xs text-gray-500">
                <span>📄 Live Document Preview</span>
                <span>Template: {templatePreference.toUpperCase()}</span>
              </div>

              {/* Document Paper Container */}
              <div
                id="cv-preview-document"
                className="min-h-[297mm] w-full max-w-[210mm] overflow-hidden rounded-xl bg-white p-8 shadow-xl transition-all border border-gray-200"
              >
                {/* Modern Template Layout */}
                {templatePreference === "modern" && (
                  <div className="grid gap-6 md:grid-cols-12">
                    {/* Left Column Accent */}
                    <div className="md:col-span-4 rounded-xl bg-slate-900 p-5 text-white">
                      <h2 className="text-2xl font-black leading-tight text-white">
                        {personalDetails.fullName || "Your Full Name"}
                      </h2>
                      <p className="mt-2 text-xs text-slate-300">
                        {personalDetails.email}
                      </p>
                      <p className="text-xs text-slate-300">
                        {personalDetails.phone}
                      </p>
                      <p className="text-xs text-slate-300">
                        {personalDetails.address}
                      </p>

                      {/* Skills */}
                      {skillList.length > 0 && (
                        <div className="mt-6">
                          <h3 className="mb-2 text-xs font-black uppercase text-blue-400">
                            Skills
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {skillList.map((skill) => (
                              <span
                                key={skill}
                                className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {languages.length > 0 && (
                        <div className="mt-6">
                          <h3 className="mb-2 text-xs font-black uppercase text-blue-400">
                            Languages
                          </h3>
                          <p className="text-xs text-slate-300">
                            {languages.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Main Content */}
                    <div className="space-y-5 md:col-span-8">
                      {/* Summary */}
                      {personalDetails.summary && (
                        <div>
                          <h3 className="mb-1 text-xs font-black uppercase text-[#5472FC]">
                            Profile Summary
                          </h3>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {personalDetails.summary}
                          </p>
                        </div>
                      )}

                      {/* Experience */}
                      {experienceEntries.length > 0 && (
                        <div>
                          <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-black uppercase text-[#5472FC]">
                            Experience
                          </h3>
                          <div className="space-y-3">
                            {experienceEntries.map((exp, idx) => (
                              <div key={idx}>
                                <div className="flex justify-between text-xs font-bold text-slate-900">
                                  <span>{exp.title || "Position Title"}</span>
                                  <span className="text-gray-500">
                                    {exp.startDate} - {exp.endDate}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-gray-600">
                                  {exp.organization}
                                </p>
                                <p className="mt-1 text-xs text-gray-700">
                                  {exp.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {educationEntries.length > 0 && (
                        <div>
                          <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-black uppercase text-[#5472FC]">
                            Education
                          </h3>
                          <div className="space-y-2">
                            {educationEntries.map((edu, idx) => (
                              <div key={idx}>
                                <div className="flex justify-between text-xs font-bold text-slate-900">
                                  <span>
                                    {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                                  </span>
                                  <span className="text-gray-500">
                                    {edu.startDate} - {edu.endDate}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {edu.institution}{" "}
                                  {edu.gradeOrScore && `• ${edu.gradeOrScore}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {projectEntries.length > 0 && (
                        <div>
                          <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-black uppercase text-[#5472FC]">
                            Projects
                          </h3>
                          <div className="space-y-2">
                            {projectEntries.map((proj, idx) => (
                              <div key={idx}>
                                <p className="text-xs font-bold text-slate-900">
                                  {proj.name}
                                </p>
                                <p className="text-xs text-gray-700">
                                  {proj.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Classic Template Layout */}
                {templatePreference === "classic" && (
                  <div className="space-y-5 text-slate-900 font-serif">
                    {/* Centered Header */}
                    <div className="border-b-2 border-slate-900 pb-4 text-center">
                      <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                        {personalDetails.fullName || "Your Full Name"}
                      </h2>
                      <p className="mt-1 text-xs text-gray-600 font-sans">
                        {[
                          personalDetails.email,
                          personalDetails.phone,
                          personalDetails.address,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>

                    {/* Summary */}
                    {personalDetails.summary && (
                      <div>
                        <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-950 font-sans">
                          Summary
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-800">
                          {personalDetails.summary}
                        </p>
                      </div>
                    )}

                    {/* Experience */}
                    {experienceEntries.length > 0 && (
                      <div>
                        <h3 className="mb-2 border-b border-slate-300 pb-0.5 text-sm font-bold uppercase tracking-wider text-slate-950 font-sans">
                          Experience
                        </h3>
                        <div className="space-y-3 font-sans">
                          {experienceEntries.map((exp, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between text-xs font-bold text-slate-900">
                                <span>{exp.title || "Job Title"}</span>
                                <span>
                                  {exp.startDate} - {exp.endDate}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-gray-600 italic">
                                {exp.organization}
                              </p>
                              <p className="mt-1 text-xs text-gray-700 leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {educationEntries.length > 0 && (
                      <div>
                        <h3 className="mb-2 border-b border-slate-300 pb-0.5 text-sm font-bold uppercase tracking-wider text-slate-950 font-sans">
                          Education
                        </h3>
                        <div className="space-y-2 font-sans">
                          {educationEntries.map((edu, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900">
                                  {edu.institution}
                                </span>
                                <p className="text-gray-600">
                                  {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                                </p>
                              </div>
                              <span className="text-gray-500 font-medium">
                                {edu.startDate} - {edu.endDate}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills & Languages */}
                    {(skillList.length > 0 || languages.length > 0) && (
                      <div>
                        <h3 className="mb-2 border-b border-slate-300 pb-0.5 text-sm font-bold uppercase tracking-wider text-slate-950 font-sans">
                          Skills & Languages
                        </h3>
                        <p className="text-xs font-sans text-gray-800">
                          <strong>Skills:</strong> {skillList.join(", ")}
                        </p>
                        {languages.length > 0 && (
                          <p className="text-xs font-sans text-gray-800">
                            <strong>Languages:</strong> {languages.join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Minimal Template Layout */}
                {templatePreference === "minimal" && (
                  <div className="space-y-6 text-slate-900 font-sans">
                    {/* Left aligned header */}
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-slate-950">
                        {personalDetails.fullName || "Your Full Name"}
                      </h2>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                        {personalDetails.email && (
                          <span>📧 {personalDetails.email}</span>
                        )}
                        {personalDetails.phone && (
                          <span>📞 {personalDetails.phone}</span>
                        )}
                        {personalDetails.address && (
                          <span>📍 {personalDetails.address}</span>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {personalDetails.summary && (
                      <p className="text-xs text-gray-700 leading-relaxed border-l-2 border-[#5472FC] pl-3">
                        {personalDetails.summary}
                      </p>
                    )}

                    {/* Experience */}
                    {experienceEntries.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                          // Experience
                        </h3>
                        {experienceEntries.map((exp, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-950">
                              <span>
                                {exp.title} <span className="font-normal text-gray-500">@ {exp.organization}</span>
                              </span>
                              <span className="text-gray-400">
                                {exp.startDate} - {exp.endDate}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {educationEntries.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                          // Education
                        </h3>
                        {educationEntries.map((edu, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-950">
                                {edu.institution}
                              </span>
                              <p className="text-gray-600">
                                {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                              </p>
                            </div>
                            <span className="text-gray-400 font-medium">
                              {edu.startDate} - {edu.endDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {skillList.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                          // Skills
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {skillList.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CvMaker;
