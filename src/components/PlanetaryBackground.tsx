import React, { useEffect, useRef } from 'react';

interface Planet {
    x: number;
    y: number;
    vx: number; // Velocity x
    vy: number; // Velocity y
    size: number;
    color: string;
    glowColor: string;
    hasRings?: boolean;
}

const COLORS = [
    '#FFD700', // Gold
    '#FF4500', // Red
    '#00FFFF', // Cyan
    '#008080', // Teal
    '#FF7F50', // Coral
    '#800080', // Purple
    '#FF69B4', // Pink
    '#ADD8E6', // Light Blue
    '#E3E0C0', // Saturn Beige
];

const PLANET_COUNT = 9;
const MIN_SIZE = 15;
const MAX_SIZE = 35;
const MIN_SPEED = 0.5;
const MAX_SPEED = 1.5;

const SaturnSVG = ({ size, color, glowColor }: { size: number, color: string, glowColor: string }) => {
    // Fixed coordinate system 100x100 for internal SVG logic
    const PLANET_R = 17;
    const RING_INNER = 22;
    const RING_OUTER = 40;
    const TILT = -25; // Degrees

    // Gradients
    const ringGradientId = `ringGrad-${Math.random().toString(36).substr(2, 9)}`;
    const planetGradientId = `planetGrad-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{ overflow: 'visible' }}
        >
            <defs>
                <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(197, 180, 140, 0)" />
                    <stop offset="20%" stopColor="rgba(197, 180, 140, 0.8)" />
                    <stop offset="40%" stopColor="rgba(180, 160, 120, 0.4)" />
                    <stop offset="60%" stopColor="rgba(197, 180, 140, 0.8)" />
                    <stop offset="100%" stopColor="rgba(197, 180, 140, 0)" />
                </linearGradient>
                <radialGradient id={planetGradientId} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="#000" />
                </radialGradient>
            </defs>

            {/* Transform Group for Rings: Flatten (Scale Y) then Rotate */}
            <g transform={`rotate(${TILT}, 50, 50)`}>
                <g transform="translate(50, 50) rotate(0) scale(1, 0.35)">
                    {/* BACK RING (Top Half: 180 to 360 deg) */}
                    <path
                        d={`M -${RING_OUTER} 0 A ${RING_OUTER} ${RING_OUTER} 0 0 1 ${RING_OUTER} 0 L ${RING_INNER} 0 A ${RING_INNER} ${RING_INNER} 0 0 0 -${RING_INNER} 0 Z`}
                        fill={`url(#${ringGradientId})`}
                        opacity="0.8"
                    />
                </g>
            </g>

            {/* PLANET BODY */}
            <circle
                cx="50"
                cy="50"
                r={PLANET_R}
                fill={`url(#${planetGradientId})`}
                filter={`drop-shadow(0 0 4px ${glowColor})`}
            />

            {/* FRONT RING (Bottom Half) */}
            <g transform={`rotate(${TILT}, 50, 50)`}>
                <g transform="translate(50, 50) scale(1, 0.35)">
                    {/* FRONT RING (Bottom Half: 0 to 180 deg) */}
                    <path
                        d={`M -${RING_OUTER} 0 A ${RING_OUTER} ${RING_OUTER} 0 0 0 ${RING_OUTER} 0 L ${RING_INNER} 0 A ${RING_INNER} ${RING_INNER} 0 0 1 -${RING_INNER} 0 Z`}
                        fill={`url(#${ringGradientId})`}
                        opacity="0.9"
                    />
                </g>
            </g>
        </svg>
    );
};

const PlanetaryBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const planetsRef = useRef<Planet[]>([]);
    const requestRef = useRef<number>(0);
    // State only for initial render of DOM nodes properties
    const [initialPlanets, setInitialPlanets] = React.useState<Planet[]>([]);

    useEffect(() => {
        const { innerWidth: width, innerHeight: height } = window;
        const newPlanets: Planet[] = [];

        for (let i = 0; i < PLANET_COUNT; i++) {
            const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
            newPlanets.push({
                x: Math.random() * (width - size),
                y: Math.random() * (height - size),
                vx: (Math.random() - 0.5) * 2 * (Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED),
                vy: (Math.random() - 0.5) * 2 * (Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED),
                size,
                color: COLORS[i % COLORS.length],
                glowColor: COLORS[i % COLORS.length],
                hasRings: i === 8,
            });
        }
        planetsRef.current = newPlanets;
        setInitialPlanets(newPlanets);
    }, []);

    useEffect(() => {
        if (initialPlanets.length === 0) return;

        const animate = () => {
            if (!containerRef.current) return;
            const { innerWidth: width, innerHeight: height } = window;

            planetsRef.current.forEach((planet, index) => {
                const el = containerRef.current?.children[index] as HTMLDivElement;

                planet.x += planet.vx;
                planet.y += planet.vy;

                if (planet.x <= 0 || planet.x + planet.size >= width) {
                    planet.vx *= -1;
                    planet.x = Math.max(0, Math.min(planet.x, width - planet.size));
                }
                if (planet.y <= 0 || planet.y + planet.size >= height) {
                    planet.vy *= -1;
                    planet.y = Math.max(0, Math.min(planet.y, height - planet.size));
                }

                if (el) {
                    el.style.transform = `translate(${planet.x}px, ${planet.y}px)`;
                }
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, [initialPlanets]);

    if (initialPlanets.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            style={{ isolation: 'isolate' }}
        >
            {initialPlanets.map((planet, index) => (
                <div
                    key={index}
                    className="absolute"
                    style={{
                        width: `${planet.size}px`,
                        height: `${planet.size}px`,
                        left: 0,
                        top: 0,
                        transform: `translate(${planet.x}px, ${planet.y}px)`,
                    }}
                >
                    {planet.hasRings ? (
                        <div style={{ transform: 'scale(1.5)' }}>
                            <SaturnSVG size={planet.size} color={planet.color} glowColor={planet.glowColor} />
                        </div>
                    ) : (
                        <div
                            className="w-full h-full rounded-full"
                            style={{
                                background: `radial-gradient(circle at 30% 30%, ${planet.color}, #000)`,
                                boxShadow: `
                                    inset -2px -2px 6px rgba(0,0,0,0.5),
                                    0 0 10px ${planet.glowColor},
                                    0 0 20px ${planet.glowColor}80
                                `,
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default PlanetaryBackground;
