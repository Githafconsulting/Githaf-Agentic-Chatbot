import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link as LinkIcon, Trash2, FileText, ExternalLink, Database, Files, Calendar, Layers, CheckCircle, AlertCircle, X, Download, HardDrive } from 'lucide-react';
import { apiService } from '../../services/api';
import type { Document } from '../../types';
import { staggerContainer, staggerItem } from '../../utils/animations';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      console.log('Loading documents...');
      const data = await apiService.getDocuments();
      console.log('Documents loaded:', data);
      // Handle both array and object responses
      const documentsList = Array.isArray(data) ? data : (data.documents || []);
      setDocuments(documentsList);
      setError('');
    } catch (err: any) {
      console.error('Documents error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await apiService.uploadDocument(file, category || undefined);
      await loadDocuments();
      e.target.value = '';
      setCategory('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;

    try {
      setUploading(true);
      await apiService.addDocumentFromUrl(url, category || undefined);
      await loadDocuments();
      setUrl('');
      setCategory('');
      setShowUrlModal(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add document from URL');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.download_url) {
      window.open(doc.download_url, '_blank');
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    if (kb >= 1) return `${kb.toFixed(2)} KB`;
    return `${bytes} bytes`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await apiService.deleteDocument(id);
      await loadDocuments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete document');
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
            <Database className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Knowledge Base</h1>
            <p className="text-slate-300 mt-1 flex items-center gap-2">
              <Files size={16} />
              Manage your chatbot's knowledge documents
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.label
            className="btn-primary cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl shadow-md"
            whileHover={{ scale: 1.05, boxShadow: '0 8px 20px -5px rgba(30, 64, 175, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Upload File'}
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </motion.label>

          <motion.button
            onClick={() => setShowUrlModal(true)}
            className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl shadow-md"
            whileHover={{ scale: 1.05, boxShadow: '0 8px 20px -5px rgba(14, 165, 233, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <LinkIcon size={20} />
            Add from URL
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-soft"
          >
            <AlertCircle size={20} />
            <span className="flex-1">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documents List */}
      <motion.div
        variants={staggerItem}
        className="card-hover rounded-2xl shadow-soft overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
            />
            <p className="text-slate-300">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mx-auto mb-4"
            >
              <FileText size={40} className="text-primary-600" />
            </motion.div>
            <p className="text-slate-300 text-lg">No documents yet</p>
            <p className="text-slate-400 text-sm mt-2">Upload a file or add from URL to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            <AnimatePresence>
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-50 truncate">{doc.title}</h3>
                        <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium flex-shrink-0">
                          {doc.source_type}
                        </span>
                      </div>

                      {doc.summary && (
                        <p className="text-sm text-slate-300 line-clamp-2 mb-3 ml-13">
                          {doc.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-slate-400 ml-13 flex-wrap">
                        {doc.file_type && (
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {doc.file_type.toUpperCase()}
                          </span>
                        )}
                        {doc.file_size && (
                          <span className="flex items-center gap-1">
                            <HardDrive size={14} />
                            {formatFileSize(doc.file_size)}
                          </span>
                        )}
                        {doc.chunk_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <Layers size={14} />
                            {doc.chunk_count} chunks
                          </span>
                        )}
                        {doc.category && (
                          <span className="flex items-center gap-1 text-xs bg-secondary-100 text-secondary-700 px-2 py-0.5 rounded-full">
                            {doc.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {doc.source_url && (
                        <a
                          href={doc.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-400 hover:text-primary-300 mt-3 inline-flex items-center gap-1 ml-13 font-medium"
                        >
                          View source <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {doc.download_url && (
                        <motion.button
                          onClick={() => handleDownload(doc)}
                          className="text-primary-400 hover:text-primary-300 p-2 rounded-lg hover:bg-primary-50 transition-colors"
                          title="Download original file"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Download size={20} />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                        title="Delete document"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* URL Modal */}
      <AnimatePresence>
        {showUrlModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !uploading && setShowUrlModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-strong"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center">
                    <LinkIcon className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-50">Add from URL</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Document URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/document"
                      className="input w-full"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Category (optional)
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., product-docs, support, etc."
                      className="input w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleUrlSubmit}
                    disabled={uploading || !url.trim()}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!uploading && url.trim() ? { scale: 1.02 } : {}}
                    whileTap={!uploading && url.trim() ? { scale: 0.98 } : {}}
                  >
                    {uploading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Adding...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Add Document
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowUrlModal(false);
                      setUrl('');
                    }}
                    disabled={uploading}
                    className="btn-outline flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50"
                    whileHover={!uploading ? { scale: 1.02 } : {}}
                    whileTap={!uploading ? { scale: 0.98 } : {}}
                  >
                    <X size={20} />
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
