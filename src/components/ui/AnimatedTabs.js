import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const AnimatedTabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex space-x-2 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={clsx(
                        'relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2',
                        activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white'
                    )}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default AnimatedTabs;
