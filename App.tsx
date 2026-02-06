import React, { useState } from 'react';
import TimerSection from './components/TimerSection';

// Default times in seconds
const DEFAULT_PPT_TIME = 15 * 60; // 15 minutes
const DEFAULT_QA_TIME = 5 * 60;   // 5 minutes

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'both' | 'PPT' | 'QA'>('both');

  const handleToggleFullScreen = (section: 'PPT' | 'QA') => {
      setActiveSection(prev => {
          if (prev === 'both') return section;
          return 'both'; // Return to split screen if already full
      });
  };

  return (
    <div className="flex flex-col w-full h-dvh bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* Top Section: PPT */}
      <div 
        className={`
            w-full transition-all duration-500 ease-in-out relative
            ${activeSection === 'both' ? 'h-1/2' : activeSection === 'PPT' ? 'h-full' : 'h-0 overflow-hidden'}
        `}
      >
        <TimerSection 
          title="PPT 演示时间" 
          initialTime={DEFAULT_PPT_TIME} 
          type="PPT"
          isFullScreen={activeSection === 'PPT'}
          onToggleFullScreen={() => handleToggleFullScreen('PPT')}
        />
      </div>

      {/* Divider - Only visible in split mode */}
      {activeSection === 'both' && (
         <div className="h-[2px] w-full bg-slate-800 shadow-xl z-30 flex items-center justify-center relative shrink-0">
            <div className="absolute bg-slate-800 px-4 py-1 rounded-full border border-slate-700 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                Timeline
            </div>
         </div>
      )}

      {/* Bottom Section: Q&A */}
      <div 
         className={`
            w-full transition-all duration-500 ease-in-out relative
            ${activeSection === 'both' ? 'h-1/2' : activeSection === 'QA' ? 'h-full' : 'h-0 overflow-hidden'}
        `}
      >
        <TimerSection 
          title="Q&A 问答环节" 
          initialTime={DEFAULT_QA_TIME} 
          type="QA"
          isFullScreen={activeSection === 'QA'}
          onToggleFullScreen={() => handleToggleFullScreen('QA')}
        />
      </div>

    </div>
  );
};

export default App;