// src/pages/Dashboard.jsx
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Dashboard.css";

dayjs.extend(relativeTime);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [fileCount, setFileCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [name, setName] = useState("");
  const [activities, setActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [showAttendance, setShowAttendance] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const userId = user.id;
    setName(user.user_metadata?.name || "User");

    // Attendance
    const { data: attendanceRaw } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId);

    if (attendanceRaw?.length) {
      const subjects = {};

      attendanceRaw.forEach((record) => {
        const subject = record.subject;
        const isPresent = record.status?.toLowerCase() === "present";

        if (!subjects[subject]) {
          subjects[subject] = { present: 0, total: 0 };
        }

        subjects[subject].total += 1;
        if (isPresent) subjects[subject].present += 1;
      });

      const subjectStats = Object.keys(subjects).map((subject) => {
        const { present, total } = subjects[subject];
        const percent = ((present / total) * 100).toFixed(1);
        return { subject, percent };
      });

      setAttendanceData(subjectStats);

      const totalPresent = attendanceRaw.filter(
        (r) => r.status?.toLowerCase() === "present"
      ).length;
      const totalEntries = attendanceRaw.length;
      setOverallAttendance(((totalPresent / totalEntries) * 100).toFixed(1));
    }

    // File Count
    const { count: docCount } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    setFileCount(docCount || 0);

    // Task Count
    const { count: taskDone } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);
    setTaskCount(taskDone || 0);

    // GPA History
    const { data: gradesData } = await supabase
      .from("cgpa_records")
      .select("cgpa, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(2);

    const recentGrades =
      gradesData?.map((g) => ({
        type: "GPA Update",
        message: `Updated CGPA: ${g.cgpa}`,
        time: g.created_at,
      })) || [];

    // File Upload Activity
    const { data: docs } = await supabase
      .from("documents")
      .select("name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(2);

    const recentDocs =
      docs?.map((d) => ({
        type: "File Upload",
        message: `Uploaded: ${d.name}`,
        time: d.created_at,
      })) || [];

    // Completed Tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, created_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("created_at", { ascending: false })
      .limit(2);

    const recentTasks =
      tasks?.map((t) => ({
        type: "Task Done",
        message: `Completed task: ${t.title}`,
        time: t.created_at,
      })) || [];

    const all = [...recentGrades, ...recentDocs, ...recentTasks];
    const sorted = all.sort((a, b) => new Date(b.time) - new Date(a.time));
    setActivities(sorted.slice(0, 5));

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="welcome-card">
        <h2>👋 Welcome, {name}</h2>
        <p>You're doing great! Keep going 🚀</p>
      </div>

      <h2 className="dashboard-heading">📊 Dashboard</h2>

      <div className="stat-boxes">
        <div className="stat-card" onClick={() => setShowAttendance(true)}>
  <img
    src="https://img.icons8.com/color/48/classroom.png"
    alt="Attendance"
  />
  <h3>Attendance</h3>
  <p>{loading ? "..." : `${overallAttendance || 0}%`}</p>
</div>

        <div className="stat-card">
          <img
            src="https://img.icons8.com/color/48/upload-to-cloud.png"
            alt="Files"
          />
          <h3>Files Uploaded</h3>
          <p>{loading ? "..." : fileCount}</p>
        </div>

        <div className="stat-card">
          <img
            src="https://img.icons8.com/fluency/48/checked--v1.png"
            alt="Tasks Done"
          />
          <h3>Tasks Done</h3>
          <p>{loading ? "..." : taskCount}</p>
        </div>
      </div>

      {showAttendance && (
        <div className="attendance-details">
          <div className="attendance-header">
            <h4>📚 Subject-wise Attendance</h4>
            <button className="close-btn" onClick={() => setShowAttendance(false)}>
              ❌ Close
            </button>
          </div>

          {attendanceData?.length > 0 ? (
            <ul className="attendance-list">
              {attendanceData.map((item) => (
                <li key={item.subject}>
                  <strong>{item.subject}</strong>: {item.percent}%
                </li>
              ))}
            </ul>
          ) : (
            <p>No subject-wise attendance found.</p>
          )}
        </div>
      )}

      <div className="activity-section">
        <h3>📌 Recent Activity</h3>
        {loading ? (
          <p>Loading...</p>
        ) : activities.length === 0 ? (
          <p>No recent activity yet.</p>
        ) : (
          <ul className="activity-list">
            {activities.map((item, idx) => (
              <li key={idx}>
                <strong>{item.type}:</strong> {item.message}
                <span className="time">{dayjs(item.time).fromNow()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;








// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import "../styles/Dashboard.css";

// const Dashboard = ({ userEmail }) => {
//   const [cgpa, setCgpa] = useState(0);
//   const [credits, setCredits] = useState(0);
//   const [subjectCount, setSubjectCount] = useState(0);
//   const [activities, setActivities] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const { data: userData } = await supabase.auth.getUser();
//       const userId = userData.user?.id;

//       if (!userId) return;

//       // 1. Fetch subjects
//       const { data: subjects, error: subError } = await supabase
//         .from("subjects")
//         .select("*")
//         .eq("user_id", userId);

//       if (subjects) {
//         const totalCredits = subjects.reduce((sum, sub) => sum + (sub.credit || 0), 0);
//         const totalWeighted = subjects.reduce((sum, sub) => sum + ((sub.credit || 0) * (sub.grade || 0)), 0);
//         const cgpaCalc = totalCredits ? (totalWeighted / totalCredits).toFixed(2) : 0;

//         setCredits(totalCredits);
//         setSubjectCount(subjects.length);
//         setCgpa(cgpaCalc);
//       }

//       // 2. Fetch recent activity (if available)
//       const { data: acts } = await supabase
//         .from("activities")
//         .select("*")
//         .eq("user_id", userId)
//         .order("timestamp", { ascending: false })
//         .limit(5);

//       if (acts) setActivities(acts);
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="dashboard-container">
//         <div className="welcome-card">
//             <h2>🎓 Welcome {userEmail || "Student"}!</h2>
//         </div> 
      

//       <div className="stats-grid">
//         <div className="stat-card">
//           <h3>CGPA</h3>
//           <p>{cgpa}</p>
//         </div>
//         <div className="stat-card">
//           <h3>Total Credits</h3>
//           <p>{credits}</p>
//         </div>
//         <div className="stat-card">
//           <h3>Subjects</h3>
//           <p>{subjectCount}</p>
//         </div>
//       </div>

//       <div className="recent-activity">
//         <h3>📌 Recent Activity</h3>
//         {activities.length > 0 ? (
//           <ul>
//             {activities.map((act) => (
//               <li key={act.id}>{act.description}</li>
//             ))}
//           </ul>
//         ) : (
//           <p>No recent activity found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
