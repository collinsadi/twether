import { motion } from 'framer-motion';
import { AlertTriangle, Github, ExternalLink, Info } from 'lucide-react';
import { useState } from 'react';
import { ProjectStatusModal } from './ProjectStatusModal';

interface StatusBannerProps {
  status?: 'maintenance' | 'offline' | 'beta';
  message?: string;
  githubUrl?: string;
}

export const StatusBanner = ({ 
  status = 'maintenance', 
  message = 'Service temporarily unavailable. Check back soon!',
  githubUrl = 'https://github.com/collinsadi/twether'
}: StatusBannerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMaintenance = status === 'maintenance';
  const isOffline = status === 'offline';
  const isBeta = status === 'beta';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden ${
        isOffline
          ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-b border-red-500/30'
          : isMaintenance 
            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30'
            : isBeta
              ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-purple-500/30'
              : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-blue-500/30'
      }`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className={`flex items-center justify-center space-x-1 px-4 sm:px-2 py-2 sm:py-1 rounded-full text-xs font-medium w-28  ${
              isOffline
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : isMaintenance 
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : isBeta
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              <span className="hidden sm:inline">
                {isOffline ? 'OFFLINE' : isMaintenance ? 'MAINTENANCE' : isBeta ? 'BETA' : ''}
              </span>
              <span className="sm:hidden">
                {isOffline ? 'OFF' : isMaintenance ? 'MAINTENANCE' : isBeta ? 'BETA' : ''}
              </span>
            </div>
            
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className={`text-sm sm:text-base font-medium truncate ${
                isOffline ? 'text-red-200' : isMaintenance ? 'text-orange-200' : isBeta ? 'text-purple-200' : 'text-blue-200'
              }`}>
                {message}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isMaintenance && (
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30"
              >
                <Info className="w-4 h-4" />
                <span>Details</span>
              </motion.button>
            )}
            
            <motion.a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isOffline
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                  : isMaintenance 
                    ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30'
                    : isBeta
                      ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30'
              }`}
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Contribute</span>
              <span className="sm:hidden">Help</span>
              <ExternalLink className="w-3 h-3" />
            </motion.a>
          </div>
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 right-0 h-px ${
        isOffline
          ? 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent'
          : isMaintenance 
            ? 'bg-gradient-to-r from-transparent via-orange-500/50 to-transparent'
            : isBeta
              ? 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent'
              : 'bg-gradient-to-r from-transparent via-blue-500/50 to-transparent'
      }`}></div>
      
      <ProjectStatusModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </motion.div>
  );
}; 