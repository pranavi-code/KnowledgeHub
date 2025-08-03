import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Play, 
  GitPullRequest, 
  Bot, 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  ArrowRight,
  BookOpen,
  Video,
  Code,
  MessageSquare,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

const LearningPath = () => {
  // Dummy data for learning steps
  const steps = [
    { 
      id: 1, 
      type: 'doc', 
      title: 'Project Overview', 
      description: 'Understand the project structure and goals',
      link: '/docs/project',
      duration: '10 min'
    },
    { 
      id: 2, 
      type: 'video', 
      title: 'API Design Intro', 
      description: 'Learn about RESTful API design principles',
      link: 'https://youtube.com/xyz',
      duration: '15 min'
    },
    { 
      id: 3, 
      type: 'pr', 
      title: 'Review GitHub PR #42', 
      description: 'Review the authentication service refactor',
      link: 'https://github.com/org/repo/pull/42',
      duration: '20 min'
    },
    { 
      id: 4, 
      type: 'ai', 
      title: 'Ask a question to AI Assistant', 
      description: 'Get help with any technical questions',
      action: '/ask-ai',
      duration: '5 min'
    },
    { 
      id: 5, 
      type: 'doc', 
      title: 'Code Style Guidelines', 
      description: 'Review coding standards and best practices',
      link: '/docs/style-guide',
      duration: '12 min'
    },
    { 
      id: 6, 
      type: 'video', 
      title: 'Database Schema Walkthrough', 
      description: 'Understanding the data model and relationships',
      link: 'https://youtube.com/db-schema',
      duration: '18 min'
    }
  ];

  const [completedSteps, setCompletedSteps] = useState([]);
  const [expandedStep, setExpandedStep] = useState(null);

  // Load completed steps from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('learningPathCompleted');
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  // Save completed steps to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('learningPathCompleted', JSON.stringify(completedSteps));
  }, [completedSteps]);

  const toggleStepCompletion = (stepId) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepId)) {
        return prev.filter(id => id !== stepId);
      } else {
        return [...prev, stepId];
      }
    });
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'doc':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'pr':
        return <GitPullRequest className="w-5 h-5" />;
      case 'ai':
        return <Bot className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getStepTypeColor = (type) => {
    switch (type) {
      case 'doc':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'video':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'pr':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'ai':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStepTypeLabel = (type) => {
    switch (type) {
      case 'doc':
        return 'Documentation';
      case 'video':
        return 'Video';
      case 'pr':
        return 'Pull Request';
      case 'ai':
        return 'AI Assistant';
      default:
        return 'Learning';
    }
  };

  const handleStepAction = (step) => {
    if (step.type === 'ai') {
      // Navigate to AI assistant
      window.location.href = step.action;
    } else if (step.link) {
      // Open external link
      window.open(step.link, '_blank');
    }
  };

  const progress = (completedSteps.length / steps.length) * 100;
  const completedCount = completedSteps.length;
  const totalSteps = steps.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Learning Path</h1>
                <p className="text-gray-600">Complete these steps to get up to speed with the project</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{completedCount}/{totalSteps}</div>
              <div className="text-sm text-gray-500">Steps Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Completion Status */}
          {completedCount === totalSteps && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Award className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Congratulations! 🎉</h3>
                <p className="text-green-600 text-sm">You've completed all learning steps!</p>
              </div>
            </div>
          )}
        </div>

        {/* Learning Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isExpanded = expandedStep === step.id;

            return (
              <div
                key={step.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-white/20 hover:border-blue-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Step Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Status Icon */}
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                          isCompleted 
                            ? 'bg-green-500 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-semibold ${
                            isCompleted ? 'text-green-700 line-through' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStepTypeColor(step.type)}`}>
                            {getStepTypeLabel(step.type)}
                          </span>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{step.duration}</span>
                          </div>
                        </div>
                        
                        <p className={`text-sm ${
                          isCompleted ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {step.description}
                        </p>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              {getStepIcon(step.type)}
                              <span>Step {index + 1} of {totalSteps}</span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {step.type === 'ai' 
                                ? 'Click the action button to open the AI Assistant and ask your question.'
                                : `This ${getStepTypeLabel(step.type).toLowerCase()} will help you understand the project better.`
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => handleStepAction(step)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                          isCompleted
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                        }`}
                      >
                        {step.type === 'ai' ? 'Ask AI' : 'Open'}
                        <ExternalLink className="w-4 h-4 ml-1 inline" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Summary */}
        {completedCount > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
                <p className="text-gray-600 text-sm">
                  {completedCount === totalSteps 
                    ? 'All steps completed! You\'re ready to contribute.'
                    : `${totalSteps - completedCount} steps remaining to complete your onboarding.`
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPath; 