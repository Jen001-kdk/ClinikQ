import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

const ErrorToast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[16px] shadow-[0_10px_30px_rgba(220,38,38,0.1)] overflow-hidden"
        >
          {/* Animated red side accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#DC2626]"></div>
          
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#DC2626]/10 text-[#DC2626]">
            <FaExclamationCircle size={18} />
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-black text-[#991B1B] uppercase tracking-widest leading-none mb-0.5">
              Authentication Failed
            </span>
            <span className="text-[13px] font-bold text-[#DC2626]">
              {message || 'Please check your credentials.'}
            </span>
          </div>

          <button 
            onClick={onClose}
            className="ml-4 p-1 rounded-full hover:bg-black/5 text-[#991B1B]/50 hover:text-[#991B1B] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;
