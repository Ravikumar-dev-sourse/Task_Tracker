import { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  FileCheck2,
  TriangleAlert,
  CalendarDays,
  ArrowRight,
  BookOpen,
  Bell,
  Files,
} from "lucide-react";

import { TaskContext } from "../TaskContext";
import "./Student.css";

function StudentDashboard() {
  const { mytask = [], submissions = [] } = useContext(TaskContext);

  // Get today's date in YYYY-MM-DD format
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Identify submitted tasks
  const submittedTaskIds = new Set(
    submissions.map((item) => String(item.taskId)),
  );

  // Dashboard counts
  const totalTasks = mytask.length;

  const pendingTasks = mytask.filter(
    (item) => !submittedTaskIds.has(String(item.id)),
  );

  const submittedTasks = mytask.filter((item) =>
    submittedTaskIds.has(String(item.id)),
  );

  const overdueTasks = pendingTasks.filter(
    (item) => item.dueDate && item.dueDate < todayString,
  );

  // Recent submissions
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
    .slice(0, 4);

  // Upcoming deadlines from Faculty-created tasks
  const upcomingDeadlines = mytask
    .filter((item) => item.dueDate && item.dueDate >= todayString)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Format the due date
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Summary cards
  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: ClipboardList,
      className: "total",
    },
    {
      label: "Pending",
      value: pendingTasks.length,
      icon: Clock3,
      className: "pending",
    },
    {
      label: "Submitted",
      value: submittedTasks.length,
      icon: FileCheck2,
      className: "submitted",
    },
    {
      label: "Overdue",
      value: overdueTasks.length,
      icon: TriangleAlert,
      className: "overdue",
    },
  ];

  // Quick action links
  const quickActions = [
    {
      title: "View Student Tasks",
      description: "View faculty assignments and deadlines",
      path: "/student/tasks",
      icon: BookOpen,
      className: "blue",
    },
    {
      title: "My Submissions",
      description: "Track submitted work and status",
      path: "/student/submissions",
      icon: Files,
      className: "teal",
    },
    {
      title: "Notifications",
      description: "Check updates and faculty feedback",
      path: "/student/notifications",
      icon: Bell,
      className: "orange",
    },
  ];

  return (
    <div className="student-dashboard">
      {/* Dashboard heading */}
      <div className="student-dashboard-header">
        <div>
          <h1>Welcome to Your Dashboard!</h1>
          <p>Here's an overview of your academic tasks and submissions.</p>
        </div>

        <NavLink to="/student/tasks" className="student-dashboard-view-button">
          View Tasks <ArrowRight size={17} />
        </NavLink>
      </div>

      {/* Summary cards */}
      <section className="student-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className={`student-stat-card ${stat.className}`}
              key={stat.label}
            >
              <div className="student-stat-icon">
                <Icon size={23} />
              </div>

              <div>
                <p>{stat.label}</p>
                <h2>{stat.value}</h2>
              </div>
            </div>
          );
        })}
      </section>

      {/* Recent submissions and upcoming deadlines */}
      <section className="student-dashboard-panels">
        {/* Recent submissions */}
        <div className="student-dashboard-panel">
          <div className="student-panel-header">
            <h2>Recent Submissions</h2>

            <NavLink to="/student/submissions">View All</NavLink>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="student-empty-state">
              <FileCheck2 size={25} />
              <p>No submissions yet.</p>
              <span>Your submitted tasks will appear here.</span>
            </div>
          ) : (
            <div className="student-dashboard-list">
              {recentSubmissions.map((submission, index) => {
                const relatedTask = mytask.find(
                  (item) => String(item.id) === String(submission.taskId),
                );

                return (
                  <div
                    className="student-dashboard-list-item"
                    key={submission.id || `${submission.taskId}-${index}`}
                  >
                    <div className="student-list-icon submitted-icon">
                      <FileCheck2 size={19} />
                    </div>

                    <div className="student-list-info">
                      <h3>
                        {submission.taskTitle ||
                          relatedTask?.title ||
                          "Submitted Task"}
                      </h3>

                      <p>
                        Submitted:{" "}
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString(
                              "en-IN",
                            )
                          : "Date not available"}
                      </p>
                    </div>

                    <span
                      className={`student-dashboard-status ${(
                        submission.status || "Submitted"
                      ).toLowerCase()}`}
                    >
                      {submission.status || "Submitted"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="student-dashboard-panel">
          <div className="student-panel-header">
            <h2>Upcoming Deadlines</h2>

            <NavLink to="/student/tasks">View All</NavLink>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="student-empty-state">
              <CalendarDays size={25} />
              <p>No upcoming deadlines.</p>
              <span>New faculty-created tasks will appear here.</span>
            </div>
          ) : (
            <div className="student-dashboard-list">
              {upcomingDeadlines.map((item) => (
                <div className="student-dashboard-list-item" key={item.id}>
                  <div className="student-list-icon deadline-icon">
                    <CalendarDays size={19} />
                  </div>

                  <div className="student-list-info">
                    <h3>{item.title}</h3>

                    <p>
                      {item.subject || "Task"} · Due {formatDate(item.dueDate)}
                    </p>
                  </div>

                  <span className="student-deadline-badge">Upcoming</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section className="student-quick-actions">
        <h2>Quick Actions</h2>

        <div className="student-quick-action-list">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <NavLink
                to={action.path}
                className="student-quick-action"
                key={action.title}
              >
                <div
                  className={`student-quick-action-icon ${action.className}`}
                >
                  <Icon size={22} />
                </div>

                <div className="student-quick-action-info">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>

                <ArrowRight size={19} className="student-quick-action-arrow" />
              </NavLink>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
