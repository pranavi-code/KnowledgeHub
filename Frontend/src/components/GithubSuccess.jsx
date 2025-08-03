import { CheckCircle, GitBranch, Github, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RepoFiles from "./RepoFiles";

const GithubSuccess = () => {
  const params = new URLSearchParams(useLocation().search);
  const count = params.get("count");
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showFiles, setShowFiles] = useState(false);

  const token =
    new URLSearchParams(window.location.search).get("token") ||
    localStorage.getItem("githubToken");

  useEffect(() => {
    if (token) {
      localStorage.setItem("githubToken", token);
      fetch("http://localhost:5000/github/repos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setRepos(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Repo fetch error:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleSelectRepo = (repo) => {
    setSelectedRepo(repo);
    localStorage.setItem("selectedRepo", repo.full_name);
    localStorage.setItem("selectedRepoData", JSON.stringify(repo));
  };

  const handleConfirmSelection = () => {
    if (selectedRepo) {
      // Save selected repo for app use
      localStorage.setItem("selectedRepo", selectedRepo.full_name);
      localStorage.setItem("selectedRepoData", JSON.stringify(selectedRepo));
      setShowFiles(true);
    }
  };

  const handleBackToRepos = () => {
    setShowFiles(false);
    setSelectedRepo(null);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100">
        <div className="p-8 rounded-xl bg-white/80 text-center border shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading repositories...</p>
        </div>
      </div>
    );
  }

  // Show files if a repository is selected and confirmed
  if (showFiles && selectedRepo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <RepoFiles 
            repo={selectedRepo} 
            token={token} 
            onBack={handleBackToRepos}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Success Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border text-center mb-10 shadow">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">GitHub Sync Successful!</h1>
          <p className="text-gray-700 text-lg mb-1">{count} repositories synced from GitHub.</p>
          <p className="text-sm text-gray-500">Select a repository to associate with your app.</p>
        </div>

        {/* Repositories */}
        <div className="bg-white/90 rounded-xl p-6 border shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <Github className="w-5 h-5 mr-2" />
              Your GitHub Repositories
            </h2>
            <button
              onClick={handleGoToDashboard}
              className="text-blue-600 font-medium hover:underline"
            >
              Skip & Go to Dashboard
            </button>
          </div>

          {repos.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No repositories found.</p>
          ) : (
            <div className="grid gap-4">
              {repos.map((repo) => (
                <div
                  key={repo.full_name}
                  className={`p-5 rounded-xl border-2 transition cursor-pointer hover:shadow ${
                    selectedRepo?.full_name === repo.full_name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectRepo(repo)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-lg text-gray-900 mr-3">
                          {repo.full_name}
                        </h3>
                        {repo.private && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                            Private
                          </span>
                        )}
                        {selectedRepo?.full_name === repo.full_name && (
                          <CheckCircle className="ml-2 w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-gray-600 text-sm mb-2">{repo.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {repo.stargazers_count || 0}
                        </div>
                        <div className="flex items-center">
                          <GitBranch className="w-4 h-4 mr-1" />
                          {repo.forks_count || 0}
                        </div>
                        <span>
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className={`ml-6 px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedRepo?.full_name === repo.full_name
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRepo(repo);
                      }}
                    >
                      {selectedRepo?.full_name === repo.full_name ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Confirmation */}
          {selectedRepo && (
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
              <div>
                <h3 className="text-blue-900 font-semibold mb-1">
                  Selected Repository
                </h3>
                <p className="text-blue-700 text-sm">{selectedRepo.full_name}</p>
              </div>
              <button
                onClick={handleConfirmSelection}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Use This Repository
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GithubSuccess; 