import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface TweetCardProps {
  tweet: {
    id: number;
    author: string;
    handle: string;
    content: string;
    timestamp: string;
    likes: number;
    retweets: number;
    replies: number;
    category: string;
    url?: string;
  };
}

export const TweetCard = ({ tweet }: TweetCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-black border border-white/5 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.02]"
    >
      {/* Tweet Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-lg flex-shrink-0">
            {tweet.author.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2 flex-wrap">
              <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                {tweet.author}
              </h3>
              <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">
                {tweet.handle}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">•</span>
              <span className="text-gray-500 text-xs sm:text-sm">
                {tweet.timestamp}
              </span>
            </div>
            <span className="inline-block px-2 sm:px-3 py-1 bg-white/5 text-white/70 text-xs rounded-full border border-white/10">
              {tweet.category}
            </span>
          </div>
        </div>
        
        <div className="flex items-center ml-2">
          {tweet.url && (
            <motion.a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="text-gray-500 hover:text-white transition-colors p-1 sm:p-2 rounded-full hover:bg-white/5 flex items-center space-x-1"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">View</span>
            </motion.a>
          )}
        </div>
      </div>

      {/* Tweet Content */}
      <p className="text-white leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
        {tweet.content}
      </p>

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}; 