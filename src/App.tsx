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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

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
          {!isSubscribed && (
            <button 
              onClick={() => setShowSubscription(true)}
              className="px-2.5 py-1.5 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-bold rounded-full hover:bg-amber-200 transition-colors flex items-center gap-1 sm:gap-1.5 shadow-sm active:scale-95"
            >
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-500 rounded-full flex items-center justify-center text-white">
                <span className="text-[8px] sm:text-[10px]">★</span>
              </div>
              <span className="hidden xs:inline">去廣告</span>
              <span className="xs:hidden">Premium</span>
            </button>
          )}
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

        {/* Improved Ad Placement: Integrated Discovery Card */}
        {!isSubscribed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white border border-black/5 rounded-[24px] p-4 shadow-sm flex items-center gap-4 relative overflow-hidden cursor-pointer hover:border-emerald-200 transition-colors group"
            onClick={() => window.open('https://picsum.photos', '_blank')}
          >
            <div className="absolute top-2 right-3 bg-gray-100 text-[7px] font-bold px-1.5 py-0.5 rounded text-gray-400 uppercase tracking-tighter">Sponsored</div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Coffee className="text-emerald-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-800">想提升 200% 專注力嗎？</p>
              <p className="text-[10px] text-gray-500 mt-0.5">試試這款專為學生設計的白噪音耳機...</p>
            </div>
            <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={16} fill="currentColor" />
            </div>
          </motion.div>
        )}

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

      {/* Subscription Modal */}
      <AnimatePresence>
        {showSubscription && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 sm:p-8 text-white text-center relative flex-shrink-0">
                <button 
                  onClick={() => setShowSubscription(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors active:scale-90"
                >
                  <RotateCcw size={20} className="rotate-45" />
                </button>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-2xl sm:text-3xl">💎</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">升級專業版</h2>
                <p className="text-amber-50 text-xs sm:text-sm mt-1">一次付費，永久享受無廣告體驗</p>
              </div>
              
              <div className="p-6 sm:p-8 overflow-y-auto">
                <ul className="space-y-3 mb-6 sm:mb-8">
                  {[
                    '永久移除所有廣告',
                    '解鎖所有自定義主題',
                    '跨裝置同步設定',
                    '支持台灣獨立開發者'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-600">
                      <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-1 gap-3 mb-6 sm:mb-8">
                  {/* Monthly Option */}
                  <button 
                    onClick={() => {
                      setIsSubscribed(true);
                      setShowSubscription(false);
                      alert('感謝訂閱！已成功升級為專業版。');
                    }}
                    className="flex justify-between items-center p-4 rounded-2xl border-2 border-black/5 hover:border-emerald-500 transition-all text-left group active:scale-[0.98]"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">月費計劃</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">NT$ 60 <span className="text-xs font-normal text-gray-400">/ 月</span></p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-emerald-500 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </button>

                  {/* Lifetime Option */}
                  <button 
                    onClick={() => {
                      setIsSubscribed(true);
                      setShowSubscription(false);
                      alert('感謝支持！您已獲得終身專業版權限。');
                    }}
                    className="flex justify-between items-center p-4 rounded-2xl border-2 border-amber-500 bg-amber-50 transition-all text-left relative group active:scale-[0.98]"
                  >
                    <div className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">超值終身</div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 uppercase">終身買斷</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">NT$ 300 <span className="text-xs font-normal text-gray-400">/ 永久</span></p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    </div>
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setIsSubscribed(true);
                    setShowSubscription(false);
                    alert('感謝支持！已成功升級。');
                  }}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
                >
                  確認升級
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
