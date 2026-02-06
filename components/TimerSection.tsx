import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Settings, Plus, Minus, Maximize2, Minimize2, BellOff } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { formatTime } from '../utils/time';
import SettingsModal from './SettingsModal';
import { RingtoneType } from '../types';

interface TimerSectionProps {
  title: string;
  initialTime: number; // in seconds
  type: 'PPT' | 'QA';
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const TimerSection: React.FC<TimerSectionProps> = ({ 
  title, 
  initialTime, 
  type,
  isFullScreen,
  onToggleFullScreen
}) => {
  const { 
    timeLeft, 
    duration, 
    status, 
    start, 
    pause, 
    reset, 
    setTime, 
    adjustTime,
    ringtone,
    setRingtone,
    isRinging,
    stopAlarm,
    previewRingtone
  } = useTimer(initialTime);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme configuration based on type
  const theme = type === 'PPT' 
    ? {
        main: 'bg-blue-600',
        gradient: 'from-blue-900/40 to-slate-900',
        text: 'text-blue-400',
        ringColor: 'stroke-blue-500',
        ringBg: 'stroke-blue-900/30',
        glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]',
        buttonMain: 'bg-blue-600 hover:bg-blue-500',
        icon: 'text-blue-100'
      }
    : {
        main: 'bg-rose-600',
        gradient: 'from-rose-900/40 to-slate-900',
        text: 'text-rose-400',
        ringColor: 'stroke-rose-500',
        ringBg: 'stroke-rose-900/30',
        glow: 'shadow-[0_0_30px_-5px_rgba(225,29,72,0.3)]',
        buttonMain: 'bg-rose-600 hover:bg-rose-500',
        icon: 'text-rose-100'
      };

  // Determine status color
  const getStatusColor = () => {
    if (status === 'completed') return 'text-red-500 animate-pulse';
    if (timeLeft < 60 && status === 'running') return 'text-amber-400';
    return 'text-white';
  };

  const handleMainAction = () => {
    if (isRinging) {
      stopAlarm();
    } else if (status === 'running') {
      pause();
    } else {
      start();
    }
  };

  // Handler for settings save
  const handleSettingsSave = (newSeconds: number, newRingtone: RingtoneType) => {
    setTime(newSeconds);
    setRingtone(newRingtone);
  };

  // SVG Progress Ring Calculations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  // Safety check to prevent division by zero
  const safeDuration = duration > 0 ? duration : 1; 
  const progressRatio = timeLeft / safeDuration;
  const progress = Math.min(1, Math.max(0, progressRatio)); 
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className={`relative flex flex-col items-center w-full h-full overflow-hidden transition-all duration-500 bg-gradient-to-b ${theme.gradient} border-b border-white/5 last:border-b-0`}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className={`absolute top-0 left-0 w-full h-1 ${theme.main} opacity-20`}></div>
         <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full ${theme.main} blur-[100px] opacity-10`}></div>
         <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full ${theme.main} blur-[100px] opacity-10`}></div>
      </div>

      {/* Header Controls */}
      <div className="w-full flex justify-between items-start px-6 pt-4 sm:pt-6 z-20 absolute top-0">
        <div className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 ${theme.text} backdrop-blur-sm border border-white/5`}>
            {type === 'PPT' ? 'PPT 演示' : 'Q&A 问答'}
        </div>

        <div className="flex gap-2">
           {onToggleFullScreen && (
              <button 
                  onClick={onToggleFullScreen}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Toggle Fullscreen"
              >
                  {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
           )}
           <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-h-full z-10 px-4">
        
        {/* Clickable Timer Area */}
        <button 
          onClick={handleMainAction}
          className="group relative outline-none rounded-full transition-transform active:scale-95 focus-visible:ring-4 focus-visible:ring-white/30"
          aria-label={isRinging ? "Stop Alarm" : status === 'running' ? "Pause Timer" : "Start Timer"}
        >
          <div className="relative">
             {/* SVG Ring */}
            <svg 
              className={`transform -rotate-90 w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96 transition-all duration-300 ${isRinging ? 'animate-pulse' : ''}`}
              viewBox="0 0 250 250" 
            >
              <circle
                cx="125"
                cy="125"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className={`${theme.ringBg}`}
              />
              <circle
                cx="125"
                cy="125"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                className={`${isRinging ? 'text-red-500' : theme.ringColor} transition-all duration-1000 ease-linear`}
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
            </svg>

            {/* Digital Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isRinging ? (
                // Ringing State Display
                <div className="flex flex-col items-center animate-bounce">
                  <BellOff size={64} className="text-red-500 mb-2" />
                  <span className="text-red-400 font-bold text-lg tracking-widest uppercase">Stop Alarm</span>
                </div>
              ) : (
                // Normal Timer Display
                <>
                  <span className={`text-5xl sm:text-7xl lg:text-8xl font-mono font-bold tracking-tighter tabular-nums ${getStatusColor()} drop-shadow-2xl transition-colors duration-300`}>
                    {formatTime(timeLeft)}
                  </span>
                  <span className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 px-3 py-0.5 sm:py-1 rounded-full ${status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-400'}`}>
                      {status === 'idle' && 'READY'}
                      {status === 'running' && 'RUNNING'}
                      {status === 'paused' && 'PAUSED'}
                      {status === 'completed' && 'DONE'}
                  </span>
                </>
              )}
            </div>
            
            {/* Hover Play/Pause Overlay Hint (only if not ringing) */}
            {!isRinging && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[1px]">
                 {status === 'running' ? (
                   <Pause size={48} className="text-white drop-shadow-lg" />
                 ) : (
                   <Play size={48} className="text-white drop-shadow-lg ml-1" />
                 )}
              </div>
            )}
          </div>
        </button>

        {/* Secondary Controls Row */}
        <div className="flex items-center gap-4 sm:gap-6 mt-6 sm:mt-10">
           
           <div className="flex items-center bg-slate-800/50 rounded-full p-1 border border-white/5">
              {/* Quick Minus */}
              <button 
                onClick={(e) => { e.stopPropagation(); adjustTime(-60); }}
                className="p-3 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-90"
                title="-1 Min"
              >
                <Minus size={20} />
              </button>
              
              <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

              {/* Quick Add */}
              <button 
                onClick={(e) => { e.stopPropagation(); adjustTime(60); }}
                className="p-3 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-90"
                title="+1 Min"
              >
                <Plus size={20} />
              </button>
           </div>

          {/* Main Toggle Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleMainAction(); }}
            className={`p-4 sm:p-5 rounded-full text-white shadow-lg ${isRinging ? 'bg-red-500 hover:bg-red-600 animate-pulse' : theme.buttonMain + ' ' + theme.glow} hover:scale-105 active:scale-95 transition-all`}
            title={isRinging ? "Stop Alarm" : (status === 'running' ? "Pause" : "Start")}
          >
            {isRinging ? (
              <BellOff size={28} fill="currentColor" />
            ) : status === 'running' ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="ml-1" />
            )}
          </button>

          {/* Reset */}
          <button
            onClick={(e) => { e.stopPropagation(); reset(); }}
            className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-all border border-white/5 hover:border-white/20 active:scale-95"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
        currentDuration={duration}
        currentRingtone={ringtone}
        themeColor={theme.main}
        onPreviewRingtone={(type) => {
            setRingtone(type);
            previewRingtone(type);
        }}
      />
    </div>
  );
};

export default TimerSection;