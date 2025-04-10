/**
 * @param dateStr - The input date string.
 * @returns The formatted date string.
 */

export const formatDate = (dateStr: string, ofst: number = 0): string => {
  const date = new Date(dateStr);

  date.setHours(date.getHours() + ofst);

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
};
