import React, { useMemo } from 'react';
import { analyzeMarriageDasaForecast } from '../utils/marriageDasaForecast';
import { AlertTriangle, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { TAMIL_PLANET_NAMES } from '../utils/translations';

interface Props {
    boyChart: any;
    girlChart: any;
    boyBirthDate: Date;
    girlBirthDate: Date;
    language: 'en' | 'ta';
}

export const MarriageDasaForecast: React.FC<Props> = ({
    boyChart,
    girlChart,
    boyBirthDate,
    girlBirthDate,
    language
}) => {
    const forecast = useMemo(() =>
        analyzeMarriageDasaForecast(boyChart, girlChart, boyBirthDate, girlBirthDate),
        [boyChart, girlChart, boyBirthDate, girlBirthDate]
    );

    const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
        if (severity === 'high') return 'bg-red-500/20 border-red-500 text-red-300';
        if (severity === 'medium') return 'bg-orange-500/20 border-orange-500 text-orange-300';
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
    };

    const getScoreColor = (score: number) => {
        if (score >= 100) return 'text-green-400';
        if (score >= 60) return 'text-teal-400';
        if (score >= 30) return 'text-yellow-400';
        if (score >= 0) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                    {language === 'ta' ? 'அடுத்த 10 ஆண்டு தசா முன்னறிவிப்பு' : '10-Year Dasa Forecast'}
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">
                            {language === 'ta' ? 'மொத்த இணக்கம்' : 'Overall Compatibility'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {language === 'ta' ? 'அடுத்த 10 ஆண்டுகளுக்கான சராசரி' : 'Average for next 10 years'}
                        </p>
                    </div>
                    <div className={`text-4xl font-bold ${getScoreColor(forecast.overallCompatibility)}`}>
                        {forecast.overallCompatibility.toFixed(0)}/225
                    </div>
                </div>
            </div>

            {forecast.challenges.length > 0 && (
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-lg font-semibold text-white">
                            {language === 'ta' ? 'எச்சரிக்கை காலங்கள்' : 'Challenging Periods'}
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {forecast.challenges.map((challenge, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border ${getSeverityColor(challenge.severity)}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-semibold">{format(challenge.date, 'MMM yyyy')}</span>
                                    </div>
                                    <span className="text-xs uppercase px-2 py-1 rounded bg-black/30">{challenge.severity}</span>
                                </div>
                                <p className="text-sm">
                                    {language === 'ta' ? challenge.description.ta : challenge.description.en}
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                    <User className="w-3 h-3" />
                                    <span>
                                        {language === 'ta'
                                            ? challenge.affectedPerson === 'boy' ? 'ஆண் பாதிக்கப்படுவார்'
                                                : challenge.affectedPerson === 'girl' ? 'பெண் பாதிக்கப்படுவார்'
                                                    : 'இருவரும் பாதிக்கப்படுவார்கள்'
                                            : challenge.affectedPerson === 'boy' ? 'Affects Husband'
                                                : challenge.affectedPerson === 'girl' ? 'Affects Wife'
                                                    : 'Affects Both'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="glass-panel p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                    {language === 'ta' ? 'ஆணின் தசா காலங்கள்' : "Groom's Dasa Periods"}
                </h4>
                <div className="space-y-2">
                    {forecast.boyPeriods.slice(0, 5).map((period, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${period.isProblematic ? 'bg-red-900/20 border border-red-500/30' : 'bg-gray-800/50'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-white">
                                            {language === 'ta'
                                                ? `${TAMIL_PLANET_NAMES[period.mahaDasa]} மகா - ${TAMIL_PLANET_NAMES[period.planet]} புக்தி`
                                                : `${period.mahaDasa} Maha - ${period.planet} Bhukti`}
                                        </span>
                                    </div>
                                    {period.isProblematic && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                                            {period.problemType === 'both_6th_8th' ? '6th & 8th' :
                                                period.problemType === '6th_house_lord' ? '6th House' : '8th House'}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {format(period.startDate, 'MMM yyyy')} - {format(period.endDate, 'MMM yyyy')}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(period.score)}`}>
                                    {period.score.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-400">{period.quality}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                    {language === 'ta' ? 'பெண்ணின் தசா காலங்கள்' : "Bride's Dasa Periods"}
                </h4>
                <div className="space-y-2">
                    {forecast.girlPeriods.slice(0, 5).map((period, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${period.isProblematic ? 'bg-red-900/20 border border-red-500/30' : 'bg-gray-800/50'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-white">
                                            {language === 'ta'
                                                ? `${TAMIL_PLANET_NAMES[period.mahaDasa]} மகா - ${TAMIL_PLANET_NAMES[period.planet]} புக்தி`
                                                : `${period.mahaDasa} Maha - ${period.planet} Bhukti`}
                                        </span>
                                    </div>
                                    {period.isProblematic && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                                            {period.problemType === 'both_6th_8th' ? '6th & 8th' :
                                                period.problemType === '6th_house_lord' ? '6th House' : '8th House'}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {format(period.startDate, 'MMM yyyy')} - {format(period.endDate, 'MMM yyyy')}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(period.score)}`}>
                                    {period.score.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-400">{period.quality}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6 bg-blue-900/10 border-blue-500/30">
                <h4 className="text-lg font-semibold text-blue-300 mb-3">
                    {language === 'ta' ? 'பரிந்துரைகள்' : 'Recommendations'}
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                    {forecast.challenges.filter(c => c.severity === 'high').length > 0 && (
                        <li className="flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            <span>
                                {language === 'ta'
                                    ? 'உயர் சவால் காலங்களில் முக்கிய முடிவுகளை தவிர்க்கவும்'
                                    : 'Avoid major decisions during high-challenge periods'}
                            </span>
                        </li>
                    )}
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>
                            {language === 'ta'
                                ? '6வது/8வது வீட்டு அதிபதி தசை காலங்களில் உடல்நலத்தை கவனியுங்கள்'
                                : 'Pay attention to health during 6th/8th house lord periods'}
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        <span>
                            {language === 'ta'
                                ? 'இருவருக்கும் நல்ல மதிப்பெண் இருக்கும் போது முக்கிய நிகழ்வுகளை திட்டமிடுங்கள்'
                                : 'Plan important events when both partners have good scores'}
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
