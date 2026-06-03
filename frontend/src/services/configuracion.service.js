import { api } from '@/api/http'

export const getTasaDolar = () => api.get('/configuracion/tasa-dolar')
