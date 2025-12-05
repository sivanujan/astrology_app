import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculatePlanetaryPositions } from '../utils/astrology';

interface InputFormProps {
    setChartData: (data: any) => void;
}

const InputForm: React.FC<InputFormProps> = ({ setChartData }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
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

        const birthDate = new Date(`${formData.date}T${formData.time}`);
        const chartData = calculatePlanetaryPositions(birthDate, formData.lat, formData.lng);

        setChartData({
            ...chartData,
            userDetails: formData,
            birthDate
        });

        setIsGenerating(false);
        navigate('/chart');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 md:p-12"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
                        Discover Your Cosmic Blueprint
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Enter your birth details to generate an authentic South Indian Vedic chart.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-600"
                            placeholder="e.g. Arjuna"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Date of Birth
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white [color-scheme:dark]"
                            />
                        </div>

                        {/* Time Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Time of Birth
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* City Search */}
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Place of Birth
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-600"
                                placeholder="Search city..."
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 animate-spin" />
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
                                Calculating Planetary Positions...
                            </>
                        ) : (
                            <>
                                Generate Vedic Chart
                                <SparklesIcon />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
    </svg>
);

export default InputForm;
