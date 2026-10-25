
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

function Signup() {
  const { students, setStudents } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    department: "",
    className: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();

    // Check both Context and localStorage for duplicate accounts.
    const storedUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    const emailExists =
      students.some(
        (student) =>
          student.email?.trim().toLowerCase() === normalizedEmail
      ) ||
      storedUsers.some(
        (user) =>
          user.email?.trim().toLowerCase() === normalizedEmail
      );

    if (emailExists) {
      setError("This email is already registered.");
      return;
    }

    const newStudent = {
      id: crypto.randomUUID(),
      username: form.username.trim(),
      email: normalizedEmail,
      department: form.department.trim(),
      className: form.className.trim(),
      role: "Student",
      password: form.password,
    };

    // Update the shared React state.
    setStudents((previous) => [...previous, newStudent]);

    // Save registered accounts for login and future visits.
    const updatedUsers = [...storedUsers, newStudent];

    localStorage.setItem(
      "registeredUsers",
      JSON.stringify(updatedUsers)
    );

    alert("Account created successfully. Please log in.");

    navigate("/");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSignup}>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Register as a student</p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
        />

        <label htmlFor="email">Email ID</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <label htmlFor="department">Department</label>
        <input
          id="department"
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Enter your department"
          required
        />

        <label htmlFor="className">Class / Section</label>
        <input
          id="className"
          name="className"
          value={form.className}
          onChange={handleChange}
          placeholder="e.g. III AI&DS - A"
          required
        />

        <label htmlFor="role">Role</label>
        <input id="role" value="Student" readOnly />

        <label htmlFor="password">Create Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a password"
          required
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-button">
          Sign Up
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
