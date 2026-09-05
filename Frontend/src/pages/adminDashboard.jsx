import { useCallback, useEffect, useState } from "react";
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
 * Admin Dashboard Page
 * Gated behind ProtectedRoute allowedRoles=['admin']
 *
 * Sections:
 * 1. Overview — System-wide analytics & pending moderation counters
 * 2. Listing Approvals — Multi-tab approval queue for Colleges, Opportunities, and Classes
 * 3. User Management — User role editing, account suspension/activation, & student profile view
 * 4. Inquiries — Platform inquiries moderation & status workflow
 */

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "employer", label: "Employer" },
  { value: "college_admin", label: "College Admin" },
  { value: "instructor", label: "Instructor" },
  { value: "admin", label: "System Admin" },
];

const ACCOUNT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending Review" },
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

function getUserStatusBadgeVariant(status) {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "suspended":
      return "danger";
    default:
      return "secondary";
  }
}

function AdminDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  // Global Data States
  const [colleges, setColleges] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [rowActionId, setRowActionId] = useState(null);

  // Approval Section Sub-states
  const [approvalTab, setApprovalTab] = useState("colleges"); // 'colleges' | 'opportunities' | 'classes'
  const [approvalFilterStatus, setApprovalFilterStatus] = useState("pending"); // 'pending' | 'approved' | 'rejected' | 'all'

  // User Management Sub-states
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [viewingStudentProfile, setViewingStudentProfile] = useState(null);

  // Inquiries Sub-states
  const [viewingInquiry, setViewingInquiry] = useState(null);

  // Fetch All Platform Data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [colRes, oppRes, clsRes, usrRes, inqRes, appRes] = await Promise.all([
        api.listColleges(),
        api.listOpportunities(),
        api.listClasses(),
        api.getUsers(),
        api.getInquiries(),
        api.getApplications(),
      ]);

      setColleges(colRes.data || []);
      setOpportunities(oppRes.data || []);
      setClasses(clsRes.data || []);
      setUsers(usrRes.data || []);
      setInquiries(inqRes.data || []);
      setApplications(appRes.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError(err?.message || "Failed to load administrative records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // --- APPROVAL ACTIONS ---
  const handleUpdateCollegeApproval = async (id, status) => {
    setRowActionId(`col_${id}`);
    try {
      await api.updateCollegeApprovalStatus(id, status);
      setColleges((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? { ...c, approvalStatus: status } : c))
      );
      showToast(`College listing ${status === "approved" ? "approved" : "rejected"} successfully.`);
    } catch (err) {
      setError(err?.message || "Failed to update college status.");
    } finally {
      setRowActionId(null);
    }
  };

  const handleUpdateOpportunityApproval = async (id, status) => {
    setRowActionId(`opp_${id}`);
    try {
      await api.updateOpportunityApprovalStatus(id, status);
      setOpportunities((prev) =>
        prev.map((o) => ((o._id || o.id) === id ? { ...o, approvalStatus: status } : o))
      );
      showToast(`Opportunity listing ${status === "approved" ? "approved" : "rejected"} successfully.`);
    } catch (err) {
      setError(err?.message || "Failed to update opportunity status.");
    } finally {
      setRowActionId(null);
    }
  };

  const handleUpdateClassApproval = async (id, status) => {
    setRowActionId(`cls_${id}`);
    try {
      await api.updateOnlineClassApprovalStatus(id, status);
      setClasses((prev) =>
        prev.map((cls) => ((cls._id || cls.id) === id ? { ...cls, approvalStatus: status } : cls))
      );
      showToast(`Online class listing ${status === "approved" ? "approved" : "rejected"} successfully.`);
    } catch (err) {
      setError(err?.message || "Failed to update class status.");
    } finally {
      setRowActionId(null);
    }
  };

  // --- USER MANAGEMENT ACTIONS ---
  const handleUserRoleChange = async (userId, newRole) => {
    setRowActionId(`usr_role_${userId}`);
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: newRole, accountType: newRole } : u))
      );
      showToast(`User role updated to "${newRole}".`);
    } catch (err) {
      setError(err?.message || "Failed to update user role.");
    } finally {
      setRowActionId(null);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    setRowActionId(`usr_status_${userId}`);
    try {
      await api.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, accountStatus: newStatus } : u))
      );
      showToast(`User account status set to "${newStatus}".`);
    } catch (err) {
      setError(err?.message || "Failed to update user status.");
    } finally {
      setRowActionId(null);
    }
  };

  // --- INQUIRY ACTIONS ---
  const handleInquiryStatusChange = async (inquiryId, newStatus) => {
    setRowActionId(`inq_${inquiryId}`);
    try {
      await api.updateInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((i) => ((i._id || i.id) === inquiryId ? { ...i, status: newStatus } : i))
      );
      showToast(`Inquiry status updated to "${newStatus}".`);
    } catch (err) {
      setError(err?.message || "Failed to update inquiry status.");
    } finally {
      setRowActionId(null);
    }
  };

  // --- COMPUTED STATS FOR OVERVIEW ---
  const userCountsByRole = {
    student: users.filter((u) => (u.role || u.accountType) === "student").length,
    employer: users.filter((u) => (u.role || u.accountType) === "employer").length,
    college_admin: users.filter((u) => (u.role || u.accountType) === "college_admin").length,
    instructor: users.filter((u) => (u.role || u.accountType) === "instructor").length,
    admin: users.filter((u) => (u.role || u.accountType) === "admin").length,
  };

  const pendingColleges = colleges.filter((c) => (c.approvalStatus || "approved") === "pending").length;
  const pendingOpportunities = opportunities.filter((o) => (o.approvalStatus || "approved") === "pending").length;
  const pendingClasses = classes.filter((cls) => (cls.approvalStatus || "approved") === "pending").length;
  const totalPendingListings = pendingColleges + pendingOpportunities + pendingClasses;

  // Filtered Users for User Management Table
  const filteredUsers = users.filter((u) => {
    const role = u.role || u.accountType || "student";
    const status = u.accountStatus || "active";
    const matchesRole = userRoleFilter === "all" || role === userRoleFilter;
    const matchesStatus = userStatusFilter === "all" || status === userStatusFilter;
    return matchesRole && matchesStatus;
  });

  const handleResetMockData = async () => {
    if (window.confirm("Are you sure you want to reset all mock data back to seed state?")) {
      try {
        await api.resetMockData();
        showToast("Mock database reset successfully!");
        fetchAllData();
      } catch (err) {
        setError("Failed to reset mock database.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border-r border-slate-200 p-5 lg:min-h-[calc(100vh-64px)] flex flex-col justify-between">
          <div>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <span className="inline-block rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-black text-purple-700 uppercase tracking-widest">
                Administrator Portal
              </span>
              <h2 className="mt-2 text-lg font-black text-slate-950">Admin Console</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <nav className="flex lg:flex-col gap-1 overflow-x-auto">
              {[
                { id: "overview", label: "📊 System Overview" },
                { id: "approvals", label: `🛡️ Approvals (${totalPendingListings})` },
                { id: "users", label: `👥 Users (${users.length})` },
                { id: "inquiries", label: `💬 Inquiries (${inquiries.length})` },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`whitespace-nowrap flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-black transition-all ${
                    activeSection === sec.id
                      ? "bg-[#2551D9] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{sec.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 lg:mt-0">
            <button
              type="button"
              onClick={handleResetMockData}
              className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 border border-rose-100"
            >
              🔄 Reset Mock Database
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <section className="flex-1 p-5 sm:p-8 lg:p-10">
          {/* Global Toast & Error Notices */}
          {toastMessage && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
              ✓ {toastMessage}
            </div>
          )}
          {error && (
            <ErrorBanner
              message={error}
              onClose={() => setError(null)}
              className="mb-6"
            />
          )}

          {loading ? (
            <LoadingSpinner size="lg" message="Loading admin records..." />
          ) : (
            <>
              {/* SECTION 1: OVERVIEW */}
              {activeSection === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-2xl font-black sm:text-3xl text-slate-950">
                      System Overview & Analytics
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                      High-level breakdown of registered users, pending listing approvals, and active platform inquiries.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="p-5 border-slate-200 bg-white">
                      <p className="text-xs font-bold text-amber-600 uppercase">Pending Approvals</p>
                      <p className="mt-2 text-3xl font-black text-amber-600">{totalPendingListings}</p>
                      <p className="mt-1 text-[11px] text-slate-400">Listings awaiting review</p>
                    </Card>

                    <Card className="p-5 border-slate-200 bg-white">
                      <p className="text-xs font-bold text-[#2551D9] uppercase">Total Users</p>
                      <p className="mt-2 text-3xl font-black text-slate-950">{users.length}</p>
                      <p className="mt-1 text-[11px] text-slate-400">Registered platform accounts</p>
                    </Card>

                    <Card className="p-5 border-slate-200 bg-white">
                      <p className="text-xs font-bold text-emerald-600 uppercase">Colleges & Opportunities</p>
                      <p className="mt-2 text-3xl font-black text-emerald-600">{colleges.length + opportunities.length}</p>
                      <p className="mt-1 text-[11px] text-slate-400">Total institutional listings</p>
                    </Card>

                    <Card className="p-5 border-slate-200 bg-white">
                      <p className="text-xs font-bold text-purple-600 uppercase">Inquiries & Applications</p>
                      <p className="mt-2 text-3xl font-black text-purple-600">{inquiries.length + applications.length}</p>
                      <p className="mt-1 text-[11px] text-slate-400">Total student interactions</p>
                    </Card>
                  </div>

                  {/* Users by Role Breakdown */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6">
                      <h3 className="text-base font-black text-slate-950 mb-4">Users by Role</h3>
                      <div className="space-y-3">
                        {Object.entries(userCountsByRole).map(([rKey, count]) => (
                          <div key={rKey} className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-2">
                            <span className="capitalize text-slate-700">{rKey.replace("_", " ")}</span>
                            <Badge variant="primary" size="sm">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-base font-black text-slate-950 mb-4">Listings Approval Pipeline</h3>
                      <div className="space-y-4 text-xs font-bold">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-slate-700">Colleges (Pending / Total)</span>
                          <span className="text-amber-600">{pendingColleges} / {colleges.length}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-slate-700">Jobs & Internships (Pending / Total)</span>
                          <span className="text-amber-600">{pendingOpportunities} / {opportunities.length}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-slate-700">Online Classes (Pending / Total)</span>
                          <span className="text-amber-600">{pendingClasses} / {classes.length}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* SECTION 2: LISTING APPROVALS */}
              {activeSection === "approvals" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-black sm:text-3xl text-slate-950">
                      Listing Approvals & Moderation
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                      Review submitted colleges, opportunities, and classes. Approving a listing publishes it live across EduPath.
                    </p>
                  </div>

                  {/* Category Nav Tabs */}
                  <div className="flex border-b border-slate-200">
                    {[
                      { id: "colleges", label: `Colleges (${colleges.length})` },
                      { id: "opportunities", label: `Jobs & Internships (${opportunities.length})` },
                      { id: "classes", label: `Online Classes (${classes.length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setApprovalTab(tab.id)}
                        className={`px-4 py-2.5 text-xs font-black border-b-2 ${
                          approvalTab === tab.id
                            ? "border-[#5472FC] text-[#5472FC]"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Sub-Filters */}
                  <div className="flex gap-2">
                    {["pending", "approved", "rejected", "all"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setApprovalFilterStatus(st)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-extrabold capitalize ${
                          approvalFilterStatus === st
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Approval Items Render */}
                  {approvalTab === "colleges" && (
                    <div className="space-y-3">
                      {colleges
                        .filter((c) =>
                          approvalFilterStatus === "all"
                            ? true
                            : (c.approvalStatus || "approved") === approvalFilterStatus
                        )
                        .map((c) => {
                          const id = c._id || c.id;
                          const isActing = rowActionId === `col_${id}`;
                          const status = c.approvalStatus || "approved";

                          return (
                            <Card key={id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200 bg-white">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-slate-950 text-base">{c.collegeName}</h4>
                                  <Badge variant={getApprovalBadgeVariant(status)} size="sm">
                                    {status.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Affiliation: {c.affiliation || "N/A"} • City: {c.city || "Nepal"} • Contact: {c.contactEmail || "N/A"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  loading={isActing}
                                  onClick={() => handleUpdateCollegeApproval(id, "approved")}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  ✓ Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  loading={isActing}
                                  onClick={() => handleUpdateCollegeApproval(id, "rejected")}
                                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                >
                                  ✕ Reject
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  )}

                  {approvalTab === "opportunities" && (
                    <div className="space-y-3">
                      {opportunities
                        .filter((o) =>
                          approvalFilterStatus === "all"
                            ? true
                            : (o.approvalStatus || "approved") === approvalFilterStatus
                        )
                        .map((o) => {
                          const id = o._id || o.id;
                          const isActing = rowActionId === `opp_${id}`;
                          const status = o.approvalStatus || "approved";

                          return (
                            <Card key={id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200 bg-white">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-slate-950 text-base">{o.title}</h4>
                                  <Badge variant={getApprovalBadgeVariant(status)} size="sm">
                                    {status.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Company: {o.companyName || "Employer"} • Type: {o.type || "job"} • Location: {o.location || "Nepal"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  loading={isActing}
                                  onClick={() => handleUpdateOpportunityApproval(id, "approved")}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  ✓ Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  loading={isActing}
                                  onClick={() => handleUpdateOpportunityApproval(id, "rejected")}
                                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                >
                                  ✕ Reject
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  )}

                  {approvalTab === "classes" && (
                    <div className="space-y-3">
                      {classes
                        .filter((cls) =>
                          approvalFilterStatus === "all"
                            ? true
                            : (cls.approvalStatus || "approved") === approvalFilterStatus
                        )
                        .map((cls) => {
                          const id = cls._id || cls.id;
                          const isActing = rowActionId === `cls_${id}`;
                          const status = cls.approvalStatus || "approved";

                          return (
                            <Card key={id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200 bg-white">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-slate-950 text-base">{cls.classTitle}</h4>
                                  <Badge variant={getApprovalBadgeVariant(status)} size="sm">
                                    {status.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Instructor: {cls.instructorOrOrganization || "N/A"} • Mode: {cls.mode || "recorded"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  loading={isActing}
                                  onClick={() => handleUpdateOnlineClassApproval(id, "approved")}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  ✓ Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  loading={isActing}
                                  onClick={() => handleUpdateOnlineClassApproval(id, "rejected")}
                                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                >
                                  ✕ Reject
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: USER MANAGEMENT */}
              {activeSection === "users" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-black sm:text-3xl text-slate-950">
                      User Management & Roles
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                      Manage all platform users, update access roles, and suspend or reactivate accounts.
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-white p-4 border border-slate-200">
                    <Select
                      label="Filter by Role"
                      options={[{ value: "all", label: "All Roles" }, ...ROLE_OPTIONS]}
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    />
                    <Select
                      label="Filter by Account Status"
                      options={[{ value: "all", label: "All Statuses" }, ...ACCOUNT_STATUS_OPTIONS]}
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                    />
                  </div>

                  {/* Users Table */}
                  <Card className="overflow-x-auto p-0 border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase font-black">
                        <tr>
                          <th className="p-4">User</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {filteredUsers.map((u) => {
                          const uId = u._id || u.id;
                          const role = u.role || u.accountType || "student";
                          const status = u.accountStatus || "active";
                          const isRoleActing = rowActionId === `usr_role_${uId}`;
                          const isStatusActing = rowActionId === `usr_status_${uId}`;

                          return (
                            <tr key={uId} className="hover:bg-slate-50">
                              <td className="p-4">
                                <p className="font-black text-slate-950">{u.fullName || `${u.firstName || ''} ${u.lastName || ''}`}</p>
                                <p className="text-[11px] text-slate-500">{u.email}</p>
                              </td>
                              <td className="p-4">
                                <select
                                  value={role}
                                  disabled={isRoleActing}
                                  onChange={(e) => handleUserRoleChange(uId, e.target.value)}
                                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-800 focus:border-[#5472FC] focus:outline-none"
                                >
                                  {ROLE_OPTIONS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                      {r.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-4">
                                <Badge variant={getUserStatusBadgeVariant(status)} size="sm">
                                  {status.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                {role === "student" && u.studentProfile && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setViewingStudentProfile(u)}
                                  >
                                    👤 Profile
                                  </Button>
                                )}
                                <Button
                                  variant={status === "suspended" ? "primary" : "danger"}
                                  size="sm"
                                  loading={isStatusActing}
                                  onClick={() => handleUserStatusToggle(uId, status)}
                                  className={status === "suspended" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"}
                                >
                                  {status === "suspended" ? "Reactivate" : "Suspend"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                </div>
              )}

              {/* SECTION 4: INQUIRIES */}
              {activeSection === "inquiries" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-black sm:text-3xl text-slate-950">
                      Inquiries & Student Feedback
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                      Review inquiries submitted by prospective students and manage response statuses.
                    </p>
                  </div>

                  <Card className="overflow-x-auto p-0 border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase font-black">
                        <tr>
                          <th className="p-4">Student / College</th>
                          <th className="p-4">Message Preview</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {inquiries.map((inq) => {
                          const inqId = inq._id || inq.id;
                          const inqStatus = inq.status || "pending";
                          const isActing = rowActionId === `inq_${inqId}`;

                          return (
                            <tr key={inqId} className="hover:bg-slate-50">
                              <td className="p-4">
                                <p className="font-black text-slate-950">{inq.collegeName || "General Inquiry"}</p>
                                <p className="text-[11px] text-slate-500">Submitted on {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "Recent"}</p>
                              </td>
                              <td className="p-4 max-w-xs truncate text-slate-700">
                                "{inq.message}"
                              </td>
                              <td className="p-4">
                                <select
                                  value={inqStatus}
                                  disabled={isActing}
                                  onChange={(e) => handleInquiryStatusChange(inqId, e.target.value)}
                                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-800 focus:border-[#5472FC] focus:outline-none"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="read">Read</option>
                                  <option value="replied">Replied</option>
                                  <option value="closed">Closed</option>
                                </select>
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewingInquiry(inq)}
                                >
                                  🔍 View Full
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* STUDENT PROFILE DRAWER / MODAL */}
      {viewingStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-950">
              Student Profile Details
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Name:</strong> {viewingStudentProfile.fullName || viewingStudentProfile.firstName}</p>
              <p><strong>Email:</strong> {viewingStudentProfile.email}</p>
              <p><strong>Education Level:</strong> {viewingStudentProfile.studentProfile?.educationLevel || "N/A"}</p>
              <p><strong>Current Course:</strong> {viewingStudentProfile.studentProfile?.currentCourse || "N/A"}</p>
              <p><strong>Bio:</strong> {viewingStudentProfile.studentProfile?.bio || "N/A"}</p>
              {viewingStudentProfile.studentProfile?.skills && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {viewingStudentProfile.studentProfile.skills.map((s) => (
                    <span key={s} className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-black text-[#2551D9]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingStudentProfile(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* INQUIRY DETAIL MODAL */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-950">
              Inquiry Details
            </h3>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-800 space-y-2">
              <p><strong>Target:</strong> {viewingInquiry.collegeName || "General Platform"}</p>
              <p><strong>Date:</strong> {viewingInquiry.createdAt ? new Date(viewingInquiry.createdAt).toLocaleString() : "N/A"}</p>
              <p className="pt-2 font-bold">Message:</p>
              <p className="italic leading-relaxed text-slate-900">"{viewingInquiry.message}"</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingInquiry(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
