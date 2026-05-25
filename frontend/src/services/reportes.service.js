import { api } from '@/api/http'

export const getReporteSemanal = ({ fechaInicio, fechaFin }) =>
  api.get(
    `/reportes/semanal?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`,
  )

export const getReporteMensual = ({ mes, anio }) =>
  api.get(`/reportes/mensual?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}`)
