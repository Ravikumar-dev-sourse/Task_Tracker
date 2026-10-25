import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useState, useEffect } from "react";

import FacultyLayout from "./faculty/FacultyLayout";
import FacultyDashboard from "./faculty/FacultyDashboard";
import CreateTask from "./faculty/CreateTask";
import MyTask from "./faculty/MyTask";
import Submission from "./faculty/Submission";
import FacultyProfile from "./faculty/FacultyProfile";

import StudentLayout from "./student/StudentLayout";
import StudentDashboard from "./student/StudentDashboard";
import TaskDetails from "./student/TaskDetails";
import Mysubmission from "./student/Mysubmission";
import StudentProfile from "./student/StudentProfile";

import ProtectedRoute from "./ProtectedRoute";

import Login from "./Login";
import Signup from "./Signup";

import { TaskContext } from "./TaskContext";
import { AuthContext } from "./AuthContext";

function App() {
  const [students, setStudents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [mytask, setMytasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("facultyTasks") || "[]");
    } catch {
      return [];
    }
  });

  // Save faculty tasks whenever they change
  useEffect(() => {
    localStorage.setItem("facultyTasks", JSON.stringify(mytask));
  }, [mytask]);

  // Sync tasks when another browser tab changes them
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== "facultyTasks") return;

      try {
        setMytasks(event.newValue ? JSON.parse(event.newValue) : []);
      } catch {
        setMytasks([]);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [task, setTask] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    priority: "High",
    tasktype: "Assignment",
    academicyear: "",
    branch: "",
    className: "",
    attachment: [],
  });

  const [submissions, setSubmissions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("submissions") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("submissions", JSON.stringify(submissions));
  }, [submissions]);

  function FacultyProtectedLayout() {
    return (
      <ProtectedRoute allowedRole="Faculty">
        <Outlet />
      </ProtectedRoute>
    );
  }

  function StudentProtectedLayout() {
    return (
      <ProtectedRoute allowedRole="Student">
        <Outlet />
      </ProtectedRoute>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        students,
        setStudents,
        currentUser,
        setCurrentUser,
      }}
    >
      <TaskContext.Provider
        value={{
          task,
          setTask,
          mytask,
          setMytasks,
          submissions,
          setSubmissions,
        }}
      >
        <Routes>
          {/* Authentication */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Faculty Side */}
        <Route element={<FacultyProtectedLayout />}>
          <Route path="/faculty" element={<FacultyLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="create-task" element={<CreateTask />} />
            <Route path="mytask" element={<MyTask />} />
            <Route path="submission" element={<Submission />} />
            <Route path="profile" element={<FacultyProfile />} />
          </Route>
        </Route>

          {/* Student Side */}
          <Route element={<StudentProtectedLayout />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />

            <Route path="tasks" element={<TaskDetails />} />
            <Route path="submissions" element={<Mysubmission />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TaskContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
