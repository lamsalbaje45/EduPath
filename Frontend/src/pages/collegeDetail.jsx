import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import {
  Card,
  Badge,
  Button,
  Input,
  Pagination,
  LoadingSpinner,
  EmptyState,
  ErrorBanner,
} from "../components/ui";

/**
 * College Detail Page
 * Fetches full list and finds college by ID client-side
 * TODO: switch to GET /colleges/:id once backend adds it
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
  const [savedColleges, setSavedColleges] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved colleges from localStorage on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const storageKey = `saved_colleges_${user.id}`;
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setSavedColleges(stored);
      if (id && stored.includes(id)) {
        setIsSaved(true);
      }
    }
  }, [user, isAuthenticated, id]);

  // Fetch college by ID
  const fetchCollege = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch full list and find by ID client-side
      // TODO: switch to GET /colleges/:id once backend adds it
      const response = await api.listColleges({ limit: 100, page: 1 });
      const found = response.data?.find((c) => c._id === id);

      if (!found) {
        setError("College not found");
        setCollege(null);
      } else {
        setCollege(found);
      }
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
      // POST inquiry with name, email, phone, message
      // The endpoint expects collegeId and message, so we'll pass the full message
      const fullMessage = `
Name: ${inquireForm.name}
Email: ${inquireForm.email}
Phone: ${inquireForm.phone || "Not provided"}

Message:
${inquireForm.message}
      `.trim();

      // TODO: Update backend inquiry endpoint to accept targetType and targetRecord
      await api.createInquiry(college._id, fullMessage);

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
  const handleToggleSaveCollege = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const storageKey = `saved_colleges_${user.id}`;
    let updated = [...savedColleges];

    if (isSaved) {
      // Remove from saved
      updated = updated.filter((c) => c !== id);
      setIsSaved(false);
    } else {
      // Add to saved
      updated.push(id);
      setIsSaved(true);
    }

    setSavedColleges(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
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
                    <span className="text-lg">🏫</span>
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
    <main className="bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white shadow-sm">
        {college.images && college.images[0] ? (
          <div className="h-96 w-full overflow-hidden bg-gray-200">
            <img
              src={college.images[0]}
              alt={college.collegeName}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-96 w-full bg-linear-to-r from-[#5472FC]/20 to-[#2551D9]/20" />
        )}
      </div>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        {/* College Info */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-slate-950">
              {college.collegeName}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {college.city}
              {college.affiliation && ` • ${college.affiliation}`}
            </p>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.floor(college.rating)
                        ? "text-amber-400"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="font-semibold text-gray-700">
                {college.rating.toFixed(1)} ({college.rating} stars)
              </span>
            </div>

            {/* Status Badge */}
            <div className="mt-4">
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
          <div className="flex flex-col gap-2 sm:flex-col">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowInquireModal(true)}
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
              {isSaved ? "❤️ Saved" : "🤍 Save College"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-black transition-colors ${
                  activeTab === tab
                    ? "border-[#5472FC] text-[#5472FC]"
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
                  className="h-48 w-full overflow-hidden rounded-xl bg-gray-200 shadow-sm"
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
                ✓ Your inquiry has been submitted successfully. We'll be in
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
