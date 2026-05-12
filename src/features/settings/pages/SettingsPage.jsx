import { useState, useRef, useCallback, useEffect } from 'react';
import { settingsAPI } from '../settingsAPI';

const ACCEPTED_TYPES = [
  '.pdf', '.doc', '.docx',
  '.xls', '.xlsx', '.csv',
  '.json', '.txt', '.md',
];

// Polling interval (ms) while the vectorstore is rebuilding
const POLL_INTERVAL_BUILDING = 3000;
const POLL_INTERVAL_IDLE = 15000;

export default function SettingsPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [filesToDelete, setFilesToDelete] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

  // ─── Vectorstore rebuild status ──────────────────────────
  const [vsStatus, setVsStatus] = useState(null); // { status, message, progress }
  const [vsLoading, setVsLoading] = useState(true);

  // ─── Fetch uploaded files ─────────────────────────────────
  const fetchUploadedFiles = async () => {
    try {
      setLoadingFiles(true);
      const res = await settingsAPI.getFiles();
      setUploadedFiles(res.data?.files || res.data || []);
    } catch {
      // silently fail — list is not critical
      setUploadedFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // ─── Fetch vectorstore status ────────────────────────────
  const fetchVsStatus = async () => {
    try {
      const res = await settingsAPI.getVectorstoreStatus();
      setVsStatus(res.data);
    } catch {
      setVsStatus(null);
    } finally {
      setVsLoading(false);
    }
  };

  // Poll vectorstore status — faster while processing, slower when idle
  useEffect(() => {
    fetchVsStatus();

    const isProcessing = vsStatus?.status === 'processing';
    const interval = setInterval(fetchVsStatus, isProcessing ? POLL_INTERVAL_BUILDING : POLL_INTERVAL_IDLE);
    return () => clearInterval(interval);
  }, [vsStatus?.status]);

  // ─── Drag & Drop handlers ────────────────────────────────
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const addFiles = (newFiles) => {
    const incoming = Array.from(newFiles);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = incoming.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
    setUploadResult(null);
    setError(null);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setUploadResult(null);
    setError(null);
  };

  // ─── Upload ──────────────────────────────────────────────
  const handleUpload = async () => {
    if (files.length === 0) return;
    try {
      setUploading(true);
      setError(null);
      setUploadResult(null);
      const res = await settingsAPI.uploadFiles(files);
      setUploadResult(res.data);
      setFiles([]);
      fetchUploadedFiles();
      fetchVsStatus(); // Immediately check vectorstore rebuild status
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ─── Mark / unmark file for deletion ──────────────────────
  const toggleFileForDeletion = (filename) => {
    setFilesToDelete((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  };

  // ─── Confirm delete marked files ─────────────────────────
  const handleConfirmDelete = async () => {
    if (filesToDelete.size === 0) return;
    const count = filesToDelete.size;
    if (!window.confirm(`Delete ${count} file${count > 1 ? 's' : ''} from the knowledge base?`)) return;
    try {
      setDeleting(true);
      setError(null);
      await settingsAPI.deleteFiles([...filesToDelete]);
      setFilesToDelete(new Set());
      fetchUploadedFiles();
      fetchVsStatus(); // Immediately check vectorstore rebuild status
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Download uploaded file ───────────────────────────────
  const handleDownloadFile = async (filename) => {
    try {
      const res = await settingsAPI.downloadFile(filename);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Download failed');
    }
  };

  // ─── Helpers ─────────────────────────────────────────────
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const fileIcon = (name) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    if (ext === 'json') return '🔧';
    if (['txt', 'md'].includes(ext)) return '📃';
    return '📎';
  };

  // Helper to detect vectorstore state
  const isVsProcessing = vsStatus?.status === 'processing';
  const isVsFailed = vsStatus?.status === 'failed';
  const isVsCompleted = vsStatus?.status === 'completed';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ── Header ────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-dark-900 tracking-tight flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white">
            <SettingsIcon className="w-5 h-5" />
          </span>
          Agent Knowledge Base
        </h2>
        <p className="text-sm text-dark-500 mt-2">
          Upload documents to enrich your AI agent's RAG knowledge base.
          Supported formats: PDF, Word, Excel, CSV, JSON, TXT, Markdown.
        </p>
      </div>

      {/* ── Vectorstore Status Banner ──────────────── */}
      {!vsLoading && vsStatus && (
        <div
          className={`rounded-2xl border p-5 transition-all duration-500 ${
            isVsProcessing
              ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50'
              : isVsFailed
                ? 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
                : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-xl shadow-sm ${
                isVsProcessing
                  ? 'bg-amber-500 text-white'
                  : isVsFailed
                    ? 'bg-red-500 text-white'
                    : 'bg-emerald-500 text-white'
              }`}
            >
              <DatabaseIcon className="w-5 h-5" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${
                isVsProcessing
                  ? 'text-amber-800'
                  : isVsFailed
                    ? 'text-red-800'
                    : 'text-emerald-800'
              }`}>
                {isVsProcessing
                  ? 'Vector Store Rebuilding…'
                  : isVsFailed
                    ? 'Vector Store Rebuild Failed'
                    : 'Vector Store Ready'}
              </p>
              <p className={`text-xs mt-0.5 ${
                isVsProcessing
                  ? 'text-amber-600'
                  : isVsFailed
                    ? 'text-red-600'
                    : 'text-emerald-600'
              }`}>
                {isVsProcessing
                  ? (vsStatus.message || 'The knowledge base is being updated in the background. You can continue working.')
                  : isVsFailed
                    ? (vsStatus.error || vsStatus.message || 'An error occurred while rebuilding the vector store.')
                    : (vsStatus.message || 'All documents are indexed and ready for the AI agent.')}
              </p>
            </div>

            {/* Progress / spinner */}
            {isVsProcessing && (
              <div className="flex items-center gap-3">
                {vsStatus.progress != null && (
                  <span className="text-xs font-bold text-amber-700">
                    {Math.round(vsStatus.progress * 100)}%
                  </span>
                )}
                <span className="inline-block w-5 h-5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
              </div>
            )}

            {/* Failed icon */}
            {isVsFailed && (
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-lg font-bold">!</span>
            )}

            {/* Ready check */}
            {isVsCompleted && (
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 text-lg">✓</span>
            )}
          </div>

          {/* Progress bar */}
          {isVsProcessing && vsStatus.progress != null && (
            <div className="mt-4 h-2 w-full rounded-full bg-amber-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700 ease-out"
                style={{ width: `${Math.round(vsStatus.progress * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Drop Zone ─────────────────────────────── */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 text-center group ${
          dragActive
            ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/10'
            : 'border-dark-300 bg-white hover:border-primary-400 hover:bg-primary-50/40'
        }`}
      >
        <input
          ref={inputRef}
          id="file-upload-input"
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragActive
              ? 'bg-primary-600 text-white scale-110'
              : 'bg-dark-100 text-dark-400 group-hover:bg-primary-100 group-hover:text-primary-600'
          }`}>
            <UploadCloudIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-dark-700">
              {dragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-dark-400 mt-1">
              or <span className="text-primary-600 font-medium underline underline-offset-2">browse from your computer</span>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {ACCEPTED_TYPES.map((ext) => (
              <span key={ext} className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-dark-100 text-dark-500 uppercase tracking-wide">
                {ext}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── File List ─────────────────────────────── */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-dark-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-dark-100">
            <p className="text-sm font-semibold text-dark-700">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            <button
              onClick={clearAll}
              className="text-xs text-danger-500 hover:text-danger-700 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>

          <ul className="divide-y divide-dark-100 max-h-64 overflow-y-auto">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="flex items-center gap-3 px-5 py-3 hover:bg-dark-50/50 transition-colors">
                <span className="text-xl leading-none">{fileIcon(file.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-800 truncate">{file.name}</p>
                  <p className="text-xs text-dark-400">{formatSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                  title="Remove file"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Upload Button ─────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          id="upload-files-button"
          disabled={files.length === 0 || uploading}
          onClick={handleUpload}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg ${
            files.length === 0 || uploading
              ? 'bg-dark-200 text-dark-400 cursor-not-allowed shadow-none'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/30 hover:shadow-primary-600/40 active:scale-[0.98]'
          }`}
        >
          {uploading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Uploading…
            </>
          ) : (
            <>
              <UploadCloudIcon className="w-4 h-4" />
              Upload to Knowledge Base
            </>
          )}
        </button>

        {files.length > 0 && !uploading && (
          <span className="text-xs text-dark-400">
            Total: {formatSize(files.reduce((sum, f) => sum + f.size, 0))}
          </span>
        )}
      </div>

      {/* ── Success ───────────────────────────────── */}
      {uploadResult && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600 text-white text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Files uploaded successfully!</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                {uploadResult.message || 'Your documents are now being processed into the knowledge base.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────── */}
      {error && (
        <div className="rounded-2xl border border-danger-100 bg-danger-50 p-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-danger-600 text-white text-lg">!</span>
            <div>
              <p className="text-sm font-semibold text-danger-800">Upload failed</p>
              <p className="text-xs text-danger-600 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Uploaded Files List ────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-dark-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark-900">Knowledge Base Files</h3>
              <p className="text-xs text-dark-400">Previously uploaded documents</p>
            </div>
          </div>
          <button
            onClick={fetchUploadedFiles}
            className="p-2 rounded-lg text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Refresh list"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
        </div>

        {loadingFiles ? (
          <div className="p-8 text-center">
            <span className="inline-block w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></span>
            <p className="text-xs text-dark-400 mt-2">Loading files…</p>
          </div>
        ) : uploadedFiles.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-dark-100 flex items-center justify-center mx-auto mb-3">
              <FolderIcon className="w-6 h-6 text-dark-300" />
            </div>
            <p className="text-sm font-medium text-dark-500">No files uploaded yet</p>
            <p className="text-xs text-dark-400 mt-1">Upload documents above to populate your knowledge base.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-50 border-b border-dark-200 text-xs font-medium text-dark-500 uppercase tracking-wider">
                  <th className="px-6 py-3">File</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Uploaded</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {uploadedFiles.map((file, i) => {
                  const fname = file.filename || file.name || '';
                  const isMarked = filesToDelete.has(fname);
                  return (
                    <tr
                      key={file.id || fname || i}
                      className={`transition-colors ${
                        isMarked
                          ? 'bg-danger-50/60 hover:bg-danger-50'
                          : 'hover:bg-dark-50/50'
                      }`}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg leading-none">{fileIcon(fname)}</span>
                          <span className={`text-sm font-medium truncate max-w-xs ${
                            isMarked ? 'text-danger-600 line-through' : 'text-dark-800'
                          }`}>
                            {fname || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-dark-500">
                        {file.size ? formatSize(file.size) : '—'}
                      </td>
                      <td className="px-6 py-3 text-sm text-dark-400">
                        {file.createdAt || file.uploadedAt
                          ? new Date(file.createdAt || file.uploadedAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownloadFile(fname)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Download file"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleFileForDeletion(fname)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isMarked
                                ? 'text-danger-600 bg-danger-100 hover:bg-danger-200'
                                : 'text-dark-400 hover:text-danger-500 hover:bg-danger-50'
                            }`}
                            title={isMarked ? 'Unmark file' : 'Mark for deletion'}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="px-6 py-3 border-t border-dark-100 bg-dark-50 flex items-center justify-between">
            <p className="text-xs text-dark-400">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} in knowledge base
              {filesToDelete.size > 0 && (
                <span className="ml-2 text-danger-500 font-semibold">
                  · {filesToDelete.size} marked for deletion
                </span>
              )}
            </p>
            {filesToDelete.size > 0 && (
              <button
                id="confirm-delete-files-button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  deleting
                    ? 'bg-dark-200 text-dark-400 cursor-not-allowed'
                    : 'bg-danger-600 text-white hover:bg-danger-700 shadow-lg shadow-danger-600/30 hover:shadow-danger-600/40 active:scale-[0.98]'
                }`}
              >
                {deleting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Deleting…
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Delete {filesToDelete.size} File{filesToDelete.size > 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Info Card ─────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-50 via-white to-primary-50 border border-primary-100 p-6">
        <h4 className="text-sm font-bold text-primary-900 flex items-center gap-2">
          <InfoIcon className="w-4 h-4 text-primary-600" />
          How RAG works
        </h4>
        <p className="text-xs text-dark-500 mt-2 leading-relaxed">
          When you upload documents, they are split into chunks, embedded, and stored in a vector database.
          The AI agent searches through these chunks to provide accurate, contextual answers based on your proprietary data.
          Supported file types include PDFs, Word documents, spreadsheets, CSV, JSON, and plain text files.
        </p>
      </div>
    </div>
  );
}

// ─── Inline Icon Components ──────────────────────────────────

function SettingsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UploadCloudIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function InfoIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FolderIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function RefreshIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function DownloadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function DatabaseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}
