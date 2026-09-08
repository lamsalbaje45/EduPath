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
 * Post Class Page
 * Multi-field form allowing instructors to submit a new online class listing.
 * Mirrors Backend/models/onlineClass.js schema exactly:
 * classTitle (required), instructorOrOrganization (required), level, mode
 * (live/recorded/self_paced), duration, price, subjects[], certificateAvailability,
 * description, startDate, schedule, enrollmentLink, thumbnail
 *
 * Gated behind ProtectedRoute (instructor/admin)
 * Submits through api.createClass -> POST /classes
 * Shows a friendly "Submitted for review, pending approval" success screen.
 */

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all_levels", label: "All Levels" },
];

const MODE_OPTIONS = [
  { value: "live", label: "Live Interactive" },
  { value: "recorded", label: "Recorded Video" },
  { value: "self_paced", label: "Self-Paced" },
];

const emptyFormData = {
  classTitle: "",
  instructorOrOrganization: "",
  level: "beginner",
  mode: "live",
  duration: "",
  price: "",
  description: "",
  startDate: "",
  schedule: "",
  enrollmentLink: "",
  thumbnail: "",
  certificateAvailability: false,
};

function PostClass() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState(emptyFormData);

  // Array Tag Input State
  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");

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
  const handleAddSubject = () => {
    const trimmed = subjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
      setSubjectInput("");
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setSubjects(subjects.filter((item) => item !== subjectToRemove));
  };

  // Client-Side Form Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.classTitle.trim()) {
      newErrors.classTitle = "Class title is required";
    }

    if (!formData.instructorOrOrganization.trim()) {
      newErrors.instructorOrOrganization = "Instructor / organization name is required";
    }

    if (
      formData.enrollmentLink.trim() &&
      !/^https?:\/\/.+/i.test(formData.enrollmentLink.trim())
    ) {
      newErrors.enrollmentLink = "Enrollment link should begin with http:// or https://";
    }

    if (
      formData.price !== "" &&
      (Number.isNaN(Number(formData.price)) || Number(formData.price) < 0)
    ) {
      newErrors.price = "Price must be a positive number";
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
      price: formData.price === "" ? 0 : Number(formData.price),
      subjects,
    };

    try {
      await api.createClass(payload);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit class listing:", err);
      setSubmitError(
        err?.message || "Failed to submit class listing. Please try again."
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
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 uppercase tracking-wider">
              Pending Approval
            </span>
            <h1 className="mt-4 text-3xl font-black text-slate-950">
              Class Submitted!
            </h1>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Your listing for <strong>{formData.classTitle}</strong> has been submitted. It is currently pending administrative approval before appearing in public searches.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/instructor")}
              >
                Go to Instructor Dashboard
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData(emptyFormData);
                  setSubjects([]);
                }}
              >
                Post Another Class
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
            Instructor Hub
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Post an Online Class
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Share your course with students looking to build new skills.
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
          {/* Section 1: Class Overview */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Class Overview
            </h2>
            <div className="space-y-4">
              <Input
                label="Class Title *"
                name="classTitle"
                placeholder="e.g. Full-Stack JavaScript Masterclass"
                value={formData.classTitle}
                onChange={handleChange}
                error={errors.classTitle}
                required
              />

              <Input
                label="Instructor / Organization *"
                name="instructorOrOrganization"
                placeholder="e.g. EduPath Academy"
                value={formData.instructorOrOrganization}
                onChange={handleChange}
                error={errors.instructorOrOrganization}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Level"
                  name="level"
                  options={LEVEL_OPTIONS}
                  value={formData.level}
                  onChange={handleChange}
                />
                <Select
                  label="Mode"
                  name="mode"
                  options={MODE_OPTIONS}
                  value={formData.mode}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Duration"
                  name="duration"
                  placeholder="e.g. 8 weeks"
                  value={formData.duration}
                  onChange={handleChange}
                />
                <Input
                  label="Price (NPR, 0 for free)"
                  name="price"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.price}
                  onChange={handleChange}
                  error={errors.price}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <Input
                  label="Schedule"
                  name="schedule"
                  placeholder="e.g. Mon / Wed / Fri - 6:00 PM to 8:00 PM"
                  value={formData.schedule}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Subjects Tag Input */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Subjects Covered
            </h2>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="e.g. React, Node.js, MongoDB..."
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="md" onClick={handleAddSubject}>
                Add Subject
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <span
                  key={subject}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#5472FC]"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subject)}
                    className="text-blue-400 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Section 3: Description, Certificate & Enrollment */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Description & Enrollment
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-900"
                >
                  Course Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none"
                  placeholder="Outline what students will learn, prerequisites, and outcomes..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Thumbnail Image URL"
                name="thumbnail"
                placeholder="https://.../thumbnail.png"
                value={formData.thumbnail}
                onChange={handleChange}
              />

              <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="certificateAvailability"
                    checked={formData.certificateAvailability}
                    onChange={handleChange}
                    className="h-5 w-5 cursor-pointer accent-[#5472FC]"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-950">
                      Certificate of Completion Provided
                    </span>
                    <p className="text-xs text-gray-500">
                      Students receive a certificate after finishing the course
                    </p>
                  </div>
                </label>

                <Input
                  label="Enrollment Link (Optional)"
                  name="enrollmentLink"
                  placeholder="https://example.com/enroll"
                  value={formData.enrollmentLink}
                  onChange={handleChange}
                  error={errors.enrollmentLink}
                />
                <p className="text-xs text-gray-500">
                  Leave blank to have students contact you directly through EduPath inquiries.
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/online-classes")}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full bg-[#5472FC] hover:bg-[#435DDE] sm:w-auto"
            >
              Submit Class for Review
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default PostClass;
