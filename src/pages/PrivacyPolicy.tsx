import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, FileText, Database, Eye, Check, User, Activity } from 'lucide-react';

interface PrivacyPolicyModalProps {
    onClose?: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            window.history.back();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Privacy Policy
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800">
                        <div className="p-4 bg-purple-500/10 rounded-2xl">
                            <Shield className="w-10 h-10 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Privacy Policy (தனியுரிமை கொள்கை)</h1>
                            <p className="text-slate-400">Last Updated: January 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-12">

                        {/* Introduction */}
                        <section>
                            <h3 className="text-xl font-semibold text-white mb-4">Introduction</h3>
                            <p className="text-slate-300 leading-relaxed">
                                At AstroZen, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our astrology services.
                            </p>
                        </section>

                        {/* 1.1 Information We Collect */}
                        <section className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="bg-blue-500/10 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1.1</span>
                                Information We Collect
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Personal Information
                                    </h4>
                                    <ul className="space-y-2 text-slate-300 text-sm">
                                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>Full Name</li>
                                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>Date of Birth, Time of Birth, Place of Birth</li>
                                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>Email Address</li>
                                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>Phone Number (optional)</li>
                                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>Gender (optional)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Usage Data
                                    </h4>
                                    <ul className="space-y-2 text-slate-300 text-sm">
                                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>Charts you create and view</li>
                                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>Features you use</li>
                                        <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>Device information & IP address</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 1.2 How We Use Your Information */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="bg-green-500/10 text-green-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1.2</span>
                                How We Use Your Information
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-slate-800/20 p-5 rounded-xl">
                                    <h4 className="font-bold text-white mb-3">Primary Purposes</h4>
                                    <ul className="space-y-2 text-sm text-slate-400">
                                        <li>Generate accurate astrological charts</li>
                                        <li>Provide personalized insights</li>
                                        <li>Save charts for future reference</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-800/20 p-5 rounded-xl">
                                    <h4 className="font-bold text-white mb-3">Analysis & Improvement</h4>
                                    <ul className="space-y-2 text-sm text-slate-400">
                                        <li>Analyze user behavior</li>
                                        <li>Identify popular features</li>
                                        <li>Fix technical issues</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-800/20 p-5 rounded-xl">
                                    <h4 className="font-bold text-white mb-3">Communication</h4>
                                    <ul className="space-y-2 text-sm text-slate-400">
                                        <li>Service notifications</li>
                                        <li>Important updates</li>
                                        <li>Support responses</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 1.3 Data Security */}
                        <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                                <Lock className="w-6 h-6 text-green-400" />
                                Data Security
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <h4 className="text-green-400 font-bold mb-4 uppercase text-xs tracking-wider">Security Measures</h4>
                                    <ul className="space-y-3">
                                        {[
                                            "Encryption: All data is encrypted in transit (HTTPS/TLS) and at rest (AES-256)",
                                            "Secure Servers: Stored on secure cloud servers with regular backups",
                                            "Access Control: Strictly limited to authorized personnel",
                                            "Password Protection: Hashed using bcrypt/Argon2",
                                            "Regular Audits: To identify and fix vulnerabilities"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-700/50">
                                    <h4 className="text-white font-bold mb-2">100% Secure Promise</h4>
                                    <p className="text-sm text-slate-400 mb-4">
                                        Your birth details and personal information are stored with bank-level security. We NEVER sell your personal data to third parties.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-3 py-1.5 rounded-full w-fit">
                                        <Shield className="w-3 h-3" /> Protected & Encrypted
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 1.4 Data Sharing */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1.4 Data Sharing & Disclosure</h2>
                            <div className="bg-red-500/5 border-l-4 border-red-500/50 p-4 mb-6">
                                <p className="text-slate-300 text-sm">
                                    <span className="text-red-400 font-bold block mb-1">We NEVER:</span>
                                    Sell your data to advertisers, share birth details publicly, or use info for unconsented purposes.
                                </p>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">We only share data:</p>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 ml-2">
                                <li>With your explicit consent (e.g. sharing charts)</li>
                                <li>For Astrologer Consultations (with permission)</li>
                                <li>For Legal Requirements</li>
                                <li>With trusted Service Providers (under strict confidentiality)</li>
                            </ul>
                        </section>

                        {/* 1.5 Your Rights */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1.5 Your Data Rights</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {['Access', 'Download', 'Correction', 'Deletion', 'Opt-Out', 'Portability'].map((right) => (
                                    <div key={right} className="bg-slate-800 p-3 rounded-lg text-center border border-slate-700">
                                        <p className="text-white font-medium text-sm">{right}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-400 text-sm mt-4">
                                To exercise rights: Go to Account Settings → Privacy or contact <a href="mailto:privacy@astrozen.com" className="text-yellow-400 hover:underline">privacy@astrozen.com</a>.
                            </p>
                        </section>

                        {/* Other Sections */}
                        <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-400">
                            <section>
                                <h2 className="text-lg font-bold text-white mb-2">1.6 Data Retention</h2>
                                <p>Active accounts retained indefinitely. Inactive accounts warned after 2 years. Deleted account data removed within 30 days.</p>
                            </section>
                            <section>
                                <h2 className="text-lg font-bold text-white mb-2">1.7 Children's Privacy</h2>
                                <p>Service is for 18+. We do not knowingly collect data from minors without parent guardian.</p>
                            </section>
                        </div>

                        <div className="h-px bg-slate-800 my-12"></div>

                        {/* DATA COLLECTION POLICY */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-blue-500/10 rounded-2xl">
                                <Database className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">3. Data Collection & Feedback Policy</h1>
                        </div>

                        <section className="space-y-8">
                            <div className="bg-slate-800/30 p-6 rounded-xl">
                                <h3 className="text-lg font-bold text-white mb-4">3.1 Why We Collect Feedback</h3>
                                <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                                    <li>Understand which features you love</li>
                                    <li>Fix bugs and technical issues faster</li>
                                    <li>Make predictions more accurate</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">3.2 What We Collect</h3>
                                <div className="grid md:grid-cols-2 gap-6 text-sm">
                                    <div className="border border-slate-700 p-4 rounded-xl">
                                        <h4 className="text-blue-400 font-bold mb-2">Automatic Collection</h4>
                                        <p className="text-slate-400">Pages visited, features used, error logs, and session metrics.</p>
                                    </div>
                                    <div className="border border-slate-700 p-4 rounded-xl">
                                        <h4 className="text-blue-400 font-bold mb-2">Voluntary Feedback</h4>
                                        <p className="text-slate-400">Ratings, feature requests, bug reports, and prediction accuracy feedback.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">3.6 Opting Out</h3>
                                <p className="text-slate-300 text-sm mb-4">You can disable analytics in Settings or use "Do Not Track". Essential security logging continues.</p>
                            </div>
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicyModal;
