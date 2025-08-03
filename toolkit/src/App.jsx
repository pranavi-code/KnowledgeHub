// src/App.jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AIKnowledgeAssistant from './components/AiAssit';
import KnowledgeDashboard from './components/DashboardCard';
import GithubSuccess from './components/GithubSuccess';
import Layout from './components/Layout';
import NotFound from './components/NotFound';
import OnboardingTimeline from './components/Onboard';
import AdvancedSearch from './components/SearchFilter';
import Settings from './components/Settings';
import KnowledgePlatformUpload from './components/UploadArticrafts';
import LearningPath from './components/LearningPath';
import KnowledgePaths from './components/KnowledgePaths';
import Weekly from './components/weekly';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<KnowledgeDashboard />} />
          <Route path="/dashboard" element={<KnowledgeDashboard />} />
          <Route path="/upload" element={<KnowledgePlatformUpload />} />
          <Route path="/search" element={<AdvancedSearch />} />
          <Route path="/onboarding" element={<OnboardingTimeline />} />
          <Route path="/ai" element={<AIKnowledgeAssistant />} />
          <Route path='/settings' element={<Settings/>}/>
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/knowledge-paths" element={<KnowledgePaths />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/github/success" element={<GithubSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
