import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Flag,
  Share,
  Heart,
  User,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useIssue } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';

const IssueDetailPage = () => {
  const { id } = useParams();
  const { getIssueById, flagIssue, followIssue, unfollowIssue } = useIssue();
  const { user } = useAuth();
  const issue = getIssueById(id);

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return <AlertCircle size={16} className="text-danger-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-warning-600" />;
      case 'resolved':
        return <CheckCircle size={16} className="text-success-600" />;
      default:
        return <AlertCircle size={16} className="text-secondary-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return 'bg-danger-100 text-danger-800';
      case 'in_progress':
        return 'bg-warning-100 text-warning-800';
      case 'resolved':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'roads':
        return 'text-issue-roads';
      case 'lighting':
        return 'text-issue-lighting';
      case 'water':
        return 'text-issue-water';
      case 'cleanliness':
        return 'text-issue-cleanliness';
      case 'safety':
        return 'text-issue-safety';
      case 'obstructions':
        return 'text-issue-obstructions';
      default:
        return 'text-secondary-600';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'roads':
        return 'Roads';
      case 'lighting':
        return 'Lighting';
      case 'water':
        return 'Water Supply';
      case 'cleanliness':
        return 'Cleanliness';
      case 'safety':
        return 'Public Safety';
      case 'obstructions':
        return 'Obstructions';
      default:
        return category;
    }
  };

  const handleFlag = async () => {
    const reason = prompt('Please specify a reason for flagging this issue:');
    if (reason) {
      await flagIssue(issue._id, reason);
    }
  };

  const handleFollow = async () => {
    if (issue.isFollowing) {
      await unfollowIssue(issue._id);
    } else {
      await followIssue(issue._id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-2">
              {getStatusIcon(issue.status)}
              <span className={`badge ${getStatusColor(issue.status)}`}>
                {issue.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            {issue.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-secondary-600">
            <span className={`font-medium ${getCategoryColor(issue.category)}`}>
              {getCategoryLabel(issue.category)}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
            {!issue.anonymous && issue.reporter && (
              <>
                <span>•</span>
                <span>by {issue.reporter.name}</span>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Description
              </h2>
              <p className="text-secondary-700 leading-relaxed">
                {issue.description}
              </p>
            </motion.div>

            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <motion.div
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Photos ({issue.images.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issue.images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Issue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            {issue.timeline && issue.timeline.length > 0 && (
              <motion.div
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Timeline
                </h2>
                <div className="space-y-4">
                  {issue.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-secondary-900">
                          {event.status}
                        </div>
                        <div className="text-xs text-secondary-500">
                          {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                        </div>
                        {event.comment && (
                          <div className="text-sm text-secondary-600 mt-1">
                            {event.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-semibold text-secondary-900 mb-3">Location</h3>
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <MapPin size={16} />
                <span>{issue.location?.address || 'Location not specified'}</span>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-semibold text-secondary-900 mb-3">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleFollow}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    issue.isFollowing
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  <Heart size={16} className={issue.isFollowing ? 'fill-current' : ''} />
                  <span>{issue.isFollowing ? 'Following' : 'Follow'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-colors"
                >
                  <Share size={16} />
                  <span>Share</span>
                </button>
                
                <button
                  onClick={handleFlag}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm bg-danger-100 text-danger-700 hover:bg-danger-200 transition-colors"
                >
                  <Flag size={16} />
                  <span>Flag Issue</span>
                </button>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="font-semibold text-secondary-900 mb-3">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Status:</span>
                  <span className={`font-medium ${getStatusColor(issue.status)}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Category:</span>
                  <span className={`font-medium ${getCategoryColor(issue.category)}`}>
                    {getCategoryLabel(issue.category)}
                  </span>
                </div>
                {issue.severity && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Severity:</span>
                    <span className="font-medium text-secondary-900">
                      {issue.severity}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-secondary-600">Reported:</span>
                  <span className="font-medium text-secondary-900">
                    {format(new Date(issue.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                {issue.followers && issue.followers.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Followers:</span>
                    <span className="font-medium text-secondary-900">
                      {issue.followers.length}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage; 