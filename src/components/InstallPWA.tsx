import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
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
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                            <div className="bg-violet-600/20 p-2 rounded-xl">
                                <Download className="w-6 h-6 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-violet-100 font-bold text-sm">Install SivaAstro to Home Screen</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Get one-tap access and use SivaAstro just like a mobile app.
                                    Save data and access your content faster.
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

                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-violet-900/20"
                    >
                        Install App
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPWA;
