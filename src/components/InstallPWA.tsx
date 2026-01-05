import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if running on iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // Check if already in standalone mode (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isIOSDevice && !isStandalone) {
            setIsIOS(true);
            // Show prompt after a small delay on iOS to not be too intrusive immediately
            const timer = setTimeout(() => setShowInstallPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can add to home screen
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleClose = () => {
        setShowInstallPrompt(false);
        setShowIOSInstructions(false);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AstroZen',
                    text: 'Check out AstroZen - Visualize your Astrology Chart!',
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback for browsers that don't support share API
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <AnimatePresence>
            {showInstallPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3"
                >
                    {!showIOSInstructions ? (
                        <>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="bg-violet-600/20 p-2 rounded-xl h-fit">
                                        <Download className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-violet-100 font-bold text-sm">Install AstroZen App</h3>
                                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                            Install for a faster experience and offline access.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-slate-500 hover:text-slate-300 transition p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleShare}
                                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                                >
                                    <Share className="w-4 h-4" /> Share
                                </button>
                                <button
                                    onClick={handleInstallClick}
                                    className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-900/20 transition"
                                >
                                    Install
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-violet-100 font-bold text-sm text-left">How to Install on iPhone</h3>
                                <button
                                    onClick={handleClose}
                                    className="text-slate-500 hover:text-slate-300 transition p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-violet-400 border border-slate-700">1</span>
                                    <span>Tap the <span className="text-white font-bold inline-flex items-center mx-1"><Share className="w-4 h-4" /> Share</span> button below</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-violet-400 border border-slate-700">2</span>
                                    <span>Select <span className="text-white font-bold inline-flex items-center mx-1"><PlusSquare className="w-4 h-4" /> Add to Home Screen</span></span>
                                </div>
                            </div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="flex justify-center pt-2"
                            >
                                <ChevronDown className="w-8 h-8 text-violet-500" />
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPWA;
