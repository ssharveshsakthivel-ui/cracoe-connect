import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const GlassCard = ({ children, className, hoverEffect = true, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={hoverEffect ? { scale: 1.02, translateY: -5 } : {}}
            className={clsx(
                'glass-panel rounded-2xl p-6 relative overflow-hidden',
                'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-500',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
