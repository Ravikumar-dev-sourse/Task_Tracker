
import { useContext, useMemo, useState } from "react";
import {
  Search, FileText, Eye, CheckCircle2, Clock,
  MessageSquare, X, Filter, RefreshCw, RotateCcw
} from "lucide-react";
import { TaskContext } from "../TaskContext";
import "./submission.css";

const valueOf = (...values) =>
  values.find((v) => v !== undefined && v !== null && v !== "") ?? "";

const yearOf = (x = {}) =>
  valueOf(x.academicYear, x.academicyear, x.academic_year);

const classOf = (x = {}) =>
  valueOf(x.className, x.class, x.classname);

const subjectOf = (x = {}) =>
  valueOf(x.subject, x.subjectName);

const typeOf = (x = {}) =>
  valueOf(x.taskType, x.tasktype, x.type);

const statusOf = (x) =>
  ["Reviewed", "Needs Resubmission"].includes(x.status)
    ? x.status
    : "Pending Review";

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Open PDF data saved by FileReader.readAsDataURL().
function openPdf(fileData, fileName = "submission.pdf") {
  if (typeof fileData !== "string" || !fileData.trim()) {
    alert("PDF data is missing. Ask the student to upload the PDF again.");
    return;
  }

  if (fileData.startsWith("blob:")) {
    alert(
      "This PDF uses a temporary link. Ask the student to upload it again after updating the upload handler to save PDF data."
    );
    return;
  }

  // Open synchronously inside the click event to avoid popup blocking.
  const pdfTab = window.open("about:blank", "_blank");

  try {
    if (/^https?:\/\//i.test(fileData)) {
      if (pdfTab) pdfTab.location.href = fileData;
      else window.location.href = fileData;
      return;
    }

    let blob;

    if (/^data:application\/pdf;base64,/i.test(fileData)) {
      const base64 = fileData.slice(fileData.indexOf(",") + 1);
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      blob = new Blob([bytes], { type: "application/pdf" });
    } else if (/^data:application\/pdf,/i.test(fileData)) {
      const content = decodeURIComponent(
        fileData.slice(fileData.indexOf(",") + 1)
      );
      blob = new Blob([content], { type: "application/pdf" });
    } else {
      if (pdfTab) pdfTab.close();
      alert("Unsupported PDF format. Please upload the PDF again.");
      return;
    }

    const url = URL.createObjectURL(blob);

    if (pdfTab) {
      pdfTab.location.href = url;
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName.toLowerCase().endsWith(".pdf")
        ? fileName
        : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  } catch (error) {
    if (pdfTab && !pdfTab.closed) pdfTab.close();
    console.error("PDF opening failed:", error);
    alert("Unable to open this PDF. Please upload it again.");
  }
}

function Submission() {
  const context = useContext(TaskContext);
  const submissions = Array.isArray(context?.submissions)
    ? context.submissions
    : [];
  const setSubmissions = context?.setSubmissions;
  const tasks = Array.isArray(context?.mytask) ? context.mytask : [];

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("All");
  const [className, setClassName] = useState("All");
  const [subject, setSubject] = useState("All");
  const [taskType, setTaskType] = useState("All");
  const [status, setStatus] = useState("All");

  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [feedback, setFeedback] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Reviewed");

  // Fill missing submission metadata from its original task.
  const records = useMemo(() => submissions.map((s) => {
    const task = tasks.find(
      (t) => String(t.id) === String(s.taskId)
    );

    return {
      ...s,
      task,
      taskTitle: valueOf(s.taskTitle, task?.title, "Untitled Task"),
      academicYear: valueOf(s.academicYear, s.academicyear, yearOf(task || {})),
      className: valueOf(s.className, s.class, classOf(task || {})),
      subject: valueOf(s.subject, subjectOf(task || {})),
      taskType: valueOf(s.taskType, s.tasktype, typeOf(task || {})),
    };
  }), [submissions, tasks]);

  // Options come from tasks as well as submitted records.
  const options = (recordGetter, taskGetter) => [...new Set([
    ...records.map(recordGetter),
    ...tasks.map(taskGetter),
  ].filter((v) => v !== "").map(String))]
    .sort((a, b) => a.localeCompare(b));

  const years = options((x) => valueOf(x.academicYear, x.academicyear), yearOf);
  const classes = options((x) => valueOf(x.className, x.class), classOf);
  const subjects = options((x) => valueOf(x.subject), subjectOf);
  const types = options((x) => valueOf(x.taskType, x.tasktype), typeOf);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return records.filter((x) => {
      const matchesSearch = [
        x.taskTitle, x.fileName, x.subject, x.className,
        x.academicYear, x.taskType, x.feedback,
      ].some((v) => String(v || "").toLowerCase().includes(q));

      return matchesSearch
        && (year === "All" || String(x.academicYear) === year)
        && (className === "All" || String(x.className) === className)
        && (subject === "All" || String(x.subject) === subject)
        && (taskType === "All" || String(x.taskType) === taskType)
        && (status === "All" || statusOf(x) === status);
    }).slice().reverse();
  }, [records, search, year, className, subject, taskType, status]);

  const clearFilters = () => {
    setSearch("");
    setYear("All");
    setClassName("All");
    setSubject("All");
    setTaskType("All");
    setStatus("All");
  };

  const openReview = (item) => {
    setSelected(item);
    setMarks(item.marks == null ? "" : String(item.marks));
    setMaxMarks(item.maxMarks == null ? "100" : String(item.maxMarks));
    setFeedback(item.feedback || "");
    setReviewStatus(
      item.status === "Needs Resubmission"
        ? "Needs Resubmission"
        : "Reviewed"
    );
  };

  const saveReview = (event) => {
    event.preventDefault();

    if (!selected || typeof setSubmissions !== "function") {
      alert("Submission context is not configured correctly.");
      return;
    }

    let score = null;
    let maximum = null;

    if (marks.trim() !== "") {
      score = Number(marks);
      maximum = Number(maxMarks);

      if (
        !Number.isFinite(score) ||
        !Number.isFinite(maximum) ||
        maximum <= 0 ||
        score < 0 ||
        score > maximum
      ) {
        alert("Enter valid marks within the maximum marks.");
        return;
      }
    }

    setSubmissions((previous) =>
      (Array.isArray(previous) ? previous : []).map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status: reviewStatus,
              marks: score,
              maxMarks: maximum,
              feedback: feedback.trim(),
              reviewedAt: new Date().toISOString(),
            }
          : item
      )
    );

    setSelected(null);
  };

  const pending = records.filter((x) => statusOf(x) === "Pending Review").length;
  const reviewed = records.filter((x) => statusOf(x) === "Reviewed").length;
  const resubmit = records.filter(
    (x) => statusOf(x) === "Needs Resubmission"
  ).length;

  return (
    <main className="faculty-submissions-page">
      <header className="submission-page-header">
        <div>
          <h1>Student Submissions</h1>
          <p>Review student work, assign marks, and provide feedback.</p>
        </div>
      </header>

      <section className="faculty-submission-summary">
        <Summary icon={<FileText size={21} />} label="Total Submissions" count={records.length} kind="total-icon" />
        <Summary icon={<Clock size={21} />} label="Pending Reviews" count={pending} kind="pending-icon" />
        <Summary icon={<CheckCircle2 size={21} />} label="Reviewed" count={reviewed} kind="reviewed-icon" />
        <Summary icon={<RotateCcw size={21} />} label="Needs Resubmission" count={resubmit} kind="resubmit-icon" />
      </section>

      <section className="faculty-submission-content">
        <div className="faculty-submission-content-header">
          <div>
            <h2>Submission Records</h2>
            <p>Filter records using the options below.</p>
          </div>
          <span>{filtered.length} records</span>
        </div>

        <div className="faculty-submission-toolbar">
          <div className="faculty-submission-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search task, file, subject, class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="faculty-filter-reset" type="button" onClick={clearFilters}>
            <RefreshCw size={15} /> Clear filters
          </button>
        </div>

        <div className="faculty-filter-heading">
          <Filter size={16} /> Filter submissions
        </div>

        <div className="faculty-submission-filter-grid">
          <FilterSelect label="Academic Year" value={year} onChange={setYear} values={years} allLabel="All Academic Years" />
          <FilterSelect label="Class" value={className} onChange={setClassName} values={classes} allLabel="All Classes" />
          <FilterSelect label="Subject" value={subject} onChange={setSubject} values={subjects} allLabel="All Subjects" />
          <FilterSelect label="Task Type" value={taskType} onChange={setTaskType} values={types} allLabel="All Task Types" />
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Needs Resubmission">Needs Resubmission</option>
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="faculty-submission-empty">
            <FileText size={38} />
            <h3>{records.length === 0 ? "No submissions yet" : "No matching submissions"}</h3>
            <p>
              {records.length === 0
                ? "Student submissions will appear here after they upload their PDFs."
                : "Try changing your filters or clear all filters."}
            </p>
            {records.length > 0 && (
              <button className="faculty-filter-reset" type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="faculty-submission-list">
            {filtered.map((item) => {
              const itemStatus = statusOf(item);

              return (
                <article className="faculty-submission-card" key={item.id}>
                  <div className="faculty-submission-file-icon"><FileText size={23} /></div>

                  <div className="faculty-submission-information">
                    <h3>{item.taskTitle}</h3>
                    <p className="faculty-submission-filename">{item.fileName || "Submitted file"}</p>

                    <div className="faculty-submission-meta">
                      {item.academicYear && <span>{item.academicYear}</span>}
                      {item.className && <span>{item.className}</span>}
                      {item.subject && <span>{item.subject}</span>}
                      {item.taskType && <span>{item.taskType}</span>}
                    </div>

                    <span className="faculty-submission-date">
                      Submitted: {formatDate(item.submittedAt)}
                    </span>

                    {item.marks != null && (
                      <p className="faculty-submission-marks">
                        Marks: {item.marks}{item.maxMarks != null ? ` / ${item.maxMarks}` : ""}
                      </p>
                    )}
                    {item.feedback && (
                      <p className="faculty-submission-feedback-preview">
                        Feedback: {item.feedback}
                      </p>
                    )}
                  </div>

                  <div className="faculty-submission-actions">
                    <span className={`faculty-status ${
                      itemStatus === "Reviewed" ? "faculty-status-reviewed"
                        : itemStatus === "Needs Resubmission" ? "faculty-status-resubmit"
                        : "faculty-status-pending"
                    }`}>
                      {itemStatus === "Reviewed" ? <CheckCircle2 size={13} />
                        : itemStatus === "Needs Resubmission" ? <RotateCcw size={13} />
                        : <Clock size={13} />}
                      {itemStatus}
                    </span>

                    <button
                      type="button"
                      className="faculty-submission-action-button"
                      disabled={!item.file}
                      onClick={() => openPdf(item.file, item.fileName)}
                    >
                      <Eye size={14} /> View PDF
                    </button>

                    <button
                      type="button"
                      className="faculty-review-button"
                      onClick={() => openReview(item)}
                    >
                      <MessageSquare size={14} />
                      {itemStatus === "Pending Review" ? "Review" : "Edit Review"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <div className="faculty-review-overlay" onClick={() => setSelected(null)}>
          <section
            className="faculty-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faculty-review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="faculty-review-modal-header">
              <div>
                <h2 id="faculty-review-title">Review Submission</h2>
                <p>{selected.taskTitle}</p>
              </div>
              <button type="button" className="faculty-review-close" onClick={() => setSelected(null)} aria-label="Close">
                <X size={19} />
              </button>
            </header>

            <form onSubmit={saveReview}>
              <div className="faculty-review-modal-body">
                <div className="faculty-review-file">
                  <FileText size={21} />
                  <div>
                    <strong>{selected.fileName || "Submitted file"}</strong>
                    <p>Submitted: {formatDate(selected.submittedAt)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="faculty-review-open-file"
                  disabled={!selected.file}
                  onClick={() => openPdf(selected.file, selected.fileName)}
                >
                  <Eye size={15} /> Open Submitted PDF
                </button>

                <div className="faculty-review-field">
                  <label htmlFor="review-status">Review Status</label>
                  <select id="review-status" value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Needs Resubmission">Needs Resubmission</option>
                  </select>
                </div>

                <div className="faculty-review-marks">
                  <div className="faculty-review-field">
                    <label htmlFor="marks">Marks Obtained</label>
                    <input id="marks" type="number" min="0" step="any" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 18" />
                  </div>
                  <div className="faculty-review-field">
                    <label htmlFor="max-marks">Maximum Marks</label>
                    <input id="max-marks" type="number" min="1" step="any" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} required={marks.trim() !== ""} />
                  </div>
                </div>

                <div className="faculty-review-field">
                  <label htmlFor="feedback">Feedback for Student</label>
                  <textarea id="feedback" rows="4" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write feedback or corrections..." />
                </div>
              </div>

              <footer className="faculty-review-modal-footer">
                <button type="button" className="faculty-review-cancel" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="faculty-review-save">Save Review</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function Summary({ icon, label, count, kind }) {
  return (
    <div className="faculty-summary-card">
      <div className={`faculty-summary-icon ${kind}`}>{icon}</div>
      <div><p>{label}</p><h2>{count}</h2></div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, values, allLabel }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="All">{allLabel}</option>
        {values.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export default Submission;
