import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TweetCard } from "./TweetCard";
import { TweetSkeletonGrid } from "./TweetSkeleton";
import { apiService } from "../services/api";
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
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Load initial tweets
  useEffect(() => {
    setTweets([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    setError(null);
    loadTweets();
  }, [searchQuery, activeFilter]);

  const loadTweets = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getTweets(page, 20, activeFilter);

      if (response.success) {
        const newTweets = response.data.tweets;

        // Filter by search query if provided
        const filteredTweets = searchQuery
          ? newTweets.filter(
              (tweet) =>
                tweet.tweetText
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                tweet.authorName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                tweet.username.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : newTweets;

        setTweets((prev) => [...prev, ...filteredTweets]);
        setPage((prev) => prev + 1);
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
  }, [searchQuery, activeFilter, loading, hasMore, page]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadTweets();
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
                setPage(1);
                setHasMore(true);
                setInitialLoading(true);
                loadTweets();
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
