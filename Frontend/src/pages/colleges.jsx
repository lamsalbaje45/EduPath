import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as api from "../api/endpoints";
import {
  Card,
  Skeleton,
  Badge,
  Input,
  Select,
  Pagination,
  EmptyState,
  ErrorBanner,
} from "../components/ui";
import { Reveal, SectionLabel, GradientCard } from "../components/ui/design";

/**
 * Colleges Browse Page
 * Real API endpoint: GET /colleges
 * Displays paginated, searchable, filterable list of approved colleges
 */

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rating" },
  { value: "newest", label: "Newest First" },
  { value: "name", label: "College Name" },
];

const ADMISSION_STATUS_OPTIONS = [
  { value: "open", label: "Open for Admission" },
  { value: "closed", label: "Admission Closed" },
  { value: "coming_soon", label: "Coming Soon" },
];

// Debounce search term
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

function CollegeListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState({
    city: searchParams.get("city")?.split(",").filter(Boolean) || [],
    affiliation: searchParams.getAll("affiliation") || [],
    admissionStatus: searchParams.get("admissionStatus") || "",
    course: searchParams.get("course")?.split(",").filter(Boolean) || [],
  });

  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "rating");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );

  // Meta from API
  const [meta, setMeta] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableAffiliations, setAvailableAffiliations] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 12,
      search: debouncedSearch,
      sortBy:
        sortBy === "rating"
          ? "rating"
          : sortBy === "newest"
            ? "createdAt"
            : "collegeName",
      sortOrder: sortBy === "name" ? "asc" : "desc",
      approvalStatus: "approved", // Only show approved colleges
    };

    if (filters.city.length > 0) params.city = filters.city.join(",");
    if (filters.affiliation.length > 0)
      params.affiliation = filters.affiliation[0]; // Backend accepts single affiliation
    if (filters.admissionStatus)
      params.admissionStatus = filters.admissionStatus;
    if (filters.course.length > 0) params.course = filters.course.join(",");

    return params;
  }, [currentPage, debouncedSearch, sortBy, filters]);

  // Update URL when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (debouncedSearch) newSearchParams.set("search", debouncedSearch);
    if (filters.city.length > 0)
      newSearchParams.set("city", filters.city.join(","));
    if (filters.affiliation.length > 0)
      newSearchParams.set("affiliation", filters.affiliation[0]);
    if (filters.admissionStatus)
      newSearchParams.set("admissionStatus", filters.admissionStatus);
    if (filters.course.length > 0)
      newSearchParams.set("course", filters.course.join(","));
    if (currentPage > 1) newSearchParams.set("page", currentPage);
    setSearchParams(newSearchParams);
  }, [debouncedSearch, filters, currentPage, setSearchParams]);

  // Fetch colleges
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.listColleges(queryParams);
      setColleges(response.data || []);
      setMeta(response.meta);

      // Extract available filter options from results
      const allCities = new Set();
      const allAffiliations = new Set();
      const allCourses = new Set();

      response.data?.forEach((college) => {
        if (college.city) allCities.add(college.city);
        if (college.affiliation) allAffiliations.add(college.affiliation);
        if (Array.isArray(college.courses)) {
          college.courses.forEach((course) => allCourses.add(course));
        }
      });

      setAvailableCities(Array.from(allCities).sort());
      setAvailableAffiliations(Array.from(allAffiliations).sort());
      setAvailableCourses(Array.from(allCourses).sort());
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
      setError(err?.message || "Failed to load colleges. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  // Fetch on params change
  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setCurrentPage(1); // Reset to page 1
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const handleToggleCityFilter = (city) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      city: prev.city.includes(city)
        ? prev.city.filter((c) => c !== city)
        : [...prev.city, city],
    }));
  };

  const handleToggleCourseFilter = (course) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      course: prev.course.includes(course)
        ? prev.course.filter((c) => c !== course)
        : [...prev.course, course],
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({ city: [], affiliation: [], admissionStatus: "", course: [] });
    setSortBy("rating");
    setCurrentPage(1);
  };

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-[#F7F8FA]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
          <Reveal>
            <SectionLabel>Colleges</SectionLabel>
            <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              Explore Colleges
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Find colleges and programs that match your interests and goals.
            </p>
          </Reveal>

          <Reveal
            delay={100}
            className="mt-8 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3"
          >
            <Input
              placeholder="Search colleges, cities, courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-950">Filters</h3>
                {(searchTerm ||
                  Object.values(filters).some((f) =>
                    Array.isArray(f) ? f.length > 0 : f,
                  )) && (
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
                {/* City Filter */}
                {availableCities.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-black uppercase text-gray-600">
                      City
                    </p>
                    <div className="space-y-2">
                      {availableCities.slice(0, 8).map((city) => (
                        <label
                          key={city}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={filters.city.includes(city)}
                            onChange={() => handleToggleCityFilter(city)}
                            className="h-4 w-4 cursor-pointer accent-[#5472FC]"
                          />
                          <span className="text-sm text-gray-700">{city}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affiliation Filter */}
                {availableAffiliations.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-black uppercase text-gray-600">
                      Affiliation
                    </p>
                    <Select
                      value={filters.affiliation[0] || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "affiliation",
                          e.target.value ? [e.target.value] : [],
                        )
                      }
                      options={availableAffiliations.map((aff) => ({
                        value: aff,
                        label: aff,
                      }))}
                      placeholder="All affiliations"
                    />
                  </div>
                )}

                {/* Admission Status Filter */}
                <div>
                  <p className="mb-3 text-xs font-black uppercase text-gray-600">
                    Admission Status
                  </p>
                  <Select
                    value={filters.admissionStatus}
                    onChange={(e) =>
                      handleFilterChange("admissionStatus", e.target.value)
                    }
                    options={ADMISSION_STATUS_OPTIONS}
                    placeholder="All statuses"
                  />
                </div>

                {/* Course Filter */}
                {availableCourses.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-black uppercase text-gray-600">
                      Courses
                    </p>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {availableCourses.slice(0, 10).map((course) => (
                        <label
                          key={course}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={filters.course.includes(course)}
                            onChange={() => handleToggleCourseFilter(course)}
                            className="h-4 w-4 cursor-pointer accent-[#5472FC]"
                          />
                          <span className="text-sm text-gray-700">
                            {course}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Colleges Grid */}
          <div className="lg:col-span-3">
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
            ) : colleges.length === 0 ? (
              <EmptyState
                title="No colleges found"
                message="Try adjusting your search or filters to find colleges that match your interests"
                action="Clear Filters"
                onAction={clearAllFilters}
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {colleges.map((college, index) => {
                    const statusVariant =
                      college.admissionStatus === "open"
                        ? "success"
                        : college.admissionStatus === "closed"
                          ? "danger"
                          : "warning";
                    const statusLabel =
                      college.admissionStatus === "open"
                        ? "Open for Admission"
                        : college.admissionStatus === "closed"
                          ? "Admission Closed"
                          : "Coming Soon";

                    return (
                      <Reveal key={college._id} delay={(index % 6) * 60}>
                        <GradientCard
                          accent="blue"
                          icon="graduation"
                          kicker="College"
                          onClick={() => navigate(`/colleges/${college._id}`)}
                          badge={
                            college.rating > 0 ? (
                              <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-black text-amber-600">
                                {college.rating.toFixed(1)} ★
                              </span>
                            ) : null
                          }
                          title={college.collegeName}
                          subtitle={college.affiliation || "Affiliated program"}
                          metaItems={[
                            { icon: "pin", text: college.city || "Nepal" },
                          ]}
                          footer="View details"
                        >
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <Badge variant={statusVariant} size="sm">
                              {statusLabel}
                            </Badge>
                            {college.courses?.slice(0, 2).map((course) => (
                              <Badge key={course} variant="secondary" size="sm">
                                {course}
                              </Badge>
                            ))}
                            {college.courses?.length > 2 && (
                              <Badge variant="outline" size="sm">
                                +{college.courses.length - 2} more
                              </Badge>
                            )}
                          </div>
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
          </div>
        </div>
      </div>
    </main>
  );
}

export default CollegeListing;
