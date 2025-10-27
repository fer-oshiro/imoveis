type Props = {
  dataISO?: string
}

export const DataFormatada = ({ dataISO }: Props) => {
  if (!dataISO) return null

  const data = new Date(dataISO)
  const agora = new Date()

  const diffMs = agora.getTime() - data.getTime()
  const dias = diffMs / (1000 * 60 * 60 * 24)

  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = String(data.getFullYear()).slice(-2)

  const texto = `${dia}-${mes}-${ano}`

  return (
    <span
      className={
        dias > 60
          ? 'text-red-500'
          : dias > 30
            ? 'text-yellow-500'
            : dias > 25
              ? 'text-gray-400'
              : ''
      }
    >
      {texto}
    </span>
  )
}
