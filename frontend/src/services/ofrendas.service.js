import { api } from '@/api/http'
import { withIglesiaActiva } from './iglesia-activa.service'

export const getOfrendas = () => api.get(withIglesiaActiva('/ofrendas'))

export const getOfrendasBySobre = (idSobre) => api.get(`/ofrendas/sobre/${idSobre}`)

export const createOfrenda = (payload) => api.post('/ofrendas', payload)
