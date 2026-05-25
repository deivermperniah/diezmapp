import { api } from '@/api/http'

export const getMiembros = () => api.get('/miembros')

export const createMiembro = (payload) => api.post('/miembros', payload)

export const updateMiembro = (idMiembro, payload) => api.put(`/miembros/${idMiembro}`, payload)

export const deleteMiembro = (idMiembro) => api.delete(`/miembros/${idMiembro}`)
