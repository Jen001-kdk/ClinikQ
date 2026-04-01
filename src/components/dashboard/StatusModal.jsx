import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";

/**
 * A premium, smooth status modal for ClinikQ.
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Modal heading
 * @param {string} message - Main body text
 * @param {string} type - 'error' | 'success' | 'info' | 'warning'
 */
const StatusModal = ({ isOpen, onClose, title, message, type = 'error' }) => {
  const configs = {
    error: {
      icon: <AlertCircle size={28} className="text-white" />,
      gradient: "from-rose-500 to-rose-600",
      shadow: "shadow-rose-500/20",
      bgLight: "bg-rose-50/50",
      textColor: "text-rose-600",
      btnBg: "bg-rose-600 hover:bg-rose-700",
      borderColor: "border-rose-100"
    },
    success: {
      icon: <CheckCircle2 size={28} className="text-white" />,
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/20",
      bgLight: "bg-emerald-50/50",
      textColor: "text-emerald-600",
      btnBg: "bg-emerald-600 hover:bg-emerald-700",
      borderColor: "border-emerald-100"
    },
    warning: {
      icon: <AlertCircle size={28} className="text-white" />,
      gradient: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-500/20",
      bgLight: "bg-amber-50/50",
      textColor: "text-amber-600",
      btnBg: "bg-amber-600 hover:bg-amber-700",
      borderColor: "border-amber-100"
    },
    info: {
      icon: <Info size={28} className="text-white" />,
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
      bgLight: "bg-blue-50/50",
      textColor: "text-blue-600",
      btnBg: "bg-blue-600 hover:bg-blue-700",
      borderColor: "border-blue-100"
    }
  };

  const config = configs[type] || configs.error;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white w-full max-w-[440px] rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/20 z-10"
          >
            {/* Top Illustration/Icon Section */}
            <div className={`h-32 bg-gradient-to-br ${config.gradient} relative flex items-center justify-center overflow-hidden`}>
               {/* Decorative Circles */}
               <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
               <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/5 rounded-full blur-xl" />
               
               <motion.div 
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 0.1, duration: 0.4 }}
                 className="relative w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white/20"
               >
                 {config.icon}
               </motion.div>
            </div>

            {/* Content Section */}
            <div className="p-8 text-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                {title}
              </h3>
              <p className="text-slate-500 font-semibold leading-relaxed mb-8 px-2 text-[15px]">
                {message}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className={`w-full py-4 ${config.btnBg} text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg ${config.shadow} transition-all active:scale-95 flex items-center justify-center gap-2 group`}
                >
                  Confirm Action
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-3 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Subtle Security/Brand Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                 ClinikQ Security System
               </p>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;
