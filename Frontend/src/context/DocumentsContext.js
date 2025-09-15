import { createContext, useContext, useState, useCallback } from 'react';
import {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getPatientDocuments,
  getDoctorDocuments,
  getAppointmentDocuments,
  shareDocument,
  getSharedDocuments,
  getDocumentPermissions,
  updateDocumentPermissions,
  getDocumentCategories,
  getDocumentTypes,
  searchDocuments,
  getRecentDocuments
} from '../services/documents.js';

const DocumentsContext = createContext();

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [documentCategories, setDocumentCategories] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user documents
  const fetchUserDocuments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserDocuments(filters);
      setDocuments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch documents');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch patient documents (for doctors)
  const fetchPatientDocuments = useCallback(async (patientId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPatientDocuments(patientId, filters);
      setDocuments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch patient documents');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch doctor documents (for patients)
  const fetchDoctorDocuments = useCallback(async (doctorId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorDocuments(doctorId, filters);
      setDocuments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch doctor documents');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch appointment documents
  const fetchAppointmentDocuments = useCallback(async (appointmentId) => {
    try {
      setError(null);
      const response = await getAppointmentDocuments(appointmentId);
      return response.data || response;
    } catch (error) {
      setError(error.message || 'Failed to fetch appointment documents');
      throw error;
    }
  }, []);

  // Get single document
  const fetchDocumentById = useCallback(async (documentId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDocumentById(documentId);
      setCurrentDocument(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch document');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload document
  const uploadDocumentFile = useCallback(async (formData) => {
    try {
      setUploading(true);
      setError(null);
      const response = await uploadDocument(formData);
      
      // Add to documents list
      setDocuments(prev => [response.data || response, ...prev]);
      
      // Refresh recent documents
      await fetchRecentDocuments();
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to upload document');
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  // Update document
  const updateDocumentData = useCallback(async (documentId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateDocument(documentId, updateData);
      
      // Update in documents list
      setDocuments(prev => 
        prev.map(doc => doc.id === documentId ? { ...doc, ...response.data } : doc)
      );
      
      // Update current document if identical
      if (currentDocument?.id === documentId) {
        setCurrentDocument(prev => ({ ...prev, ...response.data }));
      }
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update document');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentDocument]);

  // Delete document
  const deleteDocumentData = useCallback(async (documentId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDocument(documentId);
      
      // Remove from documents list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Clear current document if deleted
      if (currentDocument?.id === documentId) {
        setCurrentDocument(null);
      }
      
      // Refresh recent documents
      await fetchRecentDocuments();
      
    } catch (error) {
      setError(error.message || 'Failed to delete document');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentDocument]);

  // Download document
  const downloadDocumentFile = useCallback(async (documentId, filename) => {
    try {
      setError(null);
      const response = await downloadDocument(documentId, filename);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to download document');
      throw error;
    }
  }, []);

  // Share document
  const shareDocumentData = useCallback(async (documentId, shareData) => {
    try {
      setError(null);
      const response = await shareDocument(documentId, shareData);
      
      // Refresh shared documents
      await fetchSharedDocuments();
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to share document');
      throw error;
    }
  }, []);

  // Fetch shared documents
  const fetchSharedDocuments = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const response = await getSharedDocuments(filters);
      setSharedDocuments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch shared documents');
      throw error;
    }
  }, []);

  // Fetch document permissions
  const fetchDocumentPermissions = useCallback(async (documentId) => {
    try {
      setError(null);
      const response = await getDocumentPermissions(documentId);
      return response.data || response;
    } catch (error) {
      setError(error.message || 'Failed to fetch document permissions');
      throw error;
    }
  }, []);

  // Update document permissions
  const updateDocumentPermissionsData = useCallback(async (documentId, permissions) => {
    try {
      setError(null);
      const response = await updateDocumentPermissions(documentId, permissions);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update document permissions');
      throw error;
    }
  }, []);

  // Fetch document categories
  const fetchDocumentCategories = useCallback(async () => {
    try {
      setError(null);
      const response = await getDocumentCategories();
      setDocumentCategories(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch document categories');
      throw error;
    }
  }, []);

  // Fetch document types
  const fetchDocumentTypes = useCallback(async () => {
    try {
      setError(null);
      const response = await getDocumentTypes();
      setDocumentTypes(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch document types');
      throw error;
    }
  }, []);

  // Search documents
  const searchDocumentsData = useCallback(async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await searchDocuments(searchParams);
      setDocuments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to search documents');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recent documents
  const fetchRecentDocuments = useCallback(async (limit = 10) => {
    try {
      setError(null);
      const response = await getRecentDocuments(limit);
      setRecentDocuments(response.data || response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch recent documents');
      throw error;
    }
  }, []);

  // Clear current document
  const clearCurrentDocument = useCallback(() => {
    setCurrentDocument(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const resetDocuments = useCallback(() => {
    setDocuments([]);
    setCurrentDocument(null);
    setSharedDocuments([]);
    setRecentDocuments([]);
    setError(null);
  }, []);

  const value = {
    // State
    documents,
    currentDocument,
    sharedDocuments,
    recentDocuments,
    documentCategories,
    documentTypes,
    uploading,
    loading,
    error,

    // Actions
    fetchUserDocuments,
    fetchPatientDocuments,
    fetchDoctorDocuments,
    fetchAppointmentDocuments,
    fetchDocumentById,
    uploadDocumentFile,
    updateDocumentData,
    deleteDocumentData,
    downloadDocumentFile,
    shareDocumentData,
    fetchSharedDocuments,
    fetchDocumentPermissions,
    updateDocumentPermissionsData,
    fetchDocumentCategories,
    fetchDocumentTypes,
    searchDocumentsData,
    fetchRecentDocuments,

    // Utilities
    clearCurrentDocument,
    clearError,
    resetDocuments
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}