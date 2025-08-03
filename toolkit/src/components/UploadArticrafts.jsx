import { Calendar, CheckCircle, Code, Database, File, FileText, Github, Image, MessageSquare, Tag, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState, useEffect } from 'react';

const KnowledgePlatformUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'documentation', label: 'Technical Documentation', icon: FileText, color: 'bg-purple-600' },
    { value: 'github', label: 'GitHub Activity', icon: Github, color: 'bg-slate-800' },
    { value: 'meetings', label: 'Meeting Notes', icon: MessageSquare, color: 'bg-emerald-600' },
    { value: 'changelogs', label: 'Changelogs', icon: Calendar, color: 'bg-fuchsia-600' },
    { value: 'architecture', label: 'Architecture Docs', icon: Database, color: 'bg-indigo-700' },
    { value: 'code', label: 'Code Snippets', icon: Code, color: 'bg-rose-600' }
  ];

  const availableTags = [
    'Frontend', 'Backend', 'Database', 'API', 'Security', 'Performance', 
    'Migration', 'Bug Fix', 'Feature', 'Refactor', 'Testing', 'DevOps'
  ];

  // Fetch recent uploads from backend
  const fetchRecentUploads = async () => {
    try {
      setLoadingActivity(true);
      const response = await fetch('http://localhost:5000/api/recent-uploads?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      } else {
        console.error('Failed to fetch recent uploads');
        // Fallback to empty array if API fails
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error fetching recent uploads:', error);
      setRecentActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Load recent uploads on component mount
  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) return Image;
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp'].includes(extension)) return Code;
    if (['md', 'txt', 'doc', 'docx'].includes(extension)) return FileText;
    return File;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const uploadDate = new Date(timestamp * 1000); // Convert timestamp to Date
    const diffInMinutes = Math.floor((now - uploadDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  const addToRecentActivity = (title, category) => {
    const newActivity = {
      title,
      type: category,
      timestamp: Date.now() / 1000, // Convert to seconds for consistency
      date: new Date().toISOString().split('T')[0]
    };
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]); // Keep only 5 most recent
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleUpload = async () => {
    if (!title || !selectedCategory || uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    
    // Upload each file with metadata
    for (let fileObj of uploadedFiles) {
      const formData = new FormData();
      formData.append('file', fileObj.file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', selectedCategory);
      formData.append('tags', selectedTags.join(','));

      try {
        await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    
    // Add to recent activity and refresh from backend
    addToRecentActivity(title, selectedCategory);
    await fetchRecentUploads(); // Refresh from backend to get accurate data
    
    setIsUploading(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      setSelectedTags([]);
      setUploadedFiles([]);
    }, 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Update time display for recent activity
  const getActivityTime = (activity) => {
    if (activity.timestamp) {
      return formatTimeAgo(activity.timestamp);
    }
    return activity.time || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Area */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Upload className="w-6 h-6 text-blue-500" />
                Upload Files
              </h2>
              
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50 scale-105' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-gray-800">Drop files here or click to browse</p>
                    <p className="text-gray-500">Support for documents, images, code files, and more</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Files ({uploadedFiles.length})</h3>
                  {uploadedFiles.map((file) => {
                    const FileIcon = getFileIcon(file.name);
                    return (
                      <div key={file.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 group hover:bg-gray-100 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-slate-800 to-purple-800 rounded-lg flex items-center justify-center">
                            <FileIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 font-medium truncate">{file.name}</p>
                            <p className="text-gray-500 text-sm">{formatFileSize(file.size)}</p>
                            {file.uploadProgress > 0 && file.uploadProgress < 100 && (
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${file.uploadProgress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Metadata Form */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Tag className="w-6 h-6 text-green-500" />
                Artifact Details
              </h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide context about this artifact..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                            selectedCategory === category.value
                              ? 'border-purple-500 bg-purple-500/30 shadow-lg'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-gray-800 font-medium text-sm">{category.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                          selectedTags.includes(tag)
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-700 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload Summary */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Files</span>
                  <span className="text-gray-800 font-semibold">{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tags</span>
                  <span className="text-gray-800 font-semibold">{selectedTags.length}</span>
                </div>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!title || !selectedCategory || uploadedFiles.length === 0 || isUploading}
                className={`w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 ${
                  isUploading
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-2xl'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload Artifacts'}
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {loadingActivity ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading recent activity...</p>
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-800 to-purple-800 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm font-medium truncate">{item.title}</p>
                        <p className="text-gray-500 text-xs">{getActivityTime(item)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No recent uploads</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-2xl transform animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Successful!</h3>
              <p className="text-gray-600">Your artifacts have been added to the knowledge base.</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default KnowledgePlatformUpload;