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
    const [chartData, setChartData] = useState<any | null>(null);

    return (
        <ChartContext.Provider value={{ chartData, setChartData }}>
            {children}
        </ChartContext.Provider>
    );
};
