export function toISODate(input) {
  if (!input) return undefined;
  const s = String(input).trim();
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Accept DD/MM/YYYY
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [_, d, mo, y] = m;
    return `${y}-${mo}-${d}`;
  }
  return s; // fallback as-is
}

