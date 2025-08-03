import React, { useState, useEffect } from 'react';
import { FaChartLine, FaTrophy, FaClock, FaBullseye, FaLightbulb, FaChartBar, FaUsers, FaBook, FaCode } from 'react-icons/fa';

const Weekly = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [activity, setActivity] = useState({});
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      
      // Fetch weekly dashboard data
      const weeklyResponse = await fetch('http://localhost:5000/api/weekly-dashboard');
      const weeklyResult = await weeklyResponse.json();
      
      if (weeklyResult.success) {
        setWeeklyData(weeklyResult.weekly_data);
      }

      // Fetch goals
      const goalsResponse = await fetch('http://localhost:5000/api/weekly-dashboard/goals');
      const goalsResult = await goalsResponse.json();
      
      if (goalsResult.success) {
        setGoals(goalsResult.goals);
      }

      // Fetch activity
      const activityResponse = await fetch('http://localhost:5000/api/weekly-dashboard/activity');
      const activityResult = await activityResponse.json();
      
      if (activityResult.success) {
        setActivity(activityResult.activity);
      }

      // Fetch insights
      const insightsResponse = await fetch('http://localhost:5000/api/weekly-dashboard/insights');
      const insightsResult = await insightsResponse.json();
      
      if (insightsResult.success) {
        setInsights(insightsResult.insights);
      }

    } catch (err) {
      setError('Failed to fetch weekly data');
    } finally {
      setLoading(false);
    }
  };

  const getGoalStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalProgressColor = (completed, target) => {
    const percentage = (completed / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchWeeklyData}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Pulse Dashboard</h2>
          <p className="text-gray-600">Your weekly progress and insights</p>
        </div>
        <div className="text-sm text-gray-500">
          Week of {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyData?.tasks_completed || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
                              <FaBullseye className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Knowledge Items</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyData?.knowledge_items_learned || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaBook className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hours Spent</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyData?.time_spent_hours || 0}h</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaClock className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Goals Achieved</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyData?.goals_achieved || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaTrophy className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Goals</h3>
          <span className="text-sm text-gray-500">
            {goals.filter(g => g.status === 'completed').length} of {goals.length} completed
          </span>
        </div>
        
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getGoalStatusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{goal.category}</span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((goal.completed / goal.target) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getGoalProgressColor(goal.completed, goal.target)}`}
                    style={{ width: `${Math.min((goal.completed / goal.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                {goal.completed} of {goal.target} completed
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
          
          <div className="space-y-4">
            {Object.entries(activity).map(([category, data]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                  <span className="text-sm text-gray-500">{data.hours_spent}h</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(data).map(([metric, value]) => (
                    <div key={metric} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{metric.replace('_', ' ')}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{insight.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
                              <FaCode className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Code Commits</p>
              <p className="text-xl font-bold text-gray-900">{weeklyData?.code_commits || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <FaUsers className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Code Reviews</p>
              <p className="text-xl font-bold text-gray-900">{weeklyData?.code_reviews || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
                         <div className="p-2 bg-purple-100 rounded-full">
               <FaChartBar className="text-purple-600" />
             </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pull Requests</p>
              <p className="text-xl font-bold text-gray-900">{weeklyData?.pull_requests || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weekly; 