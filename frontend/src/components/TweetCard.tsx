import { motion } from 'framer-motion';
import { Eye, Play, CheckCircle } from 'lucide-react';
import type { Tweet } from '../services/api';

interface TweetCardProps {
  tweet: Tweet;
}

export const TweetCard = ({ tweet }: TweetCardProps) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const truncateText = (text: string) => {
    // Use longer limit for tweets without media, shorter for tweets with media
    const maxLength = tweet.mediaPreviewUrl ? 200 : 450;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isVideo = tweet.mediaType === 'video' || tweet.mediaType === 'animated_gif';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-black border border-white/5 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.02] h-fit"
    >
      {/* Tweet Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          {/* Profile Picture */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
            <img
              src={tweet.profilePicture}
              alt={`${tweet.authorName}'s profile`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg">
                    ${tweet.authorName.charAt(0)}
                  </div>
                `;
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2 flex-wrap">
              <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                {tweet.authorName}
              </h3>
              
              {/* Verified Badge */}
              {tweet.isVerified && (
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white flex-shrink-0" />
              )}
              
              <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">
                @{tweet.username}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">•</span>
              <span className="text-gray-500 text-xs sm:text-sm">
                {formatTimestamp(tweet.createdAt)}
              </span>
            </div>
            
            {/* Topics */}
            {tweet.topics && tweet.topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tweet.topics.slice(0, 2).map((topic, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 sm:px-3 py-1 bg-white/5 text-white/70 text-xs rounded-full border border-white/10"
                  >
                    {topic}
                  </span>
                ))}
                {tweet.topics.length > 2 && (
                  <span className="inline-block px-2 sm:px-3 py-1 bg-white/5 text-white/50 text-xs rounded-full border border-white/10">
                    +{tweet.topics.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center ml-2">
          <motion.a
            href={tweet.tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            className="text-gray-500 hover:text-white transition-colors p-1 sm:p-2 rounded-full hover:bg-white/5 flex items-center space-x-1"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm hidden sm:inline">View</span>
          </motion.a>
        </div>
      </div>

      {/* Tweet Content */}
      <p className="text-white leading-relaxed mb-4 text-sm sm:text-base">
        {truncateText(tweet.tweetText)}
      </p>

      {/* Media Preview */}
      {tweet.mediaPreviewUrl && (
        <div className="mb-4">
          <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10">
            <img
              src={tweet.mediaPreviewUrl}
              alt="Tweet media"
              className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            {/* Play Button for Videos */}
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 sm:p-4">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      )}

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}; 