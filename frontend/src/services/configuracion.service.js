import { api } from '@/api/http'

export const getConfiguracion = () => api.get('/configuracion')

export const getTasaDolar = () => api.get('/configuracion/tasa-dolar')

export const updateConfiguracion = (payload) => api.put('/configuracion', payload)
