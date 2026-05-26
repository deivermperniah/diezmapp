import { api } from '@/api/http'

export const getIglesias = () => api.get('/iglesias')

export const createIglesia = (payload) => api.post('/iglesias', payload)

export const updateIglesia = (idIglesia, payload) => api.put(`/iglesias/${idIglesia}`, payload)

export const deleteIglesia = (idIglesia) => api.delete(`/iglesias/${idIglesia}`)

export const getMonedas = () => api.get('/monedas')
