import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star, 
  Users, 
  Target, 
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Video,
  FileText,
  Code,
  MessageSquare,
  Award,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

const KnowledgePaths = () => {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  // Mock user ID (in real app, get from auth)
  const userId = 'user-123';

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchPaths();
    fetchUserProgress();
  }, []);

  const fetchPaths = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/knowledge-paths`);
      const result = await response.json();
      
      if (result.success) {
        setPaths(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch paths');
      }
    } catch (error) {
      console.error('Error fetching paths:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/progress?user_id=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        const progressMap = {};
        result.data.forEach(item => {
          progressMap[item.path.id] = item.progress;
        });
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const fetchPathDetails = async (pathId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-paths/${pathId}?user_id=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setSelectedPath(result.data);
        setCurrentStep(0);
      } else {
        throw new Error(result.error || 'Failed to fetch path details');
      }
    } catch (error) {
      console.error('Error fetching path details:', error);
      setError(error.message);
    }
  };

  const updateProgress = async (pathId, stepId, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-paths/${pathId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          step_id: stepId,
          action: action
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local progress state
        setUserProgress(prev => ({
          ...prev,
          [pathId]: result.data
        }));
        
        // If completing current step, move to next
        if (action === 'complete' && selectedPath) {
          const currentStepIndex = selectedPath.path.steps.findIndex(step => step.id === stepId);
          if (currentStepIndex < selectedPath.path.steps.length - 1) {
            setCurrentStep(currentStepIndex + 1);
          }
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'code_review':
        return <Code className="h-5 w-5" />;
      case 'ai_interaction':
        return <MessageSquare className="h-5 w-5" />;
      case 'quiz':
        return <Target className="h-5 w-5" />;
      case 'interactive':
        return <Play className="h-5 w-5" />;
      case 'lab':
        return <Code className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'onboarding':
        return 'bg-blue-100 text-blue-800';
      case 'development':
        return 'bg-purple-100 text-purple-800';
      case 'security':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPaths = paths.filter(path => {
    if (filters.category && path.category !== filters.category) return false;
    if (filters.difficulty && path.difficulty !== filters.difficulty) return false;
    if (filters.search && !path.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Paths</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPaths}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedPath) {
    const path = selectedPath.path;
    const progress = selectedPath.progress || { completed_steps: [], progress_percentage: 0 };
    const currentStepData = path.steps[currentStep];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedPath(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{path.title}</h1>
                  <p className="text-sm text-gray-500">{path.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-lg font-semibold text-indigo-600">{progress.progress_percentage}%</p>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      {getStepIcon(currentStepData.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Step {currentStep + 1}</h2>
                      <p className="text-gray-500">{currentStepData.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{currentStepData.estimated_time}</span>
                    </div>
                    {currentStepData.required && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Required</span>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-gray-700 text-lg mb-6">{currentStepData.content}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Resource:</span>
                        <a 
                          href={currentStepData.resource_url}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {currentStepData.resource_url}
                        </a>
                      </div>
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                        Open Resource
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    {!currentStepData.required && (
                      <button
                        onClick={() => updateProgress(path.id, currentStepData.id, 'skip')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Skip Step
                      </button>
                    )}
                    <button
                      onClick={() => updateProgress(path.id, currentStepData.id, 'complete')}
                      className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Complete</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentStep(Math.min(path.steps.length - 1, currentStep + 1))}
                    disabled={currentStep === path.steps.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Path Progress</h3>
                
                <div className="space-y-3">
                  {path.steps.map((step, index) => {
                    const isCompleted = progress.completed_steps?.includes(step.id);
                    const isCurrent = index === currentStep;
                    
                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isCurrent 
                            ? 'border-indigo-300 bg-indigo-50' 
                            : isCompleted 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-200 bg-gray-50'
                        }`}
                        onClick={() => setCurrentStep(index)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1 rounded-full ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isCurrent 
                                ? 'bg-indigo-500 text-white' 
                                : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              isCompleted ? 'text-green-800' : isCurrent ? 'text-indigo-800' : 'text-gray-700'
                            }`}>
                              {step.title}
                            </p>
                            <p className="text-xs text-gray-500">{step.estimated_time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {progress.progress_percentage === 100 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">Path Completed! 🎉</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Congratulations! You've completed this knowledge path.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Knowledge Paths</h1>
                  <p className="text-sm text-gray-500">Interactive learning journeys</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search paths..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="development">Development</option>
                  <option value="security">Security</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ category: '', difficulty: '', search: '' })}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map((path) => {
            const progress = userProgress[path.id] || { progress_percentage: 0, completed_steps: [] };
            const isInProgress = progress.progress_percentage > 0 && progress.progress_percentage < 100;
            const isCompleted = progress.progress_percentage === 100;
            
            return (
              <div
                key={path.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => fetchPathDetails(path.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{path.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isCompleted && <Award className="h-5 w-5 text-green-500" />}
                      {isInProgress && <TrendingUp className="h-5 w-5 text-blue-500" />}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                      {path.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(path.category)}`}>
                      {path.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{path.estimated_time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{path.steps.length} steps</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-indigo-600 font-medium">{progress.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progress.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Review Path</span>
                      </>
                    ) : isInProgress ? (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Continue</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Start Path</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPaths.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No paths found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new path.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgePaths; 