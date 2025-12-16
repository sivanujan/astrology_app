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

const PlanetaryBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const planetsRef = useRef<Planet[]>([]);
    const requestRef = useRef<number>(0);

    // Initialize planets
    useEffect(() => {
        const initPlanets = () => {
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
                });
            }
            planetsRef.current = newPlanets;
        };

        initPlanets();

        const animate = () => {
            if (!containerRef.current) return;
            const { innerWidth: width, innerHeight: height } = window;

            // Update positions
            planetsRef.current.forEach((planet, index) => {
                planet.x += planet.vx;
                planet.y += planet.vy;

                // Bounce off edges
                if (planet.x <= 0 || planet.x + planet.size >= width) {
                    planet.vx *= -1;
                    // Clamp to avoid sticking
                    planet.x = Math.max(0, Math.min(planet.x, width - planet.size));
                }
                if (planet.y <= 0 || planet.y + planet.size >= height) {
                    planet.vy *= -1;
                    // Clamp to avoid sticking
                    planet.y = Math.max(0, Math.min(planet.y, height - planet.size));
                }

                // Apply to DOM elements directly for performance
                const el = containerRef.current?.children[index] as HTMLDivElement;
                if (el) {
                    el.style.transform = `translate(${planet.x}px, ${planet.y}px)`;
                }
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            // Re-initialize or clamp positions on resize could be added here
            // For simplicity, we just let them bounce back naturally
        }

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
            style={{
                background: 'transparent', // Or whatever base background you want, assuming overlay on existing
            }}
        >
            {planetsRef.current.map((planet, index) => (
                <div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                        width: `${planet.size}px`,
                        height: `${planet.size}px`,
                        // Set initial position to 0,0 and move with translate in loop
                        left: 0,
                        top: 0,
                        // Realistic planet look: radial gradient + box shadow glow
                        background: `radial-gradient(circle at 30% 30%, ${planet.color}, #000)`,
                        boxShadow: `0 0 15px 2px ${planet.glowColor}80`, // 80 for 50% opacity hex
                    }}
                />
            ))}
            {/* Since we don't re-render, we need initial elements.
          However, planetsRef is not state, so map won't render initially.
          We need a state or just iterate COLORS since count is fixed.
      */}
            {Array.from({ length: PLANET_COUNT }).map((_, i) => (
                // We do this just to create the DOM nodes.
                // Their initial styles will be updated immediately by the first frame.
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: '0px', // Will be set by ref init, but needs to exist
                        height: '0px',
                        left: 0,
                        top: 0,
                    }}
                />
            ))}
        </div>
    );
};

// We need to actually render the initial visuals because the loop updates the transform,
// but the color/size styles need to be set.
// Let's refactor slightly to use state for the *initial* render of static props (color, size)
// but refs for position updates relative to each other.

const PlanetaryBackgroundFixed: React.FC = () => {
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

                const el = containerRef.current?.children[index] as HTMLDivElement;
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
            // z-0 ensures it is behind content (assuming content is z-10 or default stacking context above fixed)
            // But user asked for low z-index "above background but below content".
            // If main content has no z-index, this fixed overlay might cover it if not careful.
            // Usually fixed z-0 is fine if content is relative.
            // Let's use a standard low positive or negative depending on the app structure.
            // Safe bet: z-[1] and ensure content is z-[10] or relative with higher stack.
            // Actually user said "above background but below content".
            // If the app has a background image on body, this needs to be above that.
            style={{ isolation: 'isolate' }}
        >
            {initialPlanets.map((planet, index) => (
                <div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                        width: `${planet.size}px`,
                        height: `${planet.size}px`,
                        left: 0,
                        top: 0,
                        // 3D effect: Radial gradient
                        background: `radial-gradient(circle at 30% 30%, ${planet.color}, #000)`,
                        // Inner glow via inset shadow + Outer glow
                        boxShadow: `
                            inset -2px -2px 6px rgba(0,0,0,0.5),
                            0 0 10px ${planet.glowColor},
                            0 0 20px ${planet.glowColor}80
                        `,
                        transform: `translate(${planet.x}px, ${planet.y}px)`, // Set initial pos
                    }}
                >
                    {planet.hasRings && (
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-slate-400/60"
                            style={{
                                width: '160%',
                                height: '40%',
                                boxShadow: '0 0 10px rgba(197, 171, 110, 0.4)',
                                transform: 'translate(-50%, -50%) rotate(-20deg)',
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default PlanetaryBackgroundFixed;
