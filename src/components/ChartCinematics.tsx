import React from 'react';
import { motion } from 'framer-motion';

interface ChartCinematicsProps {
    stage: string;
    aspects?: Array<{ fromIndex: number, toIndex: number, type: 'good' | 'bad' }>;
}

const ChartCinematics: React.FC<ChartCinematicsProps> = ({ stage, aspects = [] }) => {

    // Helper to get center of a cell (0-15 grid index) for aspects
    const getCellCenter = (index: number) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        return {
            x: col * 25 + 12.5,
            y: row * 25 + 12.5
        };
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <filter id="golden-glow">
                        <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Golden Grid Draw */}
                {(stage === 'grid-draw' || stage === 'lagna' || stage === 'planets' || stage === 'aspects' || stage === 'retro' || stage === '3d' || stage === 'complete') && (
                    <motion.path
                        d="M0,0 L100,0 L100,100 L0,100 Z M25,0 L25,25 L0,25 M75,0 L75,25 L100,25 M0,75 L25,75 L25,100 M75,100 L75,75 L100,75 M25,25 L75,25 L75,75 L25,75 Z M50,25 L50,75 M25,50 L75,50"
                        fill="none"
                        stroke="#f59e0b" // Amber-500
                        strokeWidth="0.8"
                        filter="url(#golden-glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                )}

                {/* Aspect Lines */}
                {stage === 'aspects' && aspects.map((aspect, i) => {
                    const start = getCellCenter(aspect.fromIndex);
                    const end = getCellCenter(aspect.toIndex);
                    const color = aspect.type === 'good' ? '#10b981' : '#f97316';

                    return (
                        <motion.path
                            key={`aspect-${i}`}
                            d={`M ${start.x} ${start.y} Q ${50} ${50} ${end.x} ${end.y}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="0.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 1, delay: i * 0.3 }}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default ChartCinematics;
