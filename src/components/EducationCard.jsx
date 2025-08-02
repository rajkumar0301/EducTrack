import React from "react";

const EducationCard = ({ edu, onDelete }) => {
  return (
    <div className="edu-card">
      <h4>{edu.degree}</h4>
      <p>{edu.school}</p>
      <p>Year: {edu.year}</p>
      <button onClick={() => onDelete(edu.id)}>🗑️ Delete</button>
    </div>
  );
};

export default EducationCard;
