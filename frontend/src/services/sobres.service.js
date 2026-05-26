import { api } from '@/api/http'
import { getIglesiaActivaId, withIglesiaActiva } from './iglesia-activa.service'

export const getSobres = () => api.get(withIglesiaActiva('/sobres'))

export const getSiguienteNumeroSobre = (fecha) =>
  api.get(
    `/sobres/siguiente-numero?fecha=${encodeURIComponent(fecha)}&idIglesia=${encodeURIComponent(getIglesiaActivaId())}`,
  )

export const createSobre = (payload) => api.post('/sobres', payload)
