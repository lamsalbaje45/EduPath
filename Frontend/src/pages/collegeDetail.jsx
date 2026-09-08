import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import {
  Card,
  Badge,
  Button,
  Input,
  LoadingSpinner,
  EmptyState,
  ErrorBanner,
} from "../components/ui";
import { Icon, Blob, Reveal, SectionLabel } from "../components/ui/design";

/**
 * College Detail Page
 * Fetches a single college via GET /colleges/:id
 *
 * Features:
 * - Hero header with college info and rating
 * - Tabbed sections: About, Courses, Facilities, Fees, Contact
 * - Image gallery (if multiple images)
 * - Inquire button with modal form
 * - Save college button with heart icon
 */

const TABS = ["About", "Courses", "Facilities", "Fees", "Contact"];

function CollegeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // State
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("About");

  // Inquiry modal
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

  // Save college (heart icon)
  const [isSaved, setIsSaved] = useState(false);

  // Check saved status from the backend on mount
  useEffect(() => {
    if (isAuthenticated && id) {
      api
        .getMySavedItems()
        .then((res) => {
          const saved = res.data?.colleges || [];
          setIsSaved(saved.some((c) => (c._id || c) === id));
        })
        .catch(() => {});
    } else {
      setIsSaved(false);
    }
  }, [user, isAuthenticated, id]);

  // Fetch college by ID
  const fetchCollege = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getCollegeById(id);
      setCollege(response.data || null);
    } catch (err) {
      console.error("Failed to fetch college:", err);
      setError(
        err?.message || "Failed to load college details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCollege();
    }
  }, [id, fetchCollege]);

  // Handle inquire form submission
  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setInquireError(null);
    setInquireSuccess(false);

    if (!inquireForm.name || !inquireForm.email || !inquireForm.message) {
      setInquireError("Please fill in all required fields");
      return;
    }

    setInquireLoading(true);

    try {
      await api.createInquiry({
        targetType: "college",
        targetRecord: college._id,
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

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowInquireModal(false);
        setInquireSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
      setInquireError(
        err?.message || "Failed to submit inquiry. Please try again.",
      );
    } finally {
      setInquireLoading(false);
    }
  };

  // Handle save college
  const handleToggleSaveCollege = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    try {
      if (wasSaved) {
        await api.removeSavedItem("colleges", id);
      } else {
        await api.saveItem("colleges", id);
      }
    } catch (err) {
      console.error("Failed to update saved college:", err);
      setIsSaved(wasSaved);
    }
  };

  // Render tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {college?.description || "No description available"}
            </p>
          </div>
        );

      case "Courses":
        return (
          <div>
            {college?.courses && college.courses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {college.courses.map((course) => (
                  <Badge key={course} variant="primary" size="md">
                    {course}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses listed</p>
            )}
          </div>
        );

      case "Facilities":
        return (
          <div>
            {college?.facilities && college.facilities.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {college.facilities.map((facility) => (
                  <div
                    key={facility}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 p-3"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {facility}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No facilities listed</p>
            )}
          </div>
        );

      case "Fees":
        return (
          <div className="space-y-3">
            {college?.feeRange ? (
              <>
                <p className="text-sm text-gray-600">Annual Fee Range</p>
                <div className="text-2xl font-black text-[#5472FC]">
                  {typeof college.feeRange === "object"
                    ? `Rs. ${college.feeRange.min || "N/A"} - Rs. ${college.feeRange.max || "N/A"}`
                    : `Rs. ${college.feeRange}`}
                </div>
              </>
            ) : (
              <p className="text-gray-500">Fee information not available</p>
            )}
          </div>
        );

      case "Contact":
        return (
          <div className="space-y-3">
            {college?.contactEmail && (
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">Email:</span>
                <a
                  href={`mailto:${college.contactEmail}`}
                  className="text-[#5472FC] hover:underline"
                >
                  {college.contactEmail}
                </a>
              </div>
            )}
            {college?.contactPhone && (
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">Phone:</span>
                <a
                  href={`tel:${college.contactPhone}`}
                  className="text-[#5472FC] hover:underline"
                >
                  {college.contactPhone}
                </a>
              </div>
            )}
            {college?.website && (
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">Website:</span>
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5472FC] hover:underline"
                >
                  {college.website}
                </a>
              </div>
            )}
            {college?.address && (
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700">Address:</span>
                <span className="text-gray-700">{college.address}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-5">
          <LoadingSpinner
            fullScreen={false}
            size="lg"
            message="Loading college details..."
          />
        </div>
      </main>
    );
  }

  if (error || !college) {
    return (
      <main className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-5">
          <EmptyState
            title="College not found"
            message={
              error ||
              "The college you are looking for does not exist or has been removed."
            }
            action="Back to Colleges"
            onAction={() => navigate("/colleges")}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        {college.images && college.images[0] ? (
          <div className="relative h-72 w-full overflow-hidden sm:h-80">
            <img
              src={college.images[0]}
              alt={college.collegeName}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
        ) : (
          <div className="relative flex h-72 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#5472FC] to-[#22308F] sm:h-80">
            <Blob className="-right-10 -top-16 h-64 w-64 animate-blob bg-white/10" />
            <Blob className="-bottom-20 -left-14 h-72 w-72 animate-blob animation-delay-2000 bg-white/10" />
            <Icon name="graduation" className="h-20 w-20 text-white/25 sm:h-28 sm:w-28" />
          </div>
        )}
      </section>

      <div className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        {/* College Info */}
        <Reveal className="relative z-10 -mt-16 mb-8 flex flex-col items-start justify-between gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:-mt-20 sm:flex-row sm:p-8">
          <div className="flex-1">
            <SectionLabel>College</SectionLabel>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {college.collegeName}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
              <Icon name="pin" className="h-4 w-4" />
              {college.city}
              {college.affiliation && ` • ${college.affiliation}`}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {/* Rating */}
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600">
                <Icon name="star" className="h-3.5 w-3.5" />
                {college.rating.toFixed(1)} / 5
              </span>

              {/* Status Badge */}
              <Badge
                variant={
                  college.admissionStatus === "open"
                    ? "success"
                    : college.admissionStatus === "closed"
                      ? "danger"
                      : "warning"
                }
                size="md"
              >
                {college.admissionStatus === "open"
                  ? "Open for Admission"
                  : college.admissionStatus === "closed"
                    ? "Admission Closed"
                    : "Coming Soon"}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-48">
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                isAuthenticated ? setShowInquireModal(true) : navigate("/login")
              }
              className="whitespace-nowrap"
            >
              Inquire Now
            </Button>
            <Button
              variant={isSaved ? "primary" : "outline"}
              size="lg"
              onClick={handleToggleSaveCollege}
              className="whitespace-nowrap"
            >
              {isSaved ? "Saved" : "Save College"}
            </Button>
          </div>
        </Reveal>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-black transition-colors ${
                  activeTab === tab
                    ? "border-[#5472FC] text-[#2551D9]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <Card className="mb-12">{renderTabContent()}</Card>

        {/* Image Gallery (if multiple images) */}
        {college.images && college.images.length > 1 && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-black text-slate-950">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {college.images.map((image, idx) => (
                <div
                  key={idx}
                  className="h-48 w-full overflow-hidden rounded-2xl bg-gray-200 shadow-sm"
                >
                  <img
                    src={image}
                    alt={`${college.collegeName} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <Button
          variant="ghost"
          size="md"
          onClick={() => navigate("/colleges")}
          className="mt-8"
        >
          ← Back to Colleges
        </Button>
      </div>

      {/* Inquire Modal */}
      {showInquireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-950">
                Inquire About {college.collegeName}
              </h2>
              <button
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
                Your inquiry has been submitted successfully. We'll be in
                touch soon!
              </div>
            )}

            {inquireError && (
              <ErrorBanner
                message={inquireError}
                onClose={() => setInquireError(null)}
              />
            )}

            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <Input
                label="Name *"
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
                label="Phone"
                placeholder="Your phone number (optional)"
                value={inquireForm.phone}
                onChange={(e) =>
                  setInquireForm({ ...inquireForm, phone: e.target.value })
                }
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-900">
                  Message *
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1F4FD8] focus:outline-none focus:ring-0"
                  placeholder="What would you like to know about this college?"
                  rows="5"
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

export default CollegeDetail;
