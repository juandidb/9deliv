/* Determina si un restaurante está abierto según su string hours: "HH:MM-HH:MM" */

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN
  return h * 60 + m
}

export function isOpenNow(hours: string, now: Date = new Date()): boolean {
  // Soporta múltiples rangos separados por ' - '
  const ranges = hours.split(' - ').map(r => r.trim()).filter(Boolean)
  const minutes = now.getHours() * 60 + now.getMinutes()
  for (const range of ranges) {
    const [startRaw, endRaw] = range.split('-').map(s => s.trim())
    if (!startRaw || !endRaw) continue
    const start = parseTimeToMinutes(startRaw)
    const end = parseTimeToMinutes(endRaw)
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue
    if (start <= end) {
      if (minutes >= start && minutes <= end) return true
    } else {
      // Cruza medianoche
      if (minutes >= start || minutes <= end) return true
    }
  }
  return false
}
