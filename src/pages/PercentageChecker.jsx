// src/pages/PercentageChecker.jsx
import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { supabase } from "../supabaseClient";
import "../styles/percentage.css";
import {
  AiOutlineDelete,
  AiOutlineFilePdf,
  AiOutlinePlus,
  AiOutlineSave,
} from "react-icons/ai";
import { BsClockHistory, BsFileEarmarkSpreadsheet } from "react-icons/bs";


const PercentageChecker = () => {
  const [subjects, setSubjects] = useState([
    { name: "", obtained: "", total: "" },
  ]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", obtained: "", total: "" }]);
  };

  const removeSubject = (index) => {
    const updated = [...subjects];
    updated.splice(index, 1);
    setSubjects(updated);
  };

  const calculateStats = () => {
    let totalMarks = 0;
    let obtainedMarks = 0;

    subjects.forEach((sub) => {
      const o = parseFloat(sub.obtained);
      const t = parseFloat(sub.total);
      if (!isNaN(o) && !isNaN(t)) {
        obtainedMarks += o;
        totalMarks += t;
      }
    });

    const percentage =
      totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : "0.00";

    return { obtainedMarks, totalMarks, percentage };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Percentage Report", 14, 16);

    const rows = subjects.map((s) => [
      s.name,
      s.obtained,
      s.total,
      `${((s.obtained / s.total) * 100).toFixed(2)}%`,
    ]);

    doc.autoTable({
      head: [["Subject", "Obtained", "Total", "Subject %"]],
      body: rows,
      startY: 25,
      theme: "grid",
    });

    const { percentage, totalMarks, obtainedMarks } = calculateStats();
    const end = doc.lastAutoTable.finalY;

    doc.text(`Total Marks: ${obtainedMarks}/${totalMarks}`, 14, end + 10);
    doc.text(`Overall Percentage: ${percentage}%`, 14, end + 20);
    doc.save("percentage_report.pdf");
  };

  const exportToExcel = () => {
    const data = [["Subject", "Obtained", "Total", "Subject %"]];
    subjects.forEach((s) => {
      const percent = ((s.obtained / s.total) * 100).toFixed(2);
      data.push([s.name, s.obtained, s.total, `${percent}%`]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Percentage Report");
    XLSX.writeFile(wb, "percentage_report.xlsx");
  };

  const saveToSupabase = async () => {
    const { percentage, totalMarks, obtainedMarks } = calculateStats();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      alert("❌ Please login first.");
      return;
    }

    const { error } = await supabase.from("percentage_records").insert([
      {
        user_id: session.user.id,
        subjects: JSON.stringify(subjects),
        total_marks: totalMarks,
        obtained_marks: obtainedMarks,
        percentage,
      },
    ]);

    if (error) {
      alert("❌ Save failed: " + error.message);
    } else {
      alert("✅ Saved successfully");
      fetchHistory();
    }
  };

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return;

    const { data, error } = await supabase
      .from("percentage_records")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error) setHistory(data || []);
  };

  const deleteRecord = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete?");
    if (!confirm) return;

    const { error } = await supabase.from("percentage_records").delete().eq("id", id);
    if (!error) {
      alert("✅ Deleted");
      fetchHistory();
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) fetchHistory();
  };

  const { percentage, totalMarks, obtainedMarks } = calculateStats();

  return (
    <div className="percentage-container">
      <h2>📊 Percentage Checker</h2>

      <div className="subject-list">
        {subjects.map((sub, i) => (
          <div className="subject-row" key={i}>
            <input
              type="text"
              placeholder="Subject"
              value={sub.name}
              onChange={(e) => handleChange(i, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Obtained"
              value={sub.obtained}
              onChange={(e) => handleChange(i, "obtained", e.target.value)}
            />
            <input
              type="number"
              placeholder="Total"
              value={sub.total}
              onChange={(e) => handleChange(i, "total", e.target.value)}
            />
           <button onClick={() => removeSubject(i)} className="icon-only">
  <AiOutlineDelete />
</button>

          </div>
        ))}
        <button className="add-subject-btn" onClick={addSubject}>
  <AiOutlinePlus style={{ marginRight: 6 }} />
  Add Subject
</button>

      </div>

      <div className="percentage-stats">
        <div><strong>Obtained:</strong> {obtainedMarks}</div>
        <div><strong>Total:</strong> {totalMarks}</div>
        <div><strong>Percentage:</strong> {percentage}%</div>
      </div>

      <div className="actions">
       <button onClick={exportToPDF}>
  <AiOutlineFilePdf style={{ marginRight: 6 }} />
  Export PDF
</button>

       <button onClick={exportToExcel}>
  <BsFileEarmarkSpreadsheet style={{ marginRight: 6 }} />
  Export Excel
</button>

       <button onClick={saveToSupabase}>
  <AiOutlineSave style={{ marginRight: 6 }} />
  Save
</button>

        <button onClick={toggleHistory}>
  <BsClockHistory style={{ marginRight: 6 }} />
  View History
</button>

      </div>

      {showHistory && (
        <div className="history-section">
          <h3>📜 Saved History</h3>
          {history.length === 0 ? (
            <p>No records found.</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-card">
                <div
  onClick={() => setSubjects(JSON.parse(item.subjects))}
  style={{ cursor: "pointer" }}
>
  <p>
    <strong>Percentage:</strong> {item.percentage}% |{" "}
    <strong>Marks:</strong> {item.obtained_marks}/{item.total_marks}
  </p>
  <p><em>{new Date(item.created_at).toLocaleString()}</em></p>
</div>

                  <p><em>{new Date(item.created_at).toLocaleString()}</em></p>
                  <button onClick={() => deleteRecord(item.id)} className="icon-only">
  <AiOutlineDelete />
</button>

                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PercentageChecker;
