import { useState, useEffect } from "react";
import { FileText, Folder, ChevronRight, Download, Eye, ArrowLeft } from "lucide-react";

const RepoFiles = ({ repo, token, onBack }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    if (repo && token) {
      fetchFiles("");
    }
  }, [repo, token]);

  const fetchFiles = async (path) => {
    setLoading(true);
    try {
      const [owner, repoName] = repo.full_name.split("/");
      const response = await fetch(
        `http://localhost:5000/github/repo-files?owner=${owner}&repo=${repoName}&path=${path}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        setCurrentPath(path);
        
        // Update breadcrumbs
        if (path === "") {
          setBreadcrumbs([{ name: repoName, path: "" }]);
        } else {
          const pathParts = path.split("/");
          const breadcrumbItems = [{ name: repoName, path: "" }];
          let currentPathPart = "";
          pathParts.forEach((part) => {
            currentPathPart += (currentPathPart ? "/" : "") + part;
            breadcrumbItems.push({ name: part, path: currentPathPart });
          });
          setBreadcrumbs(breadcrumbItems);
        }
      } else {
        console.error("Failed to fetch files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (file) => {
    try {
      const [owner, repoName] = repo.full_name.split("/");
      const response = await fetch(
        `http://localhost:5000/github/file-content?owner=${owner}&repo=${repoName}&path=${file.path}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content);
        setSelectedFile(file);
      } else {
        console.error("Failed to fetch file content");
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  const handleFileClick = (file) => {
    if (file.type === "dir") {
      fetchFiles(file.path);
    } else {
      fetchFileContent(file);
    }
  };

  const handleBreadcrumbClick = (breadcrumb) => {
    fetchFiles(breadcrumb.path);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type === "dir") {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading files...</span>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setSelectedFile(null)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
              <p className="text-sm text-gray-500">{selectedFile.path}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{formatFileSize(selectedFile.size)}</span>
            <a
              href={selectedFile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{fileContent}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <FileText className="w-6 h-6 mr-3 text-gray-700" />
            Repository Files
          </h3>
          <p className="text-gray-600">{repo.full_name}</p>
        </div>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Repositories
        </button>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.path} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />}
              <button
                onClick={() => handleBreadcrumbClick(breadcrumb)}
                className={`text-sm hover:text-blue-600 transition-colors ${
                  index === breadcrumbs.length - 1 ? "font-semibold" : ""
                }`}
              >
                {breadcrumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Files List */}
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.path}
            onClick={() => handleFileClick(file)}
            className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center flex-1">
              <div className="mr-3">{getFileIcon(file)}</div>
              <div>
                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {file.name}
                </div>
                <div className="text-sm text-gray-500">{file.path}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {file.type === "file" && (
                <span>{formatFileSize(file.size)}</span>
              )}
              {file.type === "file" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchFileContent(file);
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="View content"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No files found in this directory.
        </div>
      )}
    </div>
  );
};

export default RepoFiles; 