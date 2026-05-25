import { api } from '@/api/http'

export const getOfrendas = () => api.get('/ofrendas')

export const createOfrenda = (payload) => api.post('/ofrendas', payload)
