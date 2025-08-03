import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { supabase } from "../supabaseClient";
import "../styles/cgpa.css";

const gradeMap = {
  O: 10,
  "A+": 9,
  A: 8,
  "A-": 7.5,
  "B+": 7,
  B: 6,
  "B-": 5.5,
  C: 5,
  "C-": 4.5,
  D: 4,
  F: 0,
};

const CGPAChecker = () => {
  const [semesters, setSemesters] = useState([
    { subjects: [{ name: "", credits: "", grade: "" }] },
  ]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleSubjectChange = (semIndex, subIndex, field, value) => {
    const updated = [...semesters];
    updated[semIndex].subjects[subIndex][field] = value;
    setSemesters(updated);
  };

  const addSubject = (semIndex) => {
    const updated = [...semesters];
    updated[semIndex].subjects.push({ name: "", credits: "", grade: "" });
    setSemesters(updated);
  };

  const removeSubject = (semIndex, subIndex) => {
    const updated = [...semesters];
    updated[semIndex].subjects.splice(subIndex, 1);
    setSemesters(updated);
  };

  const addSemester = () => {
    setSemesters([
      ...semesters,
      { subjects: [{ name: "", credits: "", grade: "" }] },
    ]);
  };

  const calculateStats = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    semesters.forEach((sem) =>
      sem.subjects.forEach((sub) => {
        const credit = parseFloat(sub.credits);
        const gradePoint = gradeMap[sub.grade.toUpperCase()];
        if (!isNaN(credit) && gradePoint !== undefined) {
          totalCredits += credit;
          totalPoints += credit * gradePoint;
        }
      })
    );

    const cgpa =
      totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    const percentage = (cgpa * 9.5).toFixed(2);

    return { cgpa, percentage, totalCredits };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("CGPA Report", 14, 16);

    semesters.forEach((sem, i) => {
      const rows = sem.subjects.map((sub) => [
        sub.name,
        sub.credits,
        sub.grade,
      ]);
      doc.autoTable({
        head: [["Subject", "Credits", "Grade"]],
        body: rows,
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 24,
        theme: "grid",
      });
    });

    const { cgpa, percentage, totalCredits } = calculateStats();
    doc.text(`CGPA: ${cgpa}`, 14, doc.lastAutoTable.finalY + 20);
    doc.text(`Percentage: ${percentage}%`, 14, doc.lastAutoTable.finalY + 28);
    doc.text(`Total Credits: ${totalCredits}`, 14, doc.lastAutoTable.finalY + 36);
    doc.save("cgpa_report.pdf");
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    semesters.forEach((sem, i) => {
      const data = [["Subject", "Credits", "Grade"]];
      sem.subjects.forEach((sub) => {
        data.push([sub.name, sub.credits, sub.grade]);
      });
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, `Semester ${i + 1}`);
    });

    XLSX.writeFile(wb, "cgpa_report.xlsx");
  };

  const saveToSupabase = async () => {
    const { cgpa, percentage, totalCredits } = calculateStats();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      alert("❌ Please log in first to save data.");
      return;
    }

    const userId = session.user.id;

    const { error } = await supabase.from("cgpa_records").insert([
      {
        user_id: userId,
        semesters: JSON.stringify(semesters),
        cgpa,
        percentage,
        total_credits: totalCredits,
      },
    ]);

    if (error) {
      alert("❌ Failed to save: " + error.message);
    } else {
      alert("✅ CGPA data saved successfully!");
      fetchHistory();
      setSemesters([{ subjects: [{ name: "", credits: "", grade: "" }] }]);
    }
  };

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return;

    const { data, error } = await supabase
      .from("cgpa_records")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error) setHistory(data || []);
  };

  const deleteRecord = async (id) => {
  const confirm = window.confirm("Are you sure to delete this record?");
  if (!confirm) return;

  setDeletingId(id);

  const { error } = await supabase
    .from("cgpa_records") // ✅ correct table name
    .delete()
    .eq("id", id);         // ✅ match exactly by 'id'

  if (error) {
    alert("❌ Failed to delete: " + error.message);
  } else {
    alert("✅ Record deleted!");
    setHistory((prev) => prev.filter((item) => item.id !== id)); // remove locally
  }

  setDeletingId(null);
};


  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) fetchHistory();
  };

  const { cgpa, percentage, totalCredits } = calculateStats();

  return (
    <div className="cgpa-container">
      <h2>
        <img
          src="https://img.icons8.com/emoji/24/mortar-board-emoji.png"
          alt="title"
          className="icon"
        />
        CGPA Checker
      </h2>

      {semesters.map((sem, semIndex) => (
        <div className="semester-block" key={semIndex}>
          <h3>Semester {semIndex + 1}</h3>
          <div className="subject-table">
            <div className="table-head">
              <span>Subject</span>
              <span>Credits</span>
              <span>Grade</span>
              <span></span>
            </div>
            {sem.subjects.map((sub, subIndex) => (
              <div className="subject-row" key={subIndex}>
                <input
                  type="text"
                  placeholder="Subject"
                  value={sub.name}
                  onChange={(e) =>
                    handleSubjectChange(semIndex, subIndex, "name", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Credits"
                  value={sub.credits}
                  onChange={(e) =>
                    handleSubjectChange(semIndex, subIndex, "credits", e.target.value)
                  }
                />
                <select
                  value={sub.grade}
                  onChange={(e) =>
                    handleSubjectChange(semIndex, subIndex, "grade", e.target.value)
                  }
                >
                  <option value="">Grade</option>
                  {Object.keys(gradeMap).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <button onClick={() => removeSubject(semIndex, subIndex)}>X</button>
              </div>
            ))}
          </div>
          <button className="add-btn" onClick={() => addSubject(semIndex)}>
            <img src="https://img.icons8.com/ios-glyphs/20/plus-math.png" className="icon" alt="plus" />
            Add Subject
          </button>
        </div>
      ))}

      <button className="add-sem-btn" onClick={addSemester}>
        <img src="https://img.icons8.com/ios-glyphs/20/plus-math.png" className="icon" alt="plus" />
        Add Semester
      </button>

      <div className="stats-box">
        <div className="stat">CGPA<strong>{cgpa}</strong></div>
        <div className="stat">Percentage<strong>{percentage}%</strong></div>
        <div className="stat">Total Credits<strong>{totalCredits}</strong></div>
      </div>

      <div className="export-buttons">
        <button onClick={exportToPDF}>
          <img src="https://img.icons8.com/color/24/export-pdf.png" className="icon" alt="pdf" />
          Export PDF
        </button>
        <button onClick={exportToExcel}>
          <img src="https://img.icons8.com/color/24/ms-excel.png" className="icon" alt="excel" />
          Export Excel
        </button>
        <button className="save-btn" onClick={saveToSupabase}>
          <img src="https://img.icons8.com/fluency/24/save.png" className="icon" alt="save" />
          Save
        </button>
        <button onClick={toggleHistory}>
         <img src="https://img.icons8.com/fluency/24/opened-folder.png" alt="history" className="icon"/>

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
                  <p><strong>CGPA:</strong> {item.cgpa} | <strong>%:</strong> {item.percentage} | <strong>Credits:</strong> {item.total_credits}</p>
                  <p>
                    <em>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "No Date"}
                    </em>
                  </p>
                  <button
                    onClick={() => deleteRecord(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? "Deleting..." : (
                      <>
                        <img
                          src="https://img.icons8.com/ios-glyphs/20/fa314a/delete.png"
                          alt="Delete"
                          className="icon"
                        />
                        Delete
                      </>
                    )}
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

export default CGPAChecker;
