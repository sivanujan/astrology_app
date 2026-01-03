import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Star, Sparkles, Search, MessageCircle, Mail, BookOpen, Clock, Heart, Calendar, Activity, ArrowRight, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [quote, setQuote] = useState('');
    const [showApology, setShowApology] = useState(false);

    // Bilingual Content
    const content = {
        en: {
            title: "Saturn Says NO! 🔴",
            subtitle: "PAGE NOT FOUND",
            message: "This page has been blocked by Saturn for karmic reasons",
            funnySubtext: "(Maybe you visited a wrong URL in your past life... or just now? 😅)",
            searchPlaceholder: "Search AstroZen...",
            buttons: {
                home: "Go Home",
                check: "Check Saturn Allows",
                apologize: "Apologize to Saturn"
            },
            popular: "📱 Popular Destinations",
            factTitle: "Saturn Fact",
            fact: "Saturn takes 29.5 years to orbit the Sun. Its influence in your chart signifies discipline, karma, and the lessons we must learn to grow.",
            apologyTitle: "Apology Accepted!",
            apologyMessage: "Saturn says: \"Greetings! But I still can't find that page... May your path lead you home.\" 🌟",
            quotes: [
                "Saturn: The planet that says 'Not Today!'",
                "Oops! Saturn has temporarily closed this cosmic portal 🚪",
                "This page wandered into Saturn's no-entry zone 🚫",
                "Saturn is doing maintenance on this dimension ⚙️",
                "404: Even astrologers can't predict this page's location 🔮"
            ],
            links: [
                { label: "Birth Chart Analysis", path: "/analysis" },
                { label: "Daily Predictions", path: "/daily-snapshot" },
                { label: "Marriage Matching", path: "/marriage-matching" },
                { label: "AI Chat", path: "/predictions" },
            ]
        },
        ta: {
            title: "சனி பகவான் தடை! 🔴",
            subtitle: "பக்கம் காணப்படவில்லை",
            message: "கர்ம வினை காரணமாக இப்பக்கம் சனி பகவானால் முடக்கப்பட்டுள்ளது",
            funnySubtext: "(ஒருவேளை நீங்கள் முற்பிறவியில் தவறான முகவரியை தேடினீர்களோ? 😅)",
            searchPlaceholder: "AstroZen-ல் தேடுக...",
            buttons: {
                home: "முகப்பு பக்கம்",
                check: "சனி அனுமதிப்பவை",
                apologize: "மன்னிப்பு கேள்"
            },
            popular: "📱 பிரபலமானவை",
            factTitle: "சனி பகவான் தகவல்",
            fact: "சனி பகவான் சூரியனை ஒருமுறை சுற்றி வர 29.5 ஆண்டுகள் ஆகும். இது ஒழுக்கம் மற்றும் கர்மவினையை குறிக்கிறது.",
            apologyTitle: "மன்னிப்பு ஏற்கப்பட்டது!",
            apologyMessage: "சனி பகவான் கூறுகிறார்: \"வாழ்த்துக்கள்! ஆனால் இப்பக்கத்தை என்னால் கண்டுபிடிக்க முடியவில்லை... உங்கள் பாதை உங்களை வீட்டிற்கு அழைத்துச் செல்லட்டும்.\" 🌟",
            quotes: [
                "சனி பகவான்: 'இன்று முடியாது' என்று சொல்லும் கிரகம்!",
                "அச்சச்சோ! இந்த பிரபஞ்ச வாசலை சனி பகவான் தற்காலிகமாக மூடிவிட்டார் 🚪",
                "இப்பக்கம் சனி பகவானின் தடை செய்யப்பட்ட பகுதிக்குள் நுழைந்துவிட்டது 🚫",
                "இந்த பரிமாணத்தில் சனி பகவான் பராமரிப்பு பணியில் உள்ளார் ⚙️",
                "404: இப்பக்கம் எங்குள்ளது என்று ஜோதிடர்களாலும் கணிக்க முடியவில்லை 🔮"
            ],
            links: [
                { label: "ஜாதக ஆய்வு", path: "/analysis" },
                { label: "தினசரி பலன்கள்", path: "/daily-snapshot" },
                { label: "திருமணப் பொருத்தம்", path: "/marriage-matching" },
                { label: "AI ஜோதிட அரட்டை", path: "/predictions" },
            ]
        }
    };

    const t = content[language === 'ta' ? 'ta' : 'en'];

    useEffect(() => {
        setQuote(t.quotes[Math.floor(Math.random() * t.quotes.length)]);
    }, [language]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Simple redirect to a search results page or just dashboard for now
            // In a real app, this would go to /search?q=...
            navigate('/dashboard');
        }
    };

    const handleApology = () => {
        setShowApology(true);
        setTimeout(() => setShowApology(false), 5000);
    };

    const popularLinks = [
        { icon: Activity, label: t.links[0].label, path: t.links[0].path, color: "text-purple-400" },
        { icon: Calendar, label: t.links[1].label, path: t.links[1].path, color: "text-orange-400" },
        { icon: Heart, label: t.links[2].label, path: t.links[2].path, color: "text-red-400" },
        { icon: Sparkles, label: t.links[3].label, path: t.links[3].path, color: "text-teal-400" },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative z-10 px-4 py-12">

            {/* Animated Saturn */}
            <motion.div
                className="mb-6 relative"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <div className="text-[150px] leading-none filter drop-shadow-[0_0_50px_rgba(234,179,8,0.3)] select-none">
                    🪐
                </div>
                {/* Rings Animation Effect (Subtle glow pulse) */}
                <motion.div
                    className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl -z-10"
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            </motion.div>

            {/* Main Heading Group */}
            <div className="text-center space-y-4 mb-12 max-w-2xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 font-display tracking-tight"
                >
                    {t.title}
                </motion.h1>

                <div className="flex items-center justify-center gap-4 text-slate-400 font-mono text-xl md:text-2xl mt-2">
                    <span className="px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700">4</span>
                    <motion.span
                        animate={{ rotate: [0, 180, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        0
                    </motion.span>
                    <span className="px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700">4</span>
                    <span className="ml-2 font-sans font-bold text-slate-300">{t.subtitle}</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl"
                >
                    <p className="text-xl text-slate-200 font-light mb-2">
                        "{t.message}"
                    </p>
                    <p className="text-slate-400 text-sm italic">
                        {t.funnySubtext}
                    </p>
                </motion.div>

                <motion.p
                    key={quote}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-yellow-500/80 italic text-lg"
                >
                    "{quote}"
                </motion.p>
            </div>

            {/* Search Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-md mb-12"
            >
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-500 transition-all shadow-lg hover:shadow-purple-500/10"
                    />
                </form>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col w-full max-w-md gap-4 mb-16"
            >
                <Link
                    to="/"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-lg group"
                >
                    <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    {t.buttons.home}
                </Link>

                <div className="grid grid-cols-2 gap-4">
                    <Link
                        to="/dashboard"
                        className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <Star className="w-4 h-4" />
                        {t.buttons.check}
                    </Link>
                    <button
                        onClick={handleApology}
                        className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-medium hover:text-white"
                    >
                        <span className="text-xl">🙏</span>
                        {t.buttons.apologize}
                    </button>
                </div>
            </motion.div>

            {/* Popular Links */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-4xl border-t border-slate-800 pt-12 mb-12"
            >
                <h3 className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-6 text-center">{t.popular}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all group"
                        >
                            <link.icon className={`w-6 h-6 ${link.color} mb-3 group-hover:scale-110 transition-transform`} />
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white text-center">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* Footer / Support */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-2xl text-center space-y-8"
            >
                <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
                    <a href="mailto:support@astrozen.app" className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                        <Mail className="w-4 h-4" /> support@astrozen.app
                    </a>
                    {/* Add other links if needed */}
                </div>

                {/* Saturn Fact */}
                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 inline-block max-w-xl mx-auto">
                    <div className="flex items-start gap-3 text-left">
                        <div className="p-2 bg-blue-500/10 rounded-full shrink-0">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-blue-300 font-bold text-xs uppercase tracking-wider mb-1">{t.factTitle}</h4>
                            <p className="text-slate-400 text-sm">
                                {t.fact}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Apology Modal/Toaster */}
            <AnimatePresence>
                {showApology && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-yellow-500/30 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md w-[90%]"
                    >
                        <div className="text-3xl">🙏</div>
                        <div>
                            <h4 className="font-bold text-yellow-400">{t.apologyTitle}</h4>
                            <p className="text-sm text-slate-300">{t.apologyMessage}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default NotFound;
