// src/pages/Attendance.jsx
import React, { useEffect, useState } from "react";
import "../styles/Attendance.css";
import { supabase } from "../supabaseClient";
import { useUser } from "../contexts/UserContext";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";

const Attendance = () => {
  const { user } = useUser();
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // ✅ Add subject
  const handleAddSubject = async () => {
    if (!newSubject.trim() || !user) return;
    const subject = newSubject.trim();

    const alreadyExists = subjects.some((s) => s.subject_name === subject);
    if (alreadyExists) {
      toast.error("Subject already exists.");
      return;
    }

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        id: uuidv4(),
        user_id: user.id,
        subject_name: subject,
      })
      .select();

    if (!error && data) {
      setSubjects([...subjects, data[0]]);
      setNewSubject("");
      toast.success("Subject added!");
    } else {
      toast.error("Failed to add subject.");
    }
  };

  // ✅ Delete subject
  const handleDeleteSubject = async (subjectId) => {
    const confirm = window.confirm("Are you sure you want to delete this subject?");
    if (!confirm) return;

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (!error) {
      setSubjects(subjects.filter((s) => s.id !== subjectId));
      toast.success("Subject deleted!");
    } else {
      toast.error("Failed to delete subject.");
    }
  };

  // ✅ Mark attendance
  const markAttendance = async (subjectName, status) => {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("attendance").insert({
      id: uuidv4(),
      user_id: user.id,
      subject: subjectName,
      date: today,
      status,
    });

    if (!error) {
      fetchAttendance();
      toast.success(`Marked ${status} for ${subjectName}`);
    } else {
      toast.error("Failed to mark attendance.");
    }
  };

  // ✅ Fetch data
  const fetchAttendance = async () => {
    if (!user) return;

    const { data: att } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", user.id);
    setAttendance(att || []);

    const { data: subs } = await supabase
      .from("subjects")
      .select("id, subject_name")
      .eq("user_id", user.id);

    setSubjects(subs || []);
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const getStats = (subjectName) => {
    const filtered = attendance.filter((a) => a.subject === subjectName);
    const present = filtered.filter((a) => a.status === "present").length;
    const total = filtered.length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
    return { total, present, percentage };
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Subject", "Date", "Status"]],
      body: attendance.map((a) => [a.subject, a.date, a.status]),
    });
    doc.save("attendance_report.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(attendance);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance_report.xlsx");
  };

  const filteredAttendance = selectedDate
    ? attendance.filter((a) => a.date === selectedDate)
    : attendance;

  return (
    <div className="attendance-page">
      <Toaster position="top-right" />
      <h2>
         <img src="https://img.icons8.com/fluency/48/attendance-mark.png" alt="Attendance Icon" style={{ verticalAlign: "middle", marginRight: "10px" }} onError={(e) => {  e.target.onerror = null;  e.target.src = "https://img.icons8.com/fluency/48/classroom.png"; }}/>
         Attendance Tracker
      </h2>

      <div className="add-subject">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter Subject Name"
        />
        <button onClick={handleAddSubject}>
          <img src="https://img.icons8.com/color/24/plus.png" alt="Add Icon" /> Add
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ marginLeft: "auto" }}
        />
      </div>

      <div className="export-buttons" style={{ display: "flex", gap: "1rem", margin: "1rem 0", flexWrap: "wrap" }}>
        <button onClick={handleExportPDF}>
          <img src="https://img.icons8.com/color/24/export-pdf.png" alt="pdf" /> Export PDF
        </button>
        <button onClick={handleExportExcel}>
          <img src="https://img.icons8.com/color/24/ms-excel.png" alt="excel" /> Export Excel
        </button>
      </div>

      <div className="subject-grid">
        {subjects.map((subj, i) => {
          const name = subj.subject_name;
          const subjectId = subj.id;
          const { total, present, percentage } = getStats(name);

          return (
            <div key={i} className="subject-card">
              <h3>{name}</h3>

              <p>
                <img src="https://img.icons8.com/color/24/classroom.png" alt="class icon" />
                Total: {total}
              </p>
              <p>
                <img src="https://img.icons8.com/emoji/24/check-mark-emoji.png" alt="present icon" />
                Present: {present}
              </p>
              <p>
                <img src="https://img.icons8.com/color/24/combo-chart--v1.png" alt="percentage" />
                Attendance: {percentage}%
                {percentage < 75 && (
                  <span style={{ color: "red", marginLeft: "8px" }}>⚠️ Low!</span>
                )}
              </p>

              <div className="attendance-buttons">
                <button className="present-btn" onClick={() => markAttendance(name, "present")}>
                  <img src="https://img.icons8.com/color/24/ok--v1.png" alt="Present" /> Present
                </button>
                <button className="absent-btn" onClick={() => markAttendance(name, "absent")}>
                  <img src="https://img.icons8.com/color/24/delete-sign.png" alt="Absent" /> Absent
                </button>
                <button className="delete-btn" onClick={() => handleDeleteSubject(subjectId)}>
                  <img src="https://img.icons8.com/fluency/24/filled-trash.png" alt="Delete" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div style={{ marginTop: "2rem" }}>
          <h3>📅 Attendance on {selectedDate}</h3>
          <ul>
            {filteredAttendance.map((a, i) => (
              <li key={i}>{a.subject} — {a.status}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Attendance;

