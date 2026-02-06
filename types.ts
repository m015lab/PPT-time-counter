export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type RingtoneType = 'bell' | 'alarm' | 'digital' | 'none';

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  ring: string;
  button: string;
  buttonHover: string;
}

export type TimerType = 'PPT' | 'Q&A';