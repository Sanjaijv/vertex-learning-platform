export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatStudentCount(count: number): string {
  if (count < 1000) return `${count}`;
  return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}
