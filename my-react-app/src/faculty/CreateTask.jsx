import { ClipboardPlus, Settings, PinIcon } from "lucide-react";
import { useContext } from "react";
import { TaskContext } from "../TaskContext";

function CreateTask() {
  const { task, setTask, setMytasks } = useContext(TaskContext);

  const handlechange = (e) => {
    const { name, value } = e.target;
    setTask((t) => ({
      ...t,
      [name]: value,
    }));
  };
  const handleFileChange = (e) => {
    const file = Array.from(e.target.files);
    setTask((t) => ({
      ...t,
      attachment: [...t.attachment, ...file],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const attachments = task.attachment.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      status: "Pending",
      attachment: attachments,
      createdAt: new Date().toISOString(),
    };

    setMytasks((previousTasks) => [...previousTasks, newTask]);

    setTask({
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
  };

  return (
    <div>
      <div className="Header-task">
        <h1>Create Task</h1>
        <p>Create and assign a new task to students</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="task-details">
          <h2>
            <ClipboardPlus size={20} />
            Task Details
          </h2>
          <div className="details-element">
            <div>
              <h4>
                Task Title <span className="required-star">*</span>{" "}
              </h4>
              <input
                type="text"
                placeholder="Enter task title (eg:React Assignment)"
                name="title"
                value={task.title}
                onChange={handlechange}
                required
              />
            </div>
            <div>
              <h4>
                Subject <span className="required-star">*</span>
              </h4>
              <select
                name="subject"
                value={task.subject}
                onChange={handlechange}
                required
              >
                <option value="">--Select Subject--</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="Business Aanlytics">Business Analytics</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="description">
            <h4>Description </h4>
            <textarea
              name="description"
              value={task.description}
              onChange={handlechange}
              placeholder="Provide detailed despcription about the task,instruction,requirements,etc"
            ></textarea>
          </div>
        </div>
        <div className="task-setting">
          <h2>
            {" "}
            <Settings size={20} />
            Task Settings
          </h2>
          <div className="task-element">
            <div>
              <h4>
                Due Date <span className="required-star">*</span>{" "}
              </h4>
              <input
                type="date"
                name="dueDate"
                value={task.dueDate}
                onChange={handlechange}
                required
              />
            </div>
            <div>
              <h4>Priority</h4>
              <select
                name="priority"
                value={task.priority}
                onChange={handlechange}
                required
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">low</option>
              </select>
            </div>
            <div>
              <h4>
                Task Type <span className="required-star">*</span>
              </h4>
              <select
                name="tasktype"
                value={task.tasktype}
                onChange={handlechange}
                required
              >
                <option value="Assignment">Assignment</option>
                <option value="Certificate">Certificate</option>
                <option value="Mini Project">Mini Project</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="task-element">
            <div>
              <h4>
                Academic Year <span className="required-star">*</span>{" "}
              </h4>
              <select
                name="academicyear"
                value={task.academicyear}
                onChange={handlechange}
                required
              >
                <option value="">Select Year</option>
                <option value="I Year">I Year</option>
                <option value="II Year">II Year</option>
                <option value="III Year">III Year</option>
                <option value="IV Year">IV Year</option>
              </select>
            </div>
            <div>
              <h4>
                Branch<span className="required-star">*</span>{" "}
              </h4>
              <select
                name="branch"
                value={task.branch}
                onChange={handlechange}
                required
              >
                <option value="">Select Branch</option>
                <option value="AI&DS">AI&DS </option>
                <option value="AIML">AIML</option>
                <option value="CSE">CSE</option>
                <option value="CCE">CCE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="BIO-TECH">BIO-TECH</option>
              </select>
            </div>
            <div>
              <h4>
                Class <span className="required-star">*</span>{" "}
              </h4>
              <select
                name="className"
                value={task.className}
                onChange={handlechange}
                required
              >
                <option value="">Select Class</option>
                <option value="A"> A</option>
                <option value="B"> B</option>
                <option value="C"> C</option>
                <option value="D"> D </option>
                <option value="E"> E </option>
                <option value="F"> F </option>
              </select>
            </div>
          </div>
        </div>
        <div className="form-section">
          <h2>
            <PinIcon />
            Attachment
          </h2>

          <div className="file-upload">
            <input
              type="file"
              id="task-file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
              name="attachment"
              onChange={handleFileChange}
            />

            <label htmlFor="task-file">Choose File</label>

            <p>Upload PDF, DOCX, PPTX or ZIP</p>

            {task.attachment.length > 0 && (
              <div className="Files">
                <p>Selected files ({task.attachment.length})</p>
                {task.attachment.map((files, index) => (
                  <div key={index} className="file-name">
                    {files.name}

                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => {
                        setTask((t) => ({
                          ...t,
                          attachment: t.attachment.filter((_, i) => i != index),
                        }));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="main-button">
          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              setTask({
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
            }}
          >
            Cancel
          </button>
          <button type="submit" className="create-button">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
