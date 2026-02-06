import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, TimerStatus, RingtoneType } from '../types';

export const useTimer = (initialDurationSeconds: number) => {
  const [duration, setDuration] = useState(initialDurationSeconds);
  const [timeLeft, setTimeLeft] = useState(initialDurationSeconds);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [ringtone, setRingtone] = useState<RingtoneType>('bell');
  const [isRinging, setIsRinging] = useState(false);
  
  // Refs for accurate timing (Wall-Clock approach)
  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context robustly
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume().catch(console.error);
    }
  };

  // Pure tone generator that doesn't depend on closure state for the type
  const playTone = useCallback((type: RingtoneType) => {
    if (!audioContextRef.current || type === 'none') return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'bell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.5);
    } else if (type === 'alarm') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.1);
      osc.frequency.linearRampToValueAtTime(600, now + 0.2);
      osc.frequency.linearRampToValueAtTime(800, now + 0.3);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'digital') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      gainNode.gain.setValueAtTime(0.1, now);
      osc.start(now);
      osc.stop(now + 0.1);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1200, now + 0.15);
      gain2.gain.setValueAtTime(0.1, now + 0.15);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.25);
    }
  }, []);

  const startAlarm = useCallback(() => {
    if (ringtone === 'none') return;
    
    setIsRinging(true);
    initAudio();
    
    // Play immediately using current ringtone state
    playTone(ringtone);

    const interval = ringtone === 'bell' ? 2000 : ringtone === 'alarm' ? 800 : 1000;
    
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    
    // Note: We use a ref for the ringtone inside interval to ensure it picks up changes if they happen live
    // But for simplicity, we restart the alarm if ringtone changes. 
    // Here we just lock it to the ringtone at start of alarm.
    alarmIntervalRef.current = window.setInterval(() => {
        playTone(ringtone);
    }, interval);
  }, [ringtone, playTone]);

  const stopAlarm = useCallback(() => {
    setIsRinging(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    initAudio();
    if (isRinging) stopAlarm();
    
    // If already running, do nothing
    if (status === 'running') return;

    let targetTime = timeLeft;
    
    // Auto-reset if starting from 0
    if (timeLeft <= 0) {
        targetTime = duration;
        setTimeLeft(duration);
    }

    // Use Date.now() for drift-free timing
    endTimeRef.current = Date.now() + targetTime * 1000;
    setStatus('running');
  }, [duration, timeLeft, status, isRinging, stopAlarm]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    
    setStatus('paused');
    stopAlarm();
    
    // Capture exact remaining time
    if (endTimeRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        setTimeLeft(remaining);
        endTimeRef.current = null;
    }
  }, [status, stopAlarm]);

  const reset = useCallback(() => {
    setStatus('idle');
    setTimeLeft(duration);
    stopAlarm();
    endTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [duration, stopAlarm]);

  const setTime = useCallback((newSeconds: number) => {
    setDuration(newSeconds);
    setTimeLeft(newSeconds);
    setStatus('idle');
    stopAlarm();
    endTimeRef.current = null;
  }, [stopAlarm]);

  const adjustTime = useCallback((seconds: number) => {
    if (status === 'running' && endTimeRef.current) {
        // Adjust the target End Time
        endTimeRef.current += seconds * 1000;
        
        // Immediately update display
        const now = Date.now();
        const newRemaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        
        // Check if we adjusted into finished state
        if (newRemaining <= 0) {
            setTimeLeft(0);
            setStatus('completed');
            startAlarm();
            endTimeRef.current = null;
        } else {
            setTimeLeft(newRemaining);
        }
    } else {
        // Idle or Paused adjustment
        setTimeLeft(prev => Math.max(0, prev + seconds));
    }
    
    // Always adjust duration to keep progress bar relative
    setDuration(prev => Math.max(0, prev + seconds));
  }, [status, startAlarm]);

  // Main Timer Loop
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = window.setInterval(() => {
        if (!endTimeRef.current) return;

        const now = Date.now();
        const diff = endTimeRef.current - now;
        const newTimeLeft = Math.ceil(diff / 1000);

        // Optimization: Only update state if the integer second changed
        setTimeLeft(prev => {
             if (newTimeLeft <= 0) {
                 // Completion logic handled inside the setter to avoid closure staleness? 
                 // No, setter is pure. We need side effects.
                 // We'll handle side effects outside or rely on the value check.
                 // Better pattern: Check value here.
                 return 0;
             }
             if (prev !== newTimeLeft) return newTimeLeft;
             return prev;
        });

        if (newTimeLeft <= 0) {
            window.clearInterval(timerRef.current!);
            setStatus('completed');
            startAlarm();
            endTimeRef.current = null;
        }

      }, 200); // Check frequently (5Hz) to catch 0 quickly, but render only on second change
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, startAlarm]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const previewRingtone = useCallback((type: RingtoneType) => {
      initAudio();
      playTone(type);
  }, [playTone]);

  return {
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
    previewRingtone // New explicit preview method
  };
};