import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getJobById,
  updateJob,
  deleteJob,
  getStatusByJobId,
  createStatus,
  deleteStatus,
} from "../api/jobs";
import type { JobApplication, ApplicationStatus } from "../types";
import { useParams, useNavigate } from "react-router-dom";

const STATUS_BADGE: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-yellow-100 text-yellow-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const titleCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const ROUND_STATUS_BADGE: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-700",
  Passed: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-700",
  Withdrawn: "bg-orange-100 text-orange-700",
};

const Spinner = () => (
  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
);

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobApplication | null>(null);
  const [rounds, setRounds] = useState<ApplicationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<JobApplication>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete job state
  const [deleteLoading, setDeleteLoading] = useState(false);

  // New round form state
  const [roundForm, setRoundForm] = useState({
    round: "",
    round_status: "",
    date: "",
    notes: "",
  });
  const [roundLoading, setRoundLoading] = useState(false);
  const [roundError, setRoundError] = useState("");

  useEffect(() => {
    if (!token || !id) return;

    const fetchData = async () => {
      try {
        const [jobData, statusData] = await Promise.all([
          getJobById(token, id),
          getStatusByJobId(token, id),
        ]);
        setJob(jobData[0]);
        setRounds(Array.isArray(statusData) ? statusData : []);
      } catch (_err) {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, id]);

  const handleEditSave = async () => {
    if (!token || !id || !job) return;
    setEditLoading(true);
    setEditError("");
    try {
      const updated = await updateJob(token, id, {
        ...job,
        ...editForm,
      } as JobApplication);
      setJob(updated[0]);
      setEditing(false);
      setEditForm({});
    } catch (_err) {
      setEditError("Failed to save changes");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!token || !id) return;
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    setDeleteLoading(true);
    try {
      await deleteJob(token, id);
      navigate("/dashboard");
    } catch (_err) {
      setError("Failed to delete application");
      setDeleteLoading(false);
    }
  };

  const handleAddRound = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setRoundLoading(true);
    setRoundError("");
    try {
      const newRounds = await createStatus(token, id, roundForm);
      setRounds([...rounds, newRounds[0]]);
      setRoundForm({ round: "", round_status: "", date: "", notes: "" });
    } catch (_err) {
      setRoundError("Failed to add interview round");
    } finally {
      setRoundLoading(false);
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    if (!token || !id) return;
    try {
      await deleteStatus(token, id, roundId);
      setRounds(rounds.filter((r) => r.app_id !== roundId));
    } catch (_err) {
      setRoundError("Failed to remove round");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ── Job Info Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {editing ? (
            /* Edit form */
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-700 mb-2">Edit Application</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Company Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={editForm.company_name ?? job.company_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, company_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Role
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={editForm.role ?? job.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={editForm.status ?? job.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Platform
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={editForm.platform ?? job.platform ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, platform: e.target.value })
                    }
                    placeholder="LinkedIn, Seek, Indeed..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={
                      (editForm.date_applied ?? job.date_applied ?? "").slice(0, 10)
                    }
                    onChange={(e) =>
                      setEditForm({ ...editForm, date_applied: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Job URL
                  </label>
                  <input
                    type="url"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={editForm.job_url ?? job.job_url ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, job_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={editForm.notes ?? job.notes ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                />
              </div>

              {editError && (
                <p className="text-sm text-red-600">{editError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleEditSave}
                  disabled={editLoading}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditForm({});
                    setEditError("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Read view */
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {job.company_name}
                  </h1>
                  <p className="text-base text-gray-500 mt-1">{job.role}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[titleCase(job.status)] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {titleCase(job.status)}
                </span>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Platform
                  </dt>
                  <dd className="mt-0.5 text-gray-900">{job.platform || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date Applied
                  </dt>
                  <dd className="mt-0.5 text-gray-900">
                    {job.date_applied
                      ? new Date(job.date_applied).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </dd>
                </div>
                {job.job_url && (
                  <div className="md:col-span-2">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Job Listing
                    </dt>
                    <dd className="mt-0.5">
                      <a
                        href={job.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        View listing ↗
                      </a>
                    </dd>
                  </div>
                )}
                {job.notes && (
                  <div className="md:col-span-2">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Notes
                    </dt>
                    <dd className="mt-0.5 text-gray-900 whitespace-pre-line">
                      {job.notes}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteJob}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  {deleteLoading ? "Deleting..." : "Delete Application"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Interview Rounds ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Interview Rounds
          </h2>

          {rounds.length === 0 ? (
            <p className="text-sm text-gray-400 mb-6">
              No rounds recorded yet.
            </p>
          ) : (
            <div className="space-y-3 mb-6">
              {rounds.map((round) => (
                <div
                  key={round.app_id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {round.round}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROUND_STATUS_BADGE[round.round_status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {round.round_status}
                      </span>
                    </div>
                    {round.date && (
                      <p className="text-xs text-gray-500">
                        {new Date(round.date).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {round.notes && (
                      <p className="text-xs text-gray-600">{round.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteRound(round.app_id)}
                    className="text-xs text-red-400 hover:text-red-600 ml-4 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add round form */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Add Round
          </h3>
          {roundError && (
            <p className="text-sm text-red-600 mb-2">{roundError}</p>
          )}
          <form onSubmit={handleAddRound} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Round Type *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={roundForm.round}
                  onChange={(e) =>
                    setRoundForm({ ...roundForm, round: e.target.value })
                  }
                >
                  <option value="">Select type</option>
                  <option value="Phone Screen">Phone Screen</option>
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Final">Final</option>
                  <option value="Assessment">Assessment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={roundForm.round_status}
                  onChange={(e) =>
                    setRoundForm({ ...roundForm, round_status: e.target.value })
                  }
                >
                  <option value="">Select status</option>
                  <option value="Pending">Pending</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={roundForm.date}
                onChange={(e) =>
                  setRoundForm({ ...roundForm, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={roundForm.notes}
                onChange={(e) =>
                  setRoundForm({ ...roundForm, notes: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={roundLoading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {roundLoading ? "Adding..." : "Add Round"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
