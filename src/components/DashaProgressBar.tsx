import React from 'react';

interface DashaProgressBarProps {
    startDate: Date;
    endDate: Date;
    currentDate?: Date;
    showPercentage?: boolean;
    showMarker?: boolean;
}

const DashaProgressBar: React.FC<DashaProgressBarProps> = ({
    startDate,
    endDate,
    currentDate = new Date(),
    showPercentage = true,
    showMarker = true
}) => {
    // Calculate progress percentage
    const calculateProgress = () => {
        const start = startDate.getTime();
        const end = endDate.getTime();
        const current = currentDate.getTime();

        if (current < start) return 0;
        if (current > end) return 100;

        const total = end - start;
        const elapsed = current - start;
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    const progress = calculateProgress();
    const isActive = progress > 0 && progress < 100;

    // Color based on progress
    const getBarColor = () => {
        if (progress < 30) return 'from-green-500 to-green-600';
        if (progress < 70) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    return (
        <div className="w-full space-y-1">
            <div className="relative w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                {/* Progress Fill */}
                <div
                    className={`h-full bg-gradient-to-r ${isActive ? getBarColor() : 'from-slate-600 to-slate-700'} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                />

                {/* Current Position Marker */}
                {showMarker && isActive && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-purple-500 animate-pulse"
                        style={{ left: `calc(${progress}% - 6px)` }}
                    />
                )}
            </div>

            {/* Percentage and "You are here" text */}
            {showPercentage && isActive && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                        {progress.toFixed(0)}% complete
                    </span>
                    {showMarker && (
                        <span className="text-purple-400 flex items-center gap-1">
                            <span>↑</span> You are here
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashaProgressBar;
