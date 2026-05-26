import { api } from '@/api/http'
import { withIglesiaActiva } from './iglesia-activa.service'

export const getMiembros = () => api.get(withIglesiaActiva('/miembros'))

export const createMiembro = (payload) => api.post('/miembros', payload)

export const updateMiembro = (idMiembro, payload) => api.put(`/miembros/${idMiembro}`, payload)

export const deleteMiembro = (idMiembro) => api.delete(`/miembros/${idMiembro}`)
