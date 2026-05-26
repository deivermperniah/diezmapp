import { api } from '@/api/http'
import { withIglesiaActiva } from './iglesia-activa.service'

export const getTransferencias = () => api.get(withIglesiaActiva('/transferencias'))

export const createTransferencia = (payload) => api.post('/transferencias', payload)
