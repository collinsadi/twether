import { motion } from 'framer-motion';

export const TweetSkeleton = () => {
  return (
    <div className="bg-black border border-white/5 rounded-2xl p-4 sm:p-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <div className="h-4 sm:h-5 bg-white/5 rounded w-24 animate-pulse" />
              <div className="h-3 sm:h-4 bg-white/5 rounded w-16 animate-pulse hidden sm:block" />
              <div className="h-3 sm:h-4 bg-white/5 rounded w-1 animate-pulse hidden sm:block" />
              <div className="h-3 sm:h-4 bg-white/5 rounded w-12 animate-pulse" />
            </div>
            <div className="h-5 bg-white/5 rounded w-16 animate-pulse" />
          </div>
        </div>
        
        <div className="w-8 h-8 bg-white/5 rounded-full animate-pulse ml-2" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-4/6 animate-pulse" />
      </div>

      {/* Image Skeleton */}
      <div className="mb-4">
        <div className="w-full h-48 sm:h-56 bg-white/5 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

export const TweetSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <TweetSkeleton />
        </motion.div>
      ))}
    </div>
  );
}; 