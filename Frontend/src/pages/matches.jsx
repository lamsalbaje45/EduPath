import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import { Badge, EmptyState, ErrorBanner, LoadingSpinner } from "../components/ui";

/**
 * Matches Page (ProtectedRoute)
 * Full list of the student's recommended colleges, jobs/internships, and online
 * classes -- the complete data behind the home page's "Recommended for you"
 * preview, which only shows one item per category.
 */

const SECTIONS = [
  { key: "colleges", title: "Recommended Colleges" },
  { key: "opportunities", title: "Recommended Jobs & Internships" },
  { key: "classes", title: "Recommended Online Classes" },
];

function CollegeMatchCard({ college }) {
  const id = college._id || college.id;
  return (
    <Link
      to={`/colleges/${id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#B8CAFF] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black text-slate-950">{college.collegeName}</h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {typeof college.matchPercentage === "number" && (
            <span className="rounded-full bg-[#E7EEFF] px-2 py-0.5 text-[10px] font-black text-[#2551D9]">
              {college.matchPercentage}% match
            </span>
          )}
          {college.rating > 0 && (
            <Badge variant="warning" size="sm">
              {college.rating.toFixed(1)} / 5
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {college.city || "Nepal"}
        {college.affiliation && ` • ${college.affiliation}`}
      </p>
      {college.courses?.length > 0 && (
        <p className="mt-2 text-xs text-slate-600">
          {college.courses.slice(0, 3).join(", ")}
        </p>
      )}
    </Link>
  );
}

function OpportunityMatchCard({ opportunity }) {
  const id = opportunity._id || opportunity.id;
  return (
    <Link
      to={`/jobs/${id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#B8CAFF] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black text-slate-950">{opportunity.title}</h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {typeof opportunity.matchPercentage === "number" && (
            <span className="rounded-full bg-[#E7EEFF] px-2 py-0.5 text-[10px] font-black text-[#2551D9]">
              {opportunity.matchPercentage}% match
            </span>
          )}
          <Badge variant="outline" size="sm">
            {opportunity.type === "internship" ? "Internship" : "Job"}
          </Badge>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {opportunity.companyName} • {opportunity.workMode || opportunity.location || "Onsite"}
      </p>
      <p className="mt-2 text-xs font-semibold text-slate-700">
        {opportunity.stipendOrSalaryRange || "Competitive"}
      </p>
    </Link>
  );
}

function ClassMatchCard({ onlineClass }) {
  const id = onlineClass._id || onlineClass.id;
  return (
    <Link
      to={`/online-classes/${id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#B8CAFF] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black text-slate-950">{onlineClass.classTitle}</h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {typeof onlineClass.matchPercentage === "number" && (
            <span className="rounded-full bg-[#E7EEFF] px-2 py-0.5 text-[10px] font-black text-[#2551D9]">
              {onlineClass.matchPercentage}% match
            </span>
          )}
          {onlineClass.certificateAvailability && (
            <Badge variant="warning" size="sm">
              Certificate
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {onlineClass.mode || "Live class"} • {onlineClass.duration || "Flexible"}
      </p>
      <p className="mt-2 text-xs font-semibold text-slate-700">
        {onlineClass.price ? `Rs. ${onlineClass.price}` : "Free"}
      </p>
    </Link>
  );
}

function Matches() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState({ colleges: [], opportunities: [], classes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRecommendations("all");
      const result = response?.data || response;
      setData({
        colleges: result?.colleges || [],
        opportunities: result?.opportunities || [],
        classes: result?.classes || [],
      });
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError(err?.message || "Failed to load your matches. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const totalMatches = data.colleges.length + data.opportunities.length + data.classes.length;

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="inline-flex rounded-full bg-[#E7EEFF] px-3 py-1.5 text-[11px] font-black text-[#2551D9]">
            Your Matches
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            All recommendations for {user?.firstName || "you"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Every college, job, internship, and online class EduPath has matched to your profile and career interests.
          </p>
        </div>

        {error && <ErrorBanner message={error} onClose={() => setError(null)} className="mb-6" />}

        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Loading your matches..." />
          </div>
        ) : totalMatches === 0 ? (
          <EmptyState
            title="No matches found yet"
            message="Complete your student profile with preferred courses, cities, skills, and career interests so EduPath can find your best matches."
            actionLabel="Complete Profile"
            onAction={() => navigate("/profile")}
          />
        ) : (
          <div className="space-y-10">
            {SECTIONS.map((section) => {
              const items = data[section.key];
              return (
                <section key={section.key}>
                  <h2 className="mb-4 text-lg font-black text-slate-950">
                    {section.title} {items.length > 0 && `(${items.length})`}
                  </h2>
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5 text-center">
                      <p className="text-xs font-bold text-slate-500">No matches in this category yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {section.key === "colleges" &&
                        items.map((college) => (
                          <CollegeMatchCard key={college._id || college.id} college={college} />
                        ))}
                      {section.key === "opportunities" &&
                        items.map((opportunity) => (
                          <OpportunityMatchCard
                            key={opportunity._id || opportunity.id}
                            opportunity={opportunity}
                          />
                        ))}
                      {section.key === "classes" &&
                        items.map((onlineClass) => (
                          <ClassMatchCard
                            key={onlineClass._id || onlineClass.id}
                            onlineClass={onlineClass}
                          />
                        ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Matches;
