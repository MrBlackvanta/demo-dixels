export const dateKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const todayKey = (): string => dateKey(new Date());

export const shiftDay = (key: string, days: number): string => {
  const date = new Date(`${key}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateKey(date);
};

export const formatDay = (date: string): string => {
  const key = todayKey();
  if (date === key) return 'Today';

  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return date;

  const diff = Math.round((target.getTime() - new Date(`${key}T00:00:00`).getTime()) / 86_400_000);
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';

  return target.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
