import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Loader2, ChevronRight, User, CheckCircle, AlertCircle, Sparkles, Save, Moon, Activity } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

import SouthIndianChart from '../../components/SouthIndianChart';
import DashaPeriods from '../../components/DashaPeriods';
import ChartAnalysis from '../../components/ChartAnalysis';
import DailySnapshot from '../../components/DailySnapshot';
import AIPredictions from '../../components/AIPredictions';
import { SceneAIChat } from '../../components/demo-scenes/SceneAIChat';
import { SceneDashboard } from '../../components/demo-scenes/SceneDashboard';
import SceneWhoAmI from '../../components/demo-scenes/SceneWhoAmI';
import SceneEndingPremium from '../../components/demo-scenes/SceneEndingPremium';

import { ZODIAC_SIGNS, NAKSHATRAS } from '../../utils/constants';

// --- DUMMY DATA ---
const DEMO_DATE = new Date("2000-04-14T14:13:00"); // Apr 14, 2000, 2:13 PM
const DEMO_LOCATION = { lat: 9.6615, lng: 80.0255, name: "Jaffna, Sri Lanka" };

const DUMMY_CHART_DATA = {
    user: {
        name: "AstroZen Demo",
        gender: "male",
        dob: "14/04/2000",
        tob: "14:13",
        place: "Jaffna, Sri Lanka"
    },
    timestamp: DEMO_DATE.toISOString(),
    birthDate: DEMO_DATE,
    latitude: DEMO_LOCATION.lat,
    longitude: DEMO_LOCATION.lng,
    ayanamsa: 23.85,
    ascendant: {
        longitude: 127.5,
        degree: 127.5,
        signIndex: 4,
        nakshatra: "Magha",
        pada: 3
    },
    planets: [
        { name: "Sun", longitude: 0.5, speed: 0.9, isRetrograde: false, signIndex: 0 },
        { name: "Moon", longitude: 134.2, speed: 12, isRetrograde: false, signIndex: 4 },
        { name: "Mars", longitude: 63.4, speed: 0.5, isRetrograde: false, signIndex: 2 },
        { name: "Mercury", longitude: 356.8, speed: 1.4, isRetrograde: false, signIndex: 11 },
        { name: "Jupiter", longitude: 33.1, speed: 0.2, isRetrograde: false, signIndex: 1 },
        { name: "Venus", longitude: 358.5, speed: 1.2, isRetrograde: false, signIndex: 11 },
        { name: "Saturn", longitude: 35.4, speed: 0.05, isRetrograde: false, signIndex: 1 },
        { name: "Rahu", longitude: 94.2, speed: -0.05, isRetrograde: true, signIndex: 3 },
        { name: "Ketu", longitude: 274.2, speed: -0.05, isRetrograde: true, signIndex: 9 }
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({ number: i + 1, signIndex: (4 + i) % 12, longitude: (127.5 + i * 30) % 360 }))
};

const DETAILS_DISPLAY = {
    rasi: "Simha (Leo)",
    nakshatra: "Magha (3)",
    lagna: "Simha (Leo)",
    dateStr: "14 Apr 2000"
};

const StarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
    </svg>
);

const DemoPage = () => {
    // We mock t.input for the exact labels used in InputForm.tsx
    const t = {
        input: {
            title: "Enter Your Birth Details",
            subtitle: "Reveal your destiny through Vedic Astrology",
            name: "Full Name",
            gender: "Gender",
            male: "Male",
            female: "Female",
            other: "Other",
            dob: "Date of Birth",
            tob: "Time of Birth",
            pob: "Place of Birth",
            generating: "Calculating Planetary Positions...",
            generateBtn: "Generate Vedic Chart",
            unknownTime: "I don't know my birth time",
            estimatedLagna: "Estimated Lagna",
            confidence: "confidence"
        }
    };

    const [chartData] = useState<any>(DUMMY_CHART_DATA);

    // Automation State
    const [showChart, setShowChart] = useState(false);
    const [showText, setShowText] = useState(false); // Control text visibility separately
    const [showDasha, setShowDasha] = useState(false); // Control Dasha page visibility
    const [showDashaText, setShowDashaText] = useState(false);
    const [demoAccordionTrigger, setDemoAccordionTrigger] = useState(false);
    const [showDemoAnalysis, setShowDemoAnalysis] = useState(false);
    const [showChat, setShowChat] = useState(false);  // New: Chat UI state
    const [showDashboard, setShowDashboard] = useState(false);  // New: Dashboard state
    const [showWhoAmI, setShowWhoAmI] = useState(false);  // New: Who Am I state
    const [showEnding, setShowEnding] = useState(false);  // New: Ending scene state
    const [isDemoComplete, setIsDemoComplete] = useState(false); // Control Dasha AI text generation

    // Form Data States (Controlled by Automation)
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [date, setDate] = useState(''); // Text input value
    const [time, setTime] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [cityResults, setCityResults] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [activeField, setActiveField] = useState<string>(''); // Track which field is being typed
    const [validationStates, setValidationStates] = useState({
        name: { isValid: false, error: '' },
        date: { isValid: false, error: '' },
        time: { isValid: false, error: '' },
        city: { isValid: false, error: '' }
    });

    // Automation Logic
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    const typeText = async (text: string, setter: React.Dispatch<React.SetStateAction<string>>, baseSpeed = 70) => {
        let current = "";
        for (let i = 0; i < text.length; i++) {
            current += text[i];
            setter(current);
            await wait(baseSpeed); // Simple consistent delay
        }
    };

    useEffect(() => {
        const runDemo = async () => {
            await wait(1000);

            // Name
            setActiveField('name');
            await typeText("AstroZen Demo", setName, 90);
            setValidationStates(prev => ({ ...prev, name: { isValid: true, error: '' } }));
            setActiveField('');
            await wait(400);

            // Gender
            setActiveField('gender');
            setGender('male');
            await wait(600);
            setActiveField('');

            // Date
            setActiveField('date');
            await typeText("14/04/2000", setDate, 70);
            setValidationStates(prev => ({ ...prev, date: { isValid: true, error: '' } }));
            setActiveField('');
            await wait(400);

            // Time
            setActiveField('time');
            await typeText("14:13", setTime, 90);
            setValidationStates(prev => ({ ...prev, time: { isValid: true, error: '' } }));
            setActiveField('');
            await wait(400);

            // City - Direct typing
            setActiveField('city');
            await typeText("Jaffna, Northern Province, Jaffna", setCitySearch, 70);
            setValidationStates(prev => ({ ...prev, city: { isValid: true, error: '' } }));
            setActiveField('');

            // Generate
            await wait(500);
            setIsGenerating(true);
            await wait(1200); // "Processing"

            // Trigger Transition - Chart first, then text
            setShowChart(true);
            await wait(800); // Wait for chart to appear
            setShowText(true);

            // Wait for chart animations to complete, then show Dasha
            await wait(9000); // Wait for all chart animations (8s) + buffer
            setShowDasha(true);

            // Auto-scroll to center the Current Dasha card for screen recording
            await wait(500);
            window.scrollTo({
                top: 400, // Scroll down to show Current Dasha card
                behavior: 'smooth'
            });

            // Wait for Dasha page entry, then trigger AI text generation
            await wait(2000);
            setShowDashaText(true);

            // Wait for 3D Counter Animation (3s + 1s settle)
            await wait(4500);

            // Scroll to the accordion section FIRST (while likely closed)
            const expandedElement = document.getElementById('current-maha-expanded');
            if (expandedElement) {
                expandedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Wait for scroll to complete
            await wait(1000);

            // THEN Trigger Accordion Expansion & Staggered List
            setDemoAccordionTrigger(true);

            // Wait for expansion animation to start
            await wait(500);

            // Scroll to the expanded card to center it
            const expandedCard = document.getElementById('current-maha-expanded');
            if (expandedCard) {
                expandedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Wait for Bhukti items to appear one by one (8 items * 0.35s = ~3s)
            await wait(3000);

            // Quick scroll sequence to show full list (~2 seconds total)
            window.scrollBy({ top: 700, behavior: 'smooth' });
            await wait(400);

            window.scrollBy({ top: 700, behavior: 'smooth' });
            await wait(400);

            window.scrollBy({ top: 800, behavior: 'smooth' });
            await wait(400);

            // Transition directly to Chat UI
            setShowChat(true);

            // Wait for chat to complete (increased to show full conversation)
            await wait(25000);

            // Transition to Dashboard
            setShowChat(false);
            await wait(500);
            setShowDashboard(true);

            // Wait for dashboard to show and card popup to complete
            await wait(6000);

            // Open Who Am I scene automatically
            setShowWhoAmI(true);

            // Wait for Who Am I to complete (reduced planets = faster)
            await wait(12000);

            // Close Who Am I and show Ending scene
            setShowWhoAmI(false);
            await wait(500);
            setShowEnding(true);

            // Wait for ending scene to complete (20s premium animation)
            await wait(20000);

            // Mark demo complete
            setIsDemoComplete(true);
        };

        runDemo();
    }, []);

    // Auto-scroll when chart appears
    useEffect(() => {
        if (showChart) {
            // Smooth scroll down to center the chart
            window.scrollTo({
                top: 200,
                behavior: 'smooth'
            });
        }
    }, [showChart]);


    return (
        /* Outer container to prevent all scrollbars during demo */
        <div className="fixed inset-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #0f172a 100%)" }}>
            <AnimatePresence mode="wait">
                {!showChart ? (
                    <motion.div
                        key="input-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                            opacity: 0,
                            y: 500,
                            transition: { duration: 0.8, ease: "easeInOut" }
                        }}
                        className="max-w-2xl w-full mx-auto relative z-10 pt-32 px-4"
                    >
                        <motion.div
                            className="glass-panel p-8 md:p-12"
                            animate={{ scale: activeField ? 1.02 : 1 }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
                                    {t.input.title}
                                </h1>
                                <p className="text-slate-400 text-lg">
                                    {t.input.subtitle}
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">{t.input.name}</label>
                                    <motion.div
                                        className="relative"
                                        animate={{ scale: activeField === 'name' ? 1.15 : 1 }}
                                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                    >
                                        <input
                                            type="text"
                                            readOnly
                                            value={name}
                                            className="w-full min-w-0 appearance-none bg-slate-800/60 border border-slate-600 rounded-lg px-3 md:px-4 py-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all text-white placeholder-slate-400"
                                            placeholder="e.g. Arjuna"
                                        />
                                        {name && validationStates.name.isValid && (
                                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                        )}
                                    </motion.div>
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                        <User className="w-4 h-4" /> {t.input.gender}
                                    </label>
                                    <motion.div
                                        className="grid grid-cols-3 gap-4"
                                        animate={{ scale: activeField === 'gender' ? 1.15 : 1 }}
                                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                    >
                                        {['male', 'female', 'other'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium ${gender === g
                                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                                                    : 'bg-slate-900/50 border-slate-700 text-slate-400'
                                                    }`}
                                            >
                                                {t.input[g as keyof typeof t.input]}
                                            </button>
                                        ))}
                                    </motion.div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Date Input */}
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> {t.input.dob}
                                        </label>

                                        <motion.div
                                            className="relative"
                                            animate={{ scale: activeField === 'date' ? 1.15 : 1 }}
                                            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                        >
                                            <input
                                                type="text"
                                                readOnly
                                                value={date}
                                                placeholder="dd/mm/yyyy"
                                                className="w-full min-w-0 appearance-none bg-slate-800/60 border border-slate-600 rounded-lg px-3 md:px-4 py-3 pr-12 md:pr-20 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all text-white placeholder-slate-400"
                                            />
                                            {date && validationStates.date.isValid && (
                                                <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                            )}
                                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Calendar className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    </div>

                                    {/* Time Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> {t.input.tob}
                                        </label>
                                        <motion.div
                                            className="relative"
                                            animate={{ scale: activeField === 'time' ? 1.15 : 1 }}
                                            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                        >
                                            <input
                                                type="text" // Using text to show typing effect correctly
                                                readOnly
                                                value={time}
                                                className="w-full min-w-0 appearance-none bg-slate-800/60 border border-slate-600 rounded-lg px-3 md:px-4 py-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all text-white"
                                            />
                                            {time && validationStates.time.isValid && (
                                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                            )}
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Place of Birth */}
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {t.input.pob}
                                    </label>
                                    <motion.div
                                        className="relative"
                                        animate={{ scale: activeField === 'city' ? 1.15 : 1 }}
                                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                    >
                                        <input
                                            type="text"
                                            readOnly
                                            value={citySearch}
                                            className="w-full min-w-0 appearance-none bg-slate-800/60 border border-slate-600 rounded-lg py-3 pl-12 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all text-white placeholder-slate-400"
                                            placeholder="Search city..."
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        {isSearching && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 animate-spin" />
                                        )}
                                        {citySearch && !isSearching && validationStates.city.isValid && (
                                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                        )}
                                    </motion.div>

                                    {/* Dropdown Results */}
                                    {showDropdown && cityResults.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {cityResults.map((city) => (
                                                <button
                                                    key={city.id}
                                                    type="button"
                                                    className="w-full text-left px-4 py-3 bg-slate-800 text-white flex items-center justify-between group border-l-4 border-purple-500"
                                                >
                                                    <div>
                                                        <span className="block font-medium">{city.name}</span>
                                                        <span className="text-xs text-slate-400">{city.admin1}, {city.country}</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-purple-400" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    disabled={isGenerating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t.input.generating}
                                        </>
                                    ) : (
                                        <>
                                            {t.input.generateBtn}
                                            <StarIcon />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : !showDasha ? (
                    <motion.div
                        key="chart-dashboard"
                        exit={{
                            opacity: 0,
                            scale: 0.92,
                            y: -50,
                            filter: "blur(8px)",
                            transition: {
                                duration: 0.6,
                                ease: [0.43, 0.13, 0.23, 0.96],
                                filter: { duration: 0.5 },
                                scale: { duration: 0.5 },
                                opacity: { duration: 0.4 }
                            }
                        }}
                        className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8 pt-24"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* South Indian Chart with Building Animation */}
                        <motion.div
                            id="chart-section"
                            className="scroll-mt-24"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <style>{`
                            /* ===== PHASE 1: ENTRANCE ANIMATIONS ===== */
                            
                            /* Header Section - Title and subtitle */
                            #chart-section h2 {
                                animation: fadeSlideDown 0.6s ease-out backwards;
                            }
                            
                            #chart-section h2 + p {
                                animation: fadeIn 0.5s ease-out 0.2s backwards;
                            }
                            
                            /* Birth Details Section Header */
                            #chart-section h3:first-of-type {
                                animation: fadeSlideUp 0.5s ease-out 0.7s backwards;
                            }
                            
                            /* Birth Detail Cards - Target bg-slate-800 cards */
                            #chart-section .bg-slate-800\\/40:nth-of-type(1) {
                                animation: cardDeal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s backwards;
                            }
                            #chart-section .bg-slate-800\\/40:nth-of-type(2) {
                                animation: cardDeal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s backwards;
                            }
                            #chart-section .bg-slate-800\\/40:nth-of-type(3) {
                                animation: cardDeal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s backwards;
                            }
                            #chart-section .bg-gradient-to-br {
                                animation: cardDeal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s backwards;
                            }
                            
                            /* Chart Headers - "Rasi Chart" and "Navamsa Chart" */
                            #chart-container h3 {
                                animation: fadeSlideUp 0.5s ease-out 1.7s backwards;
                            }
                            
                            /* Chart Grids */
                            #chart-container svg,
                            #chart-container canvas,
                            #chart-container > div {
                                animation: gridMaterialize 0.6s ease-out 2.0s backwards;
                            }
                            
                            /* Planet Names - Target spans with planet colors */
                            #chart-container .text-orange-400,
                            #chart-container .text-white,
                            #chart-container .text-red-400,
                            #chart-container .text-green-400,
                            #chart-container .text-yellow-400,
                            #chart-container .text-blue-400,
                            #chart-container .text-pink-400 {
                                animation: planetAppear 0.5s ease-out backwards;
                            }
                            
                            /* Stagger planets by color - approximate order */
                            #chart-container .text-orange-400:nth-of-type(1) { animation-delay: 2.6s; }
                            #chart-container .text-white:nth-of-type(1) { animation-delay: 3.0s; }
                            #chart-container .text-red-400:nth-of-type(1) { animation-delay: 3.4s; }
                            #chart-container .text-green-400:nth-of-type(1) { animation-delay: 3.8s; }
                            #chart-container .text-yellow-400:nth-of-type(1) { animation-delay: 4.2s; }
                            #chart-container .text-blue-400:nth-of-type(1) { animation-delay: 4.6s; }
                            #chart-container .text-pink-400:nth-of-type(1) { animation-delay: 5.0s; }
                            
                            /* Additional planets */
                            #chart-container .text-green-400:nth-of-type(2) { animation-delay: 5.4s; }
                            #chart-container .text-pink-400:nth-of-type(2) { animation-delay: 5.8s; }
                            
                            /* Lagna Badges - purple bg */
                            #chart-container .bg-purple-600,
                            #chart-container .bg-purple-500 {
                                animation: badgeLand 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 6.4s backwards;
                            }
                            
                            /* OM Symbols */
                            #chart-container .text-4xl {
                                animation: omFade 1.0s ease-out 7.0s backwards !important;
                            }
                            
                            /* Footer Text */
                            #chart-section > div > div:last-child p {
                                animation: fadeIn 0.6s ease-out 8.0s backwards;
                            }
                            
                            /* ===== KEYFRAME DEFINITIONS ===== */
                            @keyframes fadeSlideDown {
                                from {
                                    opacity: 0;
                                    transform: translateY(-20px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                            
                            @keyframes fadeSlideUp {
                                from {
                                    opacity: 0;
                                    transform: translateY(15px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                            
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            
                            @keyframes cardDeal {
                                from {
                                    opacity: 0;
                                    transform: translateY(20px) scale(0.95);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0) scale(1);
                                }
                            }
                            
                            @keyframes gridMaterialize {
                                from {
                                    opacity: 0;
                                }
                                to {
                                    opacity: 1;
                                }
                            }
                            
                            @keyframes planetAppear {
                                from {
                                    opacity: 0;
                                    transform: scale(0.7);
                                    filter: brightness(0.3);
                                }
                                50% {
                                    transform: scale(1.15);
                                    filter: brightness(1.3);
                                }
                                to {
                                    opacity: 1;
                                    transform: scale(1);
                                    filter: brightness(1);
                                }
                            }
                            
                            /* Chart pulse when planets appear */
                            @keyframes chartPulse {
                                0%, 100% {
                                    transform: scale(1);
                                }
                                50% {
                                    transform: scale(1.02);
                                }
                            }
                            
                            /* Apply pulse to chart container during planet population */
                            #chart-container {
                                animation: chartPulse 0.6s ease-in-out 2.6s 3;
                            }
                            
                            @keyframes badgeLand {
                                from {
                                    opacity: 0;
                                    transform: translateY(-20px) scale(0.5);
                                }
                                60% {
                                    transform: translateY(0) scale(1.15);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0) scale(1);
                                }
                            }
                            
                            @keyframes omFade {
                                from {
                                    opacity: 0;
                                }
                                to {
                                    opacity: 0.2;
                                }
                            }
                            
                            /* ===== PHASE 2: INTERACTIVE HOVER EFFECTS ===== */
                            
                            /* Birth Detail Cards Hover */
                            #chart-section .bg-slate-800\\/40,
                            #chart-section .bg-gradient-to-br {
                                transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
                            }
                            
                            #chart-section .bg-slate-800\\/40:hover,
                            #chart-section .bg-gradient-to-br:hover {
                                transform: translateY(-3px);
                                box-shadow: 0 10px 30px rgba(147, 51, 234, 0.3);
                            }
                            
                            /* Planet Names Hover */
                            #chart-container .text-orange-400:hover,
                            #chart-container .text-white:hover,
                            #chart-container .text-red-400:hover,
                            #chart-container .text-green-400:hover,
                            #chart-container .text-yellow-400:hover,
                            #chart-container .text-blue-400:hover,
                            #chart-container .text-pink-400:hover {
                                filter: brightness(1.3);
                                transform: scale(1.05);
                                text-shadow: 0 0 8px currentColor;
                                cursor: pointer;
                                transition: filter 0.15s ease-out, transform 0.15s ease-out;
                            }
                            
                            /* Lagna Badge Hover */
                            #chart-container .bg-purple-600:hover,
                            #chart-container .bg-purple-500:hover {
                                transform: scale(1.03);
                                filter: brightness(1.1);
                                transition: transform 0.2s ease-out, filter 0.2s ease-out;
                            }
                            
                            /* ===== FIT CHART TO SCREEN ===== */
                            #chart-section > div {
                                transform: scale(1.0);
                                transform-origin: top center;
                                margin-top: -100px;
                            }
                        `}</style>
                            <SouthIndianChart data={{
                                ...DUMMY_CHART_DATA,
                                userDetails: {
                                    name: DUMMY_CHART_DATA.user.name,
                                    date: "2000-04-14",
                                    time: DUMMY_CHART_DATA.user.tob,
                                    city: DUMMY_CHART_DATA.user.place
                                }
                            }} />
                        </motion.div>
                    </motion.div>
                ) : null}
                {/* Dasha Periods Page */}
                {showDasha && (
                    <div
                        className="relative w-full min-h-screen flex items-center justify-center py-20"
                        style={{
                            perspective: '2000px',
                            perspectiveOrigin: '50% 50%'
                        }}
                    >
                        <motion.div
                            key="dasha-page"
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                                y: 100,
                                rotateX: 15,
                                rotateY: -20,
                                filter: "blur(12px)"
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                rotateX: 5,
                                rotateY: -10,
                                filter: "blur(0px)"
                            }}
                            transition={{
                                duration: 1.2,
                                ease: [0.43, 0.13, 0.23, 0.96],
                                scale: { duration: 1.0, ease: [0.34, 1.56, 0.64, 1] },
                                rotateX: { duration: 1.1 },
                                rotateY: { duration: 1.1 },
                                filter: { duration: 0.8 },
                                opacity: { duration: 0.6, delay: 0.15 }
                            }}
                            style={isDemoComplete ? {
                                transform: 'none',
                                boxShadow: 'none',
                                borderRadius: '0px',
                                background: 'transparent',
                                backdropFilter: 'none',
                                border: 'none',
                                maxWidth: '100%',
                                padding: '1rem'
                            } : {
                                transformStyle: 'preserve-3d',
                                transform: 'translateZ(0)',
                                boxShadow: 'none',
                                borderRadius: '0px',
                                background: 'transparent',
                                backdropFilter: 'none',
                                border: 'none'
                            }}
                            className={`relative w-full mx-auto px-8 py-12 space-y-8 transition-all duration-1000 ${isDemoComplete ? '' : 'max-w-[1600px]'}`}
                        >
                            {/* Ambient Glow Effects */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 blur-3xl opacity-30 -z-10 rounded-3xl" />
                            <div className="absolute -inset-2 bg-gradient-to-b from-purple-500/10 to-transparent blur-2xl -z-10 rounded-3xl" />


                            {/* Dasha Overview */}
                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0, type: "spring", stiffness: 100 }}
                            >

                                {showDashaText ? (
                                    <div className="pt-8 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
                                        <DashaPeriods
                                            data={chartData}
                                            isDemoMode={true}
                                            demoTrigger={demoAccordionTrigger}
                                            hideHeader={false}
                                        />
                                    </div>
                                ) : (
                                    /* Thinking State - FULL PAGE SKELETON (Component Only) */
                                    <div className="space-y-8 animate-pulse pt-4">
                                        {/* Stats Cards Skeleton */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="h-24 bg-slate-800/30 rounded-xl border border-white/5"></div>
                                            <div className="h-24 bg-slate-800/30 rounded-xl border border-white/5"></div>
                                            <div className="h-24 bg-slate-800/30 rounded-xl border border-white/5"></div>
                                        </div>

                                        {/* Main Dasha Card Skeleton */}
                                        <div className="h-48 bg-slate-800/30 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                                            <div className="w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                                            <span className="relative z-10 text-xs text-white/20 uppercase tracking-widest">Calculating Planetary Periods...</span>
                                        </div>

                                        {/* List Skeleton */}
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="h-16 bg-slate-800/20 rounded-lg border border-white/5"></div>
                                            ))}
                                        </div>
                                    </div>
                                )}


                            </motion.div>
                        </motion.div>
                    </div>
                )}

                {/* Chat UI with 3D Card Transition */}
                <AnimatePresence>
                    {showChat && (
                        <motion.div
                            key="chat-ui"
                            initial={{
                                opacity: 0,
                                rotateY: 90,
                                scale: 0.8,
                                z: -500
                            }}
                            animate={{
                                opacity: 1,
                                rotateY: 0,
                                scale: 1,
                                z: 0
                            }}
                            exit={{
                                opacity: 0,
                                y: '100vh',
                                scale: 0.9
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 80,
                                damping: 20,
                                duration: 1.2
                            }}
                            style={{
                                perspective: 1500,
                                transformStyle: "preserve-3d"
                            }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm"
                        >
                            {/* 3D Card Container */}
                            <motion.div
                                initial={{ rotateX: 15, y: 50 }}
                                animate={{ rotateX: 0, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                                className="relative w-full max-w-lg mx-4 h-[85vh] rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/30 border border-purple-500/20"
                                style={{
                                    transformStyle: "preserve-3d",
                                    background: "linear-gradient(180deg, rgba(30,20,60,0.98) 0%, rgba(15,10,35,0.98) 100%)"
                                }}
                            >
                                {/* Glowing Edge Effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-purple-600/20 blur-xl -z-10" />

                                {/* Chat Content */}
                                <SceneAIChat />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dashboard with 3D Flip Transition */}
                <AnimatePresence>
                    {showDashboard && (
                        <motion.div
                            key="dashboard-ui"
                            initial={{
                                opacity: 0,
                                y: '-100vh',
                                scale: 0.95
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1
                            }}
                            exit={{
                                opacity: 0,
                                y: '100vh',
                                scale: 0.9
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 50,
                                damping: 18,
                                duration: 1
                            }}
                            style={{
                                perspective: 1500,
                                transformStyle: "preserve-3d",
                                background: "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #0f172a 100%)"
                            }}
                            className="fixed inset-0 z-[9999] overflow-hidden"
                        >
                            {/* Full Screen Dashboard */}
                            <motion.div
                                initial={{ rotateX: 10, y: 50, opacity: 0 }}
                                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                                className="w-full h-full overflow-hidden"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Dashboard Content - Full Screen */}
                                <SceneDashboard onWhoAmIClick={() => setShowWhoAmI(true)} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Who Am I Scene */}
                <AnimatePresence>
                    {showWhoAmI && (
                        <SceneWhoAmI onClose={() => setShowWhoAmI(false)} />
                    )}
                </AnimatePresence>

                {/* Ending Scene */}
                <AnimatePresence>
                    {showEnding && <SceneEndingPremium />}
                </AnimatePresence>
            </AnimatePresence >
        </div >
    );
};

export default DemoPage;

