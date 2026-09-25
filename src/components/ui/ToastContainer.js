import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataStore } from '../../store/dataStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const toasts = useDataStore((state) => state.toasts);
  const removeToast = useDataStore((state) => state.removeToast);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-400" size={20} />;
      case 'error': return <AlertCircle className="text-red-400" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{toast.title}</h4>
                {toast.description && (
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{toast.description}</p>
                )}
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {/* Progress bar effect */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 4, ease: "linear" }}
              className={`h-1 ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-primary'}`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
