import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, MessageCircle, Gift, Bot, User, AlertCircle, BrainCircuit, Clock, Heart, Briefcase, Shield, Star, Users, BarChart2, Zap, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation, useNavigate
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { queryAstrologyOrchestrator, OrchestratorResponse } from '../utils/aiOrchestrator';
import FeedbackWidget from './FeedbackWidget';
import PromoCodeModal from './PromoCodeModal';
import ChatLimitWarning from './ChatLimitWarning';
import PromoStatusBadge from './PromoStatusBadge';
import { initDeviceTracking, generateFingerprint, getIPAddress } from '../utils/deviceFingerprint';

// Typewriter Animation Component
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 20 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed]);

    return <div className="whitespace-pre-wrap">{displayedText}</div>;
};

// Format AI Response with Headers and Dividers
const formatAIResponse = (text: string): string => {
    if (!text) return text;

    // Add section dividers and headers
    let formatted = text;

    // Replace common patterns with formatted versions
    const patterns = [
        // Lagna/Ascendant headers
        { regex: /(?:🌟\s*)?(?:Your Lagna|உங்கள் லக்னம்|Lagna|லக்னம்)(?:\s*\(Ascendant\))?/gi, replacement: '\n🌟 YOUR LAGNA (ASCENDANT)\n━━━━━━━━━━━━━━━━━━━━━━\n' },

        // Strength/Analysis headers
        { regex: /(?:💪\s*)?(?:Strength Analysis|வலிமை பகுப்பாய்வு)/gi, replacement: '\n\n━━━━━━━━━━━━━━━━━━━━━━\n💪 STRENGTH ANALYSIS\n━━━━━━━━━━━━━━━━━━━━━━\n' },

        // Critical/Warning headers
        { regex: /(?:⚠️\s*)?(?:Critical Weakness|முக்கிய பலவீனம்)/gi, replacement: '\n\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ CRITICAL WEAKNESS\n━━━━━━━━━━━━━━━━━━━━━━\n' },

        // Personality/Effects headers
        { regex: /(?:✨\s*)?(?:Personality Effects|ஆளுமை விளைவுகள்)/gi, replacement: '\n\n━━━━━━━━━━━━━━━━━━━━━━\n✨ PERSONALITY EFFECTS\n━━━━━━━━━━━━━━━━━━━━━━\n' },

        // Basic Details/Info
        { regex: /(?:📋\s*)?(?:Basic Details|அடிப்படை விவரங்கள்)/gi, replacement: '\n📋 Basic Details:\n' },

        // Positive/Negative grouping
        { regex: /Positive:/gi, replacement: '\n✅ Positive:\n' },
        { regex: /Negative:/gi, replacement: '\n❌ Negative:\n' },
    ];

    patterns.forEach(({ regex, replacement }) => {
        formatted = formatted.replace(regex, replacement);
    });

    // Add spacing after progress bars
    formatted = formatted.replace(/(█+░+\s*\d+%)/g, '$1\n');

    // Clean up multiple newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
};

interface AIPredictionsProps {
    data: any;
}

const AIPredictions: React.FC<AIPredictionsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const isTamil = language === 'ta';
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get navigation state
    const [prediction, setPrediction] = useState<OrchestratorResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [question, setQuestion] = useState('');
    const [responseLanguage, setResponseLanguage] = useState<'en' | 'ta'>('en'); // LOCAL chat language, independent from app language
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth(); // Auth context

    // Chat Limit State - START BLOCKED, then enable after API confirms
    const [chatLimit, setChatLimit] = useState({ canChat: false, remaining: 0, limit: 2, hasPromo: false });
    const [promoStatus, setPromoStatus] = useState<{ hasActivePromo: boolean; promoCode?: string; expiresAt?: Date; duration?: string } | null>(null);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState<{ fingerprint: string; ipAddress: string } | null>(null);
    const [latestAIMessageIndex, setLatestAIMessageIndex] = useState<number>(-1); // Track the newest AI message for animation

    // Check for initial message from navigation (e.g., from "Wrong Prediction" button)
    useEffect(() => {
        if (location.state && location.state.initialMessage) {
            setQuestion(location.state.initialMessage);
            // Optional: clear state so it doesn't persist on refresh? 
            // window.history.replaceState({}, document.title)
        }
    }, [location]);

    // Firestore Integration
    useEffect(() => {
        if (!user || !data) return;

        // Generate a simplified chart ID or use Name+DOB key
        const chartId = `${data.userDetails.name}_${new Date(data.birthDate).getTime()}`.replace(/[^a-zA-Z0-9]/g, '_');
        const messagesRef = collection(db, `users/${user.uid}/charts/${chartId}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Add welcome message if chat is empty
                if (msgs.length === 0) {
                    const userName = data.userDetails.name || 'there';
                    const welcomeMsg = {
                        id: 'welcome',
                        role: 'assistant',
                        content: language === 'ta'
                            ? `வணக்கம் ${userName}! 🙏✨\n\nநான் உங்கள் ஜோதிட ஆலோசகர். உங்கள் ஜாதகம் பற்றி எந்த கேள்வியும் கேளுங்கள்.\n\n💼 தொழில்\n💑 திருமணம்\n🏠 சொத்து\n✈️ வெளிநாடு\n👶 குழந்தை\n\nஎன்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?`
                            : `Hello ${userName}! 🙏✨\n\nI'm your Vedic Astrology advisor. Ask me anything about your birth chart.\n\n💼 Career\n💑 Marriage\n🏠 Property\n✈️ Foreign Travel\n👶 Children\n\nWhat would you like to know?`,
                        timestamp: new Date(),
                        isWelcome: true
                    };
                    setChatHistory([welcomeMsg]);
                } else {
                    setChatHistory(msgs);
                }

                // Scroll to bottom on load
                setTimeout(scrollToBottom, 100);
            },
            (error) => {
                // Handle permission errors gracefully - use local-only chat
                console.warn('⚠️ Chat history unavailable (Firestore permissions):', error.message);
                // Initialize with welcome message for local-only mode
                const userName = data.userDetails.name || 'there';
                const welcomeMsg = {
                    id: 'welcome',
                    role: 'assistant',
                    content: language === 'ta'
                        ? `வணக்கம் ${userName}! 🙏✨\n\nநான் உங்கள் ஜோதிட ஆலோசகர். உங்கள் ஜாதகம் பற்றி எந்த கேள்வியும் கேளுங்கள்.\n\n💼 தொழில்\n💑 திருமணம்\n🏠 சொத்து\n✈️ வெளிநாடு\n👶 குழந்தை\n\nஎன்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?`
                        : `Hello ${userName}! 🙏✨\n\nI'm your Vedic Astrology advisor. Ask me anything about your birth chart.\n\n💼 Career\n💑 Marriage\n🏠 Property\n✈️ Foreign Travel\n👶 Children\n\nWhat would you like to know?`,
                    timestamp: new Date(),
                    isWelcome: true
                };
                setChatHistory([welcomeMsg]);
            }
        );

        return () => unsubscribe();
    }, [user, data, language]);

    // Internal save function - saves to chart-specific path
    const saveMessageToFirestore = async (msg: any) => {
        console.log('📝 saveMessageToFirestore CALLED', { msg, userUid: user?.uid });

        if (!user || !data) {
            console.warn('❌ ABORTED: Missing user or data');
            return;
        }

        try {
            // Normalize message format immediately
            const role = msg.role || msg.sender || 'unknown';
            const text = msg.content || msg.text || '';

            if (!text) {
                console.warn('❌ ABORTED: Empty message text');
                return;
            }

            // Generate chart ID (same as used in useEffect for loading)
            const chartId = `${data.userDetails.name}_${new Date(data.birthDate).getTime()}`.replace(/[^a-zA-Z0-9]/g, '_');

            // Fetch metadata with timeout to prevent blocking
            const getMetadata = async () => {
                try {
                    const ipPromise = getIPAddress().catch(() => 'Unknown');
                    const fpPromise = generateFingerprint().catch(() => 'Unknown');

                    // Race with 2s timeout
                    const timeout = new Promise(resolve => setTimeout(resolve, 2000));

                    const result = await Promise.race([
                        Promise.all([ipPromise, fpPromise]),
                        timeout
                    ]);

                    if (!result) return ['Unknown', 'Unknown']; // Timeout case
                    return result as [string, string];
                } catch {
                    return ['Unknown', 'Unknown'];
                }
            };

            const [ipAddress, deviceId] = await getMetadata();

            // CRITICAL: Ensure the parent chart document exists
            const chartRef = doc(db, `users/${user.uid}/charts/${chartId}`);

            try {
                const chartSnapshot = await getDoc(chartRef);

                if (!chartSnapshot.exists()) {
                    console.log('📄 Creating parent chart document:', chartId);
                    console.log('📍 Chart path:', `users/${user.uid}/charts/${chartId}`);

                    await setDoc(chartRef, {
                        userId: user.uid, // CRITICAL: Required for Firestore rules
                        name: data.userDetails.name || 'Unknown',
                        birthDate: data.birthDate,
                        createdAt: serverTimestamp(),
                        lastMessageAt: serverTimestamp()
                    });
                    console.log('✅ Parent chart document created successfully');
                } else {
                    console.log('📄 Parent chart exists, updating timestamp');
                    // Update last message timestamp
                    await setDoc(chartRef, {
                        lastMessageAt: serverTimestamp()
                    }, { merge: true });
                    console.log('✅ Parent chart timestamp updated');
                }
            } catch (parentError: any) {
                console.error('❌ ERROR with parent chart document:', parentError);
                console.error('📋 Parent Error Details:', {
                    code: parentError.code,
                    message: parentError.message,
                    path: `users/${user.uid}/charts/${chartId}`,
                    userId: user.uid
                });
                // Continue anyway - maybe the subcollection will work
            }

            console.log('💾 Saving doc to Firestore:', {
                path: `users/${user.uid}/charts/${chartId}/messages`,
                role,
                textLength: text.length,
                ip: ipAddress
            });

            // Save to chart-specific messages collection
            await addDoc(collection(db, `users/${user.uid}/charts/${chartId}/messages`), {
                role: role,
                sender: role, // Legacy compatibility
                content: text,
                text: text, // Legacy compatibility
                timestamp: serverTimestamp(),
                language: language || 'en',
                userId: user.uid,
                deviceFingerprint: deviceId || 'Unknown',
                ipAddress: ipAddress || 'Unknown'
            });
            console.log('✅ Message saved successfully to chart path');
        } catch (e: any) {
            console.error("❌ CRITICAL Error saving message:", e);
            console.error("📋 Error Details:", {
                code: e.code,
                message: e.message,
                name: e.name,
                isAuthError: e.code === 'permission-denied',
                userId: user?.uid,
                hasUser: !!user
            });
        }
    };

    // Language is now directly from context - no separate state needed

    // Calculate Dasa locally for display (Consistency Check)
    const [systemDasa, setSystemDasa] = useState<any>(null);

    useEffect(() => {
        const loadDasa = async () => {
            if (data.birthDate && data.planets) {
                const moon = data.planets.find((p: any) => p.name === 'Moon');
                if (moon) {
                    const { calculateDashaPeriods, getCurrentDasha } = await import('../utils/astrology');
                    const periods = calculateDashaPeriods(new Date(data.birthDate), moon.longitude);
                    const current = getCurrentDasha(periods);
                    setSystemDasa(current);
                }
            }
        };
        loadDasa();
    }, [data]);

    // Initialize Device Tracking
    useEffect(() => {
        const initTracking = async () => {
            if (!user) return;
            try {
                const tracking = await initDeviceTracking(user.uid);
                setDeviceInfo({
                    fingerprint: tracking.fingerprint,
                    ipAddress: tracking.ipAddress
                });
            } catch (error) {
                console.error('Device tracking error:', error);
            }
        };
        initTracking();
    }, [user]);

    // Check Chat Limit and Promo Status - DATABASE ONLY
    useEffect(() => {
        const checkLimits = async () => {
            if (!user) {
                console.log('⏸️ No user logged in - skipping limit check');
                setChatLimit({ canChat: true, remaining: 2, limit: 2, hasPromo: false });
                return;
            }

            if (!deviceInfo) {
                console.log('⏸️ Device tracking loading...');
                return;
            }

            console.log('🔍 Checking chat limits from DATABASE for user:', user.uid);

            try {
                const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

                // Check promo status first
                console.log('📡 Fetching promo status...');
                const promoResponse = await fetch(`${apiUrl}/api/promo/status/${user.uid}`);
                const promoData = await promoResponse.json();
                console.log('📨 Promo response:', promoData);

                if (promoData.success && promoData.hasActivePromo) {
                    console.log('✅ User has active promo - unlimited chats!');
                    setPromoStatus({
                        hasActivePromo: true,
                        promoCode: promoData.promoCode,
                        expiresAt: new Date(promoData.expiresAt),
                        duration: promoData.duration
                    });
                    setChatLimit({ canChat: true, remaining: -1, limit: 2, hasPromo: true });
                    return;
                }

                // Check chat limit from database
                console.log('📡 Fetching chat limit from database...');
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
                const limitResponse = await fetch(`${apiUrl}/api/chat/check-limit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        deviceFingerprint: deviceInfo.fingerprint,
                        timeZone
                    })
                });

                if (!limitResponse.ok) {
                    throw new Error(`HTTP ${limitResponse.status}: ${limitResponse.statusText}`);
                }

                const limitData = await limitResponse.json();
                console.log('📨 Chat limit response:', limitData);

                if (limitData.success) {
                    const newLimit = {
                        canChat: limitData.canChat,
                        remaining: limitData.remaining,
                        limit: limitData.limit || 2,
                        hasPromo: limitData.hasPromo || false
                    };
                    console.log('✅ Chat limit loaded from DATABASE:', newLimit);
                    console.log('⚡ SETTING STATE NOW:', newLimit);
                    setChatLimit(newLimit);
                    console.log('✔️ State has been set (might not update instantly due to React batching)');
                } else {
                    console.error('❌ Backend returned success=false:', limitData);
                    // Conservative fallback - allow 5 chats
                    setChatLimit({ canChat: true, remaining: 2, limit: 2, hasPromo: false });
                }
            } catch (error: any) {
                console.error('❌ CRITICAL ERROR checking limits:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                });
                // On error, allow chats but warn
                setChatLimit({ canChat: true, remaining: 2, limit: 2, hasPromo: false });
                alert('Warning: Could not verify chat limit. Please check your connection.');
            }
        };

        checkLimits();
    }, [user, deviceInfo]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (!data) return null;

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        // Removed frontend blocking - better UX to let user send message first
        // Backend will handle limits and we'll show friendly error after attempt

        console.log('✅ Allowing chat message to proceed. Backend will enforce limits if needed.');

        // Always add message to local chat history immediately for instant feedback
        const userMsg = { role: 'user', content: question, timestamp: new Date() };
        setChatHistory(prev => [...prev, userMsg]);

        // Also save to Firestore in background if user is logged in (non-blocking)
        if (user) {
            saveMessageToFirestore(userMsg).catch(err => {
                console.warn('Failed to save user message to Firestore:', err.message);
            });
        }

        setQuestion('');
        setIsLoading(true);
        setLoadingStatus(isTamil ? 'உங்கள் தரவை சேகரிக்கிறோம்...' : 'Collecting your data...');
        setError('');

        try {
            // Use Dasha data directly from database (no calculation)
            let enrichedData = { ...data };

            console.log("[AI Predictions] Using Dasha from database:", {
                hasCurrentDasa: !!data.currentDasa,
                hasDashaPeriods: !!data.dashaPeriods,
                maha: data.currentDasa?.maha?.planet,
                bhukti: data.currentDasa?.bhukti?.planet,
                antaram: data.currentDasa?.antaram?.planet
            });

            // DEBUG: Log the FULL currentDasa structure to see what fields exist
            if (data.currentDasa) {
                console.log("[AI Predictions] FULL currentDasa.maha structure:", data.currentDasa.maha);
                console.log("[AI Predictions] FULL currentDasa.bhukti structure:", data.currentDasa.bhukti);
            }

            // CRITICAL FIX: Hydrate missing Dasha dates for existing charts
            // If we have Moon longitude but missing dates, recalculate them NOW
            const moon = data.planets?.find((p: any) => p.name === 'Moon');
            const birthDataObject = data.birth_details?.dob || data.birthDate;

            // Helper to get Date object safely from various formats
            const getSafeDate = (d: any): Date | null => {
                if (!d) return null;
                if (d instanceof Date && !isNaN(d.getTime())) return d;
                if (typeof d === 'string') {
                    // Try standard parsing
                    let parsed = new Date(d);
                    if (!isNaN(parsed.getTime())) return parsed;

                    // Try DD/MM/YYYY parsing (common in this app)
                    // Matches 29/04/2000 or 29-04-2000
                    const parts = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                    if (parts) {
                        // parts[1] is day, parts[2] is month, parts[3] is year
                        // new Date(year, monthIndex, day)
                        parsed = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
                        if (!isNaN(parsed.getTime())) return parsed;
                    }
                    return null;
                }
                if (typeof d.toDate === 'function') return d.toDate(); // Firestore Timestamp
                if (d.seconds) return new Date(d.seconds * 1000); // Raw Timestamp object
                return null;
            };

            const birthDateObj = getSafeDate(birthDataObject);

            // Determine if we need to regenerate Dasha
            // Check if currentDasa is missing OR if dates are missing/strings
            const needToRecalcDasa = !data.currentDasa?.maha?.startDate &&
                !data.currentDasa?.maha?.start &&
                moon &&
                birthDateObj;

            if (needToRecalcDasa) {
                console.log('🔄 HYDRATING DASHA DATES: Recalculating Dasa schedule on-the-fly...', birthDateObj);
                try {
                    // Import dynamically - dashaCalculation.ts uses 'calculateVimshottariDasha'
                    const { calculateVimshottariDasha, getCurrentDasha } = await import('../utils/dashaCalculation');

                    if (birthDateObj) {
                        // Calculate full life cycle (120 years)
                        // Note: Signature is (moonLon, birthDate, years)
                        const newDashaPeriods = calculateVimshottariDasha(moon.longitude, birthDateObj, 120);

                        // getCurrentDasha in dashaCalculation.ts takes (moonLon, birthDate, currentDate)
                        const newCurrentDasa = getCurrentDasha(moon.longitude, birthDateObj, new Date());

                        // Check if we got valid results
                        if (newCurrentDasa && newCurrentDasa.maha) {
                            console.log('✅ RECALCULATED DASHA:', {
                                maha: newCurrentDasa.maha.planet,
                                start: newCurrentDasa.maha.start,
                                end: newCurrentDasa.maha.end
                            });

                            // Update enrichedData with FRESH dates
                            enrichedData.dashaPeriods = newDashaPeriods;
                            enrichedData.currentDasa = newCurrentDasa;
                        }
                    }
                } catch (calcErr) {
                    console.error('❌ Failed to recalculate Dasha dates:', calcErr);
                }
            }

            // --- PROACTIVE ENRICHMENT: Calculate Yogas & Subathuvam if missing ---
            // The AI needs these pre-calculated values to follow rules accurately.

            // 1. Calculate Subathuvam/Pavathuvam
            const { calculateSubathuvamPavathuvam, calculateHouseSubathuvamPavathuvam } = await import('../utils/subathuvam');
            const subathuvamScores = calculateSubathuvamPavathuvam(data.planets, language);
            // Assuming ascendant Sign Index is available. If not, derive from data.ascendant.
            // data.ascendant usually has 'signIndex' or we can find it.
            // Fallback: If no ascendant index, skip House Subathuvam.
            let houseScores = {};
            if (data.ascendant && typeof data.ascendant.signIndex === 'number') {
                houseScores = calculateHouseSubathuvamPavathuvam(data.planets, data.ascendant.signIndex, language);
            }

            enrichedData = {
                ...enrichedData,
                userDetails: {
                    ...data.userDetails,
                    uid: user?.uid // Inject UID for logging
                },
                subathuvam_calculations: {
                    planetary_scores: subathuvamScores,
                    house_scores: houseScores
                }
            };

            // 2. Calculate Yogas
            // Check if yoga calculation function exists or if we need to call it.
            // Usually 'calculateYogas' in 'astrology.ts' or 'yogas.ts'.
            // Let's assume basic yogas are in 'data.yogas' if calculated previously. 
            // If not present, we should calculate.
            if (!enrichedData.yogas || !enrichedData.doshas) {
                const { calculateYogas } = await import('../utils/astrology');
                const { yogas, doshas } = calculateYogas(data.planets, data.ascendant?.signIndex || 0);
                enrichedData = { ...enrichedData, yogas, doshas };
            }

            // VALIDATION: Log Dasha status but don't block (AI can still answer without perfect Dasha data)
            if (!enrichedData.currentDasa || !enrichedData.dashaPeriods || enrichedData.dashaPeriods.length === 0) {
                console.warn('[AI Chat] Dasha calculation incomplete (will proceed anyway):', {
                    hasDasa: !!enrichedData.currentDasa,
                    hasSchedule: !!enrichedData.dashaPeriods,
                    scheduleLength: enrichedData.dashaPeriods?.length || 0,
                    birthDate: data.birthDate,
                    hasMoon: !!data.planets?.find((p: any) => p.name === 'Moon')
                });

                // Don't block - AI can still provide useful answers without Dasha
                // Just add a note to the enriched data
                enrichedData.dashaWarning = "Dasha calculation incomplete - predictions may be limited";
            }

            // Debug: Log what we're sending to AI
            console.log('[AI Chat] Sending to AI:', {


                question: question,
                hasDasha: !!enrichedData.currentDasa,
                dashaLord: enrichedData.currentDasa?.maha?.planet,
                bhuktiLord: enrichedData.currentDasa?.bhukti?.planet,
                hasSchedule: !!enrichedData.dashaPeriods,
                scheduleLength: enrichedData.dashaPeriods?.length || 0,
                hasSubathuvam: !!enrichedData.subathuvam_calculations,
                language: language
            });

            // Update status before calling AI
            setLoadingStatus(isTamil ? 'உங்கள் ஜாதகத்தை பகுப்பாய்வு செய்கிறோம்...' : 'Analyzing your chart...');

            // Call the Orchestrator with enriched data (with 120s timeout for free models)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('AI response timeout - please try again')), 120000)
            );

            const response = await Promise.race([
                queryAstrologyOrchestrator(question, enrichedData, responseLanguage),
                timeoutPromise
            ]) as any;

            console.log('✅ Got AI response:', response);
            console.log('Response structure:', {
                hasTamil: !!response.final_answer_tamil,
                hasEnglish: !!response.final_answer_english,
                language: language
            });

            setPrediction(response);

            // Add AI response to history - always add to local chat for instant display
            // Extract content with fallbacks
            // Extract content with robust fallbacks
            let aiContent = '';
            let parsedResponse = response;

            // 1. Handle if response is a string (might be JSON string or plain text)
            if (typeof response === 'string') {
                try {
                    // Try to parse it as JSON
                    parsedResponse = JSON.parse(response);
                } catch (e) {
                    // If parsing fails, usage the string as-is (fallback)
                    console.log('Response is a string but not valid JSON, using as raw text');
                    aiContent = response;
                }
            }

            // 2. If we have an object (either originally or successfully parsed)
            if (typeof parsedResponse === 'object' && parsedResponse !== null) {
                // STRICT: Only use the selected language, no fallbacks
                if (responseLanguage === 'ta') {
                    aiContent = parsedResponse.final_answer_tamil || '';
                } else {
                    aiContent = parsedResponse.final_answer_english || '';
                }

                // If content is empty for selected language, show error message
                // If content is empty for selected language, show error message
                if (!aiContent) {
                    aiContent = responseLanguage === 'ta'
                        ? 'மன்னிக்கவும், தமிழில் பதில் கிடைக்கவில்லை.'
                        : 'Sorry, response not available in English.';
                }

                // 3. Clean up content (remove quotes if it looks like a stringified string)
                if (typeof aiContent === 'string') {
                    // If the content is wrapped in quotes or backticks, strip them
                    aiContent = aiContent.replace(/^["'`]|["'`]$/g, '');
                    // Replace escaped newlines
                    aiContent = aiContent.replace(/\\n/g, '\n');
                }

                console.log('Extracted AI content (first 200 chars):', aiContent.substring(0, 200));
                const aiMsg = { role: 'ai', content: aiContent, details: response, timestamp: new Date() };

                setChatHistory(prev => {
                    const newHistory = [...prev, aiMsg];
                    // Mark this as the latest AI message (for animation)
                    setLatestAIMessageIndex(newHistory.length - 1);
                    return newHistory;
                });

                // Also save to Firestore in background if user is logged in (non-blocking)
                if (user) {
                    saveMessageToFirestore(aiMsg).catch(err => {
                        console.warn('Failed to save AI message to Firestore:', err.message);
                    });
                }

                // Increment chat count if not using promo - DATABASE ONLY
                if (!chatLimit.hasPromo && user && deviceInfo) {
                    try {
                        console.log('📤 Incrementing chat count in database...');
                        const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
                        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
                        const response = await fetch(`${apiUrl}/api/chat/increment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                uid: user.uid,
                                deviceFingerprint: deviceInfo.fingerprint,
                                ipAddress: deviceInfo.ipAddress,
                                timeZone
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`Failed to increment: ${response.statusText}`);
                        }

                        const result = await response.json();
                        console.log('📨 Increment response:', result);

                        // Update local state immediately for responsive UI
                        setChatLimit(prev => {
                            const updated = {
                                ...prev,
                                remaining: Math.max(0, prev.remaining - 1),
                                canChat: prev.remaining > 1
                            };
                            console.log('💬 Chat count updated:', updated);
                            return updated;
                        });

                        // Re-fetch the actual count from database after a short delay
                        setTimeout(async () => {
                            try {
                                const limitResponse = await fetch(`${apiUrl}/api/chat/check-limit`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        uid: user.uid,
                                        deviceFingerprint: deviceInfo.fingerprint
                                    })
                                });
                                const limitData = await limitResponse.json();
                                if (limitData.success) {
                                    console.log('🔄 Refreshed count from database:', limitData);
                                    setChatLimit({
                                        canChat: limitData.canChat,
                                        remaining: limitData.remaining,
                                        limit: limitData.limit || 2,
                                        hasPromo: limitData.hasPromo || false
                                    });
                                }
                            } catch (err: any) {
                                console.warn('Failed to refresh count:', err);
                            }
                        }, 1000);

                    } catch (error: any) {
                        // Handle 429 (Too Many Requests) specifically - this is the limit being enforced
                        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
                            console.log('🚫 Chat limit enforced by backend (this is normal protection)');
                            // Update UI to show limit reached
                            setChatLimit({
                                canChat: false,
                                remaining: 0,
                                limit: 2,
                                hasPromo: false
                            });
                            // Show friendly message
                            setTimeout(() => {
                                setError(language === 'ta'
                                    ? 'இன்றைய அரட்டை வரம்பு எட்டப்பட்டது. நாளைக்கு மீண்டும் முயற்சிக்கவும்!'
                                    : 'Daily chat limit reached! Try again tomorrow or use a promo code.'
                                );
                                setShowPromoModal(true);
                            }, 500);
                        } else {
                            console.error('❌ Error incrementing chat count:', error);
                        }
                    }
                }

            }
        } catch (err: any) {
            console.error('❌ AI Chat Error:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            setError(err.message || "Failed to get prediction");
        } finally {
            setIsLoading(false);
            setLoadingStatus('');
        }
    };

    // Handle Promo Code Activation
    const handlePromoActivation = async (code: string) => {
        if (!user) {
            return { success: false, message: 'Please log in to activate promo code' };
        }

        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    promoCode: code
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update promo status
                setPromoStatus({
                    hasActivePromo: true,
                    promoCode: code,
                    expiresAt: new Date(data.expiresAt),
                    duration: data.duration
                });

                // Update chat limit
                setChatLimit({
                    canChat: true,
                    remaining: -1,
                    limit: 5,
                    hasPromo: true
                });

                return {
                    success: true,
                    message: data.message,
                    expiresAt: new Date(data.expiresAt),
                    duration: data.duration
                };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to activate promo code' };
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
                    {/* Promo Status Badge */}
                    {promoStatus?.hasActivePromo && promoStatus.promoCode && promoStatus.expiresAt && (
                        <PromoStatusBadge
                            promoCode={promoStatus.promoCode}
                            expiresAt={promoStatus.expiresAt}
                            duration={promoStatus.duration || 'week'}
                        />
                    )}

                    {/* Removed large chat limit warning - now using compact button */}

                    {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 py-8">

                            {/* Welcome Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-8"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/20">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 mb-2">
                                    {isTamil ? "வணக்கம்! உங்கள் ஜோதிட கேள்விகளை கேளுங்கள் 🔮" : "Hello! Ask me your astrology questions 🔮"}
                                </h3>
                                <p className="text-slate-400">
                                    {isTamil
                                        ? "உங்கள் ஜாதகத்தின் அடிப்படையில் துல்லியமான பதில்களைப் பெறுங்கள்."
                                        : "Get accurate predictions based on your unique birth chart."}
                                </p>
                            </motion.div>

                            {/* Trust Elements */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap justify-center gap-3 mb-8"
                            >
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs text-slate-400">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    <span>{t.predictions.subtitle}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs text-slate-400">
                                    <Users className="w-3 h-3 text-blue-400" />
                                    <span>100+ Happy Users</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs text-slate-400">
                                    <Shield className="w-3 h-3 text-emerald-400" />
                                    <span>100% Confidential</span>
                                </div>
                            </motion.div>

                            {/* Feature Highlights Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-8">
                                {[
                                    { icon: Zap, label: "Instant Answer", labelTa: "உடனடி பதில்", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
                                    { icon: BrainCircuit, label: "Deep Analysis", labelTa: "ஆழமான ஆய்வு", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
                                    { icon: BarChart2, label: "Dasa Check", labelTa: "தசா கணிப்பு", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
                                    { icon: Heart, label: "Match Check", labelTa: "பொருத்தம்", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.05) }}
                                        className={`p-3 rounded-xl border ${feature.border} ${feature.bg} flex flex-col items-center justify-center gap-2 text-center`}
                                    >
                                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${feature.color.replace('text-', 'text-opacity-80-')}`}>
                                            {isTamil ? feature.labelTa : feature.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Suggested Questions Grid */}
                            <div className="w-full">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">
                                    {isTamil ? "பரிந்துரைக்கப்பட்ட கேள்விகள்" : "Suggested Questions"}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { qEn: "When will I get married?", qTa: "எப்போது திருமணம் நடக்கும்?", icon: Heart, color: "text-pink-400" },
                                        { qEn: "When will I get a job?", qTa: "எப்போது வேலை கிடைக்கும்?", icon: Briefcase, color: "text-blue-400" },
                                        { qEn: "How is my current Dasa?", qTa: "எனது தற்போதைய தசா புத்தி எப்படி உள்ளது?", icon: Clock, color: "text-purple-400" },
                                        { qEn: "Rahu Ketu Transit effects?", qTa: "ராகு கேது பெயர்ச்சி பலன்கள்?", icon: AlertCircle, color: "text-orange-400" }
                                    ].map((item, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + (i * 0.05) }}
                                            onClick={() => {
                                                setQuestion(isTamil ? item.qTa : item.qEn);
                                                // Ideally auto-submit, but setState is async. 
                                                // We can just set it and let user press send, or trigger submit logic.
                                                // For now, just set. User can hit enter.
                                            }}
                                            className="group flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/30 transition-all text-left"
                                        >
                                            <div className={`p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 transition-colors ${item.color}`}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                                {isTamil ? item.qTa : item.qEn}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions (Footer of empty state) */}
                            <div className="flex flex-wrap justify-center gap-2 mt-8 pt-6 border-t border-slate-800/50 w-full opacity-60 hover:opacity-100 transition-opacity">
                                <button onClick={() => navigate('/chart')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                                    <FileText className="w-3 h-3" /> {isTamil ? "ஜாதகம் பார்" : "Show Chart"}
                                </button>
                                <button onClick={() => navigate('/dasha')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                                    <Clock className="w-3 h-3" /> {isTamil ? "தசா காலங்கள்" : "Dasa Periods"}
                                </button>
                                <button onClick={() => navigate('/predictions-faq')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                                    <Sparkles className="w-3 h-3" /> {isTamil ? "பொது பலன்கள்" : "Predictions"}
                                </button>
                            </div>
                        </div>
                    )}

                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 md:gap-4 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <span className="text-lg md:text-xl">🔮</span>}
                            </div>
                            <div className={`rounded-2xl p-3 md:p-5 max-w-[90%] md:max-w-[85%] lg:max-w-[70%] shadow-lg text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-blue-600/40 border border-blue-500/30 shadow-blue-500/10 text-blue-50' : 'bg-indigo-900/30 border border-indigo-500/20 shadow-indigo-500/10 text-slate-100'}`} style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                                {msg.role === 'ai' ? (
                                    // Only animate the latest AI message, show others instantly
                                    idx === latestAIMessageIndex ? (
                                        <TypewriterText text={formatAIResponse(msg.content)} speed={15} />
                                    ) : (
                                        <div className="whitespace-pre-wrap">{formatAIResponse(msg.content)}</div>
                                    )
                                ) : (
                                    msg.content
                                )}
                                {msg.details?.bava_analysis_report && (
                                    <div className="mt-6 space-y-4">
                                        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                                            <h3 className="text-lg font-bold text-purple-300 mb-2">📊 Comprehensive House Analysis</h3>
                                            <p className="text-slate-300">{msg.details.bava_analysis_report.lagna_summary}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {msg.details.bava_analysis_report.house_predictions.map((house: any) => (
                                                <div
                                                    key={house.house_number}
                                                    className={`p-3 rounded-lg border ${house.status === 'Strong' || house.status === 'Excellent'
                                                        ? 'bg-green-900/20 border-green-800/30'
                                                        : house.status === 'Weak'
                                                            ? 'bg-red-900/20 border-red-800/30'
                                                            : 'bg-yellow-900/20 border-yellow-800/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-slate-400">House {house.house_number}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${house.status === 'Strong' || house.status === 'Excellent'
                                                            ? 'bg-green-700/30 text-green-300'
                                                            : house.status === 'Weak'
                                                                ? 'bg-red-700/30 text-red-300'
                                                                : 'bg-yellow-700/30 text-yellow-300'
                                                            }`}>
                                                            {house.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-white mb-1">{house.title}</h4>
                                                    <p className="text-xs text-slate-300 mb-2">{house.analysis}</p>
                                                    <p className="text-xs text-slate-500 italic">Rule: {house.guruji_rule_applied}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                                            <h3 className="text-sm font-bold text-blue-300 mb-1">📝 Final Verdict</h3>
                                            <p className="text-sm text-slate-300">{msg.details.bava_analysis_report.final_verdict}</p>
                                        </div>
                                    </div>
                                )}
                                {/* Technical details hidden for cleaner user experience */}
                                {/* Intent, Key Planet, and Reasoning are for internal use only */}

                                {/* FEEDBACK WIDGET */}
                                {msg.role === 'ai' && user && msg.id && (
                                    <div className="mt-4 pt-3 border-t border-slate-700/50">
                                        <div className="text-center mb-2">
                                            <p className="text-sm text-slate-300">💬 Was this helpful?</p>
                                        </div>
                                        <FeedbackWidget
                                            messageId={msg.id}
                                            messagePath={`users/${user.uid}/charts/${`${data.userDetails.name}_${new Date(data.birthDate).getTime()}`.replace(/[^a-zA-Z0-9]/g, '_')}/messages/${msg.id}`}
                                            existingFeedback={msg.feedback}
                                        />
                                    </div>
                                )}

                                {/* TIMESTAMP */}
                                {msg.timestamp && (
                                    <div className={`flex items-center gap-1 text-xs text-slate-500 mt-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            {new Date(msg.timestamp.seconds ? msg.timestamp.seconds * 1000 : msg.timestamp).toLocaleTimeString(isTamil ? 'ta-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-xl">🔮</span>
                            </div>
                            <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-2xl p-5 shadow-lg shadow-indigo-500/10">
                                <div className="flex items-center gap-3 text-indigo-300">
                                    <span className="text-sm">{loadingStatus || (isTamil ? 'AI ஜோதிடர் உங்கள் ஜாதகத்தை பார்க்கிறார்...' : 'AI Astrologer is analyzing your chart...')}</span>
                                    <div className="flex gap-1">
                                        <span className="animate-bounce">●</span>
                                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                                        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg whitespace-pre-wrap">
                            <AlertCircle className="w-5 h-5 inline mr-2" />
                            {error.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                /(https?:\/\/[^\s]+)/g.test(part) ? (
                                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline font-bold text-red-300 hover:text-white break-all">
                                        {part}
                                    </a>
                                ) : (
                                    <span key={i}>{part}</span>
                                )
                            )}
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-3 md:p-4">
                <div className="max-w-5xl mx-auto">
                    {/* Top bar with language selector, chat count, and promo button */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        {/* Language Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm">Answer in:</span>
                            <button
                                onClick={() => setResponseLanguage('en')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${responseLanguage === 'en'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setResponseLanguage('ta')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${responseLanguage === 'ta'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                தமிழ்
                            </button>
                        </div>

                        {/* Chat Count and Promo Button */}
                        <div className="flex items-center gap-2">
                            {/* Chat Count Display */}
                            {!chatLimit.hasPromo && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <MessageCircle className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-medium text-blue-300">
                                        {chatLimit.limit - chatLimit.remaining}/{chatLimit.limit}
                                    </span>
                                    <span className="text-xs text-blue-400/60">used</span>
                                </div>
                            )}

                            {/* Promo Status or Button */}
                            {promoStatus?.hasActivePromo ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                    <Gift className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium text-purple-300">
                                        {isTamil ? 'வரம்பற்றது' : 'Unlimited'}
                                    </span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowPromoModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all group"
                                    title={isTamil ? 'ப்ரோமோ குறியீடு' : 'Promo Code'}
                                >
                                    <Gift className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                                    <span className="text-sm font-medium text-purple-300 group-hover:text-purple-200">
                                        {isTamil ? 'குறியீடு' : 'Code'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* LIMIT REACHED WARNING - Now shown AFTER user tries to send (handled in handleAskQuestion) */}
                    {/* Commented out pre-emptive blocking - better UX to let user try first */}
                    {/*{!chatLimit.hasPromo && chatLimit.remaining <= 0 && (
                        <div className="mb-3 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-red-300 mb-1">
                                        {language === 'ta' ? 'அரட்டை வரம்பு எட்டப்பட்டது' : 'Daily Chat Limit Reached'}
                                    </h4>
                                    <p className="text-sm text-red-200/80">
                                        {language === 'ta'
                                            ? 'நீங்கள் இன்றைய 2 இலவச அரட்டைகளையும் பயன்படுத்தியுள்ளீர்கள். நாளை மீண்டும் முயற்சிக்கவும் அல்லது வரம்பற்ற அணுகலுக்கு ப்ரோமோ குறியீட்டைப் பயன்படுத்தவும்!'
                                            : 'You have used your 2 free chats for today. Try again tomorrow or use a promo code for unlimited access!'
                                        }
                                    </p>
                                    <button
                                        onClick={() => setShowPromoModal(true)}
                                        className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Gift className="w-4 h-4" />
                                        {language === 'ta' ? 'ப்ரோமோ குறியீட்டைப் பயன்படுத்தவும்' : 'Use Promo Code'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}*/}


                    {/* Question Input Form */}
                    <form onSubmit={handleAskQuestion} className="flex gap-3">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={!chatLimit.hasPromo && chatLimit.remaining <= 0
                                ? (language === 'ta' ? 'இன்றைய வரம்பு எட்டப்பட்டது...' : 'Daily limit reached...')
                                : t.predictions.askPlaceholder
                            }
                            disabled={!chatLimit.hasPromo && chatLimit.remaining <= 0}
                            className={`flex-1 bg-white/5 border-2 rounded-3xl px-6 py-4 text-white placeholder:text-slate-400 outline-none transition-all shadow-lg ${!chatLimit.hasPromo && chatLimit.remaining <= 0
                                ? 'border-red-500/30 text-slate-600 cursor-not-allowed'
                                : 'border-purple-500/30 hover:border-purple-500/50 focus:border-purple-500 focus:shadow-purple-500/20'
                                }`}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim() || (!chatLimit.hasPromo && chatLimit.remaining <= 0)}
                            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Promo Code Modal */}
            <PromoCodeModal
                isOpen={showPromoModal}
                onClose={() => setShowPromoModal(false)}
                onActivate={handlePromoActivation}
            />
        </div>
    );
};

export default AIPredictions;
