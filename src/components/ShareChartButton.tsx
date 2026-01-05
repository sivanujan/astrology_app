import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { useChartData } from '../contexts/ChartContext';
import { generateSingleChartShareLink } from '../utils/urlUtils';
import { useLocation } from 'react-router-dom';

interface ShareChartButtonProps {
    className?: string;
    variant?: 'icon' | 'button';
}

const ShareChartButton: React.FC<ShareChartButtonProps> = ({ className = '', variant = 'button' }) => {
    const { chartData } = useChartData();
    const location = useLocation();
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (!chartData || !chartData.userDetails) {
            console.error("No chart data to share");
            return;
        }

        const details = chartData.userDetails;

        // Map userDetails to HelperBirthDetails format if needed
        const shareDetails = {
            name: details.name,
            date: details.date,
            time: details.time,
            lat: details.lat,
            lng: details.lng,
            city: details.city, // urlUtils handles 'city' fallback
            place: details.place || details.city
        };

        const link = generateSingleChartShareLink(location.pathname, shareDetails);

        const shareData = {
            title: `AstroZen Chart: ${details.name}`,
            text: `Check out this Vedic Astrology Chart for ${details.name}!`,
            url: link
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy link", err);
                alert("Could not copy link. Manually copy the URL from browser.");
            }
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleShare}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors text-purple-400 hover:text-purple-300 ${className}`}
                title="Share Chart"
            >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg transition-colors text-sm font-medium ${className}`}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                </>
            )}
        </button>
    );
};

export default ShareChartButton;
