import React, { useState } from 'react';
import { User, Bell, Link, Save, Check, Github, MessageSquare, FileText, Users } from 'lucide-react';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  
  // Form state
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Developer',
    techStack: 'React, Node.js, Python'
  });
  
 
  
  const [integrationSettings, setIntegrationSettings] = useState({
    github: { connected: true, repositories: ['main-app', 'docs-site'] },
    gitlab: { connected: false, repositories: [] },
    confluence: { connected: true, spaces: ['Engineering', 'Product'] },
    notion: { connected: false, workspaces: [] },
    googleDocs: { connected: false, folders: [] },
    slack: { connected: true, channels: ['#engineering', '#general'] },
    teams: { connected: false, channels: [] }
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  

  const toggleIntegration = (service) => {
    setIntegrationSettings(prev => ({
      ...prev,
      [service]: { ...prev[service], connected: !prev[service].connected }
    }));
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'integrations', label: 'Integrations', icon: Link }
  ];

  const roles = ['Developer', 'Team Lead', 'PM', 'New Joiner'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account preferences and integrations</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              {/* Profile Settings */}
              {activeSection === 'profile' && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Profile Settings</h2>
                    <p className="text-slate-600">Manage your identity and preferences</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                      <select
                        value={profileData.role}
                        onChange={(e) => handleProfileChange('role', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Tech Stack</label>
                      <input
                        type="text"
                        value={profileData.techStack}
                        onChange={(e) => handleProfileChange('techStack', e.target.value)}
                        placeholder="e.g., React, Node.js, Python, Docker"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-sm text-slate-500 mt-1">Used to personalize content recommendations</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Integration Settings */}
              {activeSection === 'integrations' && (
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Integration Settings</h2>
                    <p className="text-slate-600">Connect external tools to pull in project artifacts</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Version Control */}
                    <div>
                      <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        Version Control
                      </h3>
                      <div className="space-y-4">
                        {[
                          { key: 'github', label: 'GitHub', desc: 'Pull repositories, issues, and pull requests' },
                          { key: 'gitlab', label: 'GitLab', desc: 'Access GitLab projects and merge requests' }
                        ].map(service => (
                          <div key={service.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="font-medium text-slate-800">{service.label}</div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  integrationSettings[service.key].connected 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {integrationSettings[service.key].connected ? 'Connected' : 'Not Connected'}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">{service.desc}</div>
                              {integrationSettings[service.key].connected && integrationSettings[service.key].repositories.length > 0 && (
                                <div className="text-sm text-slate-500 mt-1">
                                  {integrationSettings[service.key].repositories.length} repositories connected
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => toggleIntegration(service.key)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                integrationSettings[service.key].connected
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              {integrationSettings[service.key].connected ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documentation */}
                    <div>
                      <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Documentation Platforms
                      </h3>
                      <div className="space-y-4">
                        {[
                          { key: 'confluence', label: 'Confluence', desc: 'Sync documentation and wiki pages' },
                          { key: 'notion', label: 'Notion', desc: 'Import workspaces and databases' },
                          { key: 'googleDocs', label: 'Google Docs', desc: 'Access shared documents and folders' }
                        ].map(service => (
                          <div key={service.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="font-medium text-slate-800">{service.label}</div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  integrationSettings[service.key].connected 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {integrationSettings[service.key].connected ? 'Connected' : 'Not Connected'}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">{service.desc}</div>
                            </div>
                            <button
                              onClick={() => toggleIntegration(service.key)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                integrationSettings[service.key].connected
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              {integrationSettings[service.key].connected ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Communication */}
                    <div>
                      <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Communication Tools
                      </h3>
                      <div className="space-y-4">
                        {[
                          { key: 'slack', label: 'Slack', desc: 'Import messages and decisions from channels' },
                          { key: 'teams', label: 'Microsoft Teams', desc: 'Access team conversations and files' }
                        ].map(service => (
                          <div key={service.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="font-medium text-slate-800">{service.label}</div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  integrationSettings[service.key].connected 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {integrationSettings[service.key].connected ? 'Connected' : 'Not Connected'}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">{service.desc}</div>
                              {integrationSettings[service.key].connected && integrationSettings[service.key].channels.length > 0 && (
                                <div className="text-sm text-slate-500 mt-1">
                                  {integrationSettings[service.key].channels.length} channels connected
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => toggleIntegration(service.key)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                integrationSettings[service.key].connected
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              {integrationSettings[service.key].connected ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t border-slate-200 px-8 py-4">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    saved 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Settings Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;