import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { TrashIcon, EyeIcon, LinkIcon } from "../components/Icons";
import Modal from "react-modal";
import jsPDF from "jspdf";
import "../styles/FileUpload.css";

Modal.setAppElement("#root");

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);


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

  const handleUpload = async () => {
  if (!file) return toast.error("Select a file first");

  const { data: { user } } = await supabase.auth.getUser();
  const filePath = `${user.id}/${Date.now()}_${file.name}`;
  const bucket = "documents";

  setUploading(true);
  setUploadProgress(0);

  const { data, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(filePath);

  if (signedUrlError) {
    toast.error("Failed to get upload URL");
    setUploading(false);
    return;
  }

  // Perform manual upload using XMLHttpRequest
  const xhr = new XMLHttpRequest();
  xhr.open("PUT", data.signedUrl, true);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      setUploadProgress(percent);
    }
  };

  xhr.onload = async () => {
    if (xhr.status === 200) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        filename: file.name,
        url: urlData.publicUrl,
        path: filePath,
      });

      if (dbError) {
        toast.error("Failed to save file metadata");
      } else {
        toast.success("File uploaded!");
        setFile(null);
        fetchFiles();
      }
    } else {
      toast.error("Upload failed");
    }

    setUploading(false);
    setUploadProgress(0);
  };

  xhr.onerror = () => {
    toast.error("Upload error");
    setUploading(false);
    setUploadProgress(0);
  };

  xhr.send(file);
};

 const handleDelete = async (doc) => {
  const filePath = doc.path;
  console.log("🧹 Deleting file path:", filePath);
  console.log("🗑️ Deleting doc ID:", doc.id);

  if (!filePath || !doc.id) {
    toast.error("Missing file path or ID");
    return;
  }

  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from("documents")
    .remove([filePath]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    toast.error("Failed to delete file from storage");
    return;
  }

  // Delete from DB
  const { error: dbError } = await supabase
    .from("documents")
    .delete()
    .eq("id", doc.id);

  if (dbError) {
    console.error("DB delete error:", dbError.message);
    toast.error("Failed to delete metadata from DB");
    return;
  }

  toast.success("Deleted");
  fetchFiles(); // refresh UI
};



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
        {uploading && (  <div className="progress-bar">
        <div className="progress-fill"  style={{ width: `${uploadProgress}%` }} >
             {uploadProgress}%
        </div>
      </div>
      )}

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
                 <button onClick={() => setPreviewUrl(doc.url)}> <EyeIcon className="icon" />  </button>
                 <a href={doc.url} target="_blank" rel="noreferrer"> <LinkIcon className="icon" /> </a>
                 <button onClick={() => handleDelete(doc)}> <TrashIcon className="icon" /> </button></div>

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
