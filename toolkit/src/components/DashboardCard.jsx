import React, { useEffect, useState } from 'react';
import { Search, Upload, GitPullRequest, FileText, MessageSquare, Calendar, TrendingUp, Users, Clock, Filter, Bell, Settings, ChevronDown, ChevronRight, Github, BookOpen, Zap, Star, Activity, User, Target, GitBranch, ArrowRight, Award, CheckCircle, Play, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const KnowledgeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [notifications, setNotifications] = useState(3);
  const [stats, setStats] = useState([]);
  const [activity, setActivity] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [knowledgePaths, setKnowledgePaths] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [pathsLoading, setPathsLoading] = useState(false);
  const [pathsError, setPathsError] = useState(null);
  const navigate = useNavigate();

  // Get token from localStorage or URL
  const [token, setToken] = useState(localStorage.getItem('github_token') || new URLSearchParams(window.location.search).get("token"));

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
    fetchKnowledgePaths();
    
    // Store token in localStorage if it's in URL
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken && !localStorage.getItem('github_token')) {
      localStorage.setItem('github_token', urlToken);
      setToken(urlToken);
    }
    
    // Fetch GitHub repos if token is available
    if (token) {
      fetchGitHubRepos();
    }
  }, [token]);

  const fetchGitHubRepos = async () => {
    try {
      const response = await fetch("http://localhost:5000/github/repos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRepos(data.repos || data || []);
      } else {
        console.error("Failed to fetch repos:", response.status);
        // Clear invalid token
        localStorage.removeItem('github_token');
        setToken(null);
      }
    } catch (err) {
      console.error("Repo fetch error:", err);
      // Clear invalid token on error
      localStorage.removeItem('github_token');
      setToken(null);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats and categories
      const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats');
      const statsData = await statsResponse.json();
      
      // Transform the stats data to match frontend expectations
      const transformedStats = [
        {
          label: 'Total Documents',
          value: statsData.total_documents || 0,
          change: statsData.changes?.documents || '+0%',
          icon: 'FileText',
          color: 'blue'
        },
        {
          label: 'Active PRs',
          value: statsData.active_prs || 0,
          change: statsData.changes?.prs || '+0%',
          icon: 'GitPullRequest',
          color: 'green'
        },
        {
          label: 'Team Members',
          value: statsData.team_members || 0,
          change: statsData.changes?.members || '+0%',
          icon: 'Users',
          color: 'purple'
        },
        {
          label: 'Knowledge Score',
          value: `${statsData.knowledge_score || 0}%`,
          change: statsData.changes?.score || '+0%',
          icon: 'TrendingUp',
          color: 'orange'
        }
      ];
      
      setStats(transformedStats);
      
      // Set default categories since there's no categories endpoint
      const defaultCategories = [
        { name: 'Documentation', count: Math.floor((statsData.total_documents || 0) * 0.4), color: 'bg-blue-500', icon: 'FileText', type: 'documentation' },
        { name: 'Pull Requests', count: statsData.active_prs || 0, color: 'bg-green-500', icon: 'GitPullRequest', type: 'github' },
        { name: 'Meeting Notes', count: Math.floor((statsData.total_documents || 0) * 0.2), color: 'bg-purple-500', icon: 'MessageSquare', type: 'meetings' },
        { name: 'Changelogs', count: Math.floor((statsData.total_documents || 0) * 0.1), color: 'bg-orange-500', icon: 'Activity', type: 'changelogs' }
      ];
      setCategories(defaultCategories);
      
      // Fetch recent activity
      const activityResponse = await fetch('http://localhost:5000/api/dashboard/activity');
      const activityData = await activityResponse.json();
      setActivity(activityData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API fails
      setStats([]);
      setCategories([]);
      setActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      // Fetch user data from the new API endpoints
      try {
        const userResponse = await fetch('http://localhost:5000/api/weekly-dashboard');
        const userResult = await userResponse.json();
        
        if (userResult.success) {
          setUserData(userResult.user_info);
          setUserTasks(userResult.tasks_summary?.recent_tasks || []);
          setUserProjects(userResult.projects_summary);
        }
      } catch (error) {
        console.error('Error fetching weekly dashboard data:', error);
        // Use default data if weekly dashboard is not available
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set default user data
      setUserData({
        username: 'Pranavi',
        role: 'Developer',
        email: 'pranavi@example.com'
      });
      setUserTasks([]);
      setUserProjects({
        total_projects: 2,
        active_projects: 2
      });
    }
  };

  const fetchKnowledgePaths = async () => {
    try {
      setPathsLoading(true);
      setPathsError(null);
      
      const response = await fetch('http://localhost:5000/api/knowledge-paths');
      const data = await response.json();
      
      if (data.success) {
        setKnowledgePaths(data.data || []);
        
        // Fetch user progress for each path
        const progressData = {};
        for (const path of data.data || []) {
          try {
            const progressResponse = await fetch(`http://localhost:5000/api/knowledge-paths/${path.id}?user_id=user-123`);
            const progressResult = await progressResponse.json();
            if (progressResult.success) {
              progressData[path.id] = {
                progress_percentage: progressResult.data?.progress?.progress_percentage || 0,
                completed_steps: progressResult.data?.progress?.completed_steps || []
              };
            }
          } catch (err) {
            console.error(`Error fetching progress for path ${path.id}:`, err);
          }
        }
        setUserProgress(progressData);
      } else {
        setPathsError(data.error || 'Failed to fetch knowledge paths');
      }
    } catch (err) {
      console.error('Error fetching knowledge paths:', err);
      setPathsError('Failed to connect to server');
      
      // Set default knowledge paths if API fails
      const defaultPaths = [
        {
          id: 'new-developer',
          title: 'New Developer Onboarding',
          description: 'Complete guide for new developers joining the team',
          difficulty: 'beginner',
          category: 'onboarding',
          estimated_time: '2-3 hours',
          steps: []
        },
        {
          id: 'api-developer',
          title: 'API Developer Path',
          description: 'Specialized path for API developers',
          difficulty: 'intermediate',
          category: 'development',
          estimated_time: '4-5 hours',
          steps: []
        },
        {
          id: 'security-engineer',
          title: 'Security Engineer Path',
          description: 'Comprehensive security training path',
          difficulty: 'advanced',
          category: 'security',
          estimated_time: '6-8 hours',
          steps: []
        }
      ];
      setKnowledgePaths(defaultPaths);
    } finally {
      setPathsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
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
    switch (category?.toLowerCase()) {
      case 'development':
        return 'bg-blue-100 text-blue-800';
      case 'design':
        return 'bg-purple-100 text-purple-800';
      case 'testing':
        return 'bg-green-100 text-green-800';
      case 'deployment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewAll = () => {
    navigate('/all-uploads');
  };

  const handleCategoryClick = (categoryType) => {
    navigate(`/search?type=${categoryType}`);
  };

  const handleQuickStart = () => {
    navigate('/upload');
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'merged': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-purple-100 text-purple-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pr': return GitPullRequest;
      case 'doc': return FileText;
      case 'meeting': return MessageSquare;
      case 'changelog': return Activity;
      case 'architecture': return BookOpen;
      case 'code': return Github;
      default: return FileText;
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      'FileText': FileText,
      'GitPullRequest': GitPullRequest,
      'Users': Users,
      'TrendingUp': TrendingUp,
      'BookOpen': BookOpen,
      'Activity': Activity,
      'MessageSquare': MessageSquare
    };
    return iconMap[iconName] || FileText;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* User Onboarding Summary */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Welcome back, here's your workspace.</h2>
              <p className="text-blue-100 mb-6">Track your progress and stay organized with your knowledge management</p>
              
              {/* User Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Role in Team</p>
                      <p className="font-semibold">{userData?.role || 'Developer'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Assigned Projects</p>
                      <p className="font-semibold">{userProjects?.active_projects || 0} Active</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Tasks Due This Week</p>
                      <p className="font-semibold">{userTasks?.length || 0} Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-16"></div>
          </div>
        </div>

        {/* Guided Knowledge Paths Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                  Guided Knowledge Paths
                </h3>
                <p className="text-gray-600">Interactive onboarding flows to help new team members learn like a story</p>
              </div>
              <button 
                onClick={() => window.location.href = '/knowledge-paths'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                <span>View All Paths</span>
              </button>
                  </div>
            
            {pathsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading knowledge paths...</p>
                </div>
            ) : pathsError ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">⚠</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Paths</h4>
                <p className="text-gray-600 mb-4">{pathsError}</p>
                <button 
                  onClick={fetchKnowledgePaths}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgePaths.slice(0, 3).map((path, index) => {
                  const progress = userProgress[path.id] || { progress_percentage: 0, completed_steps: [] };
                  const isInProgress = progress.progress_percentage > 0 && progress.progress_percentage < 100;
                  const isCompleted = progress.progress_percentage === 100;
                  
                  return (
                    <div
                      key={path.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => window.location.href = '/knowledge-paths'}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {path.title}
                            </h4>
                            <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isCompleted && <Award className="h-5 w-5 text-green-500" />}
                            {isInProgress && <TrendingUp className="h-5 w-5 text-blue-500" />}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                            {path.difficulty || 'Beginner'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(path.category)}`}>
                            {path.category || 'Development'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{path.estimated_time || '2-3 hours'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Target className="h-4 w-4" />
                            <span>{path.steps?.length || 5} steps</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-blue-600 font-medium">{progress.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isCompleted ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress.progress_percentage}%` }}
                            ></div>
                          </div>
                      </div>

                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
            )}
          </div>
          </div>

        {/* Git Sync Section */}
        <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <GitBranch className="w-6 h-6 mr-3 text-green-600" />
                  Git Sync
                </h3>
                <p className="text-gray-600">Connect your GitHub repositories and sync your code knowledge</p>
              </div>
              <div className="flex items-center space-x-2">
                {token ? (
                  <>
                    <button
                      onClick={fetchGitHubRepos}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('github_token');
                        setToken(null);
                        setRepos([]);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span>Disconnect</span>
                    </button>
                  </>
                ) : (
                <button 
                    onClick={() => {
                      window.location.href = "http://localhost:5000/github/login";
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>Connect GitHub</span>
                </button>
                )}
              </div>
              </div>
              
            {token && repos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repos.slice(0, 3).map((repo, index) => (
                  <div 
                    key={repo.full_name} 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                            {repo.full_name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">{repo.description || 'No description available'}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          repo.private ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {repo.private ? "Private" : "Public"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Target className="h-4 w-4" />
                          <span>{repo.language || 'Unknown'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetch("http://localhost:5000/github/sync", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                full_name: repo.full_name,
                                clone_url: repo.clone_url,
                              }),
                            })
                              .then((res) => res.json())
                              .then((data) => {
                                if (data.success) {
                                  alert('Repository synced successfully!');
                                } else {
                                  alert(data.error || 'Sync failed');
                                }
                              })
                              .catch((err) => alert('Sync failed: ' + err.message));
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <GitBranch className="h-4 w-4" />
                          <span>Sync</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            localStorage.setItem("selectedRepo", repo.full_name);
                            alert(`Repository "${repo.full_name}" selected for app!`);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Use</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No GitHub repositories connected</h4>
                <p className="text-gray-600 mb-4">Connect your GitHub account to sync repositories and track your code knowledge</p>
                <button
                  onClick={() => {
                    window.location.href = "http://localhost:5000/github/login";
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                >
                  <Github className="h-5 w-5" />
                  <span>Connect GitHub</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDashboard;