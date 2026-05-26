const KEY = 'diezmapp.idIglesiaActiva'

export const getIglesiaActivaId = () => localStorage.getItem(KEY) || ''

export const setIglesiaActivaId = (idIglesia) => {
  if (idIglesia) {
    localStorage.setItem(KEY, String(idIglesia))
    return
  }

  localStorage.removeItem(KEY)
}

export const withIglesiaActiva = (path) => {
  const idIglesia = getIglesiaActivaId()
  if (!idIglesia) return path

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}idIglesia=${encodeURIComponent(idIglesia)}`
}
