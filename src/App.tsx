/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Bell, BellOff, Settings2 } from 'lucide-react';

type TimerMode = 'work' | 'break' | 'extra';

interface TimerConfig {
  work: number;
  break: number;
  extra: number;
}

export default function App() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<TimerConfig>({
    work: 25,
    break: 5,
    extra: 5,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  const playAlarm = () => {
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed', e));
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(config[newMode] * 60);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      playAlarm();
      
      // Auto-suggest "Read 5 more minutes" if work session ends
      if (mode === 'work') {
        // We stay in work mode but at 0, or we could auto-switch to 'extra'
        // For this app, the core feature is the "5 more minutes" reminder
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(config[mode] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (config[mode] * 60)) * 100;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-emerald-100 flex flex-col items-center p-4 sm:p-6 overflow-x-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl flex justify-between items-center py-4 sm:py-8 px-2 sm:px-8 z-20"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
            <BookOpen size={18} className="sm:w-5 sm:h-5" />
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight">再讀五分鐘</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 sm:p-3 hover:bg-black/5 rounded-full transition-colors active:scale-90"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <BellOff size={20} className="sm:w-6 sm:h-6" /> : <Bell size={20} className="sm:w-6 sm:h-6" />}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 sm:p-3 hover:bg-black/5 rounded-full transition-colors active:scale-90"
            aria-label="Settings"
          >
            <Settings2 size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </motion.div>

      {/* Main Timer Display */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-8 sm:gap-12 py-4">
        {/* Mode Selector */}
        <div className="flex bg-black/5 p-1 rounded-2xl w-full">
          {(['work', 'break', 'extra'] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === m 
                  ? 'bg-white shadow-sm text-emerald-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'work' ? '專注' : m === 'break' ? '休息' : '再五分鐘'}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              className="text-black/5 sm:stroke-[8]"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray="283%"
              initial={{ strokeDashoffset: "283%" }}
              animate={{ strokeDashoffset: `${283 - (283 * progress) / 100}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
              className={`${mode === 'work' ? 'text-emerald-500' : mode === 'break' ? 'text-blue-500' : 'text-orange-500'} sm:stroke-[8]`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center z-10">
            <motion.span 
              key={timeLeft}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              className="text-6xl sm:text-8xl font-light tracking-tighter tabular-nums"
            >
              {formatTime(timeLeft)}
            </motion.span>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 uppercase tracking-[0.2em] font-bold">
              {mode === 'work' ? 'Focus' : mode === 'break' ? 'Rest' : 'Push'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 sm:gap-10">
          <button 
            onClick={resetTimer}
            className="p-4 sm:p-5 bg-black/5 hover:bg-black/10 rounded-full transition-all text-gray-600 active:scale-90"
            aria-label="Reset"
          >
            <RotateCcw size={24} className="sm:w-7 sm:h-7" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 ${
              isActive 
                ? 'bg-white border-2 border-black/5 text-black' 
                : 'bg-black text-white'
            }`}
            aria-label={isActive ? "Pause" : "Start"}
          >
            {isActive ? <Pause size={32} fill="currentColor" className="sm:w-10 sm:h-10" /> : <Play size={32} fill="currentColor" className="ml-1 sm:w-10 sm:h-10" />}
          </button>

          <button 
            onClick={() => switchMode('extra')}
            className="p-4 sm:p-5 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-all text-emerald-600 group relative active:scale-90"
            title="再讀五分鐘"
          >
            <BookOpen size={24} className="sm:w-7 sm:h-7" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
              再讀五分鐘
            </span>
          </button>
        </div>

        {/* Reminder Message */}
        <AnimatePresence>
          {timeLeft === 0 && !isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center gap-2 text-center"
            >
              <div className="flex items-center gap-2 font-bold text-lg">
                <Bell size={20} />
                <span>時間到！</span>
              </div>
              <p className="text-sm opacity-90">
                {mode === 'work' ? '做得好！要不要再堅持五分鐘？' : '休息結束，準備開始了嗎？'}
              </p>
              {mode === 'work' && (
                <button 
                  onClick={() => {
                    switchMode('extra');
                    setIsActive(true);
                  }}
                  className="mt-2 bg-white text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors"
                >
                  好，再讀五分鐘！
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-6">設定</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">專注時間 (分鐘)</label>
                  <input 
                    type="range" min="1" max="60" 
                    value={config.work} 
                    onChange={(e) => setConfig({...config, work: parseInt(e.target.value)})}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-sm font-medium mt-1">
                    <span>1</span>
                    <span className="text-emerald-600">{config.work}</span>
                    <span>60</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">休息時間 (分鐘)</label>
                  <input 
                    type="range" min="1" max="30" 
                    value={config.break} 
                    onChange={(e) => setConfig({...config, break: parseInt(e.target.value)})}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-sm font-medium mt-1">
                    <span>1</span>
                    <span className="text-blue-600">{config.break}</span>
                    <span>30</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">「再五分鐘」長度</label>
                  <input 
                    type="range" min="1" max="15" 
                    value={config.extra} 
                    onChange={(e) => setConfig({...config, extra: parseInt(e.target.value)})}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-sm font-medium mt-1">
                    <span>1</span>
                    <span className="text-orange-600">{config.extra}</span>
                    <span>15</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowSettings(false);
                  resetTimer();
                }}
                className="w-full mt-8 bg-black text-white py-3 rounded-2xl font-bold hover:bg-gray-800 transition-colors"
              >
                儲存並重置
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Info */}
      <footer className="w-full max-w-2xl py-8 text-gray-400 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase flex flex-col items-center gap-4 mt-auto">
        <span>Stay focused, just five more minutes.</span>
      </footer>
    </div>
  );
}
