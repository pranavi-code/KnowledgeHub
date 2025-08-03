import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  Database,
  ExternalLink,
  FileText,
  GitBranch,
  MapPin,
  MessageSquare,
  Rocket,
  Settings,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

const OnboardingTimeline = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [expandedPhases, setExpandedPhases] = useState(new Set([0]));
  const [userProgress, setUserProgress] = useState(0);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [pendingPhases, setPendingPhases] = useState([]);
  const [totalPhases, setTotalPhases] = useState(0);
  const [userPhases, setUserPhases] = useState([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [myAchievements, setMyAchievements] = useState([]);
  const [currentUser, setCurrentUser] = useState('rakshitha'); // Default user
  const [loading, setLoading] = useState(true);

  // Fetch user progress
  useEffect(() => {
    fetch('http://localhost:5000/api/onboarding/progress')
      .then(res => res.json())
      .then(data => {
        if (data.progress && data.progress.length > 0) {
          const userProgress = data.progress.find(p => p.username === currentUser);
          if (userProgress) {
            setUserProgress(userProgress.percentage);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching progress:', error);
      });
  }, [currentUser]);

  // Fetch user data and phases
  useEffect(() => {
    fetch('http://localhost:5000/api/onboarding/user')
      .then(res => res.json())
      .then(data => {
        const user = data.find(u => u.username === currentUser);
        if (user && user.phases) {
          const phasesArr = Object.entries(user.phases).map(([name, phaseData], idx) => ({
            id: idx,
            title: name,
            completed: phaseData.completed || false,
            tasks: phaseData.tasks || {},
            duration: getPhaseDuration(name)
          }));
          setUserPhases(phasesArr);

          const completed = phasesArr.filter(phase => phase.completed).map(phase => phase.title);
          const pending = phasesArr.filter(phase => !phase.completed).map(phase => phase.title);
          setCompletedPhases(completed);
          setPendingPhases(pending);
          setTotalPhases(phasesArr.length);
          setLoading(false);
        } else {
          // Handle case where user or phases don't exist
          setUserPhases([]);
          setCompletedPhases([]);
          setPendingPhases([]);
          setTotalPhases(0);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, [currentUser]);

  // Fetch achievements
  useEffect(() => {
    fetch('http://localhost:5000/api/onboarding/achievements')
      .then(res => res.json())
      .then(data => {
        const userAchievements = data.find(a => a.username === currentUser);
        if (userAchievements && userAchievements.achievements) {
          setMyAchievements(userAchievements.achievements);
        } else {
          setMyAchievements([]);
        }
      })
      .catch(error => {
        console.error('Error fetching achievements:', error);
        setMyAchievements([]);
      });
  }, [currentUser]);

  const getPhaseDuration = (phaseName) => {
    const durations = {
      'Foundation Setup': '1-2 days',
      'Architecture Deep Dive': '3-5 days',
      'Codebase Exploration': '1 week',
      'Workflow & Processes': '2-3 days',
      'First Contribution': '1-2 weeks'
    };
    return durations[phaseName] || 'N/A';
  };

  const getPhaseIcon = (phaseName) => {
    const icons = {
      'Foundation Setup': Settings,
      'Architecture Deep Dive': Database,
      'Codebase Exploration': Code,
      'Workflow & Processes': GitBranch,
      'First Contribution': Rocket
    };
    return icons[phaseName] || FileText;
  };

  const getTaskIcon = (taskType) => {
    const icons = {
      setup: Settings,
      access: Shield,
      social: Users,
      documentation: BookOpen,
      database: Database,
      standards: Star,
      code: Code,
      testing: Zap,
      workflow: GitBranch,
      devops: Rocket,
      process: FileText,
      task: Target,
      development: Code,
      collaboration: MessageSquare
    };
    return icons[taskType] || FileText;
  };

  const getPriorityColor = (priority) => {
    return {
      high: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      low: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
    }[priority] || 'text-gray-600 bg-gray-100';
  };

  const togglePhase = (phaseId) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleTaskCompletion = async (phaseName, taskName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/onboarding/task/${currentUser}/${encodeURIComponent(phaseName)}/${encodeURIComponent(taskName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state
        const updatedPhases = userPhases.map(phase => {
          if (phase.title === phaseName) {
            const updatedTasks = { ...phase.tasks };
            if (updatedTasks[taskName]) {
              updatedTasks[taskName].completed = result.task_completed;
            }
            
            return {
              ...phase,
              completed: result.phase_completed,
              tasks: updatedTasks
            };
          }
          return phase;
        });
        
        setUserPhases(updatedPhases);
        
        // Update progress
        const completedPhases = updatedPhases.filter(phase => phase.completed);
        const newProgress = Math.round((completedPhases.length / updatedPhases.length) * 100);
        setUserProgress(newProgress);
        
        // Update completed/pending phases
        const completed = updatedPhases.filter(phase => phase.completed).map(phase => phase.title);
        const pending = updatedPhases.filter(phase => !phase.completed).map(phase => phase.title);
        setCompletedPhases(completed);
        setPendingPhases(pending);
        
        // Refresh achievements
        fetch('http://localhost:5000/api/onboarding/achievements')
          .then(res => res.json())
          .then(data => {
            const userAchievements = data.find(a => a.username === currentUser);
            if (userAchievements && userAchievements.achievements) {
              setMyAchievements(userAchievements.achievements);
            }
          });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleResourceClick = async (resource) => {
    try {
      const response = await fetch(`http://localhost:5000/api/onboarding/resources/${encodeURIComponent(resource)}`);
      if (response.ok) {
        const resourceData = await response.json();
        // Open resource URL in new tab
        window.open(resourceData.url, '_blank');
      } else {
        // Fallback to a generic URL if resource not found
        window.open(`https://docs.example.com/${resource.toLowerCase().replace(/\s+/g, '-')}`, '_blank');
      }
    } catch (error) {
      console.error('Error fetching resource:', error);
      // Fallback to a generic URL
      window.open(`https://docs.example.com/${resource.toLowerCase().replace(/\s+/g, '-')}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading onboarding data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-white/20 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Onboarding Journey</h1>
                <p className="text-slate-600">Your guided path to becoming a productive team member</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                    style={{ width: `${userProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-700">{userProgress}% Complete</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>~4-6 weeks total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl border p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Onboarding Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Phases</span>
                    <span className="text-lg font-bold text-slate-900">{totalPhases}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Completed</span>
                    <span className="text-lg font-bold text-green-600">{completedPhases.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Pending</span>
                    <span className="text-lg font-bold text-red-600">{pendingPhases.length}</span>
                  </div>
                </div>
              </div>

              {/* Phase Navigator */}
              <div className="bg-white rounded-3xl border p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  Phase Navigator
                </h3>
                <div className="space-y-3">
                  {userPhases.map((phase, idx) => (
                    <button
                      key={phase.id}
                      onClick={() => setActivePhase(idx)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        activePhase === idx
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activePhase === idx
                            ? 'bg-white/20'
                            : 'bg-slate-200'
                        }`}>
                          {phase.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${activePhase === idx ? 'text-white' : ''}`}>
                            {phase.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {phase.completed ? 'Completed' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Completed Phases */}
              <div className="bg-white rounded-3xl border p-6 shadow-xl mt-6">
                <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Completed Phases
                </h3>
                {completedPhases.length > 0 ? (
                  <ul className="list-disc pl-5 text-slate-800 space-y-1">
                    {completedPhases.map(phase => (
                      <li key={phase}>{phase}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No phases completed yet.</p>
                )}
              </div>

              {/* Pending Phases */}
              <div className="bg-white rounded-3xl border p-6 shadow-xl mt-6">
                <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-500" />
                  Pending Phases
                </h3>
                {pendingPhases.length > 0 ? (
                  <ul className="list-disc pl-5 text-slate-800 space-y-1">
                    {pendingPhases.map(phase => (
                      <li key={phase}>{phase}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No pending phases!</p>
                )}
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-3xl border p-6 shadow-xl mt-6">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  My Achievements
                </h3>
                {myAchievements.length > 0 ? (
                  <ul className="list-disc pl-5 text-slate-800 space-y-1">
                    {myAchievements.map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No achievements yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Body */}
          <div className="lg:col-span-3">
            {/* Phase Navigator Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {userPhases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-lg flex flex-col justify-between transition-all duration-200 hover:shadow-xl ${
                    activePhase === idx ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setActivePhase(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      phase.completed ? 'bg-green-100' : 'bg-slate-200'
                    }`}>
                      {phase.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Clock className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{phase.title}</h4>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      phase.completed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {phase.completed ? 'Completed' : 'Pending'}
                    </span>
                    <span className="text-xs text-slate-500">{phase.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Cards */}
            <div className="space-y-8">
              {userPhases.map((phase, phaseIdx) => {
                const PhaseIcon = getPhaseIcon(phase.title);
                const tasks = phase.tasks || {};
                const completedTasks = Object.values(tasks).filter(task => task && task.completed).length;
                const totalTasks = Object.keys(tasks).length;
                const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div key={phase.id} className="relative">
                    {/* Phase Header */}
                    <div 
                      className="bg-white rounded-3xl p-8 shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-3xl transform hover:-translate-y-1"
                      onClick={() => togglePhase(phase.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                            <PhaseIcon className="w-8 h-8 text-indigo-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">{phase.title}</h2>
                            <p className="text-slate-700 text-lg">Complete {totalTasks} tasks to finish this phase</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-slate-500">
                                <Timer className="w-4 h-4" />
                                <span className="text-sm">{phase.duration}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Target className="w-4 h-4" />
                                <span className="text-sm">{totalTasks} tasks</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-slate-700 text-right">
                            <div className="text-sm">Progress</div>
                            <div className="text-2xl font-bold">
                              {progressPercentage}%
                            </div>
                          </div>
                          {expandedPhases.has(phase.id) ? 
                            <ChevronUp className="w-6 h-6 text-indigo-600" /> : 
                            <ChevronDown className="w-6 h-6 text-indigo-600" />
                          }
                        </div>
                      </div>
                    </div>

                    {/* Tasks */}
                    {expandedPhases.has(phase.id) && (
                      <div className="mt-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
                        <div className="space-y-6">
                          {Object.entries(tasks).map(([taskName, taskData]) => {
                            if (!taskData) return null; // Skip if taskData is null/undefined
                            
                            const TaskIcon = getTaskIcon(taskData.type || 'task');
                            
                            return (
                              <div key={taskName} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg transition-all duration-200 hover:shadow-xl">
                                <div className="flex items-start gap-4">
                                  <button
                                    onClick={() => toggleTaskCompletion(phase.title, taskName)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                      taskData.completed 
                                        ? 'bg-green-500 text-white shadow-lg' 
                                        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 hover:shadow-lg'
                                    }`}
                                  >
                                    {taskData.completed ? <CheckCircle className="w-6 h-6" /> : <TaskIcon className="w-6 h-6" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h4 className={`text-lg font-semibold ${taskData.completed ? 'line-through text-slate-500' : 'text-black'}`}>
                                          {taskName}
                                        </h4>
                                        <p className="text-slate-800 mt-1">{taskData.description || ''}</p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(taskData.priority)}`}>
                                          {taskData.priority || 'medium'}
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-700">
                                          <Clock className="w-4 h-4" />
                                          <span className="text-sm">{taskData.duration || 'N/A'}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {(taskData.resources || []).map((resource, idx) => (
                                        <button 
                                          key={idx} 
                                          className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-sm hover:bg-slate-200 transition-colors shadow"
                                          onClick={() => handleResourceClick(resource)}
                                        >
                                          <FileText className="w-3 h-3" />
                                          {resource}
                                          <ExternalLink className="w-3 h-3" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Connector */}
                    {phaseIdx < userPhases.length - 1 && (
                      <div className="flex justify-center my-8">
                        <div className="w-px h-12 bg-slate-300"></div>
                        <div className="absolute w-3 h-3 bg-slate-400 rounded-full translate-y-5 -translate-x-1.5"></div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Completion */}
              <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border border-slate-200">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center shadow">
                    <Award className="w-10 h-10 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-indigo-700 mb-2">Congratulations!</h3>
                <p className="text-slate-700 text-lg mb-6">
                  You've completed your onboarding journey and are now ready to contribute effectively to the team!
                </p>
                <button
                  className="bg-indigo-50 text-indigo-700 px-8 py-3 rounded-xl hover:bg-indigo-100 transition-all duration-200 flex items-center gap-2 mx-auto shadow"
                  onClick={() => setShowAchievement(true)}
                >
                  <Sparkles className="w-5 h-5" />
                  View Your Achievement
                </button>
              </div>

              {/* How much left to complete */}
              {pendingPhases.length > 0 && (
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl border border-slate-200 mb-6">
                  <h3 className="text-xl font-bold text-red-700 mb-2">
                    {pendingPhases.length} phase{pendingPhases.length > 1 ? 's' : ''} left to complete!
                  </h3>
                  <p className="text-slate-700">
                    Keep going! You're almost there.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Modal */}
      {showAchievement && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-auto">
            {userProgress === 100 ? (
              <>
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">Achievement Unlocked!</h2>
                <p className="text-slate-700 mb-6">
                  You have successfully completed all onboarding phases. Welcome aboard!
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-red-700 mb-4">Oops!</h2>
                <p className="text-slate-700 mb-6">
                  Complete all onboarding phases to unlock your achievement.
                </p>
              </>
            )}
            <button
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700"
              onClick={() => setShowAchievement(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingTimeline;