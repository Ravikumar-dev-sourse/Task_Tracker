
import {
  UserRound,
  Mail,
  Building2,
  BriefcaseBusiness,
  IdCard,
  ShieldCheck,
} from "lucide-react";


function FacultyProfile() {
  // Constant faculty details for the frontend demo
  const faculty = {
    name: "Dr. Arun Kumar",
    email: "arun.kumar@ritchennai.edu.in",
    department: "Artificial Intelligence and Data Science",
    designation: "Assistant Professor",
    facultyId: "FAC001",
    role: "Faculty",
  };

  return (
    <div className="faculty-profile-page">
      <div className="profile-heading">
        <h1>Faculty Profile</h1>
        <p>View your faculty information</p>
      </div>

      <div className="faculty-profile-card">
        <div className="profile-banner">
          <div className="profile-avatar">
            <UserRound size={38} />
          </div>

          <div className="profile-name">
            <h2>{faculty.name}</h2>
            <p>{faculty.designation}</p>
          </div>

          <span className="profile-role">
            <ShieldCheck size={15} />
            {faculty.role}
          </span>
        </div>

        <div className="profile-details">
          <h3>Personal Information</h3>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <UserRound size={19} />
              </div>
              <div>
                <span>Full Name</span>
                <p>{faculty.name}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={19} />
              </div>
              <div>
                <span>Email Address</span>
                <p>{faculty.email}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Building2 size={19} />
              </div>
              <div>
                <span>Department</span>
                <p>{faculty.department}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <BriefcaseBusiness size={19} />
              </div>
              <div>
                <span>Designation</span>
                <p>{faculty.designation}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <IdCard size={19} />
              </div>
              <div>
                <span>Faculty ID</span>
                <p>{faculty.facultyId}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <ShieldCheck size={19} />
              </div>
              <div>
                <span>Account Role</span>
                <p>{faculty.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-footer">
          <ShieldCheck size={17} />
          <p>Faculty account information</p>
        </div>
      </div>
    </div>
  );
}

export default FacultyProfile;
