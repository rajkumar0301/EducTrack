import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import Modal from "react-modal";
import jsPDF from "jspdf";
import "../styles/FileUpload.css";

Modal.setAppElement("#root");

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch files from Supabase table
  const fetchFiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setDocuments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Upload handler
  const handleUpload = async () => {
    if (!file) return toast.error("Select a file first");

    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) return toast.error("Upload failed");

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("documents").insert({
      user_id: user.id,
      filename: file.name,
      url: urlData.publicUrl,
      file_path: filePath, // ✅ Store correct path for deletion
    });

    if (!dbError) {
      toast.success("File uploaded!");
      setFile(null);
      fetchFiles();
    }
  };

  // Delete handler
  const handleDelete = async (doc) => {
    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from("documents")
      .remove([doc.file_path]);

    if (storageError) {
      toast.error("Storage delete failed");
      console.error(storageError.message);
      return;
    }

    // Delete from DB
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (dbError) {
      toast.error("Database delete failed");
      console.error(dbError.message);
      return;
    }

    toast.success("Document deleted");
    fetchFiles(); // or update local state
  };

  // Export documents list as PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Uploaded Documents", 14, 15);

    doc.autoTable({
      head: [["#", "File Name", "Uploaded At"]],
      body: documents.map((file, index) => [
        index + 1,
        file.filename,
        new Date(file.created_at).toLocaleString(),
      ]),
      startY: 25,
    });

    doc.save("documents.pdf");
  };

  return (
    <div className="upload-container">
      <Toaster position="top-right" />
      <h2>📁 File Manager</h2>

      <div className="upload-box">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>
        <button onClick={handleExportPDF}>📄 Export to PDF</button>
      </div>

      <h3>📑 Your Uploaded Documents</h3>
      {loading ? (
        <p>Loading...</p>
      ) : documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul className="file-list">
          {documents.map((doc) => (
            <li key={doc.id} className="doc-item">
              <div className="doc-left">
                <img src="/icons/file.svg" alt="icon" className="doc-icon" />
                <div>
                  <p>{doc.filename}</p>
                  <small>{new Date(doc.created_at).toLocaleString()}</small>
                </div>
              </div>
              <div className="doc-actions">
                <button onClick={() => setPreviewUrl(doc.url)}>👁️</button>
                <a href={doc.url} target="_blank" rel="noreferrer">🔗</a>
                <button onClick={() => handleDelete(doc)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewUrl}
        onRequestClose={() => setPreviewUrl(null)}
        contentLabel="Preview Document"
        className="preview-modal"
        overlayClassName="modal-overlay"
      >
        <button onClick={() => setPreviewUrl(null)} className="close-btn">
          ❌ Close
        </button>
        {previewUrl?.endsWith(".pdf") ? (
          <iframe src={previewUrl} width="100%" height="600px" title="Preview PDF" />
        ) : (
          <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%" }} />
        )}
      </Modal>
    </div>
  );
};

export default FileUpload;