import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api/endpoints";
import {
  Button,
  Card,
  ErrorBanner,
  Input,
  Select,
} from "../components/ui";

/**
 * Post Job Page
 * Multi-field form allowing employers to submit a new job or internship posting.
 * Mirrors Backend/models/opportunity.js schema exactly:
 * title (required), companyName (required), type (job/internship, required),
 * location, workMode (onsite/remote/hybrid), stipendOrSalaryRange, requiredSkills[],
 * suitableCourses[], applicationDeadline (date), description, applicationLink, internalApplication (toggle)
 *
 * Gated behind ProtectedRoute
 * Submits through api.createOpportunity -> POST /opportunities (falls back to mock persistence)
 * Shows a friendly "Submitted for review, pending approval" success screen.
 */

const OPPORTUNITY_TYPE_OPTIONS = [
  { value: "job", label: "Job (Full-time / Part-time)" },
  { value: "internship", label: "Internship" },
];

const WORK_MODE_OPTIONS = [
  { value: "onsite", label: "Onsite (In-office)" },
  { value: "remote", label: "Remote (Work from anywhere)" },
  { value: "hybrid", label: "Hybrid (Flexible)" },
];

function PostJob() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    type: "job",
    location: "",
    workMode: "remote",
    stipendOrSalaryRange: "",
    applicationDeadline: "",
    description: "",
    applicationLink: "",
    internalApplication: true,
  });

  // Array Tag Input States
  const [requiredSkills, setRequiredSkills] = useState([
    "React",
    "JavaScript",
    "Tailwind CSS",
  ]);
  const [skillInput, setSkillInput] = useState("");

  const [suitableCourses, setSuitableCourses] = useState([
    "BCA",
    "B.Sc. CSIT",
    "B.E. Computer",
  ]);
  const [courseInput, setCourseInput] = useState("");

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Field Change Handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Tag Array Add / Remove Handlers
  const handleAddTag = (list, setList, input, setInput) => {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput("");
    }
  };

  const handleRemoveTag = (list, setList, tagToRemove) => {
    setList(list.filter((item) => item !== tagToRemove));
  };

  // Client-Side Form Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Opportunity title is required";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company or Organization name is required";
    }

    if (!formData.type) {
      newErrors.type = "Please select opportunity type (Job or Internship)";
    }

    if (
      formData.applicationLink.trim() &&
      !/^https?:\/\/.+/i.test(formData.applicationLink.trim())
    ) {
      newErrors.applicationLink =
        "Application link should begin with http:// or https://";
    }

    return newErrors;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      ...formData,
      requiredSkills,
      suitableCourses,
      status: "active",
      approvalStatus: "pending",
    };

    try {
      await api.createOpportunity(payload);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit job posting:", err);
      setSubmitError(
        err?.message || "Failed to submit job posting. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen (Pending Approval)
  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] py-12 text-slate-950">
        <div className="mx-auto max-w-2xl px-5">
          <Card className="p-8 text-center sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl border border-amber-200">
              ⏳
            </div>
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 uppercase tracking-wider">
              Pending Approval
            </span>
            <h1 className="mt-4 text-3xl font-black text-slate-950">
              Opportunity Posted!
            </h1>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Your posting for <strong>{formData.title}</strong> at{" "}
              <strong>{formData.companyName}</strong> has been submitted. It is currently pending administrative approval before appearing in public searches.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/jobs")}
              >
                Explore All Opportunities
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    title: "",
                    companyName: "",
                    type: "job",
                    location: "",
                    workMode: "remote",
                    stipendOrSalaryRange: "",
                    applicationDeadline: "",
                    description: "",
                    applicationLink: "",
                    internalApplication: true,
                  });
                  setRequiredSkills([]);
                  setSuitableCourses([]);
                }}
              >
                Post Another Job
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] py-10 text-slate-950">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5472FC]">
            Employer Hub
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Post a Job or Internship
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Connect with qualified students and fresh graduates for your organization.
          </p>
        </div>

        {submitError && (
          <ErrorBanner
            message={submitError}
            onClose={() => setSubmitError(null)}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Position Overview */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Position Overview
            </h2>
            <div className="space-y-4">
              <Input
                label="Opportunity Title *"
                name="title"
                placeholder="e.g. Frontend Developer Intern, Associate Software Engineer"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Company / Organization Name *"
                  name="companyName"
                  placeholder="e.g. TechCorp Nepal"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                  required
                />
                <Select
                  label="Opportunity Type *"
                  name="type"
                  options={OPPORTUNITY_TYPE_OPTIONS}
                  value={formData.type}
                  onChange={handleChange}
                  error={errors.type}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Work Mode"
                  name="workMode"
                  options={WORK_MODE_OPTIONS}
                  value={formData.workMode}
                  onChange={handleChange}
                />
                <Input
                  label="Location"
                  name="location"
                  placeholder="e.g. Kathmandu, Lalitpur, or Remote"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Stipend or Salary Range"
                  name="stipendOrSalaryRange"
                  placeholder="e.g. Rs. 20,000/month or Rs. 500,000 - 800,000/yr"
                  value={formData.stipendOrSalaryRange}
                  onChange={handleChange}
                />
                <Input
                  label="Application Deadline"
                  name="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Skills & Suitable Courses Tag Inputs */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Required Skills & Target Academic Background
            </h2>
            <div className="space-y-6">
              {/* Required Skills */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  Required Skills & Technologies
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. React, Node.js, Python, Figma..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(requiredSkills, setRequiredSkills, skillInput, setSkillInput);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() =>
                      handleAddTag(requiredSkills, setRequiredSkills, skillInput, setSkillInput)
                    }
                  >
                    Add Skill
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#5472FC]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(requiredSkills, setRequiredSkills, skill)}
                        className="text-blue-400 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Suitable Courses */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  Suitable Courses / Backgrounds
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. BCA, B.Sc. CSIT, BE Computer..."
                    value={courseInput}
                    onChange={(e) => setCourseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(suitableCourses, setSuitableCourses, courseInput, setCourseInput);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() =>
                      handleAddTag(suitableCourses, setSuitableCourses, courseInput, setCourseInput)
                    }
                  >
                    Add Course
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suitableCourses.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-800"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(suitableCourses, setSuitableCourses, c)}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Job Description & Application Methods */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Description & Application Method
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-900"
                >
                  Job Description & Responsibilities
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none"
                  placeholder="Outline key responsibilities, role expectations, and company culture..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Application Options */}
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="internalApplication"
                    checked={formData.internalApplication}
                    onChange={handleChange}
                    className="h-5 w-5 cursor-pointer accent-[#5472FC]"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-950">
                      Enable Direct EduPath Applications
                    </span>
                    <p className="text-xs text-gray-500">
                      Allow candidates to submit cover messages and CVs directly on EduPath
                    </p>
                  </div>
                </label>

                <Input
                  label="External Application Link (Optional)"
                  name="applicationLink"
                  placeholder="https://company.com/careers/apply"
                  value={formData.applicationLink}
                  onChange={handleChange}
                  error={errors.applicationLink}
                />
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/jobs")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="bg-[#5472FC] hover:bg-[#435DDE]"
            >
              Submit Job for Review
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default PostJob;
