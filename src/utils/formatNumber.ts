// Formatea números con separador de miles con punto (ej: 1.234.567)
export function formatNumber(num: number): string {
  return num.toLocaleString('es-AR')
}
