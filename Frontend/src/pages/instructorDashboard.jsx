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
 * Instructor Dashboard Page
 * Gated behind ProtectedRoute allowedRoles=['instructor']
 *
 * Sections:
 * 1. Overview — Stat summary cards & inquiry status breakdown
 * 2. My Classes — Online class listings with Edit, Delete, and "Post New Class"
 * 3. Inquiries Inbox — Student inquiries about owned classes, with status updates
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

function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab: 'overview' | 'listings' | 'inquiries'
  const [activeTab, setActiveTab] = useState("overview");

  // Data States
  const [classes, setClasses] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit Class Modal State
  const [editingClass, setEditingClass] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingClass, setDeletingClass] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Inquiries Inbox Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);

  // Fetch owned classes & received inquiries
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUserId = user?._id || user?.id;
      const [classRes, inquiryRes] = await Promise.all([
        api.listClasses({ owner: currentUserId }),
        api.getReceivedInquiries(),
      ]);

      setClasses(classRes.data || []);
      setInquiries(inquiryRes.data || []);
    } catch (err) {
      console.error("Failed to load instructor dashboard data:", err);
      setError(err?.message || "Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Edit Modal Open Handler
  const handleOpenEdit = (cls) => {
    setEditingClass(cls);
    setEditFormData({
      classTitle: cls.classTitle || "",
      instructorOrOrganization: cls.instructorOrOrganization || "",
      level: cls.level || "beginner",
      mode: cls.mode || "live",
      duration: cls.duration || "",
      price: cls.price ?? 0,
      startDate: cls.startDate ? cls.startDate.split("T")[0] : "",
      schedule: cls.schedule || "",
      description: cls.description || "",
      enrollmentLink: cls.enrollmentLink || "",
      thumbnail: cls.thumbnail || "",
      certificateAvailability: cls.certificateAvailability ?? false,
    });
  };

  // Edit Class Form Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    const id = editingClass._id || editingClass.id;
    setSavingEdit(true);

    try {
      const payload = { ...editFormData, price: Number(editFormData.price) || 0 };
      await api.updateClass(id, payload);
      setClasses((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? { ...c, ...payload } : c))
      );
      setSuccessMessage(`Updated class "${payload.classTitle}" successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setEditingClass(null);
    } catch (err) {
      console.error("Failed to update class:", err);
      setError(err?.message || "Failed to update class.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Confirm Delete Listing
  const handleConfirmDelete = async () => {
    if (!deletingClass) return;
    const id = deletingClass._id || deletingClass.id;
    setDeleting(true);

    try {
      await api.deleteClass(id);
      setClasses((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setSuccessMessage(`Deleted class "${deletingClass.classTitle}" successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setDeletingClass(null);
    } catch (err) {
      console.error("Failed to delete class:", err);
      setError(err?.message || "Failed to delete class.");
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
  const totalListings = classes.length;
  const approvedListings = classes.filter((c) => c.approvalStatus === "approved").length;
  const totalInquiries = inquiries.length;

  const inquiryStatusCounts = {
    new: inquiries.filter((i) => (i.status || "new") === "new").length,
    read: inquiries.filter((i) => i.status === "read").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  // Filtered Inquiries for Inbox
  const filteredInboxInquiries = inquiries.filter((inq) => {
    const matchesClass =
      selectedClassFilter === "all" || String(inq.targetRecord) === selectedClassFilter;
    const matchesStatus =
      selectedStatusFilter === "all" || (inq.status || "new").toLowerCase() === selectedStatusFilter;
    return matchesClass && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#F7F8FA] pb-16 text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-0">
        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5472FC]">
              Instructor Hub
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Instructor Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, <strong>{user?.firstName || "Instructor"}</strong>! Manage your classes and respond to student inquiries.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/post-class")}
            className="bg-[#5472FC] hover:bg-[#435DDE]"
          >
            + Post New Class
          </Button>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            ✓ {successMessage}
          </div>
        )}
        {error && (
          <ErrorBanner message={error} onClose={() => setError(null)} className="mb-6" />
        )}

        {/* Navigation Tabs */}
        <div className="mb-8 flex border-b border-slate-200 overflow-x-auto">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "listings", label: `🎓 My Classes (${totalListings})` },
            { id: "inquiries", label: `💬 Inquiries Inbox (${totalInquiries})` },
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
                      Total Classes
                    </p>
                    <p className="mt-3 text-3xl font-black text-slate-950">{totalListings}</p>
                    <p className="mt-1 text-xs text-slate-400">Classes posted</p>
                  </Card>

                  <Card className="p-5 border-slate-200 bg-white shadow-sm">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Approved Classes
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

            {/* TAB 2: MY CLASSES */}
            {activeTab === "listings" && (
              <div className="space-y-6">
                {classes.length === 0 ? (
                  <EmptyState
                    title="No classes posted yet"
                    message="You haven't posted any online classes yet. Start sharing your course with students today."
                    action="Post Your First Class"
                    onAction={() => navigate("/post-class")}
                  />
                ) : (
                  <div className="space-y-4">
                    {classes.map((cls) => {
                      const classId = cls._id || cls.id;
                      const classInquiries = inquiries.filter(
                        (i) => String(i.targetRecord) === String(classId)
                      );

                      return (
                        <Card
                          key={classId}
                          className="flex flex-col gap-4 justify-between border-slate-200 bg-white p-5 sm:p-6 md:flex-row md:items-center"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/online-classes/${classId}`}
                                className="text-lg font-black text-slate-950 hover:text-[#5472FC] transition-colors"
                              >
                                {cls.classTitle} ↗
                              </Link>
                              <Badge variant={getApprovalBadgeVariant(cls.approvalStatus)} size="sm">
                                {(cls.approvalStatus || "pending").toUpperCase()}
                              </Badge>
                              {cls.certificateAvailability && (
                                <Badge variant="warning" size="sm">🎓 Certificate</Badge>
                              )}
                            </div>

                            <p className="text-xs font-bold text-slate-500">
                              {cls.mode || "Live"} • {cls.level || "Beginner"} • Price:{" "}
                              <span className="text-slate-800">
                                {cls.price ? `Rs. ${cls.price}` : "Free"}
                              </span>
                            </p>

                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-1">
                              <span>💬 {classInquiries.length} Inquir{classInquiries.length !== 1 ? "ies" : "y"}</span>
                              <span>📅 Posted: {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : "Recent"}</span>
                            </div>
                          </div>

                          {/* Listing Actions */}
                          <div className="flex flex-wrap items-center gap-2 border-t pt-3 md:border-t-0 md:pt-0 border-slate-100">
                            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(cls)}>
                              ✏️ Edit
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeletingClass(cls)}
                              className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            >
                              🗑️ Delete
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
                      Filter by Class
                    </label>
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#5472FC] focus:outline-none"
                    >
                      <option value="all">All Classes ({classes.length})</option>
                      {classes.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.classTitle}
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
                      setSelectedClassFilter("all");
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
                                About: <span className="text-slate-800">{inq.targetName || "Your class"}</span> • Sent {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "Recent"}
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

        {/* EDIT CLASS MODAL */}
        {editingClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
              <h3 className="text-xl font-black text-slate-950 mb-4">Edit Class Listing</h3>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <Input
                  label="Class Title *"
                  value={editFormData.classTitle}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, classTitle: e.target.value }))}
                  required
                />

                <Input
                  label="Instructor / Organization"
                  value={editFormData.instructorOrOrganization}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, instructorOrOrganization: e.target.value }))
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Level"
                    options={LEVEL_OPTIONS}
                    value={editFormData.level}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, level: e.target.value }))}
                  />
                  <Select
                    label="Mode"
                    options={MODE_OPTIONS}
                    value={editFormData.mode}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, mode: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Duration"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, duration: e.target.value }))}
                  />
                  <Input
                    label="Price (NPR)"
                    type="number"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Start Date"
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                  <Input
                    label="Schedule"
                    value={editFormData.schedule}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, schedule: e.target.value }))}
                  />
                </div>

                <Input
                  label="Enrollment Link"
                  value={editFormData.enrollmentLink}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, enrollmentLink: e.target.value }))}
                />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.certificateAvailability}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, certificateAvailability: e.target.checked }))
                    }
                    className="h-5 w-5 cursor-pointer accent-[#5472FC]"
                  />
                  <span className="text-sm font-bold text-slate-950">Certificate of Completion Provided</span>
                </label>

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
                    onClick={() => setEditingClass(null)}
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
        {deletingClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-black text-slate-950">Delete Class Listing?</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong>{deletingClass.classTitle}</strong>? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" size="md" onClick={() => setDeletingClass(null)} disabled={deleting}>
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
      </div>
    </main>
  );
}

export default InstructorDashboard;
