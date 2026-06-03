import { computed } from 'vue'
import { formatMoney, parseAmount } from '@/utils/money'

export const useContributionAmounts = ({ form, tasaDolar, isBolivarSelected }) => {
  const hasValidRate = computed(() => !isBolivarSelected.value || Number(tasaDolar.value || 0) > 0)

  const amountToUsd = (amount) => {
    const numericAmount = parseAmount(amount)
    const rate = Number(tasaDolar.value || 0)

    if (!isBolivarSelected.value) return Number(numericAmount.toFixed(2))
    return rate ? Number((numericAmount / rate).toFixed(2)) : 0
  }

  const equivalentUsd = (amount) => {
    if (!isBolivarSelected.value) return ''
    return `$ ${formatMoney(amountToUsd(amount))}`
  }

  const equivalentUsdAmount = (amount) => equivalentUsd(amount).replace('$ ', '') || '0,00'

  const totalCapturado = computed(() => {
    const diezmo = amountToUsd(form.montoDiezmo)
    const pacto = amountToUsd(form.montoPactoAmor)
    const ofrendas = form.ofrendas.reduce((total, ofrenda) => total + amountToUsd(ofrenda.montoOfrenda), 0)
    return Number((diezmo + pacto + ofrendas).toFixed(2))
  })

  const totalCapturadoEntrada = computed(() => {
    const diezmo = parseAmount(form.montoDiezmo)
    const pacto = parseAmount(form.montoPactoAmor)
    const ofrendas = form.ofrendas.reduce((total, ofrenda) => total + parseAmount(ofrenda.montoOfrenda), 0)
    return Number((diezmo + pacto + ofrendas).toFixed(2))
  })

  const totalTransferencias = computed(() =>
    Number(
      form.transferencias
        .reduce((total, transferencia) => total + amountToUsd(transferencia.montoTransferencia), 0)
        .toFixed(2),
    ),
  )

  const totalsMatch = computed(() => {
    if (!hasValidRate.value) return false
    return Math.abs(totalCapturado.value - totalTransferencias.value) <= 0.01
  })

  return {
    amountToUsd,
    equivalentUsdAmount,
    formatUsd: formatMoney,
    hasValidRate,
    parseAmount,
    totalCapturado,
    totalCapturadoEntrada,
    totalTransferencias,
    totalsMatch,
  }
}
