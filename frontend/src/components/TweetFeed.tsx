import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TweetCard } from './TweetCard';

interface Tweet {
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
}

interface TweetFeedProps {
  searchQuery: string;
  activeFilter: string;
}

// Mock data generator
const generateMockTweets = (count: number, filter?: string): Tweet[] => {
  const authors = [
    'Vitalik Buterin', 'Uniswap Labs', 'Polygon', 'Aave', 'Optimism', 
    'ENS', 'Arbitrum', 'Starknet', 'Base', 'zkSync'
  ];
  
  const categories = ['defi', 'dao', 'eth2', 'layer2', 'hackathons', 'jobs'];
  const contents = [
    'Excited to see the progress on Ethereum 2.0! The merge is getting closer and the ecosystem is growing stronger every day. 🚀',
    'New Uniswap v4 features are now live! Experience the future of decentralized trading with concentrated liquidity and hooks. 📈',
    'Polygon zkEVM is now fully compatible with Ethereum! Developers can now build with zero-knowledge proofs seamlessly. 🔥',
    'Aave v3 is now live on Ethereum mainnet! Experience improved capital efficiency and cross-chain functionality. 💎',
    'OP Stack is revolutionizing how we build Layer 2s. The future of Ethereum scaling is modular and collaborative! 🚀',
    'ENS is now integrated with more than 500 applications! Your .eth name is your identity across the entire web3 ecosystem. 🌐',
    'Arbitrum One is now processing over 1M transactions daily! The future of Ethereum scaling is here. 📊',
    'Starknet is bringing Cairo to the masses! Zero-knowledge proofs are the future of blockchain scalability. ⚡',
    'Base is now live on mainnet! Coinbase\'s L2 is bringing the next billion users to crypto. 🌍',
    'zkSync Era is revolutionizing Ethereum scaling with zero-knowledge rollups! 🚀'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    author: authors[Math.floor(Math.random() * authors.length)],
    handle: `@${authors[Math.floor(Math.random() * authors.length)].toLowerCase().replace(/\s+/g, '')}`,
    content: contents[Math.floor(Math.random() * contents.length)],
    timestamp: `${Math.floor(Math.random() * 24)}h ago`,
    likes: Math.floor(Math.random() * 2000) + 100,
    retweets: Math.floor(Math.random() * 500) + 10,
    replies: Math.floor(Math.random() * 100) + 5,
    category: filter && filter !== 'all' ? filter : categories[Math.floor(Math.random() * categories.length)],
    url: Math.random() > 0.5 ? 'https://twitter.com' : undefined
  }));
};

export const TweetFeed = ({ searchQuery, activeFilter }: TweetFeedProps) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load initial tweets
  useEffect(() => {
    setTweets([]);
    setPage(1);
    setHasMore(true);
    loadTweets();
  }, [searchQuery, activeFilter]);

  const loadTweets = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTweets = generateMockTweets(10, activeFilter === 'all' ? undefined : activeFilter);
    
    // Filter by search query if provided
    const filteredTweets = searchQuery 
      ? newTweets.filter(tweet => 
          tweet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tweet.author.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : newTweets;
    
    setTweets(prev => [...prev, ...filteredTweets]);
    setPage(prev => prev + 1);
    setHasMore(filteredTweets.length === 10);
    setLoading(false);
  }, [searchQuery, activeFilter, loading, hasMore]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadTweets();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadTweets]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <AnimatePresence mode="wait">
        {tweets.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 sm:py-20"
          >
            <p className="text-gray-500 text-base sm:text-lg">
              {searchQuery ? `No tweets found for "${searchQuery}"` : 'No tweets available'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-6 sm:py-8"
        >
          <div className="loading-spinner" />
        </motion.div>
      )}

      {/* End of feed */}
      {!hasMore && tweets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 sm:py-8"
        >
          <p className="text-gray-500 text-sm sm:text-base">You've reached the end of the feed</p>
        </motion.div>
      )}
    </div>
  );
}; 