import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Select,
} from "../components/ui";

/**
 * College Admin Dashboard Page
 * Gated behind ProtectedRoute allowedRoles=['college_admin']
 *
 * Sections:
 * 1. Overview — Stat summary cards & inquiry status breakdown
 * 2. My Listings — Colleges table with Edit, Open/Close admissions, Delete, and "List New College"
 * 3. Inquiries Inbox — Student inquiries about owned colleges, with status updates
 */

const ADMISSION_STATUS_OPTIONS = [
  { value: "open", label: "Open for Admissions" },
  { value: "closed", label: "Admissions Closed" },
  { value: "coming_soon", label: "Coming Soon" },
];

function getApprovalBadgeVariant(status) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "secondary";
  }
}

function getInquiryBadgeVariant(status) {
  switch (status?.toLowerCase()) {
    case "replied":
      return "success";
    case "read":
      return "primary";
    case "closed":
      return "secondary";
    default:
      return "warning";
  }
}

function CollegeAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab: 'overview' | 'listings' | 'inquiries'
  const [activeTab, setActiveTab] = useState("overview");

  // Data States
  const [colleges, setColleges] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit College Modal State
  const [editingCollege, setEditingCollege] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingCollege, setDeletingCollege] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingCollege, setTogglingCollege] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Inquiries Inbox Filters
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);

  // Fetch owned colleges & received inquiries
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUserId = user?._id || user?.id;
      const [collegeRes, inquiryRes] = await Promise.all([
        api.listColleges({ owner: currentUserId }),
        api.getReceivedInquiries(),
      ]);

      setColleges(collegeRes.data || []);
      setInquiries(inquiryRes.data || []);
    } catch (err) {
      console.error("Failed to load college admin dashboard data:", err);
      setError(err?.message || "Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Edit Modal Open Handler
  const handleOpenEdit = (college) => {
    setEditingCollege(college);
    setEditFormData({
      collegeName: college.collegeName || "",
      city: college.city || "",
      address: college.address || "",
      affiliation: college.affiliation || "",
      feeRange: college.feeRange || "",
      admissionStatus: college.admissionStatus || "open",
      description: college.description || "",
      contactEmail: college.contactEmail || "",
      contactPhone: college.contactPhone || "",
      website: college.website || "",
    });
  };

  // Edit College Form Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCollege) return;
    const id = editingCollege._id || editingCollege.id;
    setSavingEdit(true);

    try {
      await api.updateCollege(id, editFormData);
      setColleges((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? { ...c, ...editFormData } : c))
      );
      setSuccessMessage(`Updated listing "${editFormData.collegeName}" successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setEditingCollege(null);
    } catch (err) {
      console.error("Failed to update college:", err);
      setError(err?.message || "Failed to update listing.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle Admission Status (Open <-> Closed)
  const handleConfirmToggleAdmissionStatus = async () => {
    if (!togglingCollege) return;
    const id = togglingCollege._id || togglingCollege.id;
    const newStatus = togglingCollege.admissionStatus === "closed" ? "open" : "closed";
    setTogglingStatus(true);

    try {
      await api.updateCollege(id, { admissionStatus: newStatus });
      setColleges((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? { ...c, admissionStatus: newStatus } : c))
      );
      setSuccessMessage(`Admissions for "${togglingCollege.collegeName}" set to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setTogglingCollege(null);
    } catch (err) {
      console.error("Failed to toggle admission status:", err);
      setError(err?.message || "Failed to change admission status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  // Confirm Delete Listing
  const handleConfirmDelete = async () => {
    if (!deletingCollege) return;
    const id = deletingCollege._id || deletingCollege.id;
    setDeleting(true);

    try {
      await api.deleteCollege(id);
      setColleges((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setSuccessMessage(`Deleted listing "${deletingCollege.collegeName}" successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setDeletingCollege(null);
    } catch (err) {
      console.error("Failed to delete college:", err);
      setError(err?.message || "Failed to delete listing.");
    } finally {
      setDeleting(false);
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    setUpdatingInquiryId(inquiryId);

    try {
      await api.updateInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((i) => ((i._id || i.id) === inquiryId ? { ...i, status: newStatus } : i))
      );
      setSuccessMessage(`Inquiry status updated to "${newStatus}".`);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
      setError(err?.message || "Failed to update inquiry status.");
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  // Calculate Metrics for Overview
  const totalListings = colleges.length;
  const approvedListings = colleges.filter((c) => c.approvalStatus === "approved").length;
  const totalInquiries = inquiries.length;

  const inquiryStatusCounts = {
    new: inquiries.filter((i) => (i.status || "new") === "new").length,
    read: inquiries.filter((i) => i.status === "read").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  // Filtered Inquiries for Inbox
  const filteredInboxInquiries = inquiries.filter((inq) => {
    const matchesCollege =
      selectedCollegeFilter === "all" || String(inq.targetRecord) === selectedCollegeFilter;
    const matchesStatus =
      selectedStatusFilter === "all" || (inq.status || "new").toLowerCase() === selectedStatusFilter;
    return matchesCollege && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#F7F8FA] pb-16 text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-0">
        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5472FC]">
              College Admin Hub
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              College Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, <strong>{user?.firstName || "Admin"}</strong>! Manage your college listings and respond to student inquiries.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/list-college")}
            className="bg-[#5472FC] hover:bg-[#435DDE]"
          >
            + List New College
          </Button>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            {successMessage}
          </div>
        )}
        {error && (
          <ErrorBanner message={error} onClose={() => setError(null)} className="mb-6" />
        )}

        {/* Navigation Tabs */}
        <div className="mb-8 flex border-b border-slate-200 overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "listings", label: `My Listings (${totalListings})` },
            { id: "inquiries", label: `Inquiries Inbox (${totalInquiries})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-black transition-colors ${
                activeTab === tab.id
                  ? "border-[#5472FC] text-[#5472FC]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <LoadingSpinner size="lg" message="Loading dashboard insights..." />
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stat Summary Cards */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="p-5 border-slate-200 bg-white shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total Listings
                    </p>
                    <p className="mt-3 text-3xl font-black text-slate-950">{totalListings}</p>
                    <p className="mt-1 text-xs text-slate-400">Colleges submitted</p>
                  </Card>

                  <Card className="p-5 border-slate-200 bg-white shadow-sm">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Approved Listings
                    </p>
                    <p className="mt-3 text-3xl font-black text-emerald-600">{approvedListings}</p>
                    <p className="mt-1 text-xs text-slate-400">Live on EduPath</p>
                  </Card>

                  <Card className="p-5 border-slate-200 bg-white shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Total Inquiries
                    </p>
                    <p className="mt-3 text-3xl font-black text-[#2551D9]">{totalInquiries}</p>
                    <p className="mt-1 text-xs text-slate-400">Received from students</p>
                  </Card>

                  <Card className="p-5 border-slate-200 bg-white shadow-sm">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                      Replied
                    </p>
                    <p className="mt-3 text-3xl font-black text-purple-600">
                      {inquiryStatusCounts.replied}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Inquiries you've answered</p>
                  </Card>
                </div>

                {/* Inquiry Status Breakdown */}
                <Card className="p-6 sm:p-8">
                  <h3 className="text-xl font-black text-slate-950 mb-6">
                    Inquiry Status Breakdown
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: "new", label: "New", color: "bg-amber-500", count: inquiryStatusCounts.new },
                      { key: "read", label: "Read", color: "bg-blue-500", count: inquiryStatusCounts.read },
                      { key: "replied", label: "Replied", color: "bg-emerald-500", count: inquiryStatusCounts.replied },
                      { key: "closed", label: "Closed", color: "bg-slate-500", count: inquiryStatusCounts.closed },
                    ].map((item) => {
                      const percentage = totalInquiries > 0 ? Math.round((item.count / totalInquiries) * 100) : 0;
                      return (
                        <div key={item.key} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700">{item.label}</span>
                            <span className="text-slate-500">
                              {item.count} inquir{item.count === 1 ? "y" : "ies"} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 2: MY LISTINGS */}
            {activeTab === "listings" && (
              <div className="space-y-6">
                {colleges.length === 0 ? (
                  <EmptyState
                    title="No colleges listed yet"
                    message="You haven't listed any colleges yet. Reach thousands of prospective students by adding your institution."
                    action="List Your First College"
                    onAction={() => navigate("/list-college")}
                  />
                ) : (
                  <div className="space-y-4">
                    {colleges.map((college) => {
                      const collegeId = college._id || college.id;
                      const collegeInquiries = inquiries.filter(
                        (i) => String(i.targetRecord) === String(collegeId)
                      );

                      return (
                        <Card
                          key={collegeId}
                          className="flex flex-col gap-4 justify-between border-slate-200 bg-white p-5 sm:p-6 md:flex-row md:items-center"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/colleges/${collegeId}`}
                                className="text-lg font-black text-slate-950 hover:text-[#5472FC] transition-colors"
                              >
                                {college.collegeName} ↗
                              </Link>
                              <Badge variant={getApprovalBadgeVariant(college.approvalStatus)} size="sm">
                                {(college.approvalStatus || "pending").toUpperCase()}
                              </Badge>
                              <Badge
                                variant={college.admissionStatus === "closed" ? "danger" : "success"}
                                size="sm"
                              >
                                {(college.admissionStatus || "open").toUpperCase()}
                              </Badge>
                            </div>

                            <p className="text-xs font-bold text-slate-500">
                              {college.city || "Nepal"} • Affiliation:{" "}
                              <span className="text-slate-800">{college.affiliation || "N/A"}</span>
                            </p>

                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-1">
                              <span>{collegeInquiries.length} Inquir{collegeInquiries.length !== 1 ? "ies" : "y"}</span>
                              <span>Listed: {college.createdAt ? new Date(college.createdAt).toLocaleDateString() : "Recent"}</span>
                            </div>
                          </div>

                          {/* Listing Actions */}
                          <div className="flex flex-wrap items-center gap-2 border-t pt-3 md:border-t-0 md:pt-0 border-slate-100">
                            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(college)}>
                              Edit
                            </Button>

                            <Button variant="secondary" size="sm" onClick={() => setTogglingCollege(college)}>
                              {college.admissionStatus === "closed" ? "Reopen" : "Close"}
                            </Button>

                            <Button
                              variant="dangerSoft"
                              size="sm"
                              onClick={() => setDeletingCollege(college)}
                            >
                              Delete
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: INQUIRIES INBOX */}
            {activeTab === "inquiries" && (
              <div className="space-y-6">
                {/* Inbox Filters */}
                <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Filter by College
                    </label>
                    <select
                      value={selectedCollegeFilter}
                      onChange={(e) => setSelectedCollegeFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#5472FC] focus:outline-none"
                    >
                      <option value="all">All Colleges ({colleges.length})</option>
                      {colleges.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.collegeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Filter by Status
                    </label>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#5472FC] focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {filteredInboxInquiries.length === 0 ? (
                  <EmptyState
                    title="No inquiries in inbox"
                    message="No student inquiries match your current filters."
                    action="Clear Filters"
                    onAction={() => {
                      setSelectedCollegeFilter("all");
                      setSelectedStatusFilter("all");
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredInboxInquiries.map((inq) => {
                      const inqId = inq._id || inq.id;
                      const status = inq.status || "new";

                      return (
                        <Card key={inqId} className="p-5 sm:p-6 border-slate-200 bg-white space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="text-base font-black text-slate-950">
                                {inq.studentName}
                              </h4>
                              <p className="text-xs text-slate-500 font-bold">
                                About: <span className="text-slate-800">{inq.targetName || "Your college"}</span> • Sent {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "Recent"}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">Status:</span>
                              <select
                                value={status}
                                onChange={(e) => handleUpdateInquiryStatus(inqId, e.target.value)}
                                disabled={updatingInquiryId === inqId}
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-900 focus:border-[#5472FC] focus:outline-none"
                              >
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                                <option value="closed">Closed</option>
                              </select>
                              <Badge variant={getInquiryBadgeVariant(status)} size="sm">
                                {status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                            <p className="italic leading-relaxed">"{inq.message}"</p>
                          </div>

                          <p className="text-xs text-slate-500 font-bold">
                            Contact: {inq.email}{inq.phone ? ` • ${inq.phone}` : ""}
                          </p>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* EDIT COLLEGE MODAL */}
        {editingCollege && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
              <h3 className="text-xl font-black text-slate-950 mb-4">Edit College Listing</h3>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <Input
                  label="College Name *"
                  value={editFormData.collegeName}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, collegeName: e.target.value }))}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="City"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, city: e.target.value }))}
                  />
                  <Input
                    label="Affiliation"
                    value={editFormData.affiliation}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, affiliation: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Fee Range"
                    value={editFormData.feeRange}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, feeRange: e.target.value }))}
                  />
                  <Select
                    label="Admission Status"
                    options={ADMISSION_STATUS_OPTIONS}
                    value={editFormData.admissionStatus}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, admissionStatus: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Contact Email"
                    type="email"
                    value={editFormData.contactEmail}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  />
                  <Input
                    label="Contact Phone"
                    value={editFormData.contactPhone}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  />
                </div>

                <Input
                  label="Website"
                  value={editFormData.website}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, website: e.target.value }))}
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">Description</label>
                  <textarea
                    rows="4"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#5472FC] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setEditingCollege(null)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={savingEdit}
                    className="bg-[#5472FC] hover:bg-[#435DDE]"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingCollege && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-black text-slate-950">Delete College Listing?</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong>{deletingCollege.collegeName}</strong>? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" size="md" onClick={() => setDeletingCollege(null)} disabled={deleting}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleConfirmDelete}
                  loading={deleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TOGGLE ADMISSION STATUS CONFIRMATION MODAL */}
        {togglingCollege && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-black text-slate-950">
                {togglingCollege.admissionStatus === "closed" ? "Reopen" : "Close"} admissions?
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to {togglingCollege.admissionStatus === "closed" ? "reopen" : "close"}{" "}
                admissions for <strong>{togglingCollege.collegeName}</strong>?{" "}
                {togglingCollege.admissionStatus === "closed"
                  ? "Students will be able to submit inquiries again."
                  : "Students won't be able to submit new inquiries."}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setTogglingCollege(null)}
                  disabled={togglingStatus}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmToggleAdmissionStatus}
                  loading={togglingStatus}
                >
                  {togglingCollege.admissionStatus === "closed" ? "Confirm Reopen" : "Confirm Close"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default CollegeAdminDashboard;
