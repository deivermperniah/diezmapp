import { api } from '@/api/http'
import { getIglesiaActivaId, withIglesiaActiva } from './iglesia-activa.service'

export const getSobres = () => api.get(withIglesiaActiva('/sobres'))

export const getSobre = (idSobre) => api.get(`/sobres/${idSobre}`)

export const getSiguienteNumeroSobre = (fecha) =>
  api.get(
    `/sobres/siguiente-numero?fecha=${encodeURIComponent(fecha)}&idIglesia=${encodeURIComponent(getIglesiaActivaId())}`,
  )

export const createSobre = (payload) => api.post('/sobres', payload)

export const updateSobre = (idSobre, payload) => api.put(`/sobres/${idSobre}`, payload)

export const deleteSobre = (idSobre) => api.delete(`/sobres/${idSobre}`)
