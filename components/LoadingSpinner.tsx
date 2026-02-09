import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-app-darker">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-app-accent/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-app-accent rounded-full animate-spin border-t-transparent"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
