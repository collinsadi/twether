import { motion } from 'framer-motion';
import { Heart, Twitter } from 'lucide-react';

export const MinimalFooter = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/5 z-40"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
          <span>created with</span>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current" />
          <span>collinsadi</span>
          <span className="hidden sm:inline">•</span>
          <motion.a
            href="https://twitter.com/collinsadi"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            className="flex items-center space-x-1 text-gray-500 hover:text-white transition-colors"
          >
            <Twitter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">@collinsadi</span>
          </motion.a>
        </div>
      </div>
    </motion.footer>
  );
}; 