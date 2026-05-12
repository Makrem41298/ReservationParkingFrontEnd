import api from '../../services/api';

export const settingsAPI = {
  /**
   * Upload files for RAG agent knowledge base.
   * Sends multipart/form-data to the backend which forwards to the Python service.
   * @param {FileList|File[]} files
   * @returns {Promise}
   */
  uploadFiles: (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get list of previously uploaded RAG files.
   * @returns {Promise}
   */
  getFiles: () => api.get('/files'),

  /**
   * Delete a file from the RAG knowledge base.
   * @param {string} filename - The name of the file to delete.
   * @returns {Promise}
   */


  /**
   * Delete multiple files from the RAG knowledge base in a single request.
   * @param {string[]} filenames - Array of filenames to delete.
   * @returns {Promise}
   */
  deleteFiles: (filenames) =>
    api.post('/files/delete-batch', { filenames }),

  /**
   * Download a file from the RAG knowledge base.
   * @param {string} filename - The name of the file to download.
   * @returns {Promise} - Response with blob data.
   */
  downloadFile: (filename) =>
    api.get(`/files/${encodeURIComponent(filename)}/download`, {
      responseType: 'blob',
    }),

  /**
   * Get the current vectorstore rebuild status from the FastAPI backend.
   * The backend rebuilds the vectorstore in the background after file uploads or deletions.
   * @returns {Promise<{ status: string, message?: string, progress?: number }>}
   */
  getVectorstoreStatus: () => api.get('/vectorstore/status'),
};
