import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastContainer({ toasts }) {
  if (!toasts) return null;

  return (
    <div className="cyber-toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <motion.div 
            key={t.id} 
            layout
            initial={{ x: 80, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="cyber-toast"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
