import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as api from "../api/endpoints";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Input,
  Pagination,
  Select,
  Skeleton,
} from "../components/ui";
import { Reveal, SectionLabel, GradientCard } from "../components/ui/design";

/**
 * Jobs & Internships Browse Page
 * Real API endpoint: GET /opportunities
 * Displays paginated, searchable, filterable list of active (and optional closed/draft) opportunities
 */

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "deadline", label: "Deadline Soonest" },
];

const WORK_MODE_OPTIONS = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const OPPORTUNITY_TYPES = [
  { value: "", label: "All" },
  { value: "job", label: "Jobs" },
  { value: "internship", label: "Internships" },
];

// Debounce search term
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const toTitleCase = (value) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";

/**
 * Helper to compute countdown or closed status for opportunity deadline
 */
const deadlineLabel = (opportunity) => {
  if (opportunity.status !== "active") {
    return opportunity.status === "draft" ? "Draft" : "Closed";
  }
  if (!opportunity.applicationDeadline) {
    return "No deadline listed";
  }

  const deadlineTime = new Date(opportunity.applicationDeadline).getTime();
  if (Number.isNaN(deadlineTime)) return "No deadline listed";

  const now = Date.now();
  if (deadlineTime < now) return "Closed";

  const daysRemaining = Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24));
  if (daysRemaining === 0) return "Closes today";
  if (daysRemaining === 1) return "1 day left";
  return `${daysRemaining} days left`;
};

function JobsListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Search & type tab filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [type, setType] = useState(searchParams.get("type") || "");
  const [showAllStatuses, setShowAllStatuses] = useState(
    searchParams.get("showAllStatuses") === "true",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "newest",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );

  // Sidebar Filters
  const [filters, setFilters] = useState({
    workMode: searchParams.get("workMode") || "",
    location: searchParams.get("location")?.split(",").filter(Boolean) || [],
    skill: searchParams.get("skill")?.split(",").filter(Boolean) || [],
    suitableCourse:
      searchParams.get("suitableCourse")?.split(",").filter(Boolean) || [],
  });

  // Unique options extracted from responses
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  // Build API query params
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 12,
      search: debouncedSearch,
      sortBy: sortBy === "deadline" ? "applicationDeadline" : "createdAt",
      sortOrder: sortBy === "deadline" ? "asc" : "desc",
      approvalStatus: "approved",
    };

    if (type) params.type = type;
    if (!showAllStatuses) params.status = "active";
    if (filters.workMode) params.workMode = filters.workMode;
    if (filters.location.length) params.location = filters.location.join(",");
    if (filters.skill.length) params.skill = filters.skill.join(",");
    if (filters.suitableCourse.length) {
      params.suitableCourse = filters.suitableCourse.join(",");
    }

    return params;
  }, [currentPage, debouncedSearch, filters, showAllStatuses, sortBy, type]);

  // Update URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (type) params.set("type", type);
    if (filters.workMode) params.set("workMode", filters.workMode);
    if (filters.location.length)
      params.set("location", filters.location.join(","));
    if (filters.skill.length) params.set("skill", filters.skill.join(","));
    if (filters.suitableCourse.length) {
      params.set("suitableCourse", filters.suitableCourse.join(","));
    }
    if (showAllStatuses) params.set("showAllStatuses", "true");
    if (sortBy !== "newest") params.set("sortBy", sortBy);
    if (currentPage > 1) params.set("page", currentPage);
    setSearchParams(params);
  }, [
    currentPage,
    debouncedSearch,
    filters,
    setSearchParams,
    showAllStatuses,
    sortBy,
    type,
  ]);

  // Fetch opportunities from GET /opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.listOpportunities(queryParams);
      const data = response.data || [];
      setOpportunities(data);
      setMeta(response.meta);

      // Accumulate available filter choices across responses
      setAvailableLocations((prev) => {
        const locationsSet = new Set(prev);
        data.forEach((item) => {
          if (item.location) locationsSet.add(item.location);
        });
        return Array.from(locationsSet).sort();
      });

      setAvailableSkills((prev) => {
        const skillsSet = new Set(prev);
        data.forEach((item) => {
          item.requiredSkills?.forEach((skill) => skillsSet.add(skill));
        });
        return Array.from(skillsSet).sort();
      });

      setAvailableCourses((prev) => {
        const coursesSet = new Set(prev);
        data.forEach((item) => {
          item.suitableCourses?.forEach((course) => coursesSet.add(course));
        });
        return Array.from(coursesSet).sort();
      });
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
      setError(
        err?.message || "Failed to load opportunities. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Filter helper functions
  const toggleArrayFilter = (filterKey, value) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [filterKey]: prev[filterKey].includes(value)
        ? prev[filterKey].filter((item) => item !== value)
        : [...prev[filterKey], value],
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setType("");
    setShowAllStatuses(false);
    setSortBy("newest");
    setFilters({ workMode: "", location: [], skill: [], suitableCourse: [] });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(type) ||
    showAllStatuses ||
    sortBy !== "newest" ||
    Object.values(filters).some((val) =>
      Array.isArray(val) ? val.length > 0 : Boolean(val),
    );

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-[#F7F8FA]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
          <Reveal>
            <SectionLabel>Jobs and internships</SectionLabel>
            <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              Jobs & Internships
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Discover opportunities that match your skills, interests, and courses.
            </p>
          </Reveal>

          {/* Type Filter Tabs (All / Jobs / Internships) */}
          <Reveal
            delay={80}
            className="mt-8 flex flex-wrap gap-2"
            as="div"
          >
            <div role="tablist" aria-label="Opportunity types" className="flex flex-wrap gap-2">
              {OPPORTUNITY_TYPES.map((tab) => {
                const isActive = type === tab.value;
                return (
                  <button
                    key={tab.value || "all"}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setType(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full px-5 py-2 text-sm font-black transition-all ${
                      isActive
                        ? "bg-[#5472FC] text-white shadow-sm shadow-[#5472FC]/30"
                        : "bg-white text-slate-700 ring-1 ring-gray-200 hover:ring-[#5472FC] hover:text-[#2551D9]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal
            delay={140}
            className="mt-4 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3"
          >
            <Input
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="md:col-span-2"
            />
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              options={SORT_OPTIONS}
            />
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Error Banner */}
        {error && (
          <ErrorBanner
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-950">Filters</h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-[#5472FC] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Status Toggle */}
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={showAllStatuses}
                    onChange={(e) => {
                      setShowAllStatuses(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-[#5472FC]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Show closed & draft listings
                  </span>
                </label>

                {/* Work Mode Filter */}
                <div>
                  <p className="mb-3 text-xs font-black uppercase text-gray-600">
                    Work Mode
                  </p>
                  <Select
                    value={filters.workMode}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        workMode: e.target.value,
                      }));
                      setCurrentPage(1);
                    }}
                    options={WORK_MODE_OPTIONS}
                    placeholder="All work modes"
                  />
                </div>

                {/* Location Filter */}
                {availableLocations.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-black uppercase text-gray-600">
                      Location
                    </p>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {availableLocations.slice(0, 10).map((loc) => (
                        <label
                          key={loc}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={filters.location.includes(loc)}
                            onChange={() => toggleArrayFilter("location", loc)}
                            className="h-4 w-4 cursor-pointer accent-[#5472FC]"
                          />
                          <span className="text-sm text-gray-700">{loc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Skills Filter */}
                {availableSkills.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-black uppercase text-gray-600">
                      Required Skills
                    </p>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {availableSkills.slice(0, 12).map((skill) => (
                        <label
                          key={skill}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={filters.skill.includes(skill)}
                            onChange={() => toggleArrayFilter("skill", skill)}
                            className="h-4 w-4 cursor-pointer accent-[#5472FC]"
                          />
                          <span className="text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suitable Courses Filter */}
                {availableCourses.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-black uppercase text-gray-600">
                      Suitable Courses
                    </p>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {availableCourses.slice(0, 12).map((course) => (
                        <label
                          key={course}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={filters.suitableCourse.includes(course)}
                            onChange={() =>
                              toggleArrayFilter("suitableCourse", course)
                            }
                            className="h-4 w-4 cursor-pointer accent-[#5472FC]"
                          />
                          <span className="text-sm text-gray-700">{course}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </aside>

          {/* Opportunities Listing Grid */}
          <section className="lg:col-span-3" aria-live="polite">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <Skeleton className="h-28 rounded-none" />
                    <div className="p-4">
                      <Skeleton className="mb-2 h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <EmptyState
                title="No opportunities found"
                message="Try adjusting your search or filters to discover available jobs and internships."
                action="Clear Filters"
                onAction={clearAllFilters}
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {opportunities.map((opportunity, index) => {
                    const deadlineText = deadlineLabel(opportunity);
                    const isClosed =
                      deadlineText === "Closed" ||
                      opportunity.status !== "active";

                    return (
                      <Reveal key={opportunity._id} delay={(index % 6) * 60}>
                        <GradientCard
                          accent="emerald"
                          icon="briefcase"
                          kicker={toTitleCase(opportunity.type)}
                          onClick={() => navigate(`/jobs/${opportunity._id}`)}
                          badge={
                            opportunity.workMode ? (
                              <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                                {toTitleCase(opportunity.workMode)}
                              </span>
                            ) : null
                          }
                          title={opportunity.title}
                          subtitle={opportunity.companyName}
                          metaItems={[
                            opportunity.location
                              ? { icon: "pin", text: opportunity.location }
                              : null,
                            opportunity.stipendOrSalaryRange
                              ? { icon: "briefcase", text: opportunity.stipendOrSalaryRange }
                              : null,
                          ].filter(Boolean)}
                          footer="View details"
                        >
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {opportunity.status && opportunity.status !== "active" && (
                              <Badge variant="danger" size="sm">
                                {toTitleCase(opportunity.status)}
                              </Badge>
                            )}
                            {opportunity.requiredSkills?.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="secondary" size="sm">
                                {skill}
                              </Badge>
                            ))}
                            {opportunity.requiredSkills?.length > 2 && (
                              <Badge variant="outline" size="sm">
                                +{opportunity.requiredSkills.length - 2} more
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`mt-3 text-xs font-bold ${
                              isClosed ? "text-red-600" : "text-emerald-700"
                            }`}
                          >
                            {deadlineText}
                          </p>
                        </GradientCard>
                      </Reveal>
                    );
                  })}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination
                      currentPage={meta.page}
                      totalPages={meta.totalPages}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default JobsListing;
