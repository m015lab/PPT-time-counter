export const formatTime = (seconds: number): string => {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const calculateProgress = (total: number, remaining: number): number => {
  if (total === 0) return 0;
  const progress = ((total - remaining) / total) * 100;
  return Math.min(100, Math.max(0, progress));
};