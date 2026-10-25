import { useContext, useMemo, useRef, useState } from "react";
import {
  FileText,
  Download,
  CalendarDays,
  CheckCircle2,
  Inbox,
  Clock,
  Search,
  Eye,
  RotateCcw,
  MessageSquare,
  X,
  Upload,
  Trash2,
} from "lucide-react";
import { TaskContext } from "../TaskContext";

function MySubmissions() {
  const { submissions = [], setSubmissions } = useContext(TaskContext);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [replacementFile, setReplacementFile] = useState(null);
  const [replacementError, setReplacementError] = useState("");
  const [replacementMessage, setReplacementMessage] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  const replacementInputRef = useRef(null);

  
const handleReplacementFile = (event) => {
  const file = event.target.files?.[0];

  setReplacementFile(null);
  setReplacementError("");
  setReplacementMessage("");

  if (!file) return;

  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    setReplacementError("Please choose a PDF file.");
    event.target.value = "";
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    setReplacementError(
      "The PDF must be 3 MB or smaller for this demo."
    );
    event.target.value = "";
    return;
  }

  setReplacementFile(file);
};

const removeReplacementFile = () => {
  if (isReplacing) return;

  setReplacementFile(null);
  setReplacementError("");
  setReplacementMessage("");

  if (replacementInputRef.current) {
    replacementInputRef.current.value = "";
  }
};

const handleResubmit = async (event) => {
  event.preventDefault();

  if (isReplacing) return;

  if (!selectedSubmission || !replacementFile) {
    setReplacementError("Please choose your corrected PDF first.");
    return;
  }

  if (typeof setSubmissions !== "function") {
    setReplacementError(
      "Submission storage is not configured in TaskContext."
    );
    return;
  }

  if (selectedSubmission.status !== "Needs Resubmission") {
    setReplacementError(
      "You can replace the PDF only when faculty requests resubmission."
    );
    return;
  }

  setIsReplacing(true);
  setReplacementError("");
  setReplacementMessage("");

  try {
    const fileData = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unable to read the PDF."));
        }
      };

      reader.onerror = () =>
        reject(reader.error || new Error("Unable to read the PDF."));

      reader.readAsDataURL(replacementFile);
    });

    const updatedSubmission = {
      ...selectedSubmission,
      file: fileData,
      fileName: replacementFile.name,
      submittedAt: new Date().toISOString(),
      status: "Pending Review",
      feedback: "",
      marks: null,
      reviewedAt: null,
    };

    setSubmissions((previous) =>
      previous.map((item) =>
        String(item.id) === String(selectedSubmission.id)
          ? updatedSubmission
          : item
      )
    );

    setSelectedSubmission(updatedSubmission);
    setReplacementFile(null);
    setReplacementMessage(
      "Your corrected PDF was submitted. It is now pending faculty review."
    );

    if (replacementInputRef.current) {
      replacementInputRef.current.value = "";
    }
  } catch (error) {
    console.error("Resubmission failed:", error);
    setReplacementError(
      "Unable to submit the corrected PDF. Please try again."
    );
  } finally {
    setIsReplacing(false);
  }
};


  // Treat older "Submitted" records as awaiting review.
  const getStatus = (item) => {
    if (item.status === "Needs Resubmission") {
      return "Needs Resubmission";
    }

    if (item.status === "Reviewed") {
      return "Reviewed";
    }

    if (item.status === "Pending Review") {
      return "Pending Review";
    }

    if (item.status === "Submitted") {
      return "Pending Review";
    }

    return item.status || "Pending Review";
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    if (status === "Reviewed") return "review-status-reviewed";
    if (status === "Needs Resubmission") {
      return "review-status-resubmit";
    }

    return "review-status-pending";
  };

  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((item) => {
        const status = getStatus(item);

        const matchesSearch = [item.taskTitle, item.fileName, item.feedback]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.toLowerCase()));

        const matchesFilter = filter === "All" || status === filter;

        return matchesSearch && matchesFilter;
      })
      .slice()
      .reverse();
  }, [submissions, search, filter]);

  const pendingCount = submissions.filter(
    (item) => getStatus(item) === "Pending Review",
  ).length;

  const reviewedCount = submissions.filter(
    (item) => getStatus(item) === "Reviewed",
  ).length;

  const resubmitCount = submissions.filter(
    (item) => getStatus(item) === "Needs Resubmission",
  ).length;

  return (
    <div className="my-submissions-page">
      <div className="submissions-header">
        <div>
          <h1>My Submissions</h1>
          <p>Track your submitted tasks and faculty reviews.</p>
        </div>

        <div className="submission-total">
          <FileText size={20} />
          <span>{submissions.length} Submissions</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="submission-summary">
        <div className="submission-summary-card">
          <div className="summary-icon">
            <FileText size={22} />
          </div>
          <div>
            <p>Total Submissions</p>
            <h2>{submissions.length}</h2>
          </div>
        </div>

        <div className="submission-summary-card">
          <div className="summary-icon pending-summary-icon">
            <Clock size={22} />
          </div>
          <div>
            <p>Pending Reviews</p>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="submission-summary-card">
          <div className="summary-icon submitted-icon">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p>Reviewed</p>
            <h2>{reviewedCount}</h2>
          </div>
        </div>

        <div className="submission-summary-card">
          <div className="summary-icon resubmit-summary-icon">
            <RotateCcw size={22} />
          </div>
          <div>
            <p>Needs Resubmission</p>
            <h2>{resubmitCount}</h2>
          </div>
        </div>
      </div>

      {/* Submission history */}
      <div className="submissions-content">
        <div className="submissions-content-header">
          <h2>Submission History</h2>
          <span>{filteredSubmissions.length} records</span>
        </div>

        {/* Search and filter */}
        <div className="submission-toolbar">
          <div className="submission-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search task or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter submissions by status"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Needs Resubmission">Needs Resubmission</option>
          </select>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="submissions-empty">
            <div className="empty-icon">
              <Inbox size={36} />
            </div>

            <h3>
              {submissions.length === 0
                ? "No submissions yet"
                : "No matching submissions"}
            </h3>

            <p>
              {submissions.length === 0
                ? "Your submitted PDFs will appear here."
                : "Try another search term or status filter."}
            </p>
          </div>
        ) : (
          <div className="submissions-list">
            {filteredSubmissions.map((item) => {
              const status = getStatus(item);

              return (
                <div className="submission-card" key={item.id}>
                  <div className="submission-file-icon">
                    <FileText size={26} />
                  </div>

                  <div className="submission-information">
                    <h3>{item.taskTitle || "Untitled Task"}</h3>

                    <p className="submission-filename">
                      {item.fileName || "Submitted file"}
                    </p>

                    <div className="submission-date">
                      <CalendarDays size={15} />
                      <span>Submitted: {formatDate(item.submittedAt)}</span>
                    </div>

                    {status === "Reviewed" && item.reviewedAt && (
                      <p className="reviewed-date">
                        Reviewed: {formatDate(item.reviewedAt)}
                      </p>
                    )}

                    {item.marks !== undefined && item.marks !== null && (
                      <p className="submission-marks">
                        Marks: {item.marks}
                        {item.maxMarks != null && ` / ${item.maxMarks}`}
                      </p>
                    )}
                  </div>

                  <div className="submission-actions">
                    <span
                      className={`submission-status ${getStatusClass(status)}`}
                    >
                      {status === "Reviewed" ? (
                        <CheckCircle2 size={15} />
                      ) : status === "Needs Resubmission" ? (
                        <RotateCcw size={15} />
                      ) : (
                        <Clock size={15} />
                      )}

                      {status}
                    </span>

                    <button
                      type="button"
                      className="submission-view"
                      onClick={() => setSelectedSubmission(item)}
                    >
                      <Eye size={16} />
                      Details
                    </button>

                    {item.file && (
                      <a
                        href={item.file}
                        download={item.fileName || "submission.pdf"}
                        className="submission-download"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission details popup */}
      {selectedSubmission && (
        <div
          className="submission-modal-overlay"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="submission-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="submission-modal-header">
              <div>
                <h2 id="submission-modal-title">Submission Details</h2>
                <p>{selectedSubmission.taskTitle}</p>
              </div>

              <button
                type="button"
                className="submission-modal-close"
                aria-label="Close details"
                onClick={() => setSelectedSubmission(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="submission-modal-body">
              <div className="submission-detail-row">
                <span>File name</span>
                <strong>
                  {selectedSubmission.fileName || "Not available"}
                </strong>
              </div>

              <div className="submission-detail-row">
                <span>Submitted on</span>
                <strong>{formatDate(selectedSubmission.submittedAt)}</strong>
              </div>

              <div className="submission-detail-row">
                <span>Current status</span>
                <strong>{getStatus(selectedSubmission)}</strong>
              </div>

              {selectedSubmission.reviewedAt && (
                <div className="submission-detail-row">
                  <span>Review date</span>
                  <strong>{formatDate(selectedSubmission.reviewedAt)}</strong>
                </div>
              )}

              {selectedSubmission.marks != null && (
                <div className="submission-detail-row">
                  <span>Marks</span>
                  <strong>
                    {selectedSubmission.marks}
                    {selectedSubmission.maxMarks != null &&
                      ` / ${selectedSubmission.maxMarks}`}
                  </strong>
                </div>
              )}

              <div className="submission-feedback">
                {getStatus(selectedSubmission) === "Needs Resubmission" && (
                  <div className="resubmit-panel">
                    <h3>
                      <RotateCcw size={18} />
                      Submit Corrected Assignment
                    </h3>

                    <p className="resubmit-instructions">
                      Read the faculty feedback above, correct your work, and
                      upload the updated PDF. Your new file will replace the
                      previous submission and return to Pending Review.
                    </p>

                    <form onSubmit={handleResubmit}>
                      <label
                        htmlFor="replacement-pdf"
                        className="resubmit-file-label"
                      >
                        <Upload size={20} />
                        <span>
                          {replacementFile
                            ? replacementFile.name
                            : "Choose corrected PDF"}
                        </span>

                        <input
                          ref={replacementInputRef}
                          id="replacement-pdf"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleReplacementFile}
                          disabled={isReplacing}
                        />
                      </label>

                      {replacementFile && (
                        <div className="resubmit-selected-file">
                          <span>
                            {(replacementFile.size / 1024).toFixed(1)} KB
                          </span>

                          <button
                            type="button"
                            onClick={removeReplacementFile}
                            disabled={isReplacing}
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>
                        </div>
                      )}

                      {replacementError && (
                        <p className="resubmit-error">{replacementError}</p>
                      )}

                      {replacementMessage && (
                        <p className="resubmit-success">{replacementMessage}</p>
                      )}

                      <button
                        type="submit"
                        className="resubmit-submit-button"
                        disabled={!replacementFile || isReplacing}
                      >
                        {isReplacing
                          ? "Submitting..."
                          : "Submit Corrected Assignment"}
                      </button>
                    </form>
                  </div>
                )}

                <h3>
                  <MessageSquare size={18} />
                  Faculty Feedback
                </h3>

                <p>
                  {selectedSubmission.feedback ||
                    "No feedback has been added yet."}
                </p>
              </div>

              {selectedSubmission.file && (
                <a
                  href={selectedSubmission.file}
                  download={selectedSubmission.fileName || "submission.pdf"}
                  className="submission-download modal-download"
                >
                  <Download size={16} />
                  Download Submitted PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MySubmissions;
