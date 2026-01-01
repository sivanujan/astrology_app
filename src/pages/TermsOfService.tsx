import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TermsOfServiceModalProps {
    onClose?: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onClose }) => {
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
                        <FileText className="w-5 h-5 text-orange-400" />
                        Terms of Service
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
                        <div className="p-4 bg-orange-500/10 rounded-2xl">
                            <FileText className="w-10 h-10 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Terms of Service (சேவை விதிமுறைகள்)</h1>
                            <p className="text-slate-400">Last Updated: January 2026</p>
                        </div>
                    </div>


                    <div className="prose prose-invert max-w-none space-y-12">

                        {/* 2.1 Acceptance */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2.1 Acceptance of Terms</h2>
                            <p className="text-slate-300">
                                By using AstroZen, you agree to these Terms of Service. If you don't agree, please don't use our service.
                            </p>
                        </section>

                        {/* 2.2 Service Description */}
                        <section className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-6">2.2 Service Description</h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-orange-300 mb-3">What We Provide</h4>
                                    <ul className="space-y-2 text-slate-300 text-sm list-disc list-inside">
                                        <li>Vedic astrology chart generation</li>
                                        <li>Personalized predictions and analysis</li>
                                        <li>Matchmaking compatibility reports</li>
                                        <li>AI-powered insights</li>
                                    </ul>
                                </div>
                                <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                                    <h4 className="font-semibold text-orange-300 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Important Disclaimers
                                    </h4>
                                    <ul className="space-y-2 text-orange-200/80 text-sm">
                                        <li>Astrology is for guidance and entertainment purposes.</li>
                                        <li>Predictions are based on traditional Vedic principles.</li>
                                        <li>We don't guarantee specific outcomes.</li>
                                        <li>Always use your own judgment.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 2.3 User Responsibilities */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">2.3 User Responsibilities</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-green-900/10 p-5 rounded-xl border border-green-500/20">
                                    <h4 className="flex items-center gap-2 text-green-400 font-bold mb-4">
                                        <CheckCircle className="w-5 h-5" /> You Must
                                    </h4>
                                    <ul className="space-y-2 text-sm text-slate-300">
                                        <li>Provide accurate birth information</li>
                                        <li>Keep login credentials secure</li>
                                        <li>Respect other users' privacy</li>
                                    </ul>
                                </div>
                                <div className="bg-red-900/10 p-5 rounded-xl border border-red-500/20">
                                    <h4 className="flex items-center gap-2 text-red-400 font-bold mb-4">
                                        <XCircle className="w-5 h-5" /> Prohibited Activities
                                    </h4>
                                    <ul className="space-y-2 text-sm text-slate-300">
                                        <li>Creating fake accounts</li>
                                        <li>Scraping content or using bots</li>
                                        <li>Harassing users or posting offensive content</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 2.4 Accuracy */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2.4 Accuracy of Information</h2>
                            <p className="text-slate-300 mb-2">
                                Predictions depend on the accuracy of the birth details YOU provide. We are not responsible for inaccuracies due to wrong information.
                            </p>
                            <p className="text-slate-400 text-sm italic">
                                Please cross-verify your birth time from official records. Some features require precise timing (within 2-3 minutes).
                            </p>
                        </section>

                        {/* 2.5 Intellectual Property */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2.5 Intellectual Property</h2>
                            <p className="text-slate-300 text-sm">
                                All content, designs, and algorithms are owned by AstroZen. You cannot copy or distribute our content. However, <strong>your generated charts are yours</strong> to keep and download.
                            </p>
                        </section>

                        <div className="h-px bg-slate-800 my-8"></div>

                        {/* 2.6 Payments & Refunds */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">2.6 Payments & Refunds</h2>
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <h4 className="font-bold text-white mb-2">Refund Policy</h4>
                                    <p className="text-slate-400">
                                        Digital products are generally non-refundable. Refunds are considered on a case-by-case basis for technical issues. Contact <a href="mailto:support@astrozen.com" className="text-yellow-400">support@astrozen.com</a> within 7 days.
                                    </p>
                                </div>
                                <div className="bg-purple-900/20 p-4 rounded-lg">
                                    <h4 className="font-bold text-purple-300 mb-2">Premium Features</h4>
                                    <p className="text-slate-400">Include detailed analysis, unlimited charts, priority support, and astrologer consultations.</p>
                                </div>
                            </div>
                        </section>

                        {/* 2.8 Limitation of Liability */}
                        <section className="bg-slate-800 p-6 rounded-xl text-center">
                            <h2 className="text-lg font-bold text-white mb-3">2.8 Limitation of Liability</h2>
                            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                                AstroZen is provided "as is". We strive for accuracy but do not guarantee it. We are not liable for decisions made based on predictions. Use our service at your own discretion.
                            </p>
                        </section>

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TermsOfServiceModal;
