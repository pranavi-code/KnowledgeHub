// src/components/NotFound.jsx
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100">
    <div className="text-center">
      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFound;