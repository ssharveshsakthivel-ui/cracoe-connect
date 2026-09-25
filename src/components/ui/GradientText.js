import React from 'react';
import clsx from 'clsx';

const GradientText = ({ children, className }) => {
    return (
        <span className={clsx('bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary animate-pulse-glow', className)}>
            {children}
        </span>
    );
};

export default GradientText;
