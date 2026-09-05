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
 * List College Page
 * Multi-field form allowing college owners/administrators to submit a new college listing.
 * Mirrors Backend/models/college.js schema exactly:
 * collegeName (required), city (required), address, affiliation, courses[],
 * feeRange, facilities[], admissionStatus, description, contactEmail, contactPhone, website, images[]
 *
 * Gated behind ProtectedRoute
 * Submits through api.createCollege -> POST /colleges (falls back to mock persistence)
 * Shows a friendly "Submitted for review, pending approval" success screen.
 */

const ADMISSION_STATUS_OPTIONS = [
  { value: "open", label: "Open for Admissions" },
  { value: "closed", label: "Admissions Closed" },
  { value: "coming_soon", label: "Coming Soon" },
];

function ListCollege() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    collegeName: "",
    city: "",
    address: "",
    affiliation: "",
    feeRange: "",
    admissionStatus: "open",
    description: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
  });

  // Array Tag Input States
  const [courses, setCourses] = useState([
    "Computer Science (BCA)",
    "Business Administration (BBA)",
  ]);
  const [courseInput, setCourseInput] = useState("");

  const [facilities, setFacilities] = useState([
    "Digital Library",
    "Computer Labs",
    "Sports Complex",
  ]);
  const [facilityInput, setFacilityInput] = useState("");

  const [images, setImages] = useState([]);
  const [imageInput, setImageInput] = useState("");

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Field Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = "College name is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (
      formData.contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())
    ) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    if (
      formData.website.trim() &&
      !/^https?:\/\/.+/i.test(formData.website.trim())
    ) {
      newErrors.website = "Website URL should begin with http:// or https://";
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
      courses,
      facilities,
      images,
      approvalStatus: "pending",
    };

    try {
      await api.createCollege(payload);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit college listing:", err);
      setSubmitError(
        err?.message || "Failed to submit college listing. Please try again."
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
              College Listing Submitted!
            </h1>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Thank you for listing <strong>{formData.collegeName}</strong>. Your submission has been received and is currently under administrative review. Once approved, it will be published to all students on EduPath.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/colleges")}
              >
                Explore All Colleges
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    collegeName: "",
                    city: "",
                    address: "",
                    affiliation: "",
                    feeRange: "",
                    admissionStatus: "open",
                    description: "",
                    contactEmail: "",
                    contactPhone: "",
                    website: "",
                  });
                  setCourses([]);
                  setFacilities([]);
                  setImages([]);
                }}
              >
                List Another College
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
            Partner Program
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            List Your College
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Reach thousands of prospective students across Nepal by adding your institution to EduPath.
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
          {/* Section 1: Basic Information */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                label="College Name *"
                name="collegeName"
                placeholder="e.g. Kathmandu Tech College"
                value={formData.collegeName}
                onChange={handleChange}
                error={errors.collegeName}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="City *"
                  name="city"
                  placeholder="e.g. Kathmandu"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  required
                />
                <Input
                  label="Affiliation"
                  name="affiliation"
                  placeholder="e.g. Tribhuvan University, Pokhara University"
                  value={formData.affiliation}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Full Address"
                name="address"
                placeholder="e.g. Maitighar, Kathmandu"
                value={formData.address}
                onChange={handleChange}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Estimated Fee Range"
                  name="feeRange"
                  placeholder="e.g. Rs. 400,000 - Rs. 800,000"
                  value={formData.feeRange}
                  onChange={handleChange}
                />
                <Select
                  label="Admission Status"
                  name="admissionStatus"
                  options={ADMISSION_STATUS_OPTIONS}
                  value={formData.admissionStatus}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Courses & Facilities Tag Inputs */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Courses & Facilities
            </h2>
            <div className="space-y-6">
              {/* Offered Courses */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  Offered Courses / Programmes
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. BSc Computer Science, BBA..."
                    value={courseInput}
                    onChange={(e) => setCourseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(courses, setCourses, courseInput, setCourseInput);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() =>
                      handleAddTag(courses, setCourses, courseInput, setCourseInput)
                    }
                  >
                    Add Course
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courses.map((course) => (
                    <span
                      key={course}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#5472FC]"
                    >
                      {course}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(courses, setCourses, course)}
                        className="text-blue-400 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Campus Facilities */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  Campus Facilities
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. Auditorium, Sports Ground, Hostel..."
                    value={facilityInput}
                    onChange={(e) => setFacilityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(facilities, setFacilities, facilityInput, setFacilityInput);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() =>
                      handleAddTag(facilities, setFacilities, facilityInput, setFacilityInput)
                    }
                  >
                    Add Facility
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((fac) => (
                    <span
                      key={fac}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-800"
                    >
                      {fac}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(facilities, setFacilities, fac)}
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

          {/* Section 3: Description, Contact & Media */}
          <Card>
            <h2 className="mb-4 text-xl font-black text-slate-950">
              Description & Contact Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-900"
                >
                  College Overview & Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none"
                  placeholder="Describe your college history, vision, campus environment, and achievements..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  placeholder="admissions@college.edu.np"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  error={errors.contactEmail}
                />
                <Input
                  label="Contact Phone"
                  name="contactPhone"
                  placeholder="+977 01-4455667"
                  value={formData.contactPhone}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Official Website URL"
                name="website"
                placeholder="https://www.college.edu.np"
                value={formData.website}
                onChange={handleChange}
                error={errors.website}
              />

              {/* Image URLs Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  Campus Photo URLs
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(images, setImages, imageInput, setImageInput);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() =>
                      handleAddTag(images, setImages, imageInput, setImageInput)
                    }
                  >
                    Add Photo URL
                  </Button>
                </div>
                {images.length > 0 && (
                  <div className="space-y-1">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-700 border border-gray-200"
                      >
                        <span className="truncate max-w-md">{img}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(images, setImages, img)}
                          className="font-bold text-rose-600 hover:underline ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/colleges")}
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
              Submit Listing for Review
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ListCollege;
