import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MessageCircle, Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatLimitWarningProps {
    remaining: number;
    limit: number;
    onActivatePromo: () => void;
}

const ChatLimitWarning: React.FC<ChatLimitWarningProps> = ({ remaining, limit, onActivatePromo }) => {
    const { language } = useLanguage();

    // Always show the component (removed: if (remaining > 2) return null;)

    // Determine colors based on remaining chats
    const isUrgent = remaining <= 2;
    const isExhausted = remaining === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-xl border ${isExhausted
                    ? 'bg-red-500/20 border-red-500/50'
                    : isUrgent
                        ? 'bg-yellow-500/20 border-yellow-500/50'
                        : 'bg-blue-500/10 border-blue-500/30'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isExhausted ? 'bg-red-500/30' : isUrgent ? 'bg-yellow-500/30' : 'bg-blue-500/20'
                    }`}>
                    {isExhausted ? (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : isUrgent ? (
                        <MessageCircle className="w-5 h-5 text-yellow-400" />
                    ) : (
                        <MessageCircle className="w-5 h-5 text-blue-400" />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${isExhausted ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                        {isExhausted
                            ? (language === 'ta' ? 'அரட்டை வரம்பு எட்டப்பட்டது' : 'Chat Limit Reached')
                            : (language === 'ta' ? `${remaining} அரட்டைகள் மீதமுள்ளன` : `${remaining} Chats Remaining`)
                        }
                    </h3>
                    <p className={`text-sm ${isExhausted ? 'text-red-300' : isUrgent ? 'text-yellow-300' : 'text-blue-300'
                        }`}>
                        {isExhausted
                            ? (language === 'ta'
                                ? 'நாளைக்கு மீண்டும் முயற்சிக்கவும் அல்லது ப்ரோமோ குறியீட்டைப் பயன்படுத்தவும்'
                                : 'Try again tomorrow or use a promo code for unlimited access'
                            )
                            : (language === 'ta'
                                ? `இன்று உங்களிடம் ${remaining}/${limit} அரட்டைகள் மீதமுள்ளன. வரம்பற்ற அணுகலுக்கு ப்ரோமோ குறியீட்டைப் பயன்படுத்தவும்.`
                                : `You have ${remaining}/${limit} chats left today. Use a promo code for unlimited access.`
                            )
                        }
                    </p>
                    {/* Always show promo button */}
                    <button
                        onClick={onActivatePromo}
                        className={`mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${isExhausted ? 'animate-pulse' : ''
                            }`}
                    >
                        <Gift className="w-4 h-4" />
                        {language === 'ta' ? 'ப்ரோமோ குறியீட்டைப் பயன்படுத்தவும்' : 'Use Promo Code'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatLimitWarning;
