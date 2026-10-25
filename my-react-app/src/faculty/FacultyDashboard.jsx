import { useContext, useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { TaskContext } from "../TaskContext";
import {
  ClipboardList,
  Clock,
  CircleCheck,
  TriangleAlert,
  CalendarIcon,
  BookOpenCheck,
  FolderKanban,
  Award,
  ClipboardPlus,
  FileCheck2,
  ChevronRight
} from "lucide-react";

function getTaskIcon(type) {
  switch (type) {
    case "Assignment":
      return BookOpenCheck;

    case "Mini Project":
      return FolderKanban;

    case "Certificate":
      return Award;

    default:
      return ClipboardList;
  }
}

function FacultyDashboard() {
  const { mytask, setMytasks } = useContext(TaskContext);
  const total = mytask.length;
  const recentTasks = mytask.slice(-5).reverse();

  const pendingCount = mytask.filter(
    (item) => item.status === "Pending",
  ).length;

  const completedCount = mytask.filter(
    (item) => item.status === "Completed",
  ).length;

  const overdueCount = mytask.filter(
    (item) => item.status === "Overdue",
  ).length;
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return mytask
      .filter((item) => {
        if (!item.dueDate) return false;

        const dueDate = new Date(`${item.dueDate}T00:00:00`);

        return (
          !Number.isNaN(dueDate.getTime()) &&
          dueDate >= today &&
          item.status !== "Completed"
        );
      })
      .sort(
        (a, b) =>
          new Date(`${a.dueDate}T00:00:00`) - new Date(`${b.dueDate}T00:00:00`),
      )
      .slice(0, 5);
  }, [mytask]);
  return (
    <div>
      <div className="dashboard-header">
        <h1>Hi,Dr. Arun Kumar</h1>
        <p>Here's a quik overview of your task</p>
      </div>
      <div className="dashboard-card">
        <div className="d-card1">
          <div className="d-icon1">
            <ClipboardList size={24} color="white" />
          </div>

          <div className="d-items">
            <h3>Total Tasks</h3>
            <p>{total}</p>
          </div>
        </div>
        <div className="d-card2">
          <div className="d-icon2">
            <Clock size={24} color="white" />
          </div>

          <div className="d-items">
            <h3>Pending</h3>
            <p>{pendingCount}</p>
          </div>
        </div>
        <div className="d-card3">
          <div className="d-icon3">
            <CircleCheck size={24} color="white" />
          </div>

          <div className="d-items">
            <h3>Completed</h3>
            <p>{completedCount}</p>
          </div>
        </div>
        <div className="d-card4">
          <div className="d-icon4">
            <TriangleAlert size={24} color="white" />
          </div>

          <div className="d-items">
            <h3>Over Due</h3>
            <p>{overdueCount}</p>
          </div>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="Recent-task">
          <div className="Recent-header">
            <h3>Recent Task</h3>
            <NavLink className="View-button" to="/faculty/mytask">
              View All
            </NavLink>
          </div>
          <div className="Recent-card">
            <div className="recent-flex">
              {recentTasks.length === 0 ? (
                <div className="dashboard-notask">
                  <h3>No task created yet...</h3>
                </div>
              ) : (
                recentTasks.map((item) => {
                  const TaskIcon = getTaskIcon(item.tasktype);
                  return (
                    <div className="recent-task-card" key={item.id}>
                      <div className="recent-top">
                        <div
                          className={`task-icon ${item.tasktype.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <TaskIcon size={22} />
                        </div>
                        <div className="recent-ts">
                          <h3>{item.title}</h3>
                          <p>Subject: {item.subject}</p>
                        </div>
                      </div>
                      <div className="side-card">
                        <CalendarIcon size={16} />
                        <p>Due date: {item.dueDate}</p>

                        <span
                          className={`status ${(item.status || "Pending").toLowerCase()}`}
                        >
                          {item.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="upcoming-duedate">
          <div className="upcoming-header">
            <h3>Upcoming Deadlines</h3>
            <NavLink className="View-button" to="/faculty/mytask">
              View All
            </NavLink>
          </div>
          <div className="upcoming-content">
            {upcomingDeadlines.length === 0 ? (
              <div className="dashboard-notask">
                <h4>No upcoming deadlines...</h4>
              </div>
            ) : (
              upcomingDeadlines.map((item) => {
                const dueDate = new Date(`${item.dueDate}T00:00:00`);

                const month = dueDate
                  .toLocaleDateString("en-US", { month: "short" })
                  .toUpperCase();

                const date = dueDate.getDate();

                return (
                  <div className="deadline-card" key={item.id}>
                    <div className="deadline-info">
                      <div className="deadline-calendar">
                        <span className="deadline-month">{month}</span>
                        <span className="deadline-day">{date}</span>
                      </div>

                      <div className="deadline-title">
                        <h4>{item.title}</h4>
                        <p>{item.subject} &middot; {item.academicyear} &middot; {item.branch} &middot; {item.className}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className="quick-actions">
        <h3>Quick Actions</h3>

        <div className="quick-action-list">
          <NavLink to="/faculty/create-task" className="quick-action">
            <div className="quick-action-icon create">
              <ClipboardPlus size={22} />
            </div>
            <div className="quick-action-text">
              <h4>Create Task</h4>
              <p>Create a new assignment</p>
            </div>
            <ChevronRight size={18} />
          </NavLink>

          <NavLink to="/faculty/mytask" className="quick-action">
            <div className="quick-action-icon mytask">
              <ClipboardList size={22} />
            </div>
            <div className="quick-action-text">
              <h4>My Tasks</h4>
              <p>Manage your created tasks</p>
            </div>
            <ChevronRight size={18} />
          </NavLink>

          <NavLink to="/faculty/submission" className="quick-action">
            <div className="quick-action-icon submission">
              <FileCheck2 size={22} />
            </div>
            <div className="quick-action-text">
              <h4>Submission</h4>
              <p>Review student submissions</p>
            </div>
            <ChevronRight size={18} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
