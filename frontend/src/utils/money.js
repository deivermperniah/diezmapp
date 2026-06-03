export const formatMoney = (value) =>
  Number(value || 0).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const parseAmount = (amount) => {
  if (typeof amount === 'number') return amount
  const normalizedAmount = String(amount || '')
    .replace(/\./g, '')
    .replace(',', '.')
  return Number(normalizedAmount || 0)
}
