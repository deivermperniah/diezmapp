import { api } from '@/api/http'
import { withIglesiaActiva } from './iglesia-activa.service'

export const getReporteSemanal = ({ fechaInicio, fechaFin }) =>
  api.get(
    withIglesiaActiva(
      `/reportes/semanal?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`,
    ),
  )

export const getReporteMensual = ({ mes, anio }) =>
  api.get(withIglesiaActiva(`/reportes/mensual?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}`))
