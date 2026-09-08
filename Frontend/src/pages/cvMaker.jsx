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
 * - Live-updating preview with 2 visual templates (Modern, Classic)
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

// Start/End Date fields are stored as strict "YYYY-MM" values (native <input type="month">).
// Format them as "Mon YYYY" for display, treating a blank end date as ongoing.
function formatMonthYear(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!year || !month) return value;

  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "";
  return `${formatMonthYear(startDate) || "?"} - ${endDate ? formatMonthYear(endDate) : "Present"}`;
}

// The backend stores startDate/endDate as real Date values, which arrive over the API as
// full ISO datetime strings. <input type="month"> only accepts a strict "YYYY-MM" value,
// so normalize on load or the picker silently renders blank despite having saved data.
function toMonthInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function normalizeDateEntries(entries) {
  return entries.map((entry) => ({
    ...entry,
    startDate: toMonthInputValue(entry.startDate),
    endDate: toMonthInputValue(entry.endDate),
  }));
}

function normalizeCertifications(entries) {
  return entries.map((entry) => ({
    ...entry,
    date: toMonthInputValue(entry.date),
  }));
}

// "YYYY-MM" values are lexicographically sortable, so plain string comparison is
// chronologically correct as long as both dates are fully selected.
function getDateRangeError(startDate, endDate) {
  if (!startDate || !endDate) return null;
  return startDate < endDate ? null : "End date must be after start date.";
}

const MONTH_OPTIONS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Covers a typical resume's range: decades of past education/experience through a
// few years out for an expected graduation or start date.
const YEAR_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear + 5; year >= currentYear - 60; year -= 1) {
    years.push(String(year));
  }
  return years;
})();

const monthYearSelectClasses = (hasError) =>
  `w-full px-3 py-3 border rounded-xl text-sm font-sans bg-white/90 dark:bg-slate-900/90 dark:text-white transition-all focus:outline-none focus:ring-0 ${
    hasError
      ? "border-red-500 shadow-red-100 dark:shadow-red-900"
      : "border-gray-200 dark:border-slate-700 focus:border-[#1F4FD8] focus:shadow-[0_0_0_3px_rgba(31,79,216,0.12)]"
  }`;

// Renders Month/Year as two dropdowns but exposes the same "YYYY-MM" string contract as
// the rest of the form. Keeps its own month/year selection in local state so picking one
// dropdown before the other doesn't get wiped out while the value is still incomplete
// (the parent only receives a value once both parts are chosen).
function MonthYearSelect({ label, value, onChange, error, helperText }) {
  const [year, initialMonth] = value ? value.split("-") : ["", ""];
  const [month, setMonth] = useState(initialMonth || "");
  const [selectedYear, setSelectedYear] = useState(year || "");
  const lastEmitted = useRef(value || "");

  useEffect(() => {
    if (value !== lastEmitted.current) {
      const [nextYear, nextMonth] = value ? value.split("-") : ["", ""];
      setSelectedYear(nextYear || "");
      setMonth(nextMonth || "");
      lastEmitted.current = value || "";
    }
  }, [value]);

  const emit = (nextMonth, nextYear) => {
    const next = nextMonth && nextYear ? `${nextYear}-${nextMonth}` : "";
    lastEmitted.current = next;
    onChange(next);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <select
          aria-label={label ? `${label} month` : "Month"}
          className={monthYearSelectClasses(error)}
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            emit(e.target.value, selectedYear);
          }}
        >
          <option value="">Month</option>
          {MONTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label={label ? `${label} year` : "Year"}
          className={monthYearSelectClasses(error)}
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            emit(month, e.target.value);
          }}
        >
          <option value="">Year</option>
          {YEAR_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
      {helperText && !error && (
        <span className="mt-1 block text-xs text-gray-500">{helperText}</span>
      )}
    </div>
  );
}

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
            ? normalizeDateEntries(fetched.educationEntries)
            : DEFAULT_CV.educationEntries,
          skillList: fetched.skillList || [],
          experienceEntries: fetched.experienceEntries?.length
            ? normalizeDateEntries(fetched.experienceEntries)
            : DEFAULT_CV.experienceEntries,
          projectEntries: fetched.projectEntries?.length
            ? fetched.projectEntries
            : DEFAULT_CV.projectEntries,
          certifications: fetched.certifications?.length
            ? normalizeCertifications(fetched.certifications)
            : DEFAULT_CV.certifications,
          languages: fetched.languages || [],
          templatePreference: TEMPLATES.some((tpl) => tpl.id === fetched.templatePreference)
            ? fetched.templatePreference
            : "modern",
          publicShareStatus: Boolean(fetched.publicShareStatus),
        });
      }
    } catch (err) {
      if (err?.status !== 404) {
        console.error("Failed to load CV:", err);
        setError("Could not load your saved CV. Starting with default template.");
      }
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
        /* Chrome only omits its default header/footer (title, URL, date, page number)
           when the page has zero margin, so this is the only way to suppress them
           from CSS -- there's no other document-level control for that. */
        @page {
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cv-preview-document, #cv-preview-document * {
            visibility: visible !important;
            /* Browsers skip background colors/images when printing unless told
               otherwise, so the Modern template's dark sidebar (and skill/language
               tag backgrounds) would print as a blank white box with invisible
               white text without this. */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          #cv-preview-pane {
            display: block !important;
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
          /* Chrome evaluates the "md:" breakpoint against a print-time width that can
             fall short of 768px even on a full letter/A4 page, so it silently drops
             back to the single-column mobile layout and stacks the sidebar above the
             main content. Force the two-column layout explicitly instead of relying
             on that breakpoint during print. */
          .cv-modern-grid {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          }
          .cv-modern-sidebar {
            grid-column: span 4 / span 4 !important;
          }
          .cv-modern-main {
            grid-column: span 8 / span 8 !important;
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
              Download PDF
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
            Edit Form
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
            Live Preview
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
                        <MonthYearSelect
                          label="Start Date"
                          value={edu.startDate}
                          onChange={(nextValue) =>
                            updateArrayEntry(
                              "educationEntries",
                              idx,
                              "startDate",
                              nextValue,
                            )
                          }
                        />
                        <MonthYearSelect
                          label="End Date"
                          helperText="Leave blank if ongoing"
                          error={getDateRangeError(edu.startDate, edu.endDate)}
                          value={edu.endDate}
                          onChange={(nextValue) =>
                            updateArrayEntry(
                              "educationEntries",
                              idx,
                              "endDate",
                              nextValue,
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
                        <MonthYearSelect
                          label="Start Date"
                          value={exp.startDate}
                          onChange={(nextValue) =>
                            updateArrayEntry(
                              "experienceEntries",
                              idx,
                              "startDate",
                              nextValue,
                            )
                          }
                        />
                        <MonthYearSelect
                          label="End Date"
                          helperText="Leave blank if you currently work here"
                          error={getDateRangeError(exp.startDate, exp.endDate)}
                          value={exp.endDate}
                          onChange={(nextValue) =>
                            updateArrayEntry(
                              "experienceEntries",
                              idx,
                              "endDate",
                              nextValue,
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
                        <MonthYearSelect
                          label="Date Issued"
                          value={cert.date}
                          onChange={(nextValue) =>
                            updateArrayEntry(
                              "certifications",
                              idx,
                              "date",
                              nextValue,
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
            id="cv-preview-pane"
            className={`lg:col-span-6 xl:col-span-7 ${
              mobileView === "form" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="sticky top-4">
              <div className="no-print mb-2 flex items-center justify-between text-xs text-gray-500">
                <span>Live Document Preview</span>
                <span>Template: {templatePreference.toUpperCase()}</span>
              </div>

              {/* Document Paper Container */}
              <div
                id="cv-preview-document"
                className="min-h-[297mm] w-full max-w-[210mm] overflow-hidden rounded-xl bg-white p-8 shadow-xl transition-all border border-gray-200"
              >
                {/* Modern Template Layout */}
                {templatePreference === "modern" && (
                  <div className="cv-modern-grid grid gap-6 md:grid-cols-12">
                    {/* Left Column Accent */}
                    <div className="cv-modern-sidebar min-w-0 md:col-span-4 rounded-xl bg-slate-900 p-5 text-white">
                      <h2 className="text-2xl font-black leading-tight text-white break-words">
                        {personalDetails.fullName || "Your Full Name"}
                      </h2>
                      <p className="mt-2 text-xs text-slate-300 break-words">
                        {personalDetails.email}
                      </p>
                      <p className="text-xs text-slate-300 break-words">
                        {personalDetails.phone}
                      </p>
                      <p className="text-xs text-slate-300 break-words">
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
                    <div className="cv-modern-main min-w-0 space-y-5 md:col-span-8">
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
                                    {formatDateRange(exp.startDate, exp.endDate)}
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
                                    {formatDateRange(edu.startDate, edu.endDate)}
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
                                {proj.link && (
                                  <p className="text-xs text-[#5472FC] break-all">
                                    {proj.link}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {certifications.length > 0 && (
                        <div>
                          <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-black uppercase text-[#5472FC]">
                            Certifications
                          </h3>
                          <div className="space-y-2">
                            {certifications.map((cert, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {cert.name}
                                  </p>
                                  <p className="text-gray-600">
                                    {cert.issuer}
                                  </p>
                                  {cert.link && (
                                    <p className="text-[#5472FC] break-all">
                                      {cert.link}
                                    </p>
                                  )}
                                </div>
                                <span className="whitespace-nowrap text-gray-500">
                                  {formatMonthYear(cert.date)}
                                </span>
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
                      <h2 className="text-3xl font-bold tracking-tight text-slate-950 break-words">
                        {personalDetails.fullName || "Your Full Name"}
                      </h2>
                      <p className="mt-1 text-xs text-gray-600 font-sans break-words">
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
                                  {formatDateRange(exp.startDate, exp.endDate)}
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
                                  {edu.gradeOrScore && ` • ${edu.gradeOrScore}`}
                                </p>
                              </div>
                              <span className="text-gray-500 font-medium">
                                {formatDateRange(edu.startDate, edu.endDate)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {projectEntries.length > 0 && (
                      <div>
                        <h3 className="mb-2 border-b border-slate-300 pb-0.5 text-sm font-bold uppercase tracking-wider text-slate-950 font-sans">
                          Projects
                        </h3>
                        <div className="space-y-2 font-sans">
                          {projectEntries.map((proj, idx) => (
                            <div key={idx}>
                              <p className="text-xs font-bold text-slate-900">
                                {proj.name}
                              </p>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {proj.description}
                              </p>
                              {proj.link && (
                                <p className="text-xs text-gray-600 break-all">
                                  {proj.link}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                      <div>
                        <h3 className="mb-2 border-b border-slate-300 pb-0.5 text-sm font-bold uppercase tracking-wider text-slate-950 font-sans">
                          Certifications
                        </h3>
                        <div className="space-y-2 font-sans">
                          {certifications.map((cert, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900">
                                  {cert.name}
                                </span>
                                <p className="text-gray-600">
                                  {cert.issuer}
                                </p>
                                {cert.link && (
                                  <p className="text-gray-600 break-all">
                                    {cert.link}
                                  </p>
                                )}
                              </div>
                              <span className="whitespace-nowrap font-medium text-gray-500">
                                {formatMonthYear(cert.date)}
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

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CvMaker;
