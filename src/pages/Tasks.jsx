import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../styles/Tasks.css";

const Task = () => {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ✅ useCallback version of fetchTasks
  const fetchTasks = useCallback(async (uid = userId) => {
    if (!uid) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", uid)
      .order("due_date", { ascending: true });

    if (!error) setTasks(data);
    else console.error("Fetch error:", error.message);
  }, [userId]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchTasks(user.id);
      }
    };
    fetchUser();
  }, [fetchTasks]); // ✅ fetchTasks is now safe to use in dependency array

  const handleAddTask = async () => {
    if (!title || !userId) return alert("Title and login required!");

    const { error } = await supabase.from("tasks").insert([{
      user_id: userId,
      title,
      description,
      due_date: dueDate,
      status: "Pending",
    }]);

    if (!error) {
      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTasks();
    } else {
      console.error("Insert failed:", error.message);
      alert("Insert failed: " + error.message);
    }
  };

  const markAsDone = async (id) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "Done", completed: true })
      .eq("id", id);

    if (error) {
      console.error("❌ Mark as done failed:", error.message);
      alert("Failed to mark task as done. Check console.");
    } else {
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("📋 Task List", 14, 15);

    const tableData = tasks.map((task) => [
      task.title,
      task.description,
      task.due_date || "N/A",
      task.status,
    ]);

    doc.autoTable({
      head: [["Title", "Description", "Due Date", "Status"]],
      body: tableData,
      startY: 20,
    });

    doc.save("task-list.pdf");
  };

  const filteredTasks = tasks
    .filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((task) => statusFilter === "All" || task.status === statusFilter);

  return (
    <div className="task-container">
      <h2>📘 Add New Task</h2>
      <div className="task-form">
        <input
          type="text"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button onClick={handleAddTask}>➕ Add Task</button>
      </div>

      <div className="task-toolbar">
        <input
          type="text"
          placeholder="🔍 Search by title"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="status-filter">
          <button onClick={() => setStatusFilter("All")} className={statusFilter === "All" ? "active" : ""}>🔁 All</button>
          <button onClick={() => setStatusFilter("Pending")} className={statusFilter === "Pending" ? "active" : ""}>🟡 Pending</button>
          <button onClick={() => setStatusFilter("Done")} className={statusFilter === "Done" ? "active" : ""}>✅ Done</button>
        </div>

        <button onClick={exportToPDF} className="export-btn">
          📤 Export to PDF
        </button>
      </div>

      <h2>🗂️ Your Tasks</h2>
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <p>No matching tasks.</p>
        ) : (
          filteredTasks.map((task) => (
            <div className={`task-card ${task.status === "Done" ? "done" : ""}`} key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>📅 Due: {task.due_date || "No due date"}</p>
              <p>
                Status: <span className={`status ${task.status.toLowerCase()}`}>{task.status}</span>
              </p>
              <div className="task-actions">
                {task.status !== "Done" && (
                  <button onClick={() => markAsDone(task.id)}>✅ Mark as Done</button>
                )}
                <button className="delete" onClick={() => deleteTask(task.id)}>🗑 Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Task;


