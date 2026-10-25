
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const FACULTY_PASSCODE = "RIT@Faculty2026";

function Login() {
  const { setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState("Faculty");
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    setError("");

    // Faculty login
    if (role === "Faculty") {
      if (passcode !== FACULTY_PASSCODE) {
        setError("Incorrect faculty passcode.");
        return;
      }

      const facultyUser = {
        username: "Faculty",
        role: "Faculty",
      };

      setCurrentUser(facultyUser);

      localStorage.setItem(
        "currentUser",
        JSON.stringify(facultyUser)
      );

      navigate("/faculty/dashboard");
      return;
    }

    // Student login
    const users = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    const normalizedEmail = email.trim().toLowerCase();

    const student = users.find(
      (user) =>
        user.email?.trim().toLowerCase() === normalizedEmail &&
        user.password === password
    );

    if (!student) {
      setError("Invalid email or password. Please sign up first.");
      return;
    }

    // Exclude password from the active user profile.
    const { password: savedPassword, ...userWithoutPassword } = student;

    // Update AuthContext and localStorage.
    setCurrentUser(userWithoutPassword);

    localStorage.setItem(
      "currentUser",
      JSON.stringify(userWithoutPassword)
    );

    navigate("/student/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Task Tracker</h1>
        <p className="auth-subtitle">Login to your account</p>

        <div className="role-toggle">
          <button
            type="button"
            className={role === "Faculty" ? "selected" : ""}
            onClick={() => {
              setRole("Faculty");
              setError("");
            }}
          >
            Faculty
          </button>

          <button
            type="button"
            className={role === "Student" ? "selected" : ""}
            onClick={() => {
              setRole("Student");
              setError("");
            }}
          >
            Student
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {role === "Faculty" ? (
            <>
              <label htmlFor="passcode">Faculty Passcode</label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter faculty passcode"
                required
              />
            </>
          ) : (
            <>
              <label htmlFor="email">Email ID</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-button">
            Login as {role}
          </button>
        </form>

        {role === "Student" && (
          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
