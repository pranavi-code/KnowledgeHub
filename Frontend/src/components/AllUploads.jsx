import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, GitPullRequest, MessageSquare, Activity, BookOpen, Github, Search, Filter, Download, Eye, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUploads();
  }, []);

  const fetchAllUploads = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/dashboard/all-uploads');
      const data = await response.json();
      setUploads(data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'github': return GitPullRequest;
      case 'documentation': return FileText;
      case 'meetings': return MessageSquare;
      case 'changelogs': return Activity;
      case 'architecture': return BookOpen;
      case 'code': return Github;
      default: return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'github': return 'bg-green-100 text-green-800';
      case 'documentation': return 'bg-blue-100 text-blue-800';
      case 'meetings': return 'bg-purple-100 text-purple-800';
      case 'changelogs': return 'bg-orange-100 text-orange-800';
      case 'architecture': return 'bg-indigo-100 text-indigo-800';
      case 'code': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'github': return 'GitHub Activity';
      case 'documentation': return 'Technical Documentation';
      case 'meetings': return 'Meeting Notes';
      case 'changelogs': return 'Changelogs';
      case 'architecture': return 'Architecture Docs';
      case 'code': return 'Code Snippets';
      default: return 'Documentation';
    }
  };

  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         upload.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || upload.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading all uploads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Uploads</h1>
              <p className="text-gray-600 mt-1">Browse all uploaded artifacts and documents</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {filteredUploads.length} of {uploads.length} uploads
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search uploads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="documentation">Technical Documentation</option>
                <option value="github">GitHub Activity</option>
                <option value="meetings">Meeting Notes</option>
                <option value="changelogs">Changelogs</option>
                <option value="architecture">Architecture Docs</option>
                <option value="code">Code Snippets</option>
              </select>
            </div>
          </div>
        </div>

        {/* Uploads Grid */}
        {filteredUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUploads.map((upload, index) => {
              const TypeIcon = getTypeIcon(upload.type);
              return (
                <div
                  key={upload.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(upload.type)}`}>
                      {getTypeLabel(upload.type)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {upload.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {upload.description || 'No description available'}
                    </p>
                  </div>

                  {/* Tags */}
                  {upload.tags && upload.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {upload.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {upload.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{upload.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{upload.time}</span>
                      </div>
                      <span>by {upload.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No uploads found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'
              }
            </p>
            {!searchQuery && selectedType === 'all' && (
              <button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Upload Document
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUploads; 