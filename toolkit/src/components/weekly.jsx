import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  FileText, 
  GitPullRequest, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Calendar,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  MessageSquare,
  Code,
  BookOpen,
  Zap,
  ChevronRight,
  ChevronDown,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import io from 'socket.io-client';

const KnowledgePulseDashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [expandedSections, setExpandedSections] = useState({
    pending: true
  });
  const [animateStats, setAnimateStats] = useState(false);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    setAnimateStats(true);
    fetchWeeklyData();
    setupWebSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedWeek]);

  const setupWebSocket = () => {
    try {
      socketRef.current = io('http://localhost:5000');
      
      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        
        // Subscribe to weekly updates
        socketRef.current.emit('subscribe_weekly_updates', { week: selectedWeek });
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });
      
      socketRef.current.on('weekly_data_update', (data) => {
        console.log('Received weekly data update:', data);
        if (data.week_type === selectedWeek) {
          setWeeklyData(data.data);
          setLastUpdate(new Date());
        }
      });
      
      socketRef.current.on('weekly_data_refreshed', (data) => {
        console.log('Received weekly data refresh:', data);
        if (data.week_type === selectedWeek) {
          setWeeklyData(data.data);
          setLastUpdate(new Date());
        }
      });
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/weekly');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setWeeklyData(result.data);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch weekly data');
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      // Request manual refresh via WebSocket
      if (socketRef.current && isConnected) {
        socketRef.current.emit('request_weekly_refresh', { week: selectedWeek });
      } else {
        // Fallback to API refresh
        await fetchWeeklyData();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (week) => {
    setSelectedWeek(week);
    
    // Subscribe to new week updates
    if (socketRef.current && isConnected) {
      socketRef.current.emit('unsubscribe_weekly_updates', { week: selectedWeek });
      socketRef.current.emit('subscribe_weekly_updates', { week });
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Loading and error states
  if (loading && !weeklyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weekly data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchWeeklyData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!weeklyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const currentData = weeklyData;

  const StatCard = ({ icon: Icon, title, value, trend, color = 'blue' }) => (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 ${animateStats ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-600 font-medium">{trend}</span>
          <span className="text-gray-500 ml-1">vs last week</span>
        </div>
      )}
    </div>
  );

  const SectionCard = ({ title, icon: Icon, children, sectionKey, count }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{count} items this week</p>
          </div>
        </div>
        {expandedSections[sectionKey] ? 
          <ChevronDown className="h-5 w-5 text-gray-400" /> : 
          <ChevronRight className="h-5 w-5 text-gray-400" />
        }
      </div>
      {expandedSections[sectionKey] && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Knowledge Pulse</h1>
                  <p className="text-sm text-gray-500">Weekly AI-Generated Summary</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <select 
                value={selectedWeek}
                onChange={(e) => handleWeekChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="current">This Week</option>
                <option value="last">Last Week</option>
                <option value="twoWeeks">2 Weeks Ago</option>
              </select>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Weekly Knowledge Summary</h2>
                <p className="text-indigo-100 text-lg">{currentData.period}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 text-sm">Generated</p>
                <p className="text-white font-medium">{currentData.generated}</p>
                {lastUpdate && (
                  <p className="text-indigo-200 text-xs mt-1">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            
            {/* Highlights */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Week Highlights
              </h3>
              <div className="space-y-2">
                {currentData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center text-indigo-100">
                    <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 text-indigo-600 mr-2" />
              Weekly Activity Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData.chartData.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="uploads" stroke="#3B82F6" strokeWidth={3} name="New Uploads" />
                <Line type="monotone" dataKey="updates" stroke="#10B981" strokeWidth={3} name="Updates" />
                <Line type="monotone" dataKey="decisions" stroke="#8B5CF6" strokeWidth={3} name="Decisions" />
                <Line type="monotone" dataKey="completed" stroke="#F59E0B" strokeWidth={3} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-indigo-600 mr-2" />
              Content Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentData.chartData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {currentData.chartData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Pending Reviews */}
          <SectionCard 
            title="Pending Reviews" 
            icon={Clock} 
            sectionKey="pending"
            count={currentData.pending.length}
          >
            <div className="mt-4 space-y-4">
              {currentData.pending.map((item, index) => (
                <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>by {item.author}</span>
                        <span>•</span>
                        <span className="text-red-600 font-medium">{item.daysWaiting} days waiting</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Reviewers:</span>
                        {item.reviewers.map((reviewer, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-200 rounded text-xs">{reviewer}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Subscribe to Weekly Updates
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Customize Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePulseDashboard;