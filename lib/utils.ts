export const round = (num: number | undefined, digits: number) => {
  const c = Math.pow(10, digits);
  return Math.round((num || 0) * c) / c;
}

export const seconds2MMSS = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
