import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Moon, Sun, MapPin, Sparkles, Languages, Clock, MessageCircle, Lock, LayoutDashboard, Menu, X, Heart, ChevronDown, FileText, Activity, Phone, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PlanetaryBackground from './PlanetaryBackground';
import Logo from '/logo2.png';
import FeatureAccessPopup from './FeatureAccessPopup';
import WelcomeFeaturesModal from './WelcomeFeaturesModal';
import Footer from './Footer';
import DevToolsBlocker from './DevToolsBlocker';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [showFeaturePopup, setShowFeaturePopup] = React.useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);

    React.useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    React.useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            // Small delay to ensure smooth entrance
            const timer = setTimeout(() => setShowWelcomeModal(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const navItems = [
        { type: 'link', path: '/', label: t.nav.birthDetails, icon: MapPin, color: 'text-blue-400' },
        {
            type: 'dropdown',
            label: t.nav.analysis,
            icon: Activity,
            color: 'text-purple-400',
            items: [
                { path: '/chart', label: t.nav.chart, icon: Moon, color: 'text-yellow-300' },
                { path: '/dasha', label: t.dasha.title, icon: Clock, color: 'text-green-400' },
                { path: '/analysis', label: t.analysis.title, icon: FileText, color: 'text-pink-400', protected: true },
                { path: '/daily-snapshot', label: t.nav.dailySnapshot, icon: Sun, color: 'text-orange-400', protected: true }
            ]
        },
        { type: 'link', path: '/predictions', label: t.nav.predictions, icon: Sparkles, color: 'text-teal-400', protected: true },
        { type: 'link', path: '/marriage-tools', label: language === 'ta' ? 'திருமண கருவிகள்' : 'Marriage Tools', icon: Heart, color: 'text-red-400' },
        { type: 'link', path: '/contact', label: language === 'ta' ? 'தொடர்புக்கு' : 'Contact Us', icon: Phone, color: 'text-indigo-400' }
    ];



    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white selection:bg-purple-500/30">
            {/* Advanced Security Shield */}
            <DevToolsBlocker />

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
                            <div className="w-28 md:w-42 h-auto flex items-center justify-start">
                                <img src={Logo} alt="AstroZen Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            {navItems.map((item, idx) => {
                                if (item.type === 'dropdown') {
                                    const isActive = item.items?.some(sub => sub.path === location.pathname);
                                    return (
                                        <div key={idx} className="relative group z-50">
                                            <button className={`flex items-center gap-2.5 text-sm font-medium transition-all duration-300 py-2 outline-none ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                                                <item.icon className={`w-5 h-5 ${item.color} ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} />
                                                {item.label}
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-180 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                            </button>
                                            <div className="absolute top-full left-0 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                                                <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl p-2 flex flex-col gap-1">
                                                    {item.items?.map((subItem) => {
                                                        const isLocked = subItem.protected && !user;
                                                        const isSubActive = location.pathname === subItem.path;
                                                        return (
                                                            <div
                                                                key={subItem.path}
                                                                onClick={() => {
                                                                    if (isLocked) setShowFeaturePopup(true);
                                                                    else navigate(subItem.path);
                                                                }}
                                                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer ${isSubActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                                    }`}
                                                            >
                                                                <subItem.icon className={`w-5 h-5 ${subItem.color}`} />
                                                                <span className="font-medium">{subItem.label}</span>
                                                                {isLocked && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {isActive && <div className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_10px_#a855f7]" />}
                                        </div>
                                    );
                                } else {
                                    const isActive = location.pathname === item.path;
                                    const isLocked = item.protected && !user;
                                    return (
                                        <div
                                            key={item.path}
                                            onClick={() => {
                                                if (isLocked) setShowFeaturePopup(true);
                                                else navigate(item.path!);
                                            }}
                                            className={`relative flex items-center gap-2.5 text-sm font-medium transition-all duration-300 cursor-pointer py-2 ${isActive ? 'text-white font-semibold' : isLocked ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${item.color} ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} />
                                            {item.label}
                                            {isLocked && <Lock className="w-3 h-3" />}
                                            {isActive && <div className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_10px_#a855f7]" />}
                                        </div>
                                    );
                                }
                            })}
                        </div>

                        {/* Desktop Auth & Language */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Auth Buttons */}
                            <div className="flex items-center gap-3 mr-4">
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors border border-purple-500/30 whitespace-nowrap ml-6"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span className="hidden lg:inline">{t.nav.dashboard}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                navigate('/');
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30 whitespace-nowrap"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="hidden lg:inline">{language === 'ta' ? 'வெளியேறு' : 'Logout'}</span>
                                        </button>
                                    </>
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
                                <span className="hidden md:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
                            </button>
                        </div>

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
                                    {/* Mobile Auth Buttons */}
                                    <div className="flex flex-col gap-2 pb-4 border-b border-white/10">
                                        {user ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        navigate('/dashboard');
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors border border-purple-500/30 w-full"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    <span>{t.nav.dashboard}</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        navigate('/');
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30 w-full"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>{language === 'ta' ? 'வெளியேறு' : 'Logout'}</span>
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex gap-2 w-full">
                                                <button
                                                    onClick={() => {
                                                        navigate('/login');
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:text-white transition-colors text-center"
                                                >
                                                    {t.nav.login}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/register');
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 rounded-lg hover:from-yellow-400 hover:to-orange-500 transition-colors shadow-lg shadow-yellow-500/20 text-center"
                                                >
                                                    {t.nav.signup}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {navItems.map((item, idx) => {
                                        if (item.type === 'dropdown') {
                                            return (
                                                <div key={idx} className="space-y-2 bg-slate-900/50 rounded-lg p-2 border border-white/5">
                                                    <div className="flex items-center gap-2 px-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                                        {item.label}
                                                    </div>
                                                    <div className="pl-4 space-y-1">
                                                        {item.items?.map((subItem) => {
                                                            const isLocked = subItem.protected && !user;
                                                            const isActive = location.pathname === subItem.path;
                                                            return (
                                                                <button
                                                                    key={subItem.path}
                                                                    onClick={() => {
                                                                        if (isLocked) setShowFeaturePopup(true);
                                                                        else navigate(subItem.path);
                                                                        setIsMenuOpen(false);
                                                                    }}
                                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-purple-500/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white'
                                                                        }`}
                                                                >
                                                                    <subItem.icon className={`w-4 h-4 ${subItem.color}`} />
                                                                    {subItem.label}
                                                                    {isLocked && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        const isActive = item.path === location.pathname;
                                        const isLocked = item.protected && !user;
                                        return (
                                            <button
                                                key={item.path}
                                                onClick={() => {
                                                    if (isLocked) {
                                                        setShowFeaturePopup(true);
                                                        setIsMenuOpen(false);
                                                    } else {
                                                        navigate(item.path!);
                                                        setIsMenuOpen(false);
                                                    }
                                                }}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-purple-500/10 text-white border border-purple-500/20'
                                                    : isLocked
                                                        ? 'text-slate-600 cursor-not-allowed'
                                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                {isLocked ? <Lock className="w-4 h-4" /> : <item.icon className={`w-5 h-5 ${item.color}`} />}
                                                {item.label}
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


            <Footer />

            <FeatureAccessPopup
                isOpen={showFeaturePopup}
                onClose={() => setShowFeaturePopup(false)}
            />

            <WelcomeFeaturesModal
                isOpen={showWelcomeModal}
                onClose={() => {
                    setShowWelcomeModal(false);
                    localStorage.setItem('hasSeenWelcome', 'true');
                }}
            />
        </div>
    );
};

export default Layout;
