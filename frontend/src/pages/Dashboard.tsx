import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllJobs } from "../api/jobs";
import type { JobApplication } from "../types";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const STATUS_BADGE: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-yellow-100 text-yellow-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

// Normalise DB values like "applied" → "Applied" before any lookup or comparison
const titleCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const STATS = [
  {
    label: "Applied",
    card: "border-blue-200 bg-blue-50",
    text: "text-blue-600",
  },
  {
    label: "Interview",
    card: "border-yellow-200 bg-yellow-50",
    text: "text-yellow-600",
  },
  {
    label: "Offer",
    card: "border-green-200 bg-green-50",
    text: "text-green-600",
  },
  { label: "Rejected", card: "border-red-200 bg-red-50", text: "text-red-600" },
] as const;

const Spinner = () => (
  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
);

const Dashboard = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchJobs = async () => {
      try {
        const jobs = await getAllJobs(token);
        setApplications(jobs);
      } catch (_err) {
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filtered = applications
    .filter((j) => j.company_name.toLowerCase().includes(search.toLowerCase()))
    .filter((j) => !statusFilter || titleCase(j.status) === statusFilter);

  const counts = Object.fromEntries(
    STATS.map(({ label }) => [
      label,
      applications.filter((j) => titleCase(j.status) === label).length,
    ]),
  ) as Record<string, number>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard">
            <span className="text-base font-bold text-indigo-700">
              JobTracker
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/addApplication")}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Add Application
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS.map(({ label, card, text }) => (
            <div
              key={label}
              className={`border rounded-2xl p-4 cursor-pointer transition-all ${card} ${statusFilter === label ? "ring-2 ring-indigo-400" : ""}`}
              onClick={() =>
                setStatusFilter(statusFilter === label ? "" : label)
              }
            >
              <p className={`text-3xl font-bold ${text}`}>{counts[label]}</p>
              <p className="text-sm text-gray-600 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Job list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">
            {applications.length === 0
              ? "No applications yet — add your first one!"
              : "No results match your search."}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <div
                key={job.job_id}
                onClick={() => navigate(`/jobs/${job.job_id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all"
              >
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {job.company_name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">
                    {job.role}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {job.date_applied
                      ? new Date(job.date_applied).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                    {job.platform ? ` · ${job.platform}` : ""}
                  </p>
                </div>
                <span
                  className={`ml-4 shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[titleCase(job.status)] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {titleCase(job.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
