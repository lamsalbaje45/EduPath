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
import { Icon, Blob, Reveal, SectionLabel } from "../components/ui/design";

/**
 * Online Class Detail Page
 * Fetches a single class via GET /classes/:id
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
  const { user, isAuthenticated } = useAuth();

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

  const fetchClassDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getClassById(id);
      setOnlineClass(response.data || null);
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
      await api.createInquiry({
        targetType: "instructor",
        targetRecord: onlineClass._id,
        message: inquireForm.message,
        phone: inquireForm.phone,
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
    <main className="bg-white">
      {/* Hero Banner */}
      <section className="relative flex h-56 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600 to-violet-900 sm:h-64">
        <Blob className="-right-10 -top-16 h-64 w-64 animate-blob bg-white/10" />
        <Blob className="-bottom-20 -left-14 h-72 w-72 animate-blob animation-delay-2000 bg-white/10" />
        <Icon name="laptop" className="h-20 w-20 text-white/20 sm:h-24 sm:w-24" />
      </section>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Header Card */}
        <Reveal className="relative z-10 -mt-16 mb-8 flex flex-col items-start justify-between gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:-mt-20 sm:flex-row sm:p-8">
          <div className="max-w-3xl">
            <SectionLabel>Online Class</SectionLabel>
            <p className="mb-2 text-base font-semibold text-slate-500">
              {onlineClass.instructorOrOrganization}
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
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
                  Certificate Provided
                </Badge>
              )}
            </div>

            {/* Meta information */}
            <div className="mt-5 space-y-1.5 text-sm text-slate-600">
              {onlineClass.duration && (
                <p className="flex items-center gap-1.5">
                  <Icon name="clock" className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold text-slate-900">
                    {onlineClass.duration}
                  </span>
                </p>
              )}
              <p className="flex items-center gap-1.5">
                <Icon name="target" className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-900">
                  {formatStartDate(onlineClass.startDate)}
                </span>
              </p>
              {onlineClass.schedule && (
                <p className="flex items-center gap-1.5">
                  <Icon name="pin" className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-900">
                    {onlineClass.schedule}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-48">
            {hasEnrollmentLink ? (
              <a
                href={onlineClass.enrollmentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#5472FC] px-6 py-3 text-sm font-black text-white shadow-sm shadow-[#5472FC]/30 transition-all hover:-translate-y-0.5 hover:bg-[#435DDE] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
              >
                Enroll Now ↗
              </a>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() =>
                  isAuthenticated ? setShowInquireModal(true) : navigate("/login")
                }
                className="whitespace-nowrap"
              >
                Contact for Enrollment
              </Button>
            )}
          </div>
        </Reveal>

        {/* Main Body Content */}
        <div className="pb-16">
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
                    <span>Certificate Included</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                    You will receive an official verifiable certificate of completion upon successfully finishing this course.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-4 text-gray-700 border border-gray-200">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
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
                Your inquiry has been sent to the instructor. They will contact you shortly!
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
