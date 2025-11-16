type Props = {
  date?: string | Date | null
}

export const DataFormatada = ({ date }: Props) => {
  if (!date) return null

  const dateFormatted = date instanceof Date ? date : new Date(date)
  const agora = new Date()

  const diffMs = agora.getTime() - dateFormatted.getTime()
  const dias = diffMs / (1000 * 60 * 60 * 24)

  const dia = String(dateFormatted.getDate()).padStart(2, '0')
  const mes = String(dateFormatted.getMonth() + 1).padStart(2, '0')
  const ano = String(dateFormatted.getFullYear()).slice(-2)

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
