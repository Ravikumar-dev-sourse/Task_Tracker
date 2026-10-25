import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, ClipboardPlus, ListTodo, FileCheck, User ,MoveLeft } from "lucide-react";
import { AuthContext } from "../AuthContext";

function FacultySide() {
  const { setCurrentUser } = useContext(AuthContext);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    setCurrentUser(null);
    setShowLogoutPopup(false);
    navigate("/");
  }
  return (
    <aside className="main-side">
      <nav className="side-nav">
        <NavLink to="/faculty/dashboard" className="nav-link">
          <Home size={16} />
          Dashboard
        </NavLink>

        <NavLink to="/faculty/create-task" className="nav-link">
          <ClipboardPlus size={18} />
          Create Task
        </NavLink>

        <NavLink to="/faculty/mytask" className="nav-link">
          <ListTodo size={18} />
          My Task
        </NavLink>

        <NavLink to="/faculty/submission" className="nav-link">
          <FileCheck size={18} />
          Submission
        </NavLink>

        <NavLink to="/faculty/profile" className="nav-link">
          <User size={18} />
          Profile
        </NavLink>
        <hr />
        <button
          type="button"
          className="nav-link logout-button"
          onClick={() => setShowLogoutPopup(true)}
        ><MoveLeft size={16}/>
          Logout
        </button>
      </nav>
      {showLogoutPopup && (
        <div className="logout-overlay">
          <div
            className="logout-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <h3 id="logout-title">Confirm Logout</h3>

            <p>Are you sure you want to log out?</p>

            <div className="logout-actions">
              <button
                className="cancel-button"
                onClick={() => setShowLogoutPopup(false)}
              >
                Cancel
              </button>

              <button className="confim-logout-button" onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default FacultySide;
