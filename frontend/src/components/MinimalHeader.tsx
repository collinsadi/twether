import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Wifi, WifiOff } from 'lucide-react';
import { FaFeatherAlt } from "react-icons/fa";
import { apiService } from '../services/api';
import { socketService } from '../services/socket';

interface MinimalHeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

interface Filter {
  id: string;
  label: string;
}

export const MinimalHeader = ({ onSearch, onFilterChange, activeFilter }: MinimalHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([
    { id: 'all', label: 'All' }
  ]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        const response = await apiService.getTopics();
        if (response.success && response.data.length > 0) {
          const topicFilters = response.data.map(topic => ({
            id: topic,
            label: topic.charAt(0).toUpperCase() + topic.slice(1)
          }));
          setFilters([
            { id: 'all', label: 'All' },
            ...topicFilters.slice(0, 10) // Limit to first 10 topics
          ]);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        // Fallback to default filters if API fails
        setFilters([
          { id: 'all', label: 'All' },
          { id: 'defi', label: 'DeFi' },
          { id: 'dao', label: 'DAOs' },
          { id: 'eth2', label: 'ETH2.0' },
          { id: 'layer2', label: 'Layer2' },
          { id: 'hackathons', label: 'Hackathons' },
          { id: 'jobs', label: 'Jobs' }
        ]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  // Monitor Socket.IO connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    // Check initial connection status
    checkConnection();

    // Set up interval to check connection status
    const interval = setInterval(checkConnection, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Logo and Search */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center">
              <FaFeatherAlt className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold">Twether</span>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-sm sm:max-w-md mx-3 sm:mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tweets..."
                className="search-input w-full pl-10 pr-10 text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="filter-button flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </motion.button>
        </div>

        {/* Filters */}
        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap gap-2 pb-3 sm:pb-4">
            {loadingTopics ? (
              <div className="text-gray-500 text-sm">Loading topics...</div>
            ) : (
              filters.map((filter) => (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onFilterChange(filter.id)}
                  className={`filter-button text-xs sm:text-sm px-3 sm:px-4 py-2 ${
                    activeFilter === filter.id ? 'filter-button-active' : ''
                  }`}
                >
                  {filter.label}
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}; 