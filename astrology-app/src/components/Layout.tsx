import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Moon, Sun, MapPin, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const steps = [
        { path: '/', label: 'Birth Details', icon: MapPin },
        { path: '/chart', label: 'Vedic Chart', icon: Moon },
        { path: '/analysis', label: 'Analysis', icon: Sun },
        { path: '/predictions', label: 'AI Insights', icon: Sparkles },
    ];

    const currentStepIndex = steps.findIndex(s => s.path === location.pathname);

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-purple-500/30">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

                {/* Animated Stars */}
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white animate-twinkle"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 2 + 1}px`,
                            height: `${Math.random() * 2 + 1}px`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: Math.random() * 0.7 + 0.3,
                        }}
                    />
                ))}
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                                <Star className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                VedicAI
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = location.pathname === step.path;
                                const isCompleted = idx < currentStepIndex;

                                return (
                                    <div
                                        key={step.path}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 cursor-pointer ${isActive ? 'text-purple-400' : isCompleted ? 'text-blue-400' : 'text-slate-500'
                                            }`}
                                        onClick={() => navigate(step.path)}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                        {step.label}
                                        {idx < steps.length - 1 && (
                                            <div className={`h-[1px] w-8 ml-4 ${isCompleted ? 'bg-blue-500/50' : 'bg-slate-800'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
