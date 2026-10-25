import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FileCheck2,
  Bell,
  UserRound,
  LogOut,
  GraduationCap,
} from "lucide-react";
import "./Student.css";

import { useState } from "react";

function StudentSidebar() {
  const navigate = useNavigate();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    setShowLogoutPopup(false);

    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Student Tasks",
      path: "/student/tasks",
      icon: ClipboardList,
    },
    {
      title: "My Submissions",
      path: "/student/submissions",
      icon: FileCheck2,
    },
    {
      title: "Profile",
      path: "/student/profile",
      icon: UserRound,
    },
  ];

  return (
    <aside className="student-sidebar">
      <div className="student-brand">
        <div className="student-brand-icon">
          <GraduationCap size={25} />
        </div>

        <div>
          <h2>Task Tracker</h2>
          <p>Student Portal</p>
        </div>
      </div>

      <nav className="student-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `student-menu-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="student-sidebar-bottom">
        <button
          type="button"
          className="student-logout"
          onClick={() => setShowLogoutPopup(true)}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
        
        {showLogoutPopup && (
          <div className="logout-overlay">
            <div
              className="logout-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
            >
              <div className="logout-popup-icon">
                <LogOut size={24} />
              </div>

              <h3 id="logout-title">Confirm Logout</h3>

              <p>Are you sure you want to logout from your account?</p>

              <div className="logout-popup-actions">
                <button
                  type="button"
                  className="logout-cancel-btn"
                  onClick={() => setShowLogoutPopup(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="logout-confirm-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default StudentSidebar;
