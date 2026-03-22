export const EMOTIONS = {
  '开心': { label: 'Happy',   color: '#1D9E75', bg: '#E1F5EE', dark: '#085041' },
  '焦虑': { label: 'Anxious', color: '#BA7517', bg: '#FAEEDA', dark: '#633806' },
  '平静': { label: 'Calm',    color: '#378ADD', bg: '#E6F1FB', dark: '#0C447C' },
  '沮丧': { label: 'Sad',     color: '#888780', bg: '#F1EFE8', dark: '#444441' },
  '兴奋': { label: 'Excited', color: '#7F77DD', bg: '#EEEDFE', dark: '#3C3489' },
  '疲惫': { label: 'Tired',   color: '#B4B2A9', bg: '#F1EFE8', dark: '#5F5E5A' },
};

export const getEmotionConfig = (emotion) => {
  return EMOTIONS[emotion] ?? { label: emotion ?? '—', color: '#B4B2A9', bg: '#F1EFE8', dark: '#5F5E5A' };
};
