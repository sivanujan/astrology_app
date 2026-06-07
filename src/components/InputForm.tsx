import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Loader2, ChevronRight, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculatePlanetaryPositions } from '../utils/astrology';
// import LagnaIdentificationWizard from './LagnaIdentificationWizard';
// import { IdentificationResult } from '../utils/lagnaIdentification';

import { useChartData } from '../contexts/ChartContext';
import { saveGuestBirthData } from '../hooks/useSaveGuestData';
import { useAuth } from '../contexts/AuthContext';

import { useLanguage } from '../contexts/LanguageContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const InputForm: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { setChartData } = useChartData();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        date: '',
        time: '',
        city: '',
        lat: null as number | null,
        lng: null as number | null,
    });

    const [citySearch, setCitySearch] = useState('');
    const [cityResults, setCityResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [displayDate, setDisplayDate] = useState('');
    const dateInputRef = React.useRef<HTMLInputElement>(null);

    // Validation states
    const [validationStates, setValidationStates] = useState({
        name: { isValid: false, error: '' },
        date: { isValid: false, error: '' },
        time: { isValid: false, error: '' },
        city: { isValid: false, error: '' }
    });

    // Lagna identification state - DISABLED FOR NOW
    // const [unknownBirthTime, setUnknownBirthTime] = useState(false);
    // const [showLagnaWizard, setShowLagnaWizard] = useState(false);
    // const [identifiedLagna, setIdentifiedLagna] = useState<IdentificationResult | null>(null);
    // const [estimatedTime, setEstimatedTime] = useState<string>('');

    // Initialize displayDate from formData.date logic
    useEffect(() => {
        if (formData.date) {
            const [y, m, d] = formData.date.split('-');
            if (y && m && d) {
                setDisplayDate(`${d}/${m}/${y}`);
            }
        }
    }, []);

    const handleTextDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const isDeleting = val.length < displayDate.length;

        // Allow only numbers and slashes
        if (!/^[\d/]*$/.test(val)) return;

        // Strip non-digits to process
        const numbers = val.replace(/\D/g, '');

        // Prevent typing more than 8 digits
        if (numbers.length > 8) return;

        // Robust re-formatting logic
        let res = '';
        if (numbers.length > 0) res = numbers.substring(0, 2);
        if (numbers.length > 2) res += '/' + numbers.substring(2, 4);
        if (numbers.length > 4) res += '/' + numbers.substring(4, 8);

        // If forward typing (not deleting), auto-append slash at boundaries
        if (!isDeleting) {
            if (numbers.length === 2 && !val.endsWith('/')) {
                res += '/';
            }
            if (numbers.length === 4 && !val.endsWith('/')) {
                res += '/';
            }
        }

        setDisplayDate(res);

        // If it matches DD/MM/YYYY, update main state
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(res)) {
            const [d, m, y] = res.split('/');
            // Basic validity check
            const numD = parseInt(d);
            const numM = parseInt(m);
            const numY = parseInt(y);

            if (numM > 0 && numM <= 12 && numD > 0 && numD <= 31 && numY > 1900 && numY < 2100) {
                const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                setFormData(prev => ({ ...prev, date: isoDate }));
            }
        }
    };

    const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, date: val }));
        if (val) {
            const [y, m, d] = val.split('-');
            setDisplayDate(`${d}/${m}/${y}`);
        } else {
            setDisplayDate('');
        }
    };

    const triggerDatePicker = () => {
        if (dateInputRef.current) {
            // Try showPicker first (modern browsers)
            if ('showPicker' in dateInputRef.current) {
                // @ts-ignore
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.focus();
            }
        }
    };

    // Debounce city search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (citySearch.length > 2 && citySearch !== formData.city) {
                setIsSearching(true);
                try {
                    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=5&language=en&format=json`);
                    const data = await response.json();
                    if (data.results) {
                        setCityResults(data.results);
                        setShowDropdown(true);
                    }
                } catch (error) {
                    console.error("Error searching city:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setCityResults([]);
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [citySearch, formData.city]);

    const handleCitySelect = (city: any) => {
        setFormData(prev => ({
            ...prev,
            city: `${city.name}, ${city.country}`,
            lat: city.latitude,
            lng: city.longitude
        }));
        setCitySearch(`${city.name}, ${city.country}`);
        setValidationStates(prev => ({
            ...prev,
            city: { isValid: true, error: '' }
        }));
        setShowDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.lat || !formData.lng) {
            alert("Please select a valid city from the list");
            return;
        }

        setIsGenerating(true);

        // Simulate processing time for effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Debug: Log the input values
        console.log('[InputForm] Date inputs:', {
            date: formData.date,
            time: formData.time,
            combined: `${formData.date}T${formData.time}`
        });

        // Validate inputs before creating Date
        if (!formData.date || !formData.time) {
            alert("Please enter both date and time.");
            setIsGenerating(false);
            return;
        }

        const birthDate = new Date(`${formData.date}T${formData.time}`);

        // Validate the date is valid
        if (isNaN(birthDate.getTime())) {
            console.error('[InputForm] Invalid date created:', {
                date: formData.date,
                time: formData.time,
                birthDate: birthDate,
                dateString: `${formData.date}T${formData.time}`
            });
            alert(`Invalid date or time. Please check your inputs.\nDate: ${formData.date}\nTime: ${formData.time}`);
            setIsGenerating(false);
            return;
        }

        console.log('[InputForm] Valid birthDate created:', birthDate);
        const chartData = calculatePlanetaryPositions(birthDate, formData.lat, formData.lng);

        const fullChartData = {
            ...chartData,
            userDetails: formData,
            birthDate
        };

        // Save guest data if not logged in
        if (!user) {
            saveGuestBirthData({
                dob: birthDate,
                time: formData.time,
                place: formData.city,
                latitude: formData.lat!,
                longitude: formData.lng!
            });
        } else {
            // Auto-save to Dashboard for logged-in users
            try {
                await addDoc(collection(db, 'charts'), {
                    userId: user.uid,
                    name: formData.name,
                    birth_details: {
                        dob: birthDate,
                        place: formData.city,
                        latitude: formData.lat,
                        longitude: formData.lng
                    },
                    createdAt: new Date()
                });
            } catch (error) {
                console.error("Error auto-saving chart:", error);
            }
        }

        setChartData(fullChartData);
        setIsGenerating(false);
        navigate('/chart');
    };

    // DISABLED: Lagna identification handler
    // const handleLagnaIdentificationComplete = (result: IdentificationResult, time?: string) => {
    //     setIdentifiedLagna(result);
    //     if (time) {
    //         setEstimatedTime(time);
    //         setFormData(prev => ({ ...prev, time }));
    //     }
    //     setShowLagnaWizard(false);
    // };

    return (
        <>
            {/* Lagna Identification Wizard */}
            {/* {showLagnaWizard && formData.date && formData.lat && formData.lng && (
                <LagnaIdentificationWizard
                    onClose={() => {
                        setShowLagnaWizard(false);
                        setUnknownBirthTime(false);
                    }}
                    onComplete={handleLagnaIdentificationComplete}
                    birthDate={new Date(formData.date)}
                    birthPlace={{ latitude: formData.lat, longitude: formData.lng }}
                />
            )} */}

            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-8 md:p-12"
                >
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
                            {t.input.title}
                        </h1>
                        <p className="text-slate-400 text-lg">
                            {t.input.subtitle}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">{t.input.name}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        // Validate name
                                        const isValid = e.target.value.length >= 2;
                                        setValidationStates(prev => ({
                                            ...prev,
                                            name: {
                                                isValid,
                                                error: isValid ? '' : 'Name must be at least 2 characters'
                                            }
                                        }));
                                    }}
                                    className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all text-white placeholder-slate-400"
                                    placeholder="e.g. Arjuna"
                                />
                                {formData.name && validationStates.name.isValid && (
                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                )}
                                {formData.name && !validationStates.name.isValid && validationStates.name.error && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                                )}
                            </div>
                            {formData.name && validationStates.name.error && (
                                <p className="text-red-400 text-xs ml-1">{validationStates.name.error}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                <User className="w-4 h-4" /> {t.input.gender}
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['male', 'female', 'other'].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium ${formData.gender === g
                                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                                            : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-purple-500/50 hover:text-purple-400'
                                            }`}
                                    >
                                        {t.input[g as keyof typeof t.input]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date Input - Custom DD/MM/YYYY Text + Hidden Picker */}
                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> {t.input.dob}
                                </label>

                                <div className="relative">
                                    {/* Visible Text Input */}
                                    <input
                                        type="text"
                                        required
                                        value={displayDate}
                                        onChange={(e) => {
                                            handleTextDateChange(e);
                                            // Validate date format
                                            const isValid = /^\d{2}\/\d{2}\/\d{4}$/.test(e.target.value);
                                            setValidationStates(prev => ({
                                                ...prev,
                                                date: {
                                                    isValid,
                                                    error: isValid ? '' : 'Use format: dd/mm/yyyy'
                                                }
                                            }));
                                        }}
                                        placeholder="dd/mm/yyyy"
                                        maxLength={10}
                                        className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 pr-20 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all text-white placeholder-slate-400"
                                    />

                                    {/* Validation Icons */}
                                    {displayDate && validationStates.date.isValid && (
                                        <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                    )}
                                    {displayDate && !validationStates.date.isValid && displayDate.length === 10 && (
                                        <AlertCircle className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                                    )}

                                    {/* Calendar Icon Trigger */}
                                    <button
                                        type="button"
                                        onClick={triggerDatePicker}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
                                    >
                                        <Calendar className="w-5 h-5" />
                                    </button>

                                    {/* Hidden Native Date Picker */}
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        tabIndex={-1}
                                        className="absolute opacity-0 bottom-0 left-0 w-full h-full -z-10"
                                        value={formData.date}
                                        onChange={handleNativeDateChange}
                                    />
                                </div>
                            </div>

                            {/* Time Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> {t.input.tob}
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => {
                                            setFormData({ ...formData, time: e.target.value });
                                            // Validate time
                                            const isValid = e.target.value.length > 0;
                                            setValidationStates(prev => ({
                                                ...prev,
                                                time: {
                                                    isValid,
                                                    error: isValid ? '' : 'Please select a time'
                                                }
                                            }));
                                        }}
                                        className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all text-white [color-scheme:dark]"
                                    />
                                    {formData.time && validationStates.time.isValid && (
                                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                    )}
                                </div>

                                {/* DISABLED: I don't know my birth time checkbox */}
                                {/* <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors mt-2">
                                <input
                                    type="checkbox"
                                    checked={unknownBirthTime}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setUnknownBirthTime(checked);
                                        if (checked) {
                                            setShowLagnaWizard(true);
                                        } else {
                                            setIdentifiedLagna(null);
                                            setEstimatedTime('');
                                            setFormData(prev => ({ ...prev, time: '' }));
                                        }
                                    }}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                                />
                                <HelpCircle className="w-4 h-4" />
                                <span>{t.input.unknownTime || "I don't know my birth time"}</span>
                            </label>
                            
                            {unknownBirthTime && identifiedLagna && (
                                <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm">
                                    <p className="text-purple-300">
                                        {t.input.estimatedLagna || 'Estimated Lagna'}: <strong className="text-white">{identifiedLagna.primary.lagna}</strong>
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        {identifiedLagna.primary.confidence}% {t.input.confidence || 'confidence'}
                                    </p>
                                </div>
                            )} */}
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {t.input.pob}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={citySearch}
                                    onChange={(e) => {
                                        setCitySearch(e.target.value);
                                        // Reset validation when user types
                                        if (formData.city && e.target.value !== formData.city) {
                                            setValidationStates(prev => ({
                                                ...prev,
                                                city: { isValid: false, error: '' }
                                            }));
                                        }
                                    }}
                                    className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 pl-10 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all text-white placeholder-slate-400"
                                    placeholder="Search city..."
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 animate-spin" />
                                )}
                                {formData.city && !isSearching && (
                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {showDropdown && cityResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {cityResults.map((city) => (
                                        <button
                                            key={city.id}
                                            type="button"
                                            onClick={() => handleCitySelect(city)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center justify-between group"
                                        >
                                            <div>
                                                <span className="block text-white font-medium">{city.name}</span>
                                                <span className="text-xs text-slate-400">{city.admin1}, {city.country}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
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
                                    <SparklesIcon />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div >
        </>
    );
};

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
    </svg>
);

export default InputForm;
