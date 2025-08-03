// src/pages/Classes.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  AiOutlinePlus,
  AiOutlineDelete,
  AiOutlineFilePdf,
} from "react-icons/ai";
import { BsFileEarmarkSpreadsheet } from "react-icons/bs";

import "../styles/Classes.css";

const Classes = () => {
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [schedule, setSchedule] = useState("");
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setClasses(data);
  };

 const handleAdd = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!subject || !teacher || !schedule) {
    return alert("Please fill all fields");
  }

  const { error } = await supabase.from("classes").insert([
    {
      user_id: user.id,
      subject,
      teacher,
      schedule,
    }
  ]);

  if (!error) {
    setSubject("");
    setTeacher("");
    setSchedule("");
    fetchClasses();
  } else {
    console.error("Insert failed", error);
    alert("Insert failed. Check console for details.");
  }
};


  const handleDelete = async (id) => {
    await supabase.from("classes").delete().eq("id", id);
    fetchClasses();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Class Schedule", 14, 15);
    const table = classes.map((c, i) => [i + 1, c.subject, c.teacher, c.schedule]);
    doc.autoTable({
      head: [["#", "Subject", "Teacher", "Schedule"]],
      body: table,
      startY: 25,
    });
    doc.save("classes.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(classes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");
    XLSX.writeFile(workbook, "classes.xlsx");
  };

  const filtered = classes.filter((c) =>
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="classes-container">
      <h2>📘 My Classes</h2>

      <div className="class-form">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Teacher"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
        />
        <input
          type="text"
          placeholder="Schedule (e.g. Mon 10AM)"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        />
        <button onClick={handleAdd}>
  <AiOutlinePlus style={{ marginRight: 6 }} />
  Add Class
</button>

      </div>

      <div className="search-export">
        <input
          type="text"
          placeholder="Search by subject or teacher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleExportPDF}>
  <AiOutlineFilePdf style={{ marginRight: 6 }} />
  Export PDF
</button>

<button onClick={handleExportExcel}>
  <BsFileEarmarkSpreadsheet style={{ marginRight: 6 }} />
  Export Excel
</button>

      </div>

      <table className="classes-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Subject</th>
            <th>Teacher</th>
            <th>Schedule</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => (
            <tr key={c.id}>
              <td>{i + 1}</td>
              <td>{c.subject}</td>
              <td>{c.teacher}</td>
              <td>{c.schedule}</td>
              <td>
               <button className="delete-btn" onClick={() => handleDelete(c.id)}>
  <AiOutlineDelete />
</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Classes;

