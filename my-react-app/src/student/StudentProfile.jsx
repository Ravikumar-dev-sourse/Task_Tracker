import { useEffect } from "react";
import {
  UserRound,
  Mail,
  GraduationCap,
  Building2,
  ShieldCheck,
  Pencil,
  Save,
  X,
  CheckCircle2,
  CircleUserRound,
} from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../AuthContext";
import "./Student.css";

const CURRENT_USER_KEYS = ["currentUser", "loggedInUser", "authUser", "user"];

const REGISTERED_USERS_KEYS = ["users", "registeredUsers"];

const readJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const findSignedInUser = () => {
  // First try the session/current-user keys.
  for (const key of CURRENT_USER_KEYS) {
    const user = readJSON(key);

    if (user && typeof user === "object" && !Array.isArray(user)) {
      return { ...user, _sourceKey: key };
    }
  }

  // Then look for the registered user matching the saved email.
  const savedEmail =
    localStorage.getItem("currentUserEmail") ||
    localStorage.getItem("loggedInEmail");

  if (savedEmail) {
    for (const key of REGISTERED_USERS_KEYS) {
      const users = readJSON(key);

      if (Array.isArray(users)) {
        const match = users.find(
          (user) =>
            String(user.email || "").toLowerCase() === savedEmail.toLowerCase(),
        );

        if (match) {
          return { ...match, _sourceKey: key };
        }
      }
    }
  }

  return null;
};

const getDisplayName = (user) =>
  user?.username || user?.name || user?.fullName || user?.fullname || "";

const getDepartment = (user) => user?.department || user?.branch || "";

const getClass = (user) =>
  user?.className || user?.class || user?.studentClass || "";

function StudentProfile() {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    department: "",
    className: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const signedInUser = findSignedInUser();

    if (!signedInUser) {
      setError(
        "Your signup information was not found. Please sign in again and check the localStorage key used by your login page.",
      );
      return;
    }

    const email = signedInUser.email || "";
    const profileKey = `studentProfile_${email.toLowerCase()}`;
    const savedProfile = readJSON(profileKey);

    // Signup information provides defaults; saved profile edits take priority.
    const combined = {
      ...signedInUser,
      ...(savedProfile || {}),
      email,
      role: signedInUser.role || savedProfile?.role || "Student",
      _sourceKey: signedInUser._sourceKey,
    };

    setProfile(combined);
    setFormData({
      username: getDisplayName(combined),
      email,
      department: getDepartment(combined),
      className: getClass(combined),
    });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleCancel = () => {
    setFormData({
      username: getDisplayName(profile),
      email: profile.email || "",
      department: getDepartment(profile),
      className: getClass(profile),
    });

    setIsEditing(false);
    setMessage("");
    setError("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!formData.username.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      formData.email.trim().toLowerCase() !==
      String(profile.email || "").toLowerCase()
    ) {
      setError(
        "Email changes are disabled because your email identifies your signed-in account.",
      );
      return;
    }

    const updatedProfile = {
      ...profile,
      username: formData.username.trim(),
      name: formData.username.trim(),
      email: profile.email,
      department: formData.department.trim(),
      className: formData.className.trim(),
      role: profile.role || "Student",
    };

    // Store editable profile fields separately from authentication data.
    const profileKey = `studentProfile_${profile.email.toLowerCase()}`;

    const savedFields = {
      username: updatedProfile.username,
      name: updatedProfile.name,
      email: updatedProfile.email,
      department: updatedProfile.department,
      className: updatedProfile.className,
      role: updatedProfile.role,
    };

    try {
      localStorage.setItem(profileKey, JSON.stringify(savedFields));

      // Keep the current-user record updated if this app uses one.
      const sourceKey = profile._sourceKey;

      if (sourceKey && CURRENT_USER_KEYS.includes(sourceKey)) {
        const currentStoredUser = readJSON(sourceKey);

        if (currentStoredUser) {
          localStorage.setItem(
            sourceKey,
            JSON.stringify({
              ...currentStoredUser,
              ...savedFields,
            }),
          );
        }
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      console.error("Profile save failed:", saveError);
      setError(
        "Unable to save your profile. Browser storage may be unavailable.",
      );
    }
  };

  if (!profile) {
    return (
      <main className="student-profile-page">
        <header className="student-profile-heading">
          <h1>My Profile</h1>
          <p>View and manage your student information.</p>
        </header>

        <section className="student-profile-card student-profile-not-found">
          <CircleUserRound size={42} />
          <h2>Profile unavailable</h2>
          <p>{error || "Loading your profile..."}</p>
        </section>
      </main>
    );
  }

  const displayName = getDisplayName(profile) || "Student";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function handleChangePassword(e) {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentUser?.email) {
      setPasswordError("Please log in again.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");

    const userIndex = users.findIndex(
      (user) => user.email?.toLowerCase() === currentUser.email.toLowerCase(),
    );

    if (userIndex === -1) {
      setPasswordError("Registered account not found.");
      return;
    }

    if (users[userIndex].password !== currentPassword) {
      setPasswordError("Your current password is incorrect.");
      return;
    }

    users[userIndex] = {
      ...users[userIndex],
      password: newPassword,
    };

    localStorage.setItem("registeredUsers", JSON.stringify(users));

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password changed successfully.");
  }

  return (
    <main className="student-profile-page">
      <header className="student-profile-heading">
        <div>
          <p className="student-profile-eyebrow">STUDENT PORTAL</p>
          <h1>My Profile</h1>
          <p>View and manage the information from your signup.</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="student-profile-edit-button"
            onClick={() => {
              setIsEditing(true);
              setMessage("");
              setError("");
            }}
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </header>

      {message && (
        <div className="student-profile-message success">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && <div className="student-profile-message error">{error}</div>}

      <section className="student-profile-card">
        <div className="student-profile-banner">
          <div className="student-profile-avatar">
            {initials || <UserRound size={34} />}
          </div>

          <div className="student-profile-identity">
            <h2>{displayName}</h2>
            <p>{profile.email || "Email not available"}</p>
          </div>

          <div className="student-profile-role">
            <ShieldCheck size={16} />
            {profile.role || "Student"}
          </div>
        </div>

        <div className="student-profile-content">
          <div className="student-profile-section-heading">
            <div>
              <h3>Personal Information</h3>
              <p>Your registered account details</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="student-profile-grid">
              <div className="student-profile-field">
                <label htmlFor="profile-username">Full Name</label>

                <div className="student-profile-input-wrap">
                  <UserRound size={18} />
                  <input
                    id="profile-username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    required
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="student-profile-field">
                <label htmlFor="profile-email">Email Address</label>

                <div className="student-profile-input-wrap">
                  <Mail size={18} />
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    title="Email is linked to your login account"
                  />
                </div>

                <small>Email is used to identify your account.</small>
              </div>

              <div className="student-profile-field">
                <label htmlFor="profile-department">Department</label>

                <div className="student-profile-input-wrap">
                  <Building2 size={18} />
                  <input
                    id="profile-department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Enter your department"
                  />
                </div>
              </div>

              <div className="student-profile-field">
                <label htmlFor="profile-class">Class / Year</label>

                <div className="student-profile-input-wrap">
                  <GraduationCap size={18} />
                  <input
                    id="profile-class"
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="Enter your class"
                  />
                </div>
              </div>

              <div className="student-profile-field">
                <label htmlFor="profile-role">Account Role</label>

                <div className="student-profile-input-wrap disabled">
                  <ShieldCheck size={18} />
                  <input
                    id="profile-role"
                    value={profile.role || "Student"}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="student-profile-form-actions">
                <section className="profile-section">
                  <h2>Change Password</h2>
                  <p>Update your account password.</p>

                  <form onSubmit={handleChangePassword}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      required
                    />

                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />

                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />

                    {passwordError && (
                      <p className="auth-error">{passwordError}</p>
                    )}

                    {passwordMessage && (
                      <p className="password-success">{passwordMessage}</p>
                    )}

                    <button type="submit">Change Password</button>
                  </form>
                </section>

                <button
                  type="button"
                  className="student-profile-cancel-button"
                  onClick={handleCancel}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button type="submit" className="student-profile-save-button">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        <footer className="student-profile-footer">
          <ShieldCheck size={17} />
          <p>Your profile is saved in this browser.</p>
        </footer>
      </section>
    </main>
  );
}

export default StudentProfile;
