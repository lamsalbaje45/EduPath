import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  LoadingSpinner,
  Select,
} from "../components/ui";

/**
 * Opportunity / Job Detail Page
 * Client-side lookup caveat: filters /opportunities list result by _id
 * TODO: switch to GET /opportunities/:id once backend adds single-item endpoint
 *
 * Features:
 * - Header: title, companyName, type/workMode/status badges, location, stipendOrSalaryRange, application deadline
 * - Body: Description, Required Skills (chips), Suitable Courses (chips), How to apply card
 * - Apply button:
 *   - If applicationLink present -> External link to company site (target="_blank", rel="noopener noreferrer")
 *   - If internalApplication true & applicationLink empty -> Internal apply flow (modal with cover message + CV selection)
 *   - If unauthenticated -> Redirect to /login preserving return path
 * - Save / Bookmark pattern: localStorage-backed saved jobs per user ID
 */

const toTitleCase = (value) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";

const formatDeadline = (deadline) => {
  if (!deadline) return "No deadline listed";

  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "No deadline listed";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const isOpportunityClosed = (opportunity) => {
  if (opportunity.status !== "active") return true;
  if (!opportunity.applicationDeadline) return false;

  const deadline = new Date(opportunity.applicationDeadline).getTime();
  return !Number.isNaN(deadline) && deadline < Date.now();
};

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // State
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bookmark / Save job state
  const [savedJobs, setSavedJobs] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // Apply modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverMessage, setCoverMessage] = useState("");
  const [cv, setCv] = useState(null);
  const [selectedCvReference, setSelectedCvReference] = useState("");
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const returnPath = `${location.pathname}${location.search}`;

  // Load saved jobs from localStorage on mount or auth change
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setSavedJobs([]);
      setIsSaved(false);
      return;
    }

    const storageKey = `saved_jobs_${user.id}`;
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    setSavedJobs(stored);
    setIsSaved(stored.includes(id));
  }, [id, isAuthenticated, user]);

  // Fetch opportunity details
  // Client-side lookup caveat: filters /opportunities list result by _id
  // TODO: switch to GET /opportunities/:id once backend adds single-item endpoint
  const fetchOpportunity = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.listOpportunities({ limit: 100, page: 1 });
      const found = response.data?.find((item) => item._id === id);

      if (!found) {
        setOpportunity(null);
        setError("Opportunity not found");
      } else {
        setOpportunity(found);
      }
    } catch (err) {
      console.error("Failed to fetch opportunity:", err);
      setError(
        err?.message || "Failed to load opportunity details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchOpportunity();
  }, [fetchOpportunity, id]);

  // Fetch user CV data for application
  const loadCv = useCallback(async () => {
    setCvLoading(true);
    setCvError(null);

    try {
      const response = await api.getCv();
      const cvData = response.data || null;
      setCv(cvData);
      setSelectedCvReference(cvData?._id || cvData?.id || "");
    } catch (err) {
      console.error("Failed to load CV:", err);
      setCv(null);
      setSelectedCvReference("");
      setCvError("Could not load your CV. You can still submit your cover message.");
    } finally {
      setCvLoading(false);
    }
  }, []);

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setApplicationError(null);
    setApplicationSuccess(false);
  };

  // Open apply flow (redirects to /login if unauthenticated)
  const openApplicationFlow = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: returnPath } });
      return;
    }

    setShowApplicationModal(true);
    setApplicationError(null);
    setApplicationSuccess(false);
    loadCv();
  };

  // Bookmark / Save toggle handler
  const handleToggleSaveJob = () => {
    if (!isAuthenticated || !user?.id) {
      navigate("/login", { state: { from: returnPath } });
      return;
    }

    const storageKey = `saved_jobs_${user.id}`;
    const updated = isSaved
      ? savedJobs.filter((jobId) => jobId !== id)
      : [...savedJobs, id];

    setSavedJobs(updated);
    setIsSaved(!isSaved);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Submit internal application
  const handleSubmitApplication = async (event) => {
    event.preventDefault();
    setApplicationError(null);

    if (!opportunity) return;

    setApplicationLoading(true);

    try {
      await api.createApplication({
        opportunityId: opportunity._id,
        coverMessage: coverMessage.trim(),
        cvReference: selectedCvReference || undefined,
        cvSnapshot: selectedCvReference ? cv : undefined,
      });
      setApplicationSuccess(true);
      setCoverMessage("");
    } catch (err) {
      console.error("Failed to submit application:", err);
      setApplicationError(
        err?.message || "Failed to submit your application. Please try again.",
      );
    } finally {
      setApplicationLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-5">
          <LoadingSpinner
            fullScreen={false}
            size="lg"
            message="Loading opportunity details..."
          />
        </div>
      </main>
    );
  }

  if (error || !opportunity) {
    return (
      <main className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-5">
          <EmptyState
            title="Opportunity not found"
            message={
              error ||
              "The opportunity you are looking for does not exist or has been removed."
            }
            action="Back to Jobs"
            onAction={() => navigate("/jobs")}
          />
        </div>
      </main>
    );
  }

  const isClosed = isOpportunityClosed(opportunity);
  const statusLabel = isClosed ? "Closed" : toTitleCase(opportunity.status);
  const cvReference = cv?._id || cv?.id;
  const hasExternalApplication = Boolean(opportunity.applicationLink);
  const canApplyInternally =
    opportunity.internalApplication && !hasExternalApplication;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div className="max-w-3xl">
              <p className="mb-2 text-lg font-semibold text-gray-600">
                {opportunity.companyName}
              </p>
              <h1 className="text-4xl font-black text-slate-950">
                {opportunity.title}
              </h1>

              {/* Badges: Type / WorkMode / Status */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="primary" size="md">
                  {toTitleCase(opportunity.type)}
                </Badge>
                {opportunity.workMode && (
                  <Badge variant="secondary" size="md">
                    {toTitleCase(opportunity.workMode)}
                  </Badge>
                )}
                <Badge
                  variant={
                    statusLabel === "Active"
                      ? "success"
                      : statusLabel === "Draft"
                        ? "warning"
                        : "danger"
                  }
                  size="md"
                >
                  {statusLabel}
                </Badge>
              </div>

              {/* Meta details: Location / Compensation / Deadline */}
              <div className="mt-5 space-y-1.5 text-sm text-gray-700">
                {opportunity.location && (
                  <p className="flex items-center gap-1">
                    <span>📍 Location:</span>
                    <span className="font-medium text-slate-900">
                      {opportunity.location}
                    </span>
                  </p>
                )}
                {opportunity.stipendOrSalaryRange && (
                  <p className="flex items-center gap-1">
                    <span>💵 Stipend / Salary:</span>
                    <span className="font-semibold text-slate-950">
                      {opportunity.stipendOrSalaryRange}
                    </span>
                  </p>
                )}
                <p className="flex items-center gap-1">
                  <span>⏳ Deadline:</span>
                  <span className="font-medium text-slate-900">
                    {formatDeadline(opportunity.applicationDeadline)}
                    {isClosed && " (Closed)"}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full flex-col gap-2.5 sm:w-auto">
              {hasExternalApplication ? (
                <a
                  href={opportunity.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#5472FC] px-6 py-3 text-base font-black text-white shadow-sm transition-all hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
                >
                  Apply on company site ↗
                </a>
              ) : canApplyInternally ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={openApplicationFlow}
                  disabled={isClosed}
                  className="whitespace-nowrap"
                >
                  {isClosed ? "Applications closed" : "Apply now"}
                </Button>
              ) : (
                <Button variant="secondary" size="lg" disabled>
                  Applications unavailable
                </Button>
              )}

              <Button
                variant={isSaved ? "primary" : "outline"}
                size="lg"
                onClick={handleToggleSaveJob}
                className="whitespace-nowrap"
              >
                {isSaved ? "❤️ Saved" : "🤍 Save Job"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main details column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <Card>
              <h2 className="mb-4 text-2xl font-black text-slate-950">
                Description
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-700">
                {opportunity.description || "No description provided for this opportunity."}
              </p>
            </Card>

            {/* Required Skills */}
            <Card>
              <h2 className="mb-4 text-2xl font-black text-slate-950">
                Required Skills
              </h2>
              {opportunity.requiredSkills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {opportunity.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="primary" size="md">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No required skills listed.</p>
              )}
            </Card>

            {/* Suitable Courses */}
            <Card>
              <h2 className="mb-4 text-2xl font-black text-slate-950">
                Suitable Courses
              </h2>
              {opportunity.suitableCourses?.length ? (
                <div className="flex flex-wrap gap-2">
                  {opportunity.suitableCourses.map((course) => (
                    <Badge key={course} variant="secondary" size="md">
                      {course}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No suitable courses specified.</p>
              )}
            </Card>
          </div>

          {/* How to Apply Sidebar */}
          <Card className="h-fit lg:sticky lg:top-4">
            <h2 className="mb-3 text-xl font-black text-slate-950">
              How to Apply
            </h2>
            {hasExternalApplication ? (
              <p className="text-sm leading-relaxed text-gray-700">
                This opportunity requires applying through the company&apos;s
                official website. Click the button above to open their application portal.
              </p>
            ) : canApplyInternally ? (
              <p className="text-sm leading-relaxed text-gray-700">
                You can apply directly through EduPath. Click <strong>Apply now</strong> to submit a cover message and attach your CV from CV Maker.
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-gray-700">
                This opportunity is currently not accepting applications.
              </p>
            )}
          </Card>
        </div>

        {/* Back navigation */}
        <Button
          variant="ghost"
          size="md"
          onClick={() => navigate("/jobs")}
          className="mt-8"
        >
          ← Back to Jobs
        </Button>
      </div>

      {/* Internal Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Apply for Opportunity
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {opportunity.title} at {opportunity.companyName}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close application modal"
                onClick={closeApplicationModal}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {applicationSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 p-3.5 text-sm font-medium text-green-700">
                ✓ Your application has been submitted successfully!
              </div>
            )}
            {applicationError && (
              <ErrorBanner
                message={applicationError}
                onClose={() => setApplicationError(null)}
                className="mb-4"
              />
            )}

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label
                  htmlFor="cover-message"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Cover Message
                </label>
                <textarea
                  id="cover-message"
                  rows="6"
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit for this position..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none focus:ring-0"
                />
              </div>

              <div>
                <label
                  htmlFor="cv-selection"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Attach CV
                </label>
                {cvLoading ? (
                  <div className="rounded-xl border border-gray-200 p-3">
                    <LoadingSpinner size="sm" message="Loading your CV..." />
                  </div>
                ) : (
                  <Select
                    id="cv-selection"
                    value={selectedCvReference}
                    onChange={(e) => setSelectedCvReference(e.target.value)}
                    placeholder="Apply without attaching a CV"
                    options={
                      cv && cvReference
                        ? [
                            {
                              value: cvReference,
                              label: cv.title || "CV from CV Maker",
                            },
                          ]
                        : []
                    }
                  />
                )}
                {cvError && <p className="mt-2 text-xs text-amber-700">{cvError}</p>}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={closeApplicationModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={applicationLoading}
                  className="flex-1"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </main>
  );
}

export default JobDetail;
