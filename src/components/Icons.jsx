// src/components/Icons.jsx
import React from "react";

export const TrashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21...m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12s-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const LinkIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 000 5.656l1.414 1.414a4 4 0 005.656-5.656l-1.414-1.414a4 4 0 00-5.656 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 010-5.656L11.586 6.758a4 4 0 015.656 5.656l-1.414 1.414a4 4 0 01-5.656 0z" />
  </svg>
);
