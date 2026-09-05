import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../api/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  LoadingSpinner,
} from "../components/ui";

/**
 * Applications Page (ProtectedRoute)
 * Full version of the "My Applications" management page.
 *
 * Features:
 * - Table/list of all applications submitted by the current student
 * - Opportunity Title link, Company Name, Applied Date, Cover Message preview
 * - Status badges (Draft, Submitted, Reviewing, Shortlisted, Rejected, Accepted)
 * - Cancel/Withdraw action (restricted to 'draft' or 'submitted' status)
 * - Status-filter tabs: All, Draft, Submitted, Reviewing, Shortlisted, Rejected, Accepted
 */

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Submitted" },
  { id: "reviewing", label: "Reviewing" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
  { id: "draft", label: "Draft" },
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
      return "primary";
    case "draft":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "secondary";
  }
}

function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter tab state
  const [activeFilter, setActiveFilter] = useState("all");

  // Withdrawal state
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawModalApp, setWithdrawModalApp] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getApplications();
      setApplications(response.data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(err?.message || "Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle Application Withdrawal
  const handleConfirmWithdraw = async () => {
    if (!withdrawModalApp) return;
    const appId = withdrawModalApp.id || withdrawModalApp._id;

    setWithdrawingId(appId);
    try {
      await api.withdrawApplication(appId);
      setApplications((prev) => prev.filter((a) => (a.id || a._id) !== appId));
      setActionSuccess(
        `Application for "${withdrawModalApp.opportunityTitle || withdrawModalApp.title || "Opportunity"}" was withdrawn successfully.`
      );
      setTimeout(() => setActionSuccess(""), 4000);
      setWithdrawModalApp(null);
    } catch (err) {
      console.error("Failed to withdraw application:", err);
      setError(err?.message || "Failed to withdraw application. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  // Filtered Applications
  const filteredApplications = applications.filter((app) => {
    if (activeFilter === "all") return true;
    return (app.status || "submitted").toLowerCase() === activeFilter;
  });

  return (
    <main className="min-h-screen bg-[#F7F8FA] pb-16 text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-0">
        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5472FC]">
              Student Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              My Applications
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track real-time updates and status changes on all your submitted job & internship applications.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/jobs")}
            className="bg-[#5472FC] hover:bg-[#435DDE]"
          >
            Explore More Jobs ↗
          </Button>
        </div>

        {/* Action Alerts */}
        {actionSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            ✓ {actionSuccess}
          </div>
        )}
        {error && (
          <ErrorBanner
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Status Filter Tabs */}
        <div className="mb-6 flex border-b border-slate-200 overflow-x-auto">
          {STATUS_FILTERS.map((tab) => {
            const count =
              tab.id === "all"
                ? applications.length
                : applications.filter(
                    (a) => (a.status || "submitted").toLowerCase() === tab.id
                  ).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-black transition-colors ${
                  activeFilter === tab.id
                    ? "border-[#5472FC] text-[#5472FC]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}{" "}
                <span
                  className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
                    activeFilter === tab.id
                      ? "bg-[#E7EEFF] text-[#2551D9]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <LoadingSpinner size="lg" message="Loading your applications..." />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            title={
              activeFilter === "all"
                ? "No applications submitted yet"
                : `No applications with status "${activeFilter}"`
            }
            message={
              activeFilter === "all"
                ? "Start applying to open job and internship positions to track your progress here."
                : "You have no applications matching this filter status."
            }
            action={activeFilter === "all" ? "Browse Opportunities" : "Clear Filter"}
            onAction={
              activeFilter === "all"
                ? () => navigate("/jobs")
                : () => setActiveFilter("all")
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const appId = app.id || app._id;
              const oppId = app.opportunityId || app.opportunity?._id;
              const title =
                app.opportunityTitle ||
                app.title ||
                app.opportunity?.title ||
                `Opportunity #${oppId || "N/A"}`;
              const company =
                app.companyName ||
                app.opportunity?.companyName ||
                "Organization";
              const dateStr = app.appliedAt || app.appliedDate || app.createdAt;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Recent";

              const status = (app.status || "submitted").toLowerCase();
              const canWithdraw = status === "draft" || status === "submitted";

              return (
                <Card
                  key={appId}
                  className="flex flex-col gap-4 justify-between border-slate-200 bg-white p-5 sm:p-6 md:flex-row md:items-center"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {oppId ? (
                        <Link
                          to={`/jobs/${oppId}`}
                          className="text-lg font-black text-slate-950 transition-colors hover:text-[#5472FC]"
                        >
                          {title} ↗
                        </Link>
                      ) : (
                        <h3 className="text-lg font-black text-slate-950">
                          {title}
                        </h3>
                      )}
                      <Badge variant={getBadgeVariant(status)} size="sm">
                        {status.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-xs font-bold text-slate-500">
                      Company: <span className="text-slate-800">{company}</span> • Applied on {formattedDate}
                    </p>

                    {app.coverMessage && (
                      <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                        <span className="font-bold text-slate-800 block mb-0.5">
                          Cover Message:
                        </span>
                        <p className="line-clamp-2 italic">"{app.coverMessage}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {oppId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${oppId}`)}
                      >
                        View Job Details
                      </Button>
                    )}

                    {canWithdraw && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setWithdrawModalApp(app)}
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                      >
                        Withdraw Application
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal for Application Withdrawal */}
        {withdrawModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-black text-slate-950">
                Withdraw Application?
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to withdraw your application for{" "}
                <strong>
                  {withdrawModalApp.opportunityTitle || withdrawModalApp.title || "this position"}
                </strong>
                ? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setWithdrawModalApp(null)}
                  disabled={!!withdrawingId}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleConfirmWithdraw}
                  loading={!!withdrawingId}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirm Withdraw
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Applications;
