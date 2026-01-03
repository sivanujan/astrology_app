import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface PlaceSearchProps {
    value: string;
    onChange: (place: { name: string; lat: number; lng: number }) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({
    value,
    onChange,
    placeholder = 'Search location...',
    label,
    className = ''
}) => {
    const [searchQuery, setSearchQuery] = useState(value);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Update local search when value changes externally
    useEffect(() => {
        setSearchQuery(value);
    }, [value]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2 && searchQuery !== value) {
                setIsSearching(true);
                try {
                    const response = await fetch(
                        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=8&language=en&format=json`
                    );
                    const data = await response.json();
                    if (data.results) {
                        setSearchResults(data.results);
                        setShowDropdown(true);
                    } else {
                        setSearchResults([]);
                    }
                } catch (error) {
                    console.error('Error searching location:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, value]);

    const handleSelect = (city: any) => {
        const placeName = city.admin1
            ? `${city.name}, ${city.admin1}, ${city.country}`
            : `${city.name}, ${city.country}`;

        setSearchQuery(placeName);
        onChange({
            name: placeName,
            lat: city.latitude,
            lng: city.longitude
        });
        setShowDropdown(false);
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        if (searchResults.length > 0) setShowDropdown(true);
                    }}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                    ) : (
                        <Search className="w-5 h-5 text-white/50" />
                    )}
                </div>
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                    {searchResults.map((city, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelect(city)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                        >
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="text-white font-medium">
                                        {city.name}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {city.admin1 && `${city.admin1}, `}{city.country}
                                        {city.admin2 && ` • ${city.admin2}`}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results */}
            {showDropdown && searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 text-center text-slate-400">
                    No locations found. Try a different search.
                </div>
            )}
        </div>
    );
};

export default PlaceSearch;
