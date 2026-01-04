import React, { useEffect, useState } from 'react';
import { AlertTriangle, EyeOff, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const DevToolsBlocker: React.FC = () => {
    const { language } = useLanguage();
    const [showWarning, setShowWarning] = useState(false);
    const [warningCount, setWarningCount] = useState(0);

    useEffect(() => {
        // Prevent Context Menu (Right Click)
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            triggerWarning();
        };

        // Prevent DevTools Shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                triggerWarning();
            }

            // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect/Console)
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
                e.preventDefault();
                triggerWarning();
            }

            // Ctrl+U (View Source)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                triggerWarning();
            }
        };

        // Advanced Detection: Console Object Trap
        // This detects if the console is open because the browser tries to read the 'id' 
        // property of the element when logging it.
        const detectDevTools = () => {
            const element = new Image();
            Object.defineProperty(element, 'id', {
                get: function () {
                    triggerWarning();
                    return 'Saturn';
                }
            });
            // We interpret the logging to trigger the getter
            console.log('%c', element);
        };

        const interval = setInterval(detectDevTools, 2000);

        // Debugger Trap - This effectively pauses script execution if DevTools is open
        // WARNING: usage of 'debugger' relies on DevTools being open to catch it
        // We set it on an interval to annoy potential inspectors
        const debuggerInterval = setInterval(() => {
            // We won't actually auto-trigger a pause loop as it can freeze the UI for normal users 
            // if browser heuristics misfire. Instead, we rely on event prevention.
        }, 1000);

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            clearInterval(debuggerInterval);
            clearInterval(interval);
        };
    }, []);

    const triggerWarning = () => {
        // Debounce to prevent flickering
        if (showWarning) return;
        setShowWarning(true);
        setWarningCount(prev => prev + 1);

        // REVERTED AGAIN: Just Show Warning Overlay (No Redirect)
        // User requested "redo this" (undo).
        setTimeout(() => {
            setShowWarning(false);
        }, 3000);
    };

    return (
        <AnimatePresence>
            {showWarning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="max-w-md bg-slate-900 border-2 border-red-500/50 rounded-2xl p-8 shadow-2xl shadow-red-900/50"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
                                <EyeOff className="w-20 h-20 text-red-500 relative z-10" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-red-400 mb-4 font-serif">
                            {language === 'ta' ? 'சனி பர்க்கிறார்!' : 'Saturn is Watching!'}
                        </h2>

                        <div className="space-y-4 text-slate-300">
                            <p className="text-lg">
                                {language === 'ta'
                                    ? 'ரகசியங்களை ஆராய முயற்சிக்காதீர்கள். இது ஜோதிட விதிகளுக்கு எதிரானது.'
                                    : 'Do not attempt to pry into hidden secrets. Attempting to inspect the code brings bad Karma.'}
                            </p>

                            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg flex items-center gap-3 text-left">
                                <Lock className="w-8 h-8 text-red-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-red-300">
                                        {language === 'ta' ? 'பாதுகாக்கப்பட்ட தளம்' : 'Protected Realm'}
                                    </h4>
                                    <p className="text-xs text-red-400/80">
                                        {language === 'ta'
                                            ? 'உங்கள் ஜாதக தோஷங்களைத் தவிர்க்கவும்.'
                                            : 'Stop this immediately to avoid Doshas.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {warningCount > 2 && (
                            <p className="mt-6 text-xs text-slate-500 font-mono">
                                Connection ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} // TRA-CKED
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DevToolsBlocker;
