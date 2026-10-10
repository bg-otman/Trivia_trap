export function formatAchievementName(identifier: string): string {
  return identifier
    .trim()
    .toLocaleLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
    .join(" ");
}
