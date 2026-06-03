export const buildSobrePayload = (form, idIglesia) => ({
  fecha: form.fecha,
  idIglesia: Number(idIglesia),
  idMiembro: Number(form.idMiembro),
  idMoneda: form.idMoneda,
  montoDiezmo: form.montoDiezmo || 0,
  montoPactoAmor: form.montoPactoAmor || 0,
  ofrendas: form.ofrendas,
  transferencias: form.transferencias,
})
