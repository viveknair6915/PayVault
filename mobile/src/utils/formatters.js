
export const maskString = (str, visibleStart = 0, visibleEnd = 4) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= visibleStart + visibleEnd) return str;
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  return `${start}••••••${end}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};
