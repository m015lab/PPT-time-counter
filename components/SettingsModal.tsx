import React, { useState, useEffect } from 'react';
import { X, Check, Bell, BellOff, Volume2, AlertTriangle, Radio } from 'lucide-react';
import { RingtoneType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seconds: number, ringtone: RingtoneType) => void;
  currentDuration: number;
  currentRingtone: RingtoneType;
  themeColor: string;
  onPreviewRingtone: (type: RingtoneType) => void;
}

const PRESET_TIMES = [3, 5, 10, 15, 20, 30, 45, 60];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentDuration, 
  currentRingtone,
  themeColor,
  onPreviewRingtone
}) => {
  const [minutes, setMinutes] = useState(0);
  const [selectedRingtone, setSelectedRingtone] = useState<RingtoneType>('bell');

  useEffect(() => {
    if (isOpen) {
      setMinutes(Math.ceil(currentDuration / 60));
      setSelectedRingtone(currentRingtone);
    }
  }, [isOpen, currentDuration, currentRingtone]);

  if (!isOpen) return null;

  const handleSave = () => {
    const totalSeconds = minutes * 60;
    onSave(totalSeconds > 0 ? totalSeconds : 60, selectedRingtone); 
    onClose();
  };

  const handleRingtoneSelect = (type: RingtoneType) => {
    setSelectedRingtone(type);
    onPreviewRingtone(type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        <div className={`px-6 py-4 ${themeColor} flex justify-between items-center shrink-0`}>
          <h3 className="text-white font-bold text-lg tracking-wide">设置</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors bg-black/10 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Section: Time */}
          <div className="space-y-4">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">时间设定</label>
            
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-6xl font-mono font-bold text-white tabular-nums tracking-tight">
                {minutes}<span className="text-2xl text-slate-500 ml-1">min</span>
              </span>
            </div>

            <input 
              type="range" 
              min="1" 
              max="120" 
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-${themeColor.replace('bg-', '')}`}
            />

            <div className="grid grid-cols-4 gap-2">
              {PRESET_TIMES.map((time) => (
                <button
                  key={time}
                  onClick={() => setMinutes(time)}
                  className={`py-2 px-1 rounded-lg text-sm font-semibold transition-all border ${
                    minutes === time 
                      ? `bg-white text-slate-900 border-white` 
                      : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {time}m
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800 w-full" />

          {/* Section: Sound */}
          <div className="space-y-3">
             <label className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
               结束铃声 <Volume2 size={14} />
             </label>
             <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bell', label: '清脆', icon: Bell },
                  { id: 'alarm', label: '警报', icon: AlertTriangle },
                  { id: 'digital', label: '电子', icon: Radio },
                  { id: 'none', label: '静音', icon: BellOff },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedRingtone === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleRingtoneSelect(item.id as RingtoneType)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${
                         isSelected
                         ? 'bg-slate-800 border-white/30 text-white'
                         : 'bg-slate-800/40 border-transparent text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} className={isSelected ? 'text-white' : 'text-slate-500'} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
             </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleSave}
            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all mt-2 ${themeColor}`}
          >
            <Check size={20} />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;