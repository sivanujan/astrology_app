import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Star, MessageSquare } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Changed updateDoc to setDoc
import { db } from '../lib/firebase';

interface FeedbackWidgetProps {
    messageId: string;
    messagePath: string; // "users/{uid}/charts/{chartId}/messages/{msgId}"
    existingFeedback?: { score: number; comment?: string };
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ messageId, messagePath, existingFeedback }) => {
    const [score, setScore] = useState(existingFeedback?.score || 50);
    const [comment, setComment] = useState(existingFeedback?.comment || "");
    const [isSubmitted, setIsSubmitted] = useState(!!existingFeedback);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getScoreLabel = (s: number) => {
        if (s < 30) return "Not Accurate";
        if (s < 70) return "Somewhat Accurate";
        return "Very Accurate";
    };

    const getScoreColor = (s: number) => {
        if (s < 30) return "text-red-400";
        if (s < 70) return "text-yellow-400";
        return "text-green-400";
    };

    const handleSubmit = async () => {
        if (!messagePath) {
            alert("Error: Message ID missing. Cannot save.");
            return;
        }
        setIsSubmitting(true);
        try {
            console.log("Saving feedback to:", messagePath);
            const msgRef = doc(db, messagePath);
            // Use setDoc with merge to ensure it works even if fields are missing
            await setDoc(msgRef, {
                feedback: {
                    score,
                    comment,
                    timestamp: serverTimestamp()
                }
            }, { merge: true });

            setIsSubmitted(true);
            setTimeout(() => setIsExpanded(false), 2000); // Auto close after success
        } catch (error: any) {
            console.error("Error submitting feedback:", error);
            alert(`Failed to save feedback: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted && !isExpanded) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-slate-400 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => setIsExpanded(true)}
            >
                <Star className={`w-3 h-3 ${getScoreColor(score)}`} fill="currentColor" />
                <span>You rated this {score}% Accurate</span>
            </motion.div>
        );
    }

    return (
        <div className="mt-4 border-t border-white/10 pt-4 w-full max-w-sm">
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-2 transition-colors"
                >
                    <Star className="w-3 h-3" />
                    Rate Prediction Accuracy
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20 backdrop-blur-sm"
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-300">Rate Accuracy</span>
                        <span className={`text-xs font-mono font-bold ${getScoreColor(score)}`}>
                            {score}%
                        </span>
                    </div>

                    {/* Gradient Slider */}
                    <div className="relative h-2 bg-slate-700 rounded-full mb-6">
                        <div
                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-yellow-400"
                            style={{ width: `${score}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) => setScore(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {/* Thumb Indicator (Visual only, follows score) */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-75"
                            style={{ left: `calc(${score}% - 8px)` }}
                        />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-4">
                        <span>Not Accurate</span>
                        <span>Very Accurate</span>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-3">
                        <div className="relative">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us more (optional)..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 min-h-[60px]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="flex-1 py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                            >
                                {isSubmitting ? (
                                    <span>Saving...</span>
                                ) : (
                                    <>
                                        Submit <Send className="w-3 h-3" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default FeedbackWidget;
