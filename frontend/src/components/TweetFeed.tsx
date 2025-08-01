import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TweetCard } from "./TweetCard";
import { TweetSkeletonGrid } from "./TweetSkeleton";
import { apiService } from "../services/api";
import { socketService } from "../services/socket";
import type { Tweet } from "../services/api";

interface TweetFeedProps {
  searchQuery: string;
  activeFilter: string;
}

export const TweetFeed = ({ searchQuery, activeFilter }: TweetFeedProps) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTweetNotification, setNewTweetNotification] = useState<string | null>(null);
  
  // Use refs to track current state without causing re-renders
  const currentPageRef = useRef(1);
  const currentFilterRef = useRef(activeFilter);
  const currentSearchRef = useRef(searchQuery);

  // Connect to Socket.IO for real-time updates
  useEffect(() => {
    socketService.connect();

    // Listen for new tweets
    const handleNewTweet = (newTweet: Tweet) => {
      // Check if the tweet matches current filters
      const matchesSearch = !currentSearchRef.current || 
        newTweet.tweetText.toLowerCase().includes(currentSearchRef.current.toLowerCase()) ||
        newTweet.authorName.toLowerCase().includes(currentSearchRef.current.toLowerCase()) ||
        newTweet.username.toLowerCase().includes(currentSearchRef.current.toLowerCase());
      
      const matchesFilter = currentFilterRef.current === 'all' || 
        newTweet.topics.includes(currentFilterRef.current);

      if (matchesSearch && matchesFilter) {
        // Add new tweet to the beginning of the list
        setTweets(prev => [newTweet, ...prev]);
        
        // Show notification
        setNewTweetNotification(`New tweet from @${newTweet.username}`);
        setTimeout(() => setNewTweetNotification(null), 3000);
      }
    };

    socketService.on('newTweet', handleNewTweet);

    return () => {
      socketService.off('newTweet', handleNewTweet);
    };
  }, []);

  // Reset pagination when filters or search change
  useEffect(() => {
    setTweets([]);
    currentPageRef.current = 1;
    setHasMore(true);
    setInitialLoading(true);
    setError(null);
    currentFilterRef.current = activeFilter;
    currentSearchRef.current = searchQuery;
    
    // Load initial tweets
    loadTweets(true);
  }, [searchQuery, activeFilter]);

  const loadTweets = useCallback(async (isInitialLoad = false) => {
    if (loading || (!hasMore && !isInitialLoad)) return;

    setLoading(true);
    setError(null);

    try {
      const currentPage = isInitialLoad ? 1 : currentPageRef.current;
      console.log('🔄 Loading tweets:', {
        page: currentPage,
        filter: currentFilterRef.current,
        search: currentSearchRef.current,
        isInitialLoad
      });
      
      const response = await apiService.getTweets(currentPage, 20, currentFilterRef.current);

      console.log('📡 API Response:', response);

      if (response.success) {
        const newTweets = response.data.tweets;

        // Filter by search query on client side since backend doesn't support search
        const filteredTweets = currentSearchRef.current
          ? newTweets.filter(
              (tweet) =>
                tweet.tweetText
                  .toLowerCase()
                  .includes(currentSearchRef.current.toLowerCase()) ||
                tweet.authorName
                  .toLowerCase()
                  .includes(currentSearchRef.current.toLowerCase()) ||
                tweet.username.toLowerCase().includes(currentSearchRef.current.toLowerCase())
            )
          : newTweets;

        if (isInitialLoad) {
          setTweets(filteredTweets);
          currentPageRef.current = 2;
        } else {
          setTweets((prev) => [...prev, ...filteredTweets]);
          currentPageRef.current = currentPage + 1;
        }
        
        setHasMore(response.data.pagination.hasNextPage);
      } else {
        setError(response.message || "Failed to load tweets");
      }
    } catch (error) {
      console.error("Error loading tweets:", error);
      setError("Failed to load tweets. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading, hasMore]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadTweets(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadTweets]);

  // Show skeleton loader for initial load
  if (initialLoading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <TweetSkeletonGrid count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Real-time notification */}
      <AnimatePresence>
        {newTweetNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm text-center"
          >
            🎉 {newTweetNotification}
          </motion.div>
        )}
      </AnimatePresence>



      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 sm:py-20"
          >
            <p className="text-red-400 text-base sm:text-lg mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setTweets([]);
                currentPageRef.current = 1;
                setHasMore(true);
                setInitialLoading(true);
                loadTweets(true);
              }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : tweets.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 sm:py-20"
          >
            <p className="text-gray-500 text-base sm:text-lg">
              {searchQuery
                ? `No tweets found for "${searchQuery}"`
                : activeFilter !== 'all' 
                  ? `No tweets found for topic "${activeFilter}"`
                  : "No tweets available"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {tweets.map((tweet) => (
              <TweetCard key={tweet._id} tweet={tweet} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Loading indicator for more tweets */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-6 sm:py-8"
        >
          <TweetSkeletonGrid count={4} />
        </motion.div>
      )}

      {/* End of feed */}
      {!hasMore && tweets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 sm:py-8"
        >
          <p className="text-gray-500 text-sm sm:text-base">
            You've reached the end of the feed
          </p>
        </motion.div>
      )}
    </div>
  );
};
