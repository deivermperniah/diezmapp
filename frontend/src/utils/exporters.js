const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const sanitizePdfText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')

const escapePdfText = (value) =>
  sanitizePdfText(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')

const buildPdf = ({ title, period, headers, rows }) => {
  const color = ([r, g, b]) => `${r} ${g} ${b}`
  const text = (value, x, y, size = 10, bold = false, fill = [0.08, 0.12, 0.2]) =>
    `BT ${color(fill)} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`
  const line = (x1, y1, x2, y2, stroke = [0.83, 0.87, 0.92]) =>
    `q ${color(stroke)} RG ${x1} ${y1} m ${x2} ${y2} l S Q`
  const rect = (x, y, width, height, fill) => `q ${color(fill)} rg ${x} ${y} ${width} ${height} re f Q`
  const colX = [48, 104, 190, 456]
  const colWidths = [44, 76, 230, 80]
  const rowStartY = 652
  const rowHeight = 28
  const content = [
    rect(0, 0, 595, 842, [0.97, 0.98, 1]),
    rect(36, 742, 523, 70, [1, 1, 1]),
    line(36, 742, 559, 742),
    text(title, 52, 788, 20, true, [0.04, 0.1, 0.22]),
    text(period, 52, 766, 11, false, [0.39, 0.46, 0.56]),
    rect(36, 692, 523, 36, [0.09, 0.23, 0.47]),
    ...headers.map((header, index) => text(header, colX[index], 706, 10, true, [1, 1, 1])),
  ]

  rows.slice(0, 21).forEach((row, rowIndex) => {
    const rowY = rowStartY - rowIndex * rowHeight
    const textY = rowY + 10
    content.push(rect(36, rowY, 523, rowHeight, rowIndex % 2 === 0 ? [1, 1, 1] : [0.94, 0.96, 0.98]))

    headers.forEach((header, index) => {
      const value = String(row[header] ?? '')
      const maxLength = Math.floor(colWidths[index] / 5)
      const visibleValue = value.length > maxLength ? `${value.slice(0, Math.max(maxLength - 3, 1))}...` : value
      const isTotal = header.toLowerCase() === 'total'
      content.push(text(visibleValue, colX[index], textY, 10, isTotal, isTotal ? [0.04, 0.48, 0.29] : [0.08, 0.12, 0.2]))
    })
    content.push(line(36, rowY, 559, rowY))
  })

  content.push(text(`Registros: ${rows.length}`, 48, 48, 10, true, [0.39, 0.46, 0.56]))

  const stream = content.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return pdf
}

export const exportCsvFile = ({ headers, rows, filename }) => {
  const csvRows = rows.map((row) =>
    headers
      .map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`)
      .join(','),
  )

  downloadFile(
    `\uFEFF${headers.join(',')}\n${csvRows.join('\n')}`,
    filename,
    'text/csv;charset=utf-8;',
  )
}

export const exportExcelFile = ({ columns, rows, title, period, filename }) => {
  const headerCells = columns.map((column) => `<th>${column.label}</th>`).join('')
  const bodyRows = rows
    .map((row) => `<tr>${columns.map((column) => `<td>${row[column.label]}</td>`).join('')}</tr>`)
    .join('')

  downloadFile(
    `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body, table, th, td, p { font-family: Arial, sans-serif; font-size: 12px; }
            h2 { font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p>${period}</p>
          <table border="1">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>
    `,
    filename,
    'application/vnd.ms-excel;charset=utf-8;',
  )
}

export const exportPdfFile = ({ title, period, headers, rows, filename }) => {
  downloadFile(
    buildPdf({ title, period, headers, rows }),
    filename,
    'application/pdf',
  )
}
