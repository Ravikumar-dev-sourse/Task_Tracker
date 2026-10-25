import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";
import "./Student.css";

function StudentNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitles = {
    "/student/dashboard": "Dashboard",
    "/student/tasks": "Student Tasks",
    "/student/submissions": "My Submissions",
    "/student/notifications": "Notifications",
    "/student/profile": "My Profile",
  };

  const pageTitle =
    pageTitles[location.pathname] || "Student Portal";

  return (
    <header className="student-topbar">
      <div className="student-page-heading">
        <h1>{pageTitle}</h1>
        <p>Manage your academic tasks and submissions.</p>
      </div>

      <div className="student-topbar-actions">
        <button
          type="button"
          className="student-notification-button"
          aria-label="View notifications"
          
        >
          <Bell size={20} />
          <span className="student-notification-dot" />
        </button>

        <button
          type="button"
          className="student-profile-shortcut"
          onClick={() => navigate("/student/profile")}
        >
          <div className="student-avatar">S</div>

          <div className="student-profile-label">
            <strong>Student</strong>
            <span>Student Account</span>
          </div>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}

export default StudentNav;