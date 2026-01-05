import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Loader2, User, Sparkles } from 'lucide-react';
import { useChartData } from '../contexts/ChartContext';
import SouthIndianChart from '../components/SouthIndianChart';

// Scene Imports
import { SceneIntro } from '../components/demo-scenes/SceneIntro';
import { SceneAnalysis } from '../components/demo-scenes/SceneAnalysis';
import { SceneAIChat } from '../components/demo-scenes/SceneAIChat';
import { SceneMatching } from '../components/demo-scenes/SceneMatching';
import { SceneDashboard } from '../components/demo-scenes/SceneDashboard';
import { SceneOutro } from '../components/demo-scenes/SceneOutro';
import { SceneChartCreation } from '../components/demo-scenes/SceneChartCreation';

// Mock Chart Data for the Demo
const MOCK_CHART_DATA = {
    "ayanamsa": "Lahiri",
    "planets": [
        { "name": "Sun", "signIndex": 4, "degree": 19.63, "longitude": 139.63, "isRetro": false },
        { "name": "Moon", "signIndex": 5, "degree": 15.73, "longitude": 165.73, "isRetro": false },
        { "name": "Mars", "signIndex": 5, "degree": 19.58, "longitude": 169.58, "isRetro": false },
        { "name": "Mercury", "signIndex": 4, "degree": 16.75, "longitude": 136.75, "isRetro": false },
        { "name": "Jupiter", "signIndex": 8, "degree": 13.11, "longitude": 253.11, "isRetro": false },
        { "name": "Venus", "signIndex": 4, "degree": 21.05, "longitude": 141.05, "isRetro": false },
        { "name": "Saturn", "signIndex": 10, "degree": 23.06, "longitude": 323.06, "isRetro": true },
        { "name": "Rahu", "signIndex": 6, "degree": 5.08, "longitude": 185.08, "isRetro": true },
        { "name": "Ketu", "signIndex": 0, "degree": 5.08, "longitude": 5.08, "isRetro": true }
    ],
    "ascendant": { "signIndex": 6, "degree": 10.5, "longitude": 190.5 },
    "houses": [190.5, 220.5, 250.5, 280.5, 310.5, 340.5, 10.5, 40.5, 70.5, 100.5, 130.5, 160.5],
    "userDetails": { "name": "John", "city": "New York, USA", "date": "1995-10-20", "time": "10:30" },
    "birth_details": { "dob": "1995-10-20", "place": "New York, USA" },
    "birthDate": "1995-10-20"
};

const GhostCursor = ({ x, y, click }: { x: number, y: number, click: boolean }) => (
    <motion.div
        className="fixed z-[9999] pointer-events-none"
        animate={{ x, y, scale: click ? 0.9 : 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
            <path d="M5.65376 2.56066C5.17886 1.94726 4.14644 2.10642 3.88607 2.84433L0.268598 13.0939C0.0384589 13.746 0.697419 14.3323 1.30948 14.0205L7.23438 11.0022C7.54589 10.8435 7.91571 10.8936 8.16972 11.1293L12.9868 15.6015C13.4839 16.0629 14.2889 15.8263 14.4368 15.1752L17.2514 2.79124C17.3995 2.13968 16.7441 1.62121 16.1264 1.89966L5.65376 2.56066Z" fill="white" />
            <path d="M5.65376 2.56066C5.17886 1.94726 4.14644 2.10642 3.88607 2.84433L0.268598 13.0939C0.0384589 13.746 0.697419 14.3323 1.30948 14.0205L7.23438 11.0022C7.54589 10.8435 7.91571 10.8936 8.16972 11.1293L12.9868 15.6015C13.4839 16.0629 14.2889 15.8263 14.4368 15.1752L17.2514 2.79124C17.3995 2.13968 16.7441 1.62121 16.1264 1.89966L5.65376 2.56066Z" stroke="black" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    </motion.div>
);

const Demo = () => {
    const { setChartData } = useChartData();
    const [scene, setScene] = useState(0);

    useEffect(() => {
        const timer = async () => {
            // Scene 0: Intro (0-15s)
            setScene(0);
            await new Promise(r => setTimeout(r, 12000));

            // Scene 1: Chart Creation (15-30s)
            setScene(1);
            await new Promise(r => setTimeout(r, 18000));

            // Scene 2: Analysis (30-55s)
            setScene(2);
            await new Promise(r => setTimeout(r, 15000));

            // Scene 3: AI Chat (55-65s)
            setScene(3);
            await new Promise(r => setTimeout(r, 12000));

            // Scene 4: Matching (65-75s)
            setScene(4);
            await new Promise(r => setTimeout(r, 13000));

            // Scene 5: Dashboard (75-90s)
            setScene(5);
            await new Promise(r => setTimeout(r, 12000));

            // Scene 6: Outro (90s+)
            setScene(6);
        };
        timer();
    }, []);

    // CHART CREATION LOGIC (Reused form logic for Scene 1)
    const [chartStep, setChartStep] = useState('input');
    const [cursor, setCursor] = useState({ x: -100, y: -100, click: false });
    const [form, setForm] = useState({ name: '', date: '', time: '', city: '', gender: '' });
    const [chartAnimStage, setChartAnimStage] = useState('complete');

    // Run Chart Creation specific animation ONLY when in Scene 1
    useEffect(() => {
        if (scene !== 1) return;

        const runChartSequence = async () => {
            setChartStep('input');
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Helper to type text (faster for video)
            const typeText = async (setter: any, prev: any, field: string, text: string) => {
                for (let i = 0; i <= text.length; i++) {
                    setter((p: any) => ({ ...p, [field]: text.slice(0, i) }));
                    await new Promise(r => setTimeout(r, 30));
                }
            };

            await new Promise(r => setTimeout(r, 500));

            // 1. Move to Name
            setCursor({ x: centerX, y: centerY - 150, click: false });
            await new Promise(r => setTimeout(r, 500));
            setCursor(prev => ({ ...prev, click: true }));
            await new Promise(r => setTimeout(r, 200));
            setCursor(prev => ({ ...prev, click: false }));
            await typeText(setForm, { ...form }, 'name', 'Priya Kumar');

            // 2. Gender
            setCursor({ x: centerX - 100, y: centerY - 50, click: false });
            await new Promise(r => setTimeout(r, 400));
            setCursor(prev => ({ ...prev, click: true }));
            setForm(prev => ({ ...prev, gender: 'female' }));
            await new Promise(r => setTimeout(r, 200));
            setCursor(prev => ({ ...prev, click: false }));

            // 3. Date
            setCursor({ x: centerX - 150, y: centerY + 50, click: false });
            await new Promise(r => setTimeout(r, 400));
            setCursor(prev => ({ ...prev, click: true }));
            await typeText(setForm, { ...form }, 'date', '15/08/1995');

            // 4. Time
            await new Promise(r => setTimeout(r, 400));
            setCursor({ x: centerX + 150, y: centerY + 50, click: false });
            await new Promise(r => setTimeout(r, 400));
            setCursor(prev => ({ ...prev, click: true }));
            await typeText(setForm, { ...form }, 'time', '10:30');

            // 5. City
            setCursor({ x: centerX, y: centerY + 150, click: false });
            await new Promise(r => setTimeout(r, 500));
            setCursor(prev => ({ ...prev, click: true }));
            await typeText(setForm, { ...form }, 'city', 'Chennai, India');

            // 6. Generate
            setCursor({ x: centerX, y: centerY + 250, click: false });
            await new Promise(r => setTimeout(r, 600));
            setCursor(prev => ({ ...prev, click: true }));
            await new Promise(r => setTimeout(r, 100));
            setCursor(prev => ({ ...prev, click: false }));

            setChartStep('loading');
            await new Promise(r => setTimeout(r, 2000));

            setChartStep('result');
            // @ts-ignore
            setChartData(MOCK_CHART_DATA);

            // Cinematic Chart Sequence (Accelerated)
            setChartAnimStage('init');
            await new Promise(r => setTimeout(r, 200));
            setChartAnimStage('grid-draw');
            await new Promise(r => setTimeout(r, 1000));
            setChartAnimStage('lagna');
            await new Promise(r => setTimeout(r, 1000));
            setChartAnimStage('planets');
            await new Promise(r => setTimeout(r, 1000));
            setChartAnimStage('aspects');
            await new Promise(r => setTimeout(r, 1500));
            setChartAnimStage('3d');
            await new Promise(r => setTimeout(r, 5000));
            setChartAnimStage('complete');
        };

        runChartSequence();
    }, [scene]);


    return (
        <div className="relative overflow-hidden min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
            <AnimatePresence mode="wait">
                {/* SCENE 0: INTRO */}
                {scene === 0 && (
                    <motion.div key="intro" exit={{ opacity: 0 }} className="absolute inset-0 z-50">
                        <SceneIntro />
                    </motion.div>
                )}

                {/* SCENE 1: CHART CREATION */}
                {scene === 1 && (
                    <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -100 }} className="relative z-40">
                        <div className="min-h-screen pt-20 pb-12 relative overflow-hidden">
                            <GhostCursor x={cursor.x} y={cursor.y} click={cursor.click} />

                            <AnimatePresence mode="wait">
                                {chartStep === 'input' && (
                                    <div className="max-w-2xl mx-auto px-4 absolute inset-x-0 top-32 z-20">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, y: -200, scale: 0.9 }}
                                            className="glass-panel p-8 md:p-12"
                                        >
                                            <div className="text-center mb-10">
                                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
                                                    Free Horoscope
                                                </h1>
                                                <p className="text-slate-400 text-lg">Discover your cosmic path</p>
                                            </div>

                                            <div className="space-y-8">
                                                {/* Form Fields */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300 ml-1">Name</label>
                                                    <input type="text" value={form.name} readOnly className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-white" />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2"><User className="w-4 h-4" /> Gender</label>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {['male', 'female', 'other'].map(g => (
                                                            <div key={g} className={`px-4 py-3 rounded-lg border text-center capitalize ${form.gender === g ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
                                                                {g}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-300 ml-1">Date</label>
                                                        <input type="text" value={form.date} readOnly className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-300 ml-1">Time</label>
                                                        <input type="text" value={form.time} readOnly className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-white" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300 ml-1">Place</label>
                                                    <input type="text" value={form.city} readOnly className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-white" />
                                                </div>
                                                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2">
                                                    Generate Horoscope <Sparkles className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                                {chartStep === 'loading' && (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[50vh] absolute inset-0 z-10">
                                        <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
                                        <p className="text-xl text-purple-300 animate-pulse">Consulting the Stars...</p>
                                    </motion.div>
                                )}
                                {chartStep === 'result' && (
                                    <motion.div key="result" initial={{ opacity: 0, y: 300, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative z-10 pt-10">
                                        <SceneChartCreation
                                            data={MOCK_CHART_DATA}
                                            step={chartStep}
                                            animationStage={chartAnimStage}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* SCENE 2: ANALYSIS */}
                {scene === 2 && (
                    <motion.div key="analysis" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="absolute inset-0 z-30">
                        <SceneAnalysis />
                    </motion.div>
                )}

                {/* SCENE 3: AI CHAT */}
                {scene === 3 && (
                    <motion.div key="chat" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-30">
                        <SceneAIChat />
                    </motion.div>
                )}

                {/* SCENE 4: MATCHING */}
                {scene === 4 && (
                    <motion.div key="matching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30">
                        <SceneMatching />
                    </motion.div>
                )}

                {/* SCENE 5: DASHBOARD */}
                {scene === 5 && (
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30">
                        <SceneDashboard />
                    </motion.div>
                )}

                {/* SCENE 6: OUTRO */}
                {scene === 6 && (
                    <motion.div key="outro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50">
                        <SceneOutro />
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default Demo;
