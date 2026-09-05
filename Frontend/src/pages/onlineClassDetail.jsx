import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Input,
  LoadingSpinner,
} from "../components/ui";

/**
 * Online Class Detail Page
 * Client-side lookup caveat: filters /classes list result by _id
 * TODO: switch to GET /classes/:id once backend adds single-item endpoint
 *
 * Features:
 * - Header: classTitle, instructorOrOrganization, level/mode/price badges, duration, startDate, schedule
 * - Body: Description, Schedule, Subjects (chips), Certificate Availability callout box
 * - Enroll button:
 *   - External link if enrollmentLink is present (target="_blank", rel="noopener noreferrer")
 *   - Inquiry modal ("Contact for enrollment") if enrollmentLink is empty (targetType: 'instructor')
 */

const formatLevel = (level) => {
  if (!level) return "";
  if (level === "all_levels") return "All Levels";
  return level.charAt(0).toUpperCase() + level.slice(1);
};

const formatMode = (mode) => {
  if (!mode) return "";
  if (mode === "self_paced") return "Self-Paced";
  return mode.charAt(0).toUpperCase() + mode.slice(1);
};

const formatPrice = (price) => {
  if (price === 0 || price === "0" || !price) {
    return "Free";
  }
  return `Rs. ${Number(price).toLocaleString()}`;
};

const formatStartDate = (startDate) => {
  if (!startDate) return "Flexible / Self-Paced";

  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return "Flexible / Self-Paced";

  const formatted = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const now = Date.now();
  const startMs = date.getTime();
  if (startMs > now) {
    const daysLeft = Math.ceil((startMs - now) / (1000 * 60 * 60 * 24));
    return `${formatted} (Starts in ${daysLeft} day${daysLeft === 1 ? "" : "s"})`;
  }

  return formatted;
};

function OnlineClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [onlineClass, setOnlineClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inquiry modal state (Contact for enrollment)
  const [showInquireModal, setShowInquireModal] = useState(false);
  const [inquireForm, setInquireForm] = useState({
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [inquireLoading, setInquireLoading] = useState(false);
  const [inquireError, setInquireError] = useState(null);
  const [inquireSuccess, setInquireSuccess] = useState(false);

  // Client-side lookup caveat: filters /classes list result by _id
  // TODO: switch to GET /classes/:id once backend adds single-item endpoint
  const fetchClassDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.listClasses({ limit: 100, page: 1 });
      const found = response.data?.find((c) => c._id === id);

      if (!found) {
        setError("Online class not found");
        setOnlineClass(null);
      } else {
        setOnlineClass(found);
      }
    } catch (err) {
      console.error("Failed to fetch class details:", err);
      setError(
        err?.message || "Failed to load class details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchClassDetail();
  }, [fetchClassDetail, id]);

  // Handle enrollment inquiry submission (targetType: 'instructor')
  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setInquireError(null);
    setInquireSuccess(false);

    if (!inquireForm.name || !inquireForm.email || !inquireForm.message) {
      setInquireError("Please fill in all required fields.");
      return;
    }

    setInquireLoading(true);

    try {
      const fullMessage = `
Class Enrollment Inquiry: ${onlineClass.classTitle}
Name: ${inquireForm.name}
Email: ${inquireForm.email}
Phone: ${inquireForm.phone || "Not provided"}

Message:
${inquireForm.message}
      `.trim();

      await api.createInquiry({
        targetType: "instructor",
        targetRecord: onlineClass._id,
        collegeId: onlineClass._id, // fallback for legacy endpoint fields
        studentName: inquireForm.name,
        email: inquireForm.email,
        phone: inquireForm.phone,
        message: fullMessage,
      });

      setInquireSuccess(true);
      setInquireForm({
        name:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : "",
        email: user?.email || "",
        phone: "",
        message: "",
      });

      setTimeout(() => {
        setShowInquireModal(false);
        setInquireSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to submit enrollment inquiry:", err);
      setInquireError(
        err?.message || "Failed to submit inquiry. Please try again.",
      );
    } finally {
      setInquireLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-5">
          <LoadingSpinner
            fullScreen={false}
            size="lg"
            message="Loading class details..."
          />
        </div>
      </main>
    );
  }

  if (error || !onlineClass) {
    return (
      <main className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-5">
          <EmptyState
            title="Class not found"
            message={
              error ||
              "The online class you are looking for does not exist or has been removed."
            }
            action="Back to Online Classes"
            onAction={() => navigate("/online-classes")}
          />
        </div>
      </main>
    );
  }

  const isFree =
    onlineClass.price === 0 ||
    onlineClass.price === "0" ||
    !onlineClass.price;

  const hasEnrollmentLink = Boolean(onlineClass.enrollmentLink);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div className="max-w-3xl">
              <p className="mb-2 text-lg font-semibold text-gray-600">
                {onlineClass.instructorOrOrganization}
              </p>
              <h1 className="text-4xl font-black text-slate-950">
                {onlineClass.classTitle}
              </h1>

              {/* Badges: Level / Mode / Price / Certificate */}
              <div className="mt-4 flex flex-wrap gap-2">
                {onlineClass.mode && (
                  <Badge variant="primary" size="md">
                    {formatMode(onlineClass.mode)}
                  </Badge>
                )}
                {onlineClass.level && (
                  <Badge variant="secondary" size="md">
                    {formatLevel(onlineClass.level)}
                  </Badge>
                )}
                {isFree ? (
                  <Badge variant="success" size="md">
                    Free
                  </Badge>
                ) : (
                  <Badge variant="outline" size="md">
                    {formatPrice(onlineClass.price)}
                  </Badge>
                )}
                {onlineClass.certificateAvailability && (
                  <Badge variant="warning" size="md">
                    🎓 Certificate Provided
                  </Badge>
                )}
              </div>

              {/* Meta information */}
              <div className="mt-5 space-y-1.5 text-sm text-gray-700">
                {onlineClass.duration && (
                  <p className="flex items-center gap-2">
                    <span>⏱️ Duration:</span>
                    <span className="font-semibold text-slate-900">
                      {onlineClass.duration}
                    </span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span>📅 Start Date:</span>
                  <span className="font-semibold text-slate-900">
                    {formatStartDate(onlineClass.startDate)}
                  </span>
                </p>
                {onlineClass.schedule && (
                  <p className="flex items-center gap-2">
                    <span>🗓️ Schedule:</span>
                    <span className="font-medium text-slate-900">
                      {onlineClass.schedule}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full flex-col gap-2.5 sm:w-auto">
              {hasEnrollmentLink ? (
                <a
                  href={onlineClass.enrollmentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#5472FC] px-6 py-3 text-base font-black text-white shadow-sm transition-all hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
                >
                  Enroll Now ↗
                </a>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowInquireModal(true)}
                  className="whitespace-nowrap"
                >
                  Contact for Enrollment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <Card>
              <h2 className="mb-4 text-2xl font-black text-slate-950">
                Course Description
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-700">
                {onlineClass.description ||
                  "No detailed description provided for this class."}
              </p>
            </Card>

            {/* Subjects & Curriculum Tags */}
            <Card>
              <h2 className="mb-4 text-2xl font-black text-slate-950">
                Covered Subjects & Topics
              </h2>
              {onlineClass.subjects?.length ? (
                <div className="flex flex-wrap gap-2">
                  {onlineClass.subjects.map((subj) => (
                    <Badge key={subj} variant="primary" size="md">
                      {subj}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No subjects listed.</p>
              )}
            </Card>

            {/* Schedule & Logistics */}
            {onlineClass.schedule && (
              <Card>
                <h2 className="mb-4 text-2xl font-black text-slate-950">
                  Schedule & Timing
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {onlineClass.schedule}
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certificate Callout Card */}
            <Card>
              <h3 className="mb-3 text-lg font-black text-slate-950">
                Certificate Availability
              </h3>
              {onlineClass.certificateAvailability ? (
                <div className="rounded-xl bg-amber-50 p-4 text-amber-900 border border-amber-200/60">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <span className="text-xl">🎓</span>
                    <span>Certificate Included</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                    You will receive an official verifiable certificate of completion upon successfully finishing this course.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-4 text-gray-700 border border-gray-200">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span>📜</span>
                    <span>No Certificate Offered</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                    This course focuses purely on knowledge delivery and does not issue a formal certificate.
                  </p>
                </div>
              )}
            </Card>

            {/* Enrollment Callout Card */}
            <Card>
              <h3 className="mb-3 text-lg font-black text-slate-950">
                Enrollment Info
              </h3>
              {hasEnrollmentLink ? (
                <p className="text-sm text-gray-700 leading-relaxed">
                  Click <strong>Enroll Now</strong> above to complete your registration directly on the instructor&apos;s learning platform.
                </p>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">
                  Click <strong>Contact for Enrollment</strong> to send an inquiry directly to the instructor or organization.
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Back navigation */}
        <Button
          variant="ghost"
          size="md"
          onClick={() => navigate("/online-classes")}
          className="mt-8"
        >
          ← Back to Online Classes
        </Button>
      </div>

      {/* Contact for Enrollment Inquiry Modal */}
      {showInquireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-950">
                Contact Instructor
              </h2>
              <button
                type="button"
                aria-label="Close inquiry modal"
                onClick={() => {
                  setShowInquireModal(false);
                  setInquireError(null);
                  setInquireSuccess(false);
                }}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {inquireSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                ✓ Your inquiry has been sent to the instructor. They will contact you shortly!
              </div>
            )}

            {inquireError && (
              <ErrorBanner
                message={inquireError}
                onClose={() => setInquireError(null)}
                className="mb-4"
              />
            )}

            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="Your full name"
                value={inquireForm.name}
                onChange={(e) =>
                  setInquireForm({ ...inquireForm, name: e.target.value })
                }
                required
              />

              <Input
                label="Email *"
                type="email"
                placeholder="your.email@example.com"
                value={inquireForm.email}
                onChange={(e) =>
                  setInquireForm({ ...inquireForm, email: e.target.value })
                }
                required
              />

              <Input
                label="Phone Number"
                placeholder="Your phone number (optional)"
                value={inquireForm.phone}
                onChange={(e) =>
                  setInquireForm({ ...inquireForm, phone: e.target.value })
                }
              />

              <div className="space-y-1">
                <label
                  htmlFor="inquiry-message"
                  className="block text-sm font-medium text-gray-900"
                >
                  Message *
                </label>
                <textarea
                  id="inquiry-message"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none focus:ring-0"
                  placeholder="Ask about schedule, fee details, prerequisites..."
                  rows="4"
                  value={inquireForm.message}
                  onChange={(e) =>
                    setInquireForm({ ...inquireForm, message: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => {
                    setShowInquireModal(false);
                    setInquireError(null);
                    setInquireSuccess(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={inquireLoading}
                  className="flex-1"
                >
                  Submit Inquiry
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </main>
  );
}

export default OnlineClassDetail;
