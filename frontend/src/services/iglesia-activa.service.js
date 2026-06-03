import { ref } from 'vue'

const KEY = 'diezmapp.idIglesiaActiva'
const NAME_KEY = 'diezmapp.nombreIglesiaActiva'
export const iglesiaActivaId = ref(localStorage.getItem(KEY) || '')
export const iglesiaActivaNombre = ref(localStorage.getItem(NAME_KEY) || '')
export const iglesiaActivaReady = ref(false)

export const getIglesiaActivaId = () => iglesiaActivaId.value || localStorage.getItem(KEY) || ''

export const setIglesiaActivaId = (idIglesia, nombreIglesia = '') => {
  if (idIglesia) {
    const value = String(idIglesia)
    localStorage.setItem(KEY, value)
    iglesiaActivaId.value = value
    if (nombreIglesia) {
      localStorage.setItem(NAME_KEY, nombreIglesia)
      iglesiaActivaNombre.value = nombreIglesia
    }
    return
  }

  localStorage.removeItem(KEY)
  localStorage.removeItem(NAME_KEY)
  iglesiaActivaId.value = ''
  iglesiaActivaNombre.value = ''
}

export const setIglesiaActivaReady = (ready = true) => {
  iglesiaActivaReady.value = ready
}

export const withIglesiaActiva = (path) => {
  const idIglesia = getIglesiaActivaId()
  if (!idIglesia) return path

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}idIglesia=${encodeURIComponent(idIglesia)}`
}
