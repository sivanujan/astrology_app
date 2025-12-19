import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Moon, Sun, MapPin, Sparkles, Languages, Clock, MessageCircle, Lock, LayoutDashboard, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PlanetaryBackground from './PlanetaryBackground';
import Logo from '../assets/logo.png';
import FeatureAccessPopup from './FeatureAccessPopup';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [showFeaturePopup, setShowFeaturePopup] = React.useState(false);

    const steps = [
        { path: '/', label: t.nav.birthDetails, icon: MapPin, protected: false },
        { path: '/chart', label: t.nav.chart, icon: Moon, protected: false },
        { path: '/dasha', label: t.dasha.title, icon: Clock, protected: false },
        { path: '/analysis', label: t.nav.analysis, icon: Sun, protected: true },
        { path: '/predictions', label: t.nav.predictions, icon: Sparkles, protected: true },

        { path: '/daily-snapshot', label: "Next 15 Days Forecast", icon: Sun, protected: true },
    ];

    const currentStepIndex = steps.findIndex(s => s.path === location.pathname);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white selection:bg-purple-500/30">
            {/* Animated Star Field */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {[...Array(100)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Dynamic Planetary Background */}
            <PlanetaryBackground />

            {/* Animated Planets */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-20 blur-xl"
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                <motion.div
                    className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 opacity-20 blur-xl"
                    animate={{
                        y: [0, 20, 0],
                        rotate: [360, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-48 h-auto flex items-center justify-start">
                                <img src={Logo} alt="Astro Siva Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-1 lg:gap-2">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = location.pathname === step.path;
                                const isCompleted = idx < currentStepIndex;
                                const isLocked = step.protected && !user;

                                return (
                                    <div
                                        key={step.path}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 cursor-pointer ${isActive ? 'text-purple-400' :
                                            isLocked ? 'text-slate-600 cursor-not-allowed' :
                                                isCompleted ? 'text-blue-400' : 'text-slate-500'
                                            }`}
                                        onClick={() => {
                                            if (isLocked) {
                                                setShowFeaturePopup(true);
                                            } else {
                                                navigate(step.path);
                                            }
                                        }}
                                    >
                                        {isLocked ? <Lock className="w-3 h-3" /> : <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />}
                                        {step.label}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3 mr-4">
                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors border border-purple-500/30 whitespace-nowrap"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden lg:inline">{t.nav.dashboard}</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                                    >
                                        {t.nav.login}
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="whitespace-nowrap px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 rounded-lg hover:from-yellow-400 hover:to-orange-500 transition-colors shadow-lg shadow-yellow-500/20"
                                    >
                                        {t.nav.signup}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors text-sm font-medium"
                        >
                            <Languages className="w-4 h-4 text-purple-400" />
                            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
                        </button>
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-slate-300 hover:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu Overlay */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl overflow-hidden"
                            >
                                <div className="flex flex-col p-4 space-y-4">
                                    {steps.map((step, idx) => {
                                        const Icon = step.icon;
                                        const isActive = location.pathname === step.path;
                                        const isLocked = step.protected && !user;

                                        return (
                                            <button
                                                key={step.path}
                                                onClick={() => {
                                                    if (isLocked) {
                                                        setShowFeaturePopup(true);
                                                        setIsMenuOpen(false);
                                                    } else {
                                                        navigate(step.path);
                                                        setIsMenuOpen(false);
                                                    }
                                                }}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                    : isLocked
                                                        ? 'text-slate-600 cursor-not-allowed'
                                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                {isLocked ? <Lock className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                                {step.label}
                                            </button>
                                        );
                                    })}

                                    {/* Mobile Language Toggle */}
                                    <button
                                        onClick={() => {
                                            setLanguage(language === 'en' ? 'ta' : 'en');
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors border border-white/5"
                                    >
                                        <Languages className="w-4 h-4 text-purple-400" />
                                        <span>{language === 'en' ? 'Switch to Tamil (தமிழ்)' : 'Switch to English'}</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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


            <FeatureAccessPopup
                isOpen={showFeaturePopup}
                onClose={() => setShowFeaturePopup(false)}
            />
        </div>
    );
};

export default Layout;
