
import { useContext, useMemo, useRef, useState } from "react";
import {
  Search,
  CalendarDays,
  BookOpen,
  Clock3,
  FileCheck2,
  AlertTriangle,
  Eye,
  ListFilter,
  X,
  Paperclip,
  Upload,
  Trash2,
} from "lucide-react";

import { TaskContext } from "../TaskContext";
import "./Student.css";

const MAX_PDF_SIZE = 3 * 1024 * 1024;

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read the selected file."));
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error("Unable to read the PDF."));
    };

    reader.readAsDataURL(file);
  });

function openAttachment(file) {
  const savedFile = file?.url || file?.data || file?.file;

  if (typeof savedFile !== "string" || !savedFile) {
    alert("This attachment is unavailable. Ask the faculty to upload it again.");
    return;
  }

  // Existing URLs can be opened directly.
  if (/^(https?:\/\/|blob:)/i.test(savedFile)) {
    const tab = window.open(savedFile, "_blank");

    if (!tab) {
      alert("Your browser blocked the new tab. Allow pop-ups and try again.");
    }
    return;
  }

  // For saved Data URLs, open the blank tab synchronously to avoid
  // popup blocking, then display the file inside that tab.
  const tab = window.open("about:blank", "_blank");

  if (!tab) {
    alert("Your browser blocked the new tab. Allow pop-ups and try again.");
    return;
  }

  try {
    const commaIndex = savedFile.indexOf(",");

    if (!savedFile.startsWith("data:") || commaIndex < 0) {
      throw new Error("Unsupported file format.");
    }

    const header = savedFile.slice(0, commaIndex);
    const body = savedFile.slice(commaIndex + 1);
    const mimeType = header.match(/^data:([^;,]+)/)?.[1];

    if (!mimeType) {
      throw new Error("Missing file type.");
    }

    const binary = header.includes(";base64")
      ? atob(body)
      : decodeURIComponent(body);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);

    tab.location.href = objectUrl;

    // Don't revoke immediately; the browser's PDF viewer may still be loading.
  } catch (error) {
    console.error("Attachment opening failed:", error);
    tab.close();
    alert("Unable to open this attachment. Ask the faculty to upload it again.");
  }
}

function TaskDetails() {
  const context = useContext(TaskContext);

  const mytask = Array.isArray(context?.mytask) ? context.mytask : [];
  const submissions = Array.isArray(context?.submissions)
    ? context.submissions
    : [];
  const setSubmissions = context?.setSubmissions;

  const fileInputRef = useRef(null);

  const [search, setSearch] = useState("");
  const [taskType, setTaskType] = useState("");
  const [status, setStatus] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const submissionForTask = (taskId) =>
    submissions.find(
      (item) => String(item.taskId) === String(taskId)
    );

  const submittedTaskIds = useMemo(
    () => new Set(submissions.map((item) => String(item.taskId))),
    [submissions]
  );

  const getStatus = (taskItem) => {
    const submission = submissions.find(
      (item) => String(item.taskId) === String(taskItem.id)
    );

    if (submission) {
      if (submission.status === "Needs Resubmission") {
        return "Needs Resubmission";
      }

      if (submission.status === "Reviewed") {
        return "Reviewed";
      }

      return "Submitted";
    }

    if (taskItem.dueDate && taskItem.dueDate < todayString) {
      return "Overdue";
    }

    return "Pending";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredTasks = mytask.filter((item) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch = [
      item.title,
      item.subject,
      item.description,
      item.branch,
      item.className,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    const itemType = item.tasktype ?? item.taskType ?? "Other";
    const matchesType = !taskType || itemType === taskType;
    const matchesStatus = !status || getStatus(item) === status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setTaskType("");
    setStatus("");
  };

  const openTask = (item) => {
    setSelectedTask(item);
    setSelectedFile(null);
    setFileError("");
    setSubmitMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeTask = () => {
    if (isSubmitting) return;

    setSelectedTask(null);
    setSelectedFile(null);
    setFileError("");
    setSubmitMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setSelectedFile(null);
    setFileError("");
    setSubmitMessage("");

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFileError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      setFileError("The PDF must be 3 MB or smaller for this demo.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    if (isSubmitting) return;

    setSelectedFile(null);
    setFileError("");
    setSubmitMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitTask = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!selectedTask) {
      setFileError("Please open a task first.");
      return;
    }

    if (!selectedFile) {
      setFileError("Please choose a PDF file before submitting.");
      return;
    }

    if (typeof setSubmissions !== "function") {
      setFileError(
        "Submission storage is not configured. Check your TaskContext."
      );
      return;
    }

    const existingSubmission = submissionForTask(selectedTask.id);

    // Allow replacement only when the faculty has requested resubmission.
    if (
      existingSubmission &&
      existingSubmission.status !== "Needs Resubmission"
    ) {
      setFileError("This task has already been submitted.");
      return;
    }

    setIsSubmitting(true);
    setFileError("");
    setSubmitMessage("");

    try {
      const fileData = await fileToDataURL(selectedFile);

      const newSubmission = {
        id: existingSubmission?.id || crypto.randomUUID(),
        taskId: selectedTask.id,
        taskTitle: selectedTask.title || "Untitled Task",

        academicYear:
          selectedTask.academicYear ??
          selectedTask.academicyear ??
          "",
        className: selectedTask.className ?? "",
        branch: selectedTask.branch ?? "",
        subject: selectedTask.subject ?? "",
        taskType:
          selectedTask.taskType ??
          selectedTask.tasktype ??
          "Other",

        submittedAt: new Date().toISOString(),
        status: "Pending Review",
        fileName: selectedFile.name,
        file: fileData,

        // Clear the old review after a requested resubmission.
        feedback: "",
        marks: null,
        maxMarks: 100,
        reviewedAt: null,
      };

      setSubmissions((previous) => {
        const list = Array.isArray(previous) ? previous : [];

        if (existingSubmission) {
          return list.map((item) =>
            String(item.id) === String(existingSubmission.id)
              ? newSubmission
              : item
          );
        }

        return [...list, newSubmission];
      });

      setSelectedFile(null);
      setSubmitMessage("Assignment submitted successfully.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Assignment submission failed:", error);
      setFileError(
        "Unable to save the PDF. Try a smaller file and submit again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-tasks-page">
      <div className="student-tasks-header">
        <div>
          <h1>Student Tasks</h1>
          <p>
            View faculty assignments, read instructions, and submit your work.
          </p>
        </div>

        <div className="student-task-count">
          <BookOpen size={19} />
          <span>{filteredTasks.length} tasks</span>
        </div>
      </div>

      {/* Search and filters */}
      <section className="student-task-filters">
        <div className="student-task-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search title, subject, or description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="student-task-filter-heading">
          <ListFilter size={18} />
          <span>Filters</span>
        </div>

        <div className="student-task-filter-grid">
          <select
            value={taskType}
            onChange={(event) => setTaskType(event.target.value)}
          >
            <option value="">All Task Types</option>
            <option value="Assignment">Assignment</option>
            <option value="Mini Project">Mini Project</option>
            <option value="Certificate">Certificate</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Needs Resubmission">Needs Resubmission</option>
            <option value="Overdue">Overdue</option>
          </select>

          <button
            type="button"
            className="student-task-clear-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Task list */}
      <div className="student-task-results-heading">
        <h2>Available Tasks</h2>
        <span>
          Showing {filteredTasks.length} of {mytask.length}
        </span>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="student-task-empty">
          <BookOpen size={34} />
          <h3>No tasks found</h3>
          <p>
            No matching tasks are available. Try changing your search or
            filters.
          </p>
          <button type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="student-task-card-list">
          {filteredTasks.map((item) => {
            const taskStatus = getStatus(item);

            return (
              <article className="student-task-card" key={item.id}>
                <div className="student-task-card-top">
                  <div className="student-task-card-icon">
                    <BookOpen size={23} />
                  </div>

                  <span
                    className={`student-task-status ${taskStatus
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {taskStatus === "Overdue" && (
                      <AlertTriangle size={14} />
                    )}
                    {taskStatus === "Submitted" && (
                      <FileCheck2 size={14} />
                    )}
                    {taskStatus === "Pending" && <Clock3 size={14} />}
                    {taskStatus}
                  </span>
                </div>

                <h3>{item.title || "Untitled Task"}</h3>

                <p className="student-task-subject">
                  {item.subject || "Subject not specified"}
                  {" · "}
                  {item.tasktype ?? item.taskType ?? "Other"}
                </p>

                <p className="student-task-description">
                  {item.description || "No description provided."}
                </p>

                <div className="student-task-meta">
                  <span>
                    <CalendarDays size={16} />
                    Due: {formatDate(item.dueDate)}
                  </span>
                  <span>Priority: {item.priority || "Medium"}</span>
                </div>

                <div className="student-task-audience">
                  {[
                    item.academicyear ?? item.academicYear,
                    item.branch,
                    item.className ? `Class ${item.className}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Class details not specified"}
                </div>

                <div className="student-task-card-footer">
                  <button
                    type="button"
                    className="student-task-view-button"
                    onClick={() => openTask(item)}
                  >
                    <Eye size={17} />
                    View Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Task details popup */}
      {selectedTask && (
        <div
          className="student-task-modal-overlay"
          onClick={closeTask}
        >
          <section
            className="student-task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-task-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="student-task-modal-header">
              <div>
                <span className="student-task-modal-label">
                  FACULTY ASSIGNED TASK
                </span>
                <h2 id="student-task-modal-title">
                  {selectedTask.title || "Untitled Task"}
                </h2>
              </div>

              <button
                type="button"
                className="student-task-modal-close"
                aria-label="Close task details"
                onClick={closeTask}
                disabled={isSubmitting}
              >
                <X size={21} />
              </button>
            </div>

            <div className="student-task-modal-body">
              <div className="student-task-modal-status-row">
                <span className="student-task-detail-label">
                  Submission Status
                </span>
                <span
                  className={`student-task-status ${getStatus(selectedTask)
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {getStatus(selectedTask)}
                </span>
              </div>

              <div className="student-task-detail-grid">
                <div className="student-task-detail">
                  <span>Subject</span>
                  <strong>{selectedTask.subject || "Not specified"}</strong>
                </div>

                <div className="student-task-detail">
                  <span>Task Type</span>
                  <strong>
                    {selectedTask.tasktype ??
                      selectedTask.taskType ??
                      "Other"}
                  </strong>
                </div>

                <div className="student-task-detail">
                  <span>Academic Year</span>
                  <strong>
                    {selectedTask.academicyear ??
                      selectedTask.academicYear ??
                      "Not specified"}
                  </strong>
                </div>

                <div className="student-task-detail">
                  <span>Branch / Class</span>
                  <strong>
                    {[
                      selectedTask.branch,
                      selectedTask.className
                        ? `Class ${selectedTask.className}`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" / ") || "Not specified"}
                  </strong>
                </div>

                <div className="student-task-detail">
                  <span>Priority</span>
                  <strong>{selectedTask.priority || "Medium"}</strong>
                </div>

                <div className="student-task-detail">
                  <span>Due Date</span>
                  <strong>{formatDate(selectedTask.dueDate)}</strong>
                </div>
              </div>

              <div className="student-task-full-description">
                <h3>Task Instructions</h3>
                <p>
                  {selectedTask.description ||
                    "No additional instructions provided by faculty."}
                </p>
              </div>

              {/* Faculty attachments */}
              <div className="student-task-full-description">
                <h3>
                  <Paperclip size={18} />
                  Faculty Attachments
                </h3>

                {Array.isArray(selectedTask.attachment) &&
                selectedTask.attachment.length > 0 ? (
                  selectedTask.attachment.map((file, index) => (
                    <div
                      className="faculty-attachment-item"
                      key={`${file.name || "attachment"}-${index}`}
                    >
                      <div>
                        <strong>{file.name || "Faculty attachment"}</strong>
                        <p>Assignment file from faculty</p>
                      </div>

                      <button
                        type="button"
                        className="student-task-view-button"
                        onClick={() => openAttachment(file)}
                      >
                        <Eye size={15} />
                        View / Download
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No files attached by faculty.</p>
                )}
              </div>

              {/* Student PDF submission */}
              <div className="student-task-upload-section">
                <h3>
                  <Upload size={19} />
                  Submit Your Work (PDF)
                </h3>

                <p>Select your completed assignment as a PDF file.</p>

                {submissionForTask(selectedTask.id) &&
                getStatus(selectedTask) !== "Needs Resubmission" ? (
                  <div className="student-task-upload-success">
                    <FileCheck2 size={22} />
                    <div>
                      <strong>
                        {getStatus(selectedTask) === "Reviewed"
                          ? "Assignment reviewed"
                          : "Task submitted successfully"}
                      </strong>
                      <p>
                        {submissionForTask(selectedTask.id)?.fileName ||
                          "Your submission is recorded."}
                      </p>

                      {submissionForTask(selectedTask.id)?.marks != null && (
                        <p>
                          Marks: {submissionForTask(selectedTask.id).marks}
                          {submissionForTask(selectedTask.id).maxMarks != null
                            ? ` / ${submissionForTask(selectedTask.id).maxMarks}`
                            : ""}
                        </p>
                      )}

                      {submissionForTask(selectedTask.id)?.feedback && (
                        <p>
                          Feedback:{" "}
                          {submissionForTask(selectedTask.id).feedback}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTask}>
                    <div className="student-task-file-picker">
                      <label
                        htmlFor="student-task-pdf"
                        className="student-task-file-label"
                      >
                        <FileCheck2 size={23} />
                        <span>
                          {selectedFile
                            ? selectedFile.name
                            : "Choose a PDF file"}
                        </span>
                        <input
                          ref={fileInputRef}
                          id="student-task-pdf"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                      </label>

                      {selectedFile && (
                        <button
                          type="button"
                          className="student-task-remove-file"
                          onClick={removeSelectedFile}
                          disabled={isSubmitting}
                        >
                          <Trash2 size={15} />
                          Remove file
                        </button>
                      )}
                    </div>

                    {selectedFile && (
                      <p className="student-task-selected-file">
                        Selected: {selectedFile.name}
                        {" · "}
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    )}

                    {fileError && (
                      <p className="student-task-file-error">
                        {fileError}
                      </p>
                    )}

                    {submitMessage && (
                      <p className="student-task-file-success">
                        {submitMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="student-task-submit-button"
                      disabled={!selectedFile || isSubmitting}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : getStatus(selectedTask) === "Needs Resubmission"
                          ? "Resubmit Assignment"
                          : "Submit Assignment"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default TaskDetails;
