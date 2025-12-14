import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChartContextType {
    chartData: any | null;
    setChartData: (data: any) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export const useChartData = () => {
    const context = useContext(ChartContext);
    if (!context) {
        throw new Error('useChartData must be used within a ChartProvider');
    }
    return context;
};

interface ChartProviderProps {
    children: ReactNode;
}

export const ChartProvider: React.FC<ChartProviderProps> = ({ children }) => {
    // Initialize from localStorage if available
    const [chartData, setChartDataState] = useState<any | null>(() => {
        try {
            const saved = localStorage.getItem('astrology_chart_data');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to load chart data", e);
            return null;
        }
    });

    const setChartData = (data: any) => {
        setChartDataState(data);
        try {
            if (data) {
                // Ensure data is serializable
                const serialized = JSON.stringify(data);
                localStorage.setItem('astrology_chart_data', serialized);
                console.log("Chart data saved via persist");
            } else {
                localStorage.removeItem('astrology_chart_data');
            }
        } catch (e) {
            console.error("Failed to save chart data - Storage Error?", e);
        }
    };

    return (
        <ChartContext.Provider value={{ chartData, setChartData }}>
            {children}
        </ChartContext.Provider>
    );
};
