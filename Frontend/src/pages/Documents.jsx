import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useDocuments } from '../context/GlobalContext.js';

function Documents() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    documents,
    fetchUserDocuments,
    uploadDocumentFile,
    deleteDocumentData,
    downloadDocumentFile,
    loading,
    
    error,
    clearError
  } = useDocuments();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [notifications] = useState(3);

  const [uploadData, setUploadData] = useState({
    file: null,
    documentType: '',
    description: '',
    isPublic: false
  });

  const categories = [
    { id: 'all', label: 'All Documents', icon: 'ri-folder-line', count: 0 },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'ri-medicine-bottle-line', count: 0 },
    { id: 'lab-results', label: 'Lab Results', icon: 'ri-test-tube-line', count: 0 },
    { id: 'x-rays', label: 'X-Rays', icon: 'ri-image-line', count: 0 },
    { id: 'reports', label: 'Reports', icon: 'ri-file-text-line', count: 0 },
    { id: 'insurance', label: 'Insurance', icon: 'ri-shield-check-line', count: 0 }
  ];

  // Load documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        await fetchUserDocuments();
      } catch (error) {
        console.error('Failed to load documents:', error);
      }
    };

    if (user) {
      loadDocuments();
    }
  }, [user, fetchUserDocuments]);

  
  const formatDocuments = (docs) => {
    if (!docs || !Array.isArray(docs)) return [];
    
    return docs.map(doc => ({
      id: doc.id,
      fileName: doc.document_name,
      type: doc.document_type || 'other',
      fileSize: doc.file_size,
      createdAt: doc.created_at,
      filePath: doc.file_path,
      description: doc.description,
      isPublic: doc.is_public,
      patientId: doc.patient_id,
      uploadedBy: doc.uploaded_by
    }));
  };

  const formattedDocuments = formatDocuments(documents);

  // Filter documents
  const filteredDocuments = formattedDocuments.filter(document => {
    const matchesCategory = selectedCategory === 'all' || document.type === selectedCategory;
    const matchesSearch = document.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (document.description && document.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Update category counts
  const updatedCategories = categories.map(category => ({
    ...category,
    count: category.id === 'all' 
      ? formattedDocuments.length 
      : formattedDocuments.filter(doc => doc.type === category.id).length
  }));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.documentType) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('documentType', uploadData.documentType);
      formData.append('description', uploadData.description);
      formData.append('isPublic', uploadData.isPublic);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await uploadDocumentFile(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form and close modal
      setTimeout(() => {
        setUploadData({
          file: null,
          documentType: '',
          description: '',
          isPublic: false
        });
        setShowUploadModal(false);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Failed to upload document:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      await downloadDocumentFile(document.id, document.fileName);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocumentData(documentId);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const getFileIcon = (fileName, type) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'ri-file-pdf-line';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'ri-image-line';
    if (['doc', 'docx'].includes(extension)) return 'ri-file-word-line';
    if (type === 'prescriptions') return 'ri-medicine-bottle-line';
    if (type === 'lab-results') return 'ri-test-tube-line';
    if (type === 'insurance') return 'ri-shield-check-line';
    return 'ri-file-text-line';
  };

  const getFileColor = (type) => {
    switch (type) {
      case 'prescriptions': return 'text-green-600 bg-green-100';
      case 'lab-results': return 'text-blue-600 bg-blue-100';
      case 'x-rays': return 'text-purple-600 bg-purple-100';
      case 'reports': return 'text-orange-600 bg-orange-100';
      case 'insurance': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (size) => {
    if (!size) return '0 KB';
    if (typeof size === 'string') return size;
    
    const bytes = parseInt(size);
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  const storageUsed = 45; 
  const storageLimit = 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/patient-dashboard">
                <h1 className="text-2xl font-bold text-blue-600" style={{ fontFamily: '"Pacifico", serif' }}>
                  HealthCare Pro
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <i className="ri-notification-3-line text-xl"></i>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: user?.profilePicture ? 
                      `url(${user.profilePicture})` : 
                      `url('https://readdy.ai/api/search-image?query=Professional%20patient%20profile%20photo%20of%20a%20middle-aged%20person%20in%20casual%20clothing%2C%20friendly%20smile%2C%20clean%20background%2C%20headshot%20portrait%20style%2C%20natural%20lighting%2C%20healthcare%20patient%20appearance&width=150&height=150&seq=patient-profile&orientation=squarish')`
                  }}
                ></div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors p-2"
                title="Logout"
              >
                <i className="ri-logout-circle-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/patient-dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-2">
              Dashboard
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400 text-sm"></i>
            <span className="text-sm text-gray-600 ml-2">Medical Documents</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Medical Documents</h2>
              <p className="text-gray-600">Manage your healthcare documents securely</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 sm:mt-0 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <i className="ri-upload-cloud-line mr-2"></i>
              Upload Document
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-600 mr-2"></i>
                <p className="text-red-800">{error}</p>
              </div>
              <button onClick={clearError} className="text-red-600 hover:text-red-700">
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                {updatedCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className={`${category.icon} mr-3 text-lg`}></i>
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Storage Usage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium">{storageUsed} MB of {storageLimit} MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {storageLimit - storageUsed} MB remaining
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search and View Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Search documents..."
                  />
                  <i className="ri-search-line absolute right-3 top-2.5 text-gray-400"></i>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-grid-line"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-list-check"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Display */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <i className="ri-loader-4-line animate-spin text-blue-600 text-4xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading documents...</h3>
                  <p className="text-gray-600">Please wait while we fetch your documents</p>
                </div>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {filteredDocuments.map((document) => (
                  <div key={document.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${viewMode === 'list' ? 'p-4' : 'p-6'}`}>
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(document.type)}`}>
                            <i className={`${getFileIcon(document.fileName, document.type)} text-xl`}></i>
                          </div>
                          {document.isPublic && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Shared
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{document.fileName}</h3>
                        {document.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{document.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mb-4">
                          {new Date(document.createdAt).toLocaleDateString()} • {formatFileSize(document.fileSize)}
                        </p>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDocument(document);
                              setShowPreviewModal(true);
                            }}
                            className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            <i className="ri-eye-line mr-1"></i>
                            Preview
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(document)}
                            className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                            title="Download"
                          >
                            <i className="ri-download-line"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteDocument(document.id)}
                            className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                            title="Delete"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileColor(document.type)}`}>
                          <i className={`${getFileIcon(document.fileName, document.type)} text-lg`}></i>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">{document.fileName}</h3>
                            {document.isPublic && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full ml-2 whitespace-nowrap">
                                Shared
                              </span>
                            )}
                          </div>
                          {document.description && (
                            <p className="text-sm text-gray-600 truncate">{document.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(document.createdAt).toLocaleDateString()} • {formatFileSize(document.fileSize)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedDocument(document);
                              setShowPreviewModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(document)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <i className="ri-download-line"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteDocument(document.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <i className="ri-file-line text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Try different search terms' : 'Upload your first medical document to get started'}
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-upload-cloud-line mr-2"></i>
                    Upload Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            {!isUploading ? (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                  <i className="ri-upload-cloud-line text-4xl text-gray-400 mb-4"></i>
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your files here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                  </p>
                  {uploadData.file && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {uploadData.file.name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                    <select 
                      value={uploadData.documentType}
                      onChange={(e) => setUploadData(prev => ({...prev, documentType: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select document type</option>
                      <option value="prescriptions">Prescription</option>
                      <option value="lab-results">Lab Results</option>
                      <option value="x-rays">X-Ray/Imaging</option>
                      <option value="reports">Medical Report</option>
                      <option value="insurance">Insurance Document</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({...prev, description: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Brief description of the document"
                      rows="3"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={uploadData.isPublic}
                      onChange={(e) => setUploadData(prev => ({...prev, isPublic: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                      Share with healthcare providers
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={!uploadData.file || !uploadData.documentType}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Upload
                </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <i className="ri-upload-cloud-line text-4xl text-blue-600 mb-4"></i>
                  <p className="text-sm text-gray-600 mb-4">Uploading document...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.fileName}</h3>
                <p className="text-sm text-gray-600">{new Date(selectedDocument.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleDownloadDocument(selectedDocument)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <i className="ri-download-line"></i>
                </button>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 flex items-center justify-center min-h-[400px] bg-gray-50">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4 ${getFileColor(selectedDocument.type)}`}>
                  <i className={`${getFileIcon(selectedDocument.fileName, selectedDocument.type)} text-3xl`}></i>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Document Preview</h4>
                <p className="text-gray-600 mb-4">
                  {formatFileSize(selectedDocument.fileSize)}
                </p>
                <button 
                  onClick={() => handleDownloadDocument(selectedDocument)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <i className="ri-download-line mr-2"></i>
                  Download to View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;