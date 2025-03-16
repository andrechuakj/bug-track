export function truncateName(name: string, maxLength: number) {
  return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
}

export const unscream = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
