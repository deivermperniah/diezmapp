import { api } from '@/api/http'
import { withIglesiaActiva } from './iglesia-activa.service'

export const getOfrendas = () => api.get(withIglesiaActiva('/ofrendas'))

export const createOfrenda = (payload) => api.post('/ofrendas', payload)
