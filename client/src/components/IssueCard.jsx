import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Flag,
  Eye,
  Calendar,
  Navigation
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const IssueCard = ({ issue }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      case 'in_progress':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'resolved':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reported':
        return 'Reported';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'roads':
        return 'bg-orange-500';
      case 'lighting':
        return 'bg-yellow-500';
      case 'water':
        return 'bg-blue-500';
      case 'cleanliness':
        return 'bg-brown-500';
      case 'safety':
        return 'bg-red-500';
      case 'obstructions':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'roads':
        return 'Road';
      case 'lighting':
        return 'Streetlights';
      case 'water':
        return 'Water';
      case 'cleanliness':
        return 'Garbage Collection';
      case 'safety':
        return 'Safety';
      case 'obstructions':
        return 'Obstructions';
      default:
        return category;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group hover:scale-105 overflow-hidden"
      whileHover={{ y: -5 }}
    >
      {/* Image */}
      {issue.images && issue.images.length > 0 && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={issue.images[0]}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category Tag */}
        <div className="flex items-center justify-between mb-3">
          <span className={`${getCategoryColor(issue.category)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
            {getCategoryLabel(issue.category)}
          </span>
        </div>

        {/* Status and Date */}
        <div className="flex items-center space-x-2 mb-3">
          {getStatusIcon(issue.status)}
          <span className="text-sm text-gray-600">
            {getStatusText(issue.status)} {formatDate(issue.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {issue.description}
        </p>

        {/* Distance */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Navigation size={14} />
            <span>2.8 km</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <MapPin size={14} />
          <span className="truncate">
            {issue.location?.address || 'Location not specified'}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>
              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
            </span>
            {issue.reporter && !issue.anonymous && (
              <span>by {issue.reporter.name}</span>
            )}
          </div>
          
          <Link
            to={`/issue/${issue._id}`}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium group-hover:underline"
          >
            <Eye size={12} />
            <span>View</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default IssueCard; 