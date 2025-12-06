import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TAMIL_RASI_NAMES, PLANET_SYMBOLS } from '../utils/constants';
import { TAMIL_PLANET_ABBREVIATIONS, TAMIL_PLANET_NAMES } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { getNavamsaChartData } from '../utils/astrology';

import ChartGrid from './ChartGrid';

interface SouthIndianChartProps {
    data: any;
}

const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ data }) => {
    const { t } = useLanguage();

    const navamsaData = useMemo(() => getNavamsaChartData(data), [data]);

    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    {t.chart.title}
                </h2>
                <p className="text-slate-400">
                    {data.userDetails.name} • {new Date(data.userDetails.date).toLocaleDateString()}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start justify-items-center">
                {/* Rasi Chart */}
                <ChartGrid
                    title="Rasi Chart (D1)"
                    planets={data.planets}
                    ascendant={data.ascendant}
                    onCenterContent={() => (
                        <div className="text-center p-4">
                            <div className="text-4xl font-serif text-slate-700 opacity-20 mb-2">ॐ</div>
                            <div className="text-sm text-slate-500">{t.chart.lagna}: {TAMIL_RASI_NAMES[data.ascendant.signIndex]}</div>
                            <div className="text-xs text-slate-600 mt-1">
                                {Math.floor(data.ascendant.degree)}° {Math.round((data.ascendant.degree % 1) * 60)}'
                            </div>
                        </div>
                    )}
                />

                {/* Navamsa Chart */}
                {navamsaData && (
                    <ChartGrid
                        title="Navamsa Chart (D9)"
                        planets={navamsaData.planets}
                        ascendant={navamsaData.ascendant}
                        onCenterContent={() => (
                            <div className="text-center p-4">
                                <div className="text-4xl font-serif text-slate-700 opacity-20 mb-2">D9</div>
                                <div className="text-sm text-slate-500">Navamsa</div>
                            </div>
                        )}
                    />
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                    {t.chart.note}
                </p>
            </div>
        </div>
    );
};

export default SouthIndianChart;
