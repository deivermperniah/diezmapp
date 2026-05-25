import { api } from '@/api/http'

export const getIglesias = () => api.get('/iglesias')

export const getMonedas = () => api.get('/monedas')
