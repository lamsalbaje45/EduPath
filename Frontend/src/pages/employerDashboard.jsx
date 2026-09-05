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
 * Employer Dashboard Page
 * Gated behind ProtectedRoute allowedRoles=['employer']
 *
 * Sections:
 * 1. Overview — Stat summary cards & application status breakdown
 * 2. My Listings — Opportunities table with Edit, Close/Reopen, Delete, and "Post New Job"
 * 3. Applications Inbox — Candidate applications with status updates, notes, & CV snapshots
 */

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function getBadgeVariant(status) {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "success";
    case "shortlisted":
      return "success";
    case "reviewing":
      return "primary";
    case "submitted":
      return "secondary";
    case "rejected":
      return "danger";
    default:
      return "secondary";
  }
}

function EmployerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab: 'overview' | 'listings' | 'applications'
  const [activeTab, setActiveTab] = useState("overview");

  // Data States
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit Opportunity Modal State
  const [editingOpp, setEditingOpp] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingOpp, setDeletingOpp] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Applications Inbox Filters & State
  const [selectedOppFilter, setSelectedOppFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [expandedCvApp, setExpandedCvApp] = useState(null);
  const [notesState, setNotesState] = useState({});
  const [updatingAppId, setUpdatingAppId] = useState(null);

  // Fetch Employer Opportunities & Applications
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppRes, appRes] = await Promise.all([
        api.listOpportunities(),
        api.getApplications(),
      ]);

      const allOpps = oppRes.data || [];
      const allApps = appRes.data || [];

      // TODO: Move client-side employer filter to server-side query param once backend supports GET /opportunities?employer=<id>
      const currentUserId = user?._id || user?.id;
      const employerOpps = allOpps.filter(
        (o) =>
          !o.employer ||
          o.employer === currentUserId ||
          o.employer?._id === currentUserId ||
          o.companyName?.toLowerCase() === (user?.companyName || user?.firstName)?.toLowerCase()
      );

      setOpportunities(employerOpps);
      setApplications(allApps);

      // Initialize notes state
      const initialNotes = {};
      allApps.forEach((a) => {
        const id = a.id || a._id;
        initialNotes[id] = a.employerNotes || "";
      });
      setNotesState(initialNotes);
    } catch (err) {
      console.error("Failed to load employer dashboard data:", err);
      setError(
        err?.message || "Failed to load dashboard data. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Edit Modal Open Handler
  const handleOpenEdit = (opp) => {
    setEditingOpp(opp);
    setEditFormData({
      title: opp.title || "",
      companyName: opp.companyName || "",
      type: opp.type || "job",
      location: opp.location || "",
      workMode: opp.workMode || "remote",
      stipendOrSalaryRange: opp.stipendOrSalaryRange || "",
      applicationDeadline: opp.applicationDeadline
        ? opp.applicationDeadline.split("T")[0]
        : "",
      description: opp.description || "",
      applicationLink: opp.applicationLink || "",
      internalApplication: opp.internalApplication ?? true,
    });
  };

  // Edit Opportunity Form Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingOpp) return;
    const id = editingOpp._id || editingOpp.id;
    setSavingEdit(true);

    try {
      await api.updateOpportunity(id, editFormData);
      setOpportunities((prev) =>
        prev.map((o) => ((o._id || o.id) === id ? { ...o, ...editFormData } : o))
      );
      setSuccessMessage(`Updated listing "${editFormData.title}" successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setEditingOpp(null);
    } catch (err) {
      console.error("Failed to update opportunity:", err);
      setError(err?.message || "Failed to update listing.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle Listing Status (Active <-> Closed)
  const handleToggleStatus = async (opp) => {
    const id = opp._id || opp.id;
    const newStatus = opp.status === "closed" ? "active" : "closed";

    try {
      await api.updateOpportunity(id, { status: newStatus });
      setOpportunities((prev) =>
        prev.map((o) => ((o._id || o.id) === id ? { ...o, status: newStatus } : o))
      );
      setSuccessMessage(
        `Listing "${opp.title}" status changed to ${newStatus}.`
      );
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to toggle listing status:", err);
      setError(err?.message || "Failed to change listing status.");
    }
  };

  // Confirm Delete Listing
  const handleConfirmDelete = async () => {
    if (!deletingOpp) return;
    const id = deletingOpp._id || deletingOpp.id;
    setDeleting(true);

    try {
      await api.deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((o) => (o._id || o.id) !== id));
      setSuccessMessage(`Deleted listing "${deletingOpp.title}" successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setDeletingOpp(null);
    } catch (err) {
      console.error("Failed to delete opportunity:", err);
      setError(err?.message || "Failed to delete listing.");
    } finally {
      setDeleting(false);
    }
  };

  // Update Application Status & Notes
  const handleUpdateAppStatus = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    const currentNotes = notesState[appId] || "";

    try {
      await api.updateApplicationStatus(appId, newStatus, currentNotes);
      setApplications((prev) =>
        prev.map((a) =>
          (a.id || a._id) === appId ? { ...a, status: newStatus, employerNotes: currentNotes } : a
        )
      );
      setSuccessMessage(`Candidate application updated to "${newStatus}".`);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to update application status:", err);
      setError(err?.message || "Failed to update application status.");
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Save Employer Notes
  const handleSaveNotes = async (appId, currentStatus) => {
    setUpdatingAppId(appId);
    const notes = notesState[appId] || "";

    try {
      await api.updateApplicationStatus(appId, currentStatus, notes);
      setApplications((prev) =>
        prev.map((a) =>
          (a.id || a._id) === appId ? { ...a, employerNotes: notes } : a
        )
      );
      setSuccessMessage("Employer notes saved successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to save employer notes:", err);
      setError(err?.message || "Failed to save employer notes.");
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Calculate Metrics for Overview
  const totalListings = opportunities.length;
  const activeListings = opportunities.filter((o) => o.status === "active").length;
  const totalApps = applications.length;

  const appStatusCounts = {
    submitted: applications.filter((a) => (a.status || "submitted") === "submitted").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // Filtered Applications for Inbox
  const filteredInboxApps = applications.filter((app) => {
    const matchesOpp =
      selectedOppFilter === "all" ||
      app.opportunityId === selectedOppFilter ||
      app.opportunity?._id === selectedOppFilter;
    const matchesStatus =
      selectedStatusFilter === "all" ||
      (app.status || "submitted").toLowerCase() === selectedStatusFilter;
    return matchesOpp && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#F7F8FA] pb-16 text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-0">
        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              Employer Hub
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Employer Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, <strong>{user?.firstName || "Employer"}</strong>! Manage your active listings, evaluate candidates, and update hiring statuses.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/post-job")}
            className="bg-[#5472FC] hover:bg-[#435DDE]"
          >
            + Post New Opportunity
          </Button>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            ✓ {successMessage}
          </div>
        )}
        {error && (
          <ErrorBanner
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Navigation Tabs */}
        <div className="mb-8 flex border-b border-slate-200 overflow-x-auto">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "listings", label: `📋 My Listings (${totalListings})` },
            { id: "applications", label: `📥 Applications Inbox (${totalApps})` },
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
                    <p className="mt-3 text-3xl font-black text-slate-950">
                      {totalListings}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Opportunities posted</p>
                  </Card>

                  <Card className="p-5 border-slate-200 bg-white shadow-sm">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Active Listings
                    </p>
                    <p className="mt-3 text-3xl font-black text-emerald-600">
                      {activeListings}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Currently accepting applications</p>
                  </Card>

                  <Card className="p-5 border-slate-200 bg-white shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Total Applications
                    </p>
                    <p className="mt-3 text-3xl font-black text-[#2551D9]">
                      {totalApps}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Received from students</p>
                  </Card>

                  <Card className="p-5 border-slate-200 bg-white shadow-sm">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                      Shortlisted & Hired
                    </p>
                    <p className="mt-3 text-3xl font-black text-purple-600">
                      {appStatusCounts.shortlisted + appStatusCounts.accepted}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Qualified candidates</p>
                  </Card>
                </div>

                {/* Application Pipeline Breakdown */}
                <Card className="p-6 sm:p-8">
                  <h3 className="text-xl font-black text-slate-950 mb-6">
                    Candidate Application Pipeline
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: "submitted", label: "Submitted / New", color: "bg-slate-500", count: appStatusCounts.submitted },
                      { key: "reviewing", label: "Under Review", color: "bg-blue-500", count: appStatusCounts.reviewing },
                      { key: "shortlisted", label: "Shortlisted", color: "bg-purple-500", count: appStatusCounts.shortlisted },
                      { key: "accepted", label: "Accepted / Offered", color: "bg-emerald-500", count: appStatusCounts.accepted },
                      { key: "rejected", label: "Rejected", color: "bg-rose-500", count: appStatusCounts.rejected },
                    ].map((item) => {
                      const percentage = totalApps > 0 ? Math.round((item.count / totalApps) * 100) : 0;
                      return (
                        <div key={item.key} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700">{item.label}</span>
                            <span className="text-slate-500">
                              {item.count} candidate{item.count !== 1 ? "s" : ""} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                              style={{ width: `${totalApps > 0 ? percentage : 0}%` }}
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
                {opportunities.length === 0 ? (
                  <EmptyState
                    title="No opportunities posted yet"
                    message="You haven't posted any job or internship listings yet. Start attracting top talent today."
                    action="Post Your First Opportunity"
                    onAction={() => navigate("/post-job")}
                  />
                ) : (
                  <div className="space-y-4">
                    {opportunities.map((opp) => {
                      const oppId = opp._id || opp.id;
                      const oppApps = applications.filter(
                        (a) => a.opportunityId === oppId || a.opportunity?._id === oppId
                      );

                      return (
                        <Card
                          key={oppId}
                          className="flex flex-col gap-4 justify-between border-slate-200 bg-white p-5 sm:p-6 md:flex-row md:items-center"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/jobs/${oppId}`}
                                className="text-lg font-black text-slate-950 hover:text-[#5472FC] transition-colors"
                              >
                                {opp.title} ↗
                              </Link>
                              <Badge
                                variant={opp.type === "internship" ? "warning" : "primary"}
                                size="sm"
                              >
                                {(opp.type || "job").toUpperCase()}
                              </Badge>
                              <Badge
                                variant={opp.status === "closed" ? "secondary" : "success"}
                                size="sm"
                              >
                                {(opp.status || "active").toUpperCase()}
                              </Badge>
                            </div>

                            <p className="text-xs font-bold text-slate-500">
                              {opp.workMode || "Onsite"} • {opp.location || "Nepal"} • Salary/Stipend:{" "}
                              <span className="text-slate-800">{opp.stipendOrSalaryRange || "Competitive"}</span>
                            </p>

                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-1">
                              <span>📥 {oppApps.length} Application{oppApps.length !== 1 ? "s" : ""}</span>
                              <span>📅 Posted: {opp.createdAt ? new Date(opp.createdAt).toLocaleDateString() : "Recent"}</span>
                            </div>
                          </div>

                          {/* Listing Actions */}
                          <div className="flex flex-wrap items-center gap-2 border-t pt-3 md:border-t-0 md:pt-0 border-slate-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(opp)}
                            >
                              ✏️ Edit
                            </Button>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleToggleStatus(opp)}
                            >
                              {opp.status === "closed" ? "▶ Reopen" : "⏸ Close"}
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeletingOpp(opp)}
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

            {/* TAB 3: APPLICATIONS INBOX */}
            {activeTab === "applications" && (
              <div className="space-y-6">
                {/* Inbox Filters */}
                <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Filter by Opportunity
                    </label>
                    <select
                      value={selectedOppFilter}
                      onChange={(e) => setSelectedOppFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#5472FC] focus:outline-none"
                    >
                      <option value="all">All Opportunities ({opportunities.length})</option>
                      {opportunities.map((o) => (
                        <option key={o._id || o.id} value={o._id || o.id}>
                          {o.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Filter by Candidate Status
                    </label>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#5472FC] focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {filteredInboxApps.length === 0 ? (
                  <EmptyState
                    title="No applications in inbox"
                    message="No candidate applications match your current opportunity or status filters."
                    action="Clear Filters"
                    onAction={() => {
                      setSelectedOppFilter("all");
                      setSelectedStatusFilter("all");
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredInboxApps.map((app) => {
                      const appId = app.id || app._id;
                      const status = app.status || "submitted";
                      const candidateName =
                        app.studentName ||
                        app.student?.name ||
                        app.user?.firstName
                          ? `${app.user.firstName} ${app.user.lastName || ""}`
                          : "Applicant";

                      return (
                        <Card key={appId} className="p-5 sm:p-6 border-slate-200 bg-white space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="text-base font-black text-slate-950">
                                {candidateName}
                              </h4>
                              <p className="text-xs text-slate-500 font-bold">
                                Position: <span className="text-slate-800">{app.opportunityTitle || app.title || "Job Opportunity"}</span> • Applied on {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}
                              </p>
                            </div>

                            {/* Status Change Selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">Status:</span>
                              <select
                                value={status}
                                onChange={(e) => handleUpdateAppStatus(appId, e.target.value)}
                                disabled={updatingAppId === appId}
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-900 focus:border-[#5472FC] focus:outline-none"
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <Badge variant={getBadgeVariant(status)} size="sm">
                                {status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          {/* Cover Message */}
                          {app.coverMessage && (
                            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                              <span className="font-bold text-slate-900 block mb-1">
                                Cover Message:
                              </span>
                              <p className="italic leading-relaxed">"{app.coverMessage}"</p>
                            </div>
                          )}

                          {/* CV Snapshot Accordion */}
                          {app.cvSnapshot && (
                            <div>
                              <button
                                type="button"
                                onClick={() => setExpandedCvApp(expandedCvApp === appId ? null : appId)}
                                className="text-xs font-black text-[#5472FC] hover:underline flex items-center gap-1"
                              >
                                📄 {expandedCvApp === appId ? "Hide CV Snapshot" : "View Candidate CV Snapshot"}
                              </button>

                              {expandedCvApp === appId && (
                                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-3">
                                  <h5 className="font-black text-slate-950">Candidate CV Overview</h5>
                                  {app.cvSnapshot.personalDetails && (
                                    <p>
                                      <strong>Summary:</strong> {app.cvSnapshot.personalDetails.summary || "N/A"}
                                    </p>
                                  )}
                                  {app.cvSnapshot.skillList && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {app.cvSnapshot.skillList.map((s) => (
                                        <span key={s} className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Employer Internal Notes */}
                          <div className="pt-2">
                            <label className="mb-1 block text-xs font-bold text-slate-700">
                              Internal Employer Notes
                            </label>
                            <div className="flex gap-2">
                              <textarea
                                rows="2"
                                placeholder="Add private feedback, interview notes, or evaluation summary..."
                                value={notesState[appId] || ""}
                                onChange={(e) =>
                                  setNotesState((prev) => ({ ...prev, [appId]: e.target.value }))
                                }
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#5472FC] focus:outline-none"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveNotes(appId, status)}
                                loading={updatingAppId === appId}
                                className="self-end shrink-0"
                              >
                                Save Notes
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* EDIT OPPORTUNITY MODAL */}
        {editingOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
              <h3 className="text-xl font-black text-slate-950 mb-4">
                Edit Job Listing
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <Input
                  label="Opportunity Title *"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Company Name"
                    value={editFormData.companyName}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                  />
                  <Select
                    label="Type"
                    options={[
                      { value: "job", label: "Job" },
                      { value: "internship", label: "Internship" },
                    ]}
                    value={editFormData.type}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Work Mode"
                    options={[
                      { value: "onsite", label: "Onsite" },
                      { value: "remote", label: "Remote" },
                      { value: "hybrid", label: "Hybrid" },
                    ]}
                    value={editFormData.workMode}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, workMode: e.target.value }))
                    }
                  />
                  <Input
                    label="Location"
                    value={editFormData.location}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Salary / Stipend Range"
                    value={editFormData.stipendOrSalaryRange}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        stipendOrSalaryRange: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Deadline"
                    type="date"
                    value={editFormData.applicationDeadline}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        applicationDeadline: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#5472FC] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setEditingOpp(null)}
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
        {deletingOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-black text-slate-950">
                Delete Opportunity Listing?
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong>{deletingOpp.title}</strong>? All associated candidates and data will be removed.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setDeletingOpp(null)}
                  disabled={deleting}
                >
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

export default EmployerDashboard;
