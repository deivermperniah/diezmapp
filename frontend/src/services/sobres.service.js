import { api } from '@/api/http'

export const getSobres = () => api.get('/sobres')

export const getSiguienteNumeroSobre = (fecha) =>
  api.get(`/sobres/siguiente-numero?fecha=${encodeURIComponent(fecha)}`)

export const createSobre = (payload) => api.post('/sobres', payload)
