
import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { TaskContext } from "../TaskContext";
import {
  SearchIcon,
  CalendarIcon,
  MoreVertical,
  BookOpenCheck,
  FolderKanban,
  Award,
  ClipboardList,
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

function MyTask() {
  const { mytask ,setMytasks } = useContext(TaskContext);

  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [className, setClassName] = useState("");
  const [status, setStatus] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  const handleDelete = (id) => {
  setMytasks((previousTasks) =>
    previousTasks.filter((item) => item.id !== id)
  );
};

  const total = mytask.length;

  
  const filteredTasks = mytask.filter((item) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchText) ||
      (item.subject || "").toLowerCase().includes(searchText) ||
      (item.tasktype || "").toLowerCase().includes(searchText) ||
      (item.description || "").toLowerCase().includes(searchText);

    const matchesCategory =
      category === "" || item.tasktype === category;

    const matchesYear =
      year === "" || item.academicyear === year;

    const matchesBranch =
      branch === "" || item.branch === branch;

    const matchesClass =
      className === "" || item.className === className;

    const matchesStatus =
      status === "" ||
      (item.status || "Pending") === status;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesYear &&
      matchesBranch &&
      matchesClass &&
      matchesStatus
    );
  });

  return (
    <div>
      <div className="mytask-header">
        <div>
          <h1>My Task</h1>
          <p>Manage and track the tasks you have created.</p>
        </div>

        <div>
          <NavLink
            to="/faculty/create-task"
            className="mytask-button"
          >
            + Create
          </NavLink>
        </div>
      </div>

      <div className="mytask-list">
        {total === 0 ? (
          <div className="No-task">
            <h1>No Task created yet</h1>
            <p>
              You haven't created any tasks yet.
              Create your first task to get started!
            </p>
          </div>
        ) : (
          <>
            <div className="top-section">
              
              <div className="Search-bar">
                <SearchIcon size={15} />

                <input
                  type="text"
                  placeholder="Search by title, subject, type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

             
              <div className="filter">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Mini Project">Mini Project</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Others">Others</option>
                </select>

                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  <option value="I Year">I Year</option>
                  <option value="II Year">II Year</option>
                  <option value="III Year">III Year</option>
                  <option value="IV Year">IV Year</option>
                </select>

                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">All Branches</option>
                  <option value="AI&DS">AI&DS</option>
                  <option value="AIML">AIML</option>
                  <option value="CSE">CSE</option>
                  <option value="CCE">CCE</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="BIO-TECH">BIO-TECH</option>
                </select>

                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                >
                  <option value="">All Classes</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <h1>Your Tasks ({filteredTasks.length} of {total})</h1>

            {filteredTasks.length === 0 ? (
              <div className="No-task">
                <h2>No matching tasks found</h2>
                <p>Try changing your search or filters.</p>

                <button
                  className="clear-filter"
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setYear("");
                    setBranch("");
                    setClassName("");
                    setStatus("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredTasks.map((item) => {
                const TaskIcon = getTaskIcon(item.tasktype);

                return (
                  <div className="mytask-main" key={item.id}>
                    <div className="mytask-card">
                      <div
                        className={`icon ${(item.tasktype || "others")
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        <TaskIcon size={20} />
                      </div>

                      <div className="mytask-icon">
                        <h2>{item.title}</h2>

                        <p>
                          Subject: {item.subject} &middot; Type: {item.tasktype}
                        </p>

                       

                        <hr />

                        <p>
                          Year: {item.academicyear} &middot;  Branch: {item.branch} &middot; Class: {item.className}
                        </p>
                      </div>
                    </div>

                    <div className="side-card">
                      <CalendarIcon size={16} />

                      <p>Due date: {item.dueDate}</p>

                      <p
                        className={`priority ${(item.priority || "Medium").toLowerCase()}`}
                      >
                        {item.priority}
                      </p>

                      <p
                        className={`status ${(item.status || "Pending").toLowerCase()}`}
                      >
                        {item.status}
                      </p>
                      {showPopup && (
                        <div className="popup">
                           <button className="Edit">Edit</button>
                           <button className="Delete"
                            onClick={()=>handleDelete(item.id)}
                           >Delete</button>
                        </div>
                      )}
                      <button className="More-button" onClick={() => {
                        if(showPopup === true) {
                          setShowPopup(false)
                         } 
                         else if (showPopup === false){
                           setShowPopup(true)
                         }
                      }}>
                         <MoreVertical size={20} />
                      </button> 
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyTask;
