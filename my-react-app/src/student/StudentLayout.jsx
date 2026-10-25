import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentNav from "./StudentNav";
import "./Student.css";

function StudentLayout() {
  return (
    <div className="student-layout">
      <StudentSidebar />

      <div className="student-main">
        <StudentNav />

        <main className="student-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;