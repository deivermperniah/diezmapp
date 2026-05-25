import { api } from '@/api/http'

export const getTransferencias = () => api.get('/transferencias')

export const createTransferencia = (payload) => api.post('/transferencias', payload)
