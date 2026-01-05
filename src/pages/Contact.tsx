import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Send, Loader2, Sparkles, Globe, Phone, Rocket, Star, Zap, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Shooting Star Component
const ShootingStar = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ x: -100, y: -100, opacity: 0 }}
        animate={{ x: '120vw', y: '120vh', opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, delay, repeat: Infinity, repeatDelay: Math.random() * 10 + 5 }}
        className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_20px_2px_rgba(255,255,255,0.5)] z-0 pointer-events-none"
    >
        <div className="absolute top-0 right-0 w-20 h-[1px] bg-gradient-to-l from-transparent to-white transform -rotate-45 origin-right" />
    </motion.div>
);

const Contact = () => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [launchProgress, setLaunchProgress] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Simulate rocket launch progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (progress > 90) clearInterval(interval);
            setLaunchProgress(progress);
        }, 100);

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            clearInterval(interval);
            setLaunchProgress(100);

            if (data.status === 'success') {
                setTimeout(() => {
                    setStatus('success');
                    setFormData({ name: '', email: '', message: '' });
                    setLaunchProgress(0);
                    setTimeout(() => setStatus('idle'), 5000);
                }, 500);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('error');
        }
    };

    const getLoadingMessage = () => {
        if (launchProgress < 30) return isTamil ? "ராக்கெட் தயாராகிறது..." : "Preparing launch boosters... 🚀";
        if (launchProgress < 60) return isTamil ? "விண்வெளியில் பயணிக்கிறது..." : "Passing Mercury... ☿";
        if (launchProgress < 90) return isTamil ? "நட்சத்திரங்களை கடக்கிறது..." : "Warp speed engaged... ✨";
        return isTamil ? "விண்வெளி மையத்தை அடைந்தது!" : "Arriving at Cosmic Center! 🎯";
    };

    return (
        <div className="min-h-screen pt-24 pb-12 relative overflow-hidden bg-[#0a0a16]">
            {/* Cosmic Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Shooting Stars */}
                {[...Array(5)].map((_, i) => (
                    <ShootingStar key={i} delay={i * 3} />
                ))}

                {/* Twinkling Stars */}
                <div className="absolute inset-0 opacity-30">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-[2px] h-[2px] bg-white rounded-full animate-pulse"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDuration: `${Math.random() * 3 + 2}s`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>

                {/* Nebulas */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen" />
            </div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block"
                    >
                        <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-400 to-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            {isTamil ? 'விண்மீன்களிடம் கேளுங்கள்! 🌟' : 'Cast Your Message to the Stars! 🌟'}
                        </h1>
                    </motion.div>
                    <p className="text-indigo-200/80 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                        {isTamil
                            ? 'பூமியில் இருந்தாலும், செவ்வாயில் இருந்தாலும் - எங்களை அடையுங்கள்! ✨'
                            : "Whether you're on Earth or exploring the cosmos, we're just a light-year away! ✨"}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 text-left">
                    {/* The Cosmic Bottle (Form) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-3 relative group"
                    >
                        {/* Bottle/Portal Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[2rem] opacity-30 group-hover:opacity-50 blur-xl transition duration-1000 group-hover:duration-200"></div>

                        <div className="relative rounded-[1.5rem] p-8">
                            {/* Form Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30">
                                        <MessageCircle className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">
                                        {isTamil ? 'விண்வெளி அஞ்சல்' : 'Cosmic Message Portal'}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    {isTamil ? 'இணைப்பில்' : 'System Online'}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-purple-300 ml-1">
                                        {isTamil ? 'உங்கள் பெயர்' : 'Name'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#0f0a1e]/85 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-400 focus:bg-[#0f0a1e]/95 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 shadow-lg outline-none transition-all pl-12"
                                            placeholder={isTamil ? 'நட்சத்திரங்கள் உங்களை என்ன அழைக்கும்?' : 'What do the stars call you? ⭐'}
                                        />
                                        <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-300 ml-1">
                                        {isTamil ? 'மின்னஞ்சல்' : 'Email'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-[#0f0a1e]/85 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-400 focus:bg-[#0f0a1e]/95 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 shadow-lg outline-none transition-all pl-12"
                                            placeholder={isTamil ? 'உங்கள் விண்வெளி முகவரி' : 'Your cosmic coordinates (email) 📧'}
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-pink-300 ml-1">
                                        {isTamil ? 'செய்தி' : 'Message'}
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-[#0f0a1e]/85 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-400 focus:bg-[#0f0a1e]/95 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 shadow-lg outline-none transition-all resize-none"
                                            placeholder={isTamil ? 'உங்கள் விண்வெளி எண்ணங்கள்... 💫' : 'Share your cosmic thoughts... 💭'}
                                        />
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        {formData.message.length} chars - {formData.message.length > 50 ? "The stars are listening! ✨" : "Universe awaits..."}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending' || status === 'success'}
                                    className={`w-full relative overflow-hidden group py-4 rounded-xl font-bold text-white text-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl
                                        ${status === 'success'
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500'
                                        }`}
                                >
                                    {/* Rocket Trail Background Animation */}
                                    {status === 'sending' && (
                                        <motion.div
                                            className="absolute left-0 top-0 h-full bg-white/20"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${launchProgress}%` }}
                                            transition={{ ease: "linear", duration: 0.1 }}
                                        />
                                    )}

                                    <div className="relative flex items-center justify-center gap-2">
                                        {status === 'sending' ? (
                                            <>
                                                <Rocket className="w-6 h-6 animate-bounce" />
                                                <span>{getLoadingMessage()}</span>
                                            </>
                                        ) : status === 'success' ? (
                                            <>
                                                <Sparkles className="w-6 h-6 animate-spin-slow" />
                                                <span>{isTamil ? 'செய்தி விண்மீன்களை அடைந்தது! ✨' : 'Message Landed! 🌟'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                                <span>{isTamil ? 'விண்ணுக்கு அனுப்பு' : 'Launch to the Universe 🚀'}</span>
                                            </>
                                        )}
                                    </div>
                                </button>

                                {status === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm text-center flex items-center justify-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        {isTamil ? 'அச்சச்சோ! மீண்டும் முயற்சிக்கவும் 🔄' : 'Cosmic interference detected! Try again? 🛸'}
                                    </motion.div>
                                )}
                            </form>
                        </div>
                    </motion.div>

                    {/* Cosmic Info / Address */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="lg:col-span-2 space-y-8 flex flex-col justify-center"
                    >
                        {/* 3D Planet Visual */}
                        <div className="relative h-64 w-full flex items-center justify-center">
                            {/* Orbital Rings */}
                            <div className="absolute w-48 h-48 border border-purple-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                            <div className="absolute w-64 h-64 border border-blue-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse] rotate-45" />

                            {/* Central Planet */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="relative w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full shadow-[0_0_50px_rgba(139,92,246,0.4)] flex items-center justify-center z-10"
                            >
                                <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-20 bg-repeat bg-center rounded-full mix-blend-overlay"></div>
                                <div className="text-4xl">🪐</div>
                            </motion.div>

                            {/* Floating Satellite */}
                            <motion.div
                                animate={{ x: [40, -40, 40], y: [20, -20, 20] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute top-10 right-10 text-2xl"
                            >
                                🛸
                            </motion.div>
                        </div>

                        {/* Cosmic Headquarters Card */}
                        <div className="p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Globe className="w-24 h-24" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                {isTamil ? 'விண்வெளி மையம்' : 'AstroZen HQ'}
                            </h3>

                            <div className="space-y-6">
                                <div className="group flex items-start gap-4">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                                        <MapPin className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
                                            {isTamil ? 'இடம்' : 'Location'}
                                        </p>
                                        <p className="text-slate-300 leading-relaxed font-medium">
                                            AstroZen Astrology Center<br />
                                            Jaffna, Sri Lanka
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 italic">
                                            (Look for the building with stars! ⭐)
                                        </p>
                                    </div>
                                </div>

                                <div className="group flex items-start gap-4">
                                    <div className="p-3 bg-pink-500/20 rounded-xl group-hover:bg-pink-500/30 transition-colors">
                                        <Mail className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-pink-400 font-bold uppercase tracking-wider mb-1">
                                            {isTamil ? 'மின்னஞ்சல்' : 'Email'}
                                        </p>
                                        <p className="text-slate-300 font-medium">
                                            support@astrozen.app
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 italic">
                                            (We reply faster than Saturn's orbit! 🪐)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
