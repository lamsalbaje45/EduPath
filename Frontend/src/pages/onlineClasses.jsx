import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as api from "../api/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Input,
  Pagination,
  Select,
  Skeleton,
} from "../components/ui";

/**
 * Online Classes Browse Page
 * Real API endpoint: GET /classes
 * Displays paginated, searchable, filterable list of online courses & classes
 */

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "start_date", label: "Start Date Soonest" },
];

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

const PRICE_TYPE_OPTIONS = [
  { value: "", label: "All Prices" },
  { value: "free", label: "Free Only" },
  { value: "paid", label: "Paid Only" },
];

// Debounce search input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const formatLevel = (level) => {
  if (!level) return "";
  if (level === "all_levels") return "All Levels";
  return level.charAt(0).toUpperCase() + level.slice(1);
};

const formatMode = (mode) => {
  if (!mode) return "";
  if (mode === "self_paced") return "Self-Paced";
  return mode.charAt(0).toUpperCase() + mode.slice(1);
};

const formatPrice = (price) => {
  if (price === 0 || price === "0" || !price) {
    return "Free";
  }
  return `Rs. ${Number(price).toLocaleString()}`;
};

function OnlineClassesListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "newest",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );

  const [filters, setFilters] = useState({
    level: searchParams.get("level") || "",
    mode: searchParams.get("mode") || "",
    priceType: searchParams.get("priceType") || "",
    subject: searchParams.get("subject")?.split(",").filter(Boolean) || [],
    hasCertificate: searchParams.get("hasCertificate") === "true",
  });

  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Build query params for GET /classes
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 12,
      search: debouncedSearch,
    };

    if (sortBy === "newest") {
      params.sortBy = "createdAt";
      params.sortOrder = "desc";
    } else if (sortBy === "price_asc") {
      params.sortBy = "price";
      params.sortOrder = "asc";
    } else if (sortBy === "price_desc") {
      params.sortBy = "price";
      params.sortOrder = "desc";
    } else if (sortBy === "start_date") {
      params.sortBy = "startDate";
      params.sortOrder = "asc";
    }

    if (filters.level) params.level = filters.level;
    if (filters.mode) params.mode = filters.mode;
    if (filters.subject.length) params.subject = filters.subject.join(",");
    if (filters.hasCertificate) params.certificate = "true";

    if (filters.priceType === "free") {
      params.priceMax = 0;
    } else if (filters.priceType === "paid") {
      params.priceMin = 1;
    }

    return params;
  }, [currentPage, debouncedSearch, filters, sortBy]);

  // Sync URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.level) params.set("level", filters.level);
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.priceType) params.set("priceType", filters.priceType);
    if (filters.subject.length)
      params.set("subject", filters.subject.join(","));
    if (filters.hasCertificate) params.set("hasCertificate", "true");
    if (sortBy !== "newest") params.set("sortBy", sortBy);
    if (currentPage > 1) params.set("page", currentPage);
    setSearchParams(params);
  }, [
    currentPage,
    debouncedSearch,
    filters,
    setSearchParams,
    sortBy,
  ]);

  // Fetch online classes
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.listClasses(queryParams);
      const data = response.data || [];
      setClasses(data);
      setMeta(response.meta);

      // Accumulate available subject choices from responses
      setAvailableSubjects((prev) => {
        const subjectsSet = new Set(prev);
        data.forEach((item) => {
          item.subjects?.forEach((subj) => subjectsSet.add(subj));
        });
        return Array.from(subjectsSet).sort();
      });
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setError(
        err?.message || "Failed to load online classes. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Toggle subject filter
  const toggleSubjectFilter = (subject) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      subject: prev.subject.includes(subject)
        ? prev.subject.filter((item) => item !== subject)
        : [...prev.subject, subject],
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setFilters({
      level: "",
      mode: "",
      priceType: "",
      subject: [],
      hasCertificate: false,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    sortBy !== "newest" ||
    Boolean(filters.level) ||
    Boolean(filters.mode) ||
    Boolean(filters.priceType) ||
    filters.hasCertificate ||
    filters.subject.length > 0;

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-950">
            Online Classes & Courses
          </h1>
          <p className="mt-2 text-gray-600">
            Learn new skills and advance your education with flexible online courses
          </p>
        </div>

        {/* Search Input & Sort Dropdown */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Search classes, instructors, or subjects..."
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
        </div>

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
                {/* Level Filter */}
                <div>
                  <p className="mb-3 text-xs font-black uppercase text-gray-600">
                    Level
                  </p>
                  <Select
                    value={filters.level}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        level: e.target.value,
                      }));
                      setCurrentPage(1);
                    }}
                    options={LEVEL_OPTIONS}
                    placeholder="All levels"
                  />
                </div>

                {/* Mode Filter */}
                <div>
                  <p className="mb-3 text-xs font-black uppercase text-gray-600">
                    Learning Mode
                  </p>
                  <Select
                    value={filters.mode}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        mode: e.target.value,
                      }));
                      setCurrentPage(1);
                    }}
                    options={MODE_OPTIONS}
                    placeholder="All modes"
                  />
                </div>

                {/* Price Filter */}
                <div>
                  <p className="mb-3 text-xs font-black uppercase text-gray-600">
                    Price Type
                  </p>
                  <Select
                    value={filters.priceType}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        priceType: e.target.value,
                      }));
                      setCurrentPage(1);
                    }}
                    options={PRICE_TYPE_OPTIONS}
                    placeholder="All prices"
                  />
                </div>

                {/* Certificate Checkbox */}
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={filters.hasCertificate}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        hasCertificate: e.target.checked,
                      }));
                      setCurrentPage(1);
                    }}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-[#5472FC]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Certificate of completion
                  </span>
                </label>

                {/* Subjects Filter */}
                {availableSubjects.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-black uppercase text-gray-600">
                      Subjects
                    </p>
                    <div className="max-h-44 space-y-2 overflow-y-auto">
                      {availableSubjects.slice(0, 15).map((subj) => (
                        <label
                          key={subj}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={filters.subject.includes(subj)}
                            onChange={() => toggleSubjectFilter(subj)}
                            className="h-4 w-4 cursor-pointer accent-[#5472FC]"
                          />
                          <span className="text-sm text-gray-700">{subj}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </aside>

          {/* Classes Listing Grid */}
          <section className="lg:col-span-3" aria-live="polite">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Card key={idx}>
                    <Skeleton className="mb-4 h-6 w-3/4" />
                    <Skeleton className="mb-3 h-4 w-1/2" />
                    <Skeleton className="mb-4 h-16" />
                    <Skeleton className="h-9 w-full" />
                  </Card>
                ))}
              </div>
            ) : classes.length === 0 ? (
              <EmptyState
                title="No online classes found"
                message="Try adjusting your search or filters to find available courses."
                action="Clear Filters"
                onAction={clearAllFilters}
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {classes.map((cls) => {
                    const isFree = cls.price === 0 || cls.price === "0" || !cls.price;

                    return (
                      <Card
                        key={cls._id}
                        hover
                        className="flex flex-col justify-between"
                        onClick={() => navigate(`/online-classes/${cls._id}`)}
                      >
                        <div>
                          {/* Title & Instructor */}
                          <h2 className="mb-1 text-lg font-black text-slate-950">
                            {cls.classTitle}
                          </h2>
                          <p className="mb-3 text-sm font-semibold text-gray-600">
                            {cls.instructorOrOrganization}
                          </p>

                          {/* Badges: Mode & Level */}
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {cls.mode && (
                              <Badge variant="primary" size="sm">
                                {formatMode(cls.mode)}
                              </Badge>
                            )}
                            {cls.level && (
                              <Badge variant="secondary" size="sm">
                                {formatLevel(cls.level)}
                              </Badge>
                            )}
                            {isFree ? (
                              <Badge variant="success" size="sm">
                                Free
                              </Badge>
                            ) : (
                              <Badge variant="outline" size="sm">
                                {formatPrice(cls.price)}
                              </Badge>
                            )}
                            {cls.certificateAvailability && (
                              <Badge variant="warning" size="sm">
                                🎓 Certificate
                              </Badge>
                            )}
                          </div>

                          {/* Duration & Schedule */}
                          <div className="mb-3 space-y-1 text-sm text-gray-600">
                            {cls.duration && (
                              <p className="flex items-center gap-1">
                                <span>⏱️</span>
                                <span>Duration: {cls.duration}</span>
                              </p>
                            )}
                            {cls.schedule && (
                              <p className="flex items-center gap-1">
                                <span>📅</span>
                                <span>{cls.schedule}</span>
                              </p>
                            )}
                          </div>

                          {/* Top 3 Subject Chips */}
                          {cls.subjects?.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-1.5">
                              {cls.subjects.slice(0, 3).map((subj) => (
                                <Badge key={subj} variant="outline" size="sm">
                                  {subj}
                                </Badge>
                              ))}
                              {cls.subjects.length > 3 && (
                                <Badge variant="outline" size="sm">
                                  +{cls.subjects.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          {/* View details button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/online-classes/${cls._id}`);
                            }}
                          >
                            View details
                          </Button>
                        </div>
                      </Card>
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

export default OnlineClassesListing;
