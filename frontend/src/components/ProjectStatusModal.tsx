import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Heart, DollarSign } from 'lucide-react';

interface ProjectStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectStatusModal = ({ isOpen, onClose }: ProjectStatusModalProps) => {
  const handleEmailContact = () => {
    window.open('mailto:hello@collinsadi.xyz?subject=Twether Project Support', '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-black border border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/20 rounded-full">
                    <Heart className="w-5 h-5 text-orange-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Project Status</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                    <DollarSign className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    Project Temporarily On Hold
                  </h3>
                </div>

                <div className="space-y-4 text-gray-300">
                  <p className="text-sm sm:text-base leading-relaxed">
                    Unfortunately, Twether has become quite expensive to operate without funding or external support. 
                    The costs for API tokens and AI processing have grown beyond what can be sustained independently.
                  </p>
                  
                  <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-800">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-orange-400" />
                      Main Cost Factors:
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-400">
                      <li>• Twitter API access and rate limits</li>
                      <li>• AI model processing (GPT/Gemini tokens)</li>
                      <li>• Server infrastructure and hosting</li>
                      <li>• Real-time data processing costs</li>
                    </ul>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed">
                    If you're interested in supporting this project and helping bring it back online, 
                    please don't hesitate to reach out. Any form of support, collaboration, or sponsorship 
                    would be greatly appreciated!
                  </p>
                </div>

                {/* Contact Button */}
                <div className="pt-4">
                  <motion.button
                    onClick={handleEmailContact}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-black font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 shadow-lg text-sm sm:text-base"
                  >
                    <Mail className="w-5 h-5 text-black" />
                    <span>Contact Developer</span>
                  </motion.button>
                  <p className="text-center text-sm text-gray-400 mt-2">
                    hello@collinsadi.xyz
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
