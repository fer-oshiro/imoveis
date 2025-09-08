import React from 'react'

export const EnviarComprovante = ({ user }) => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [fileType, setFileType] = React.useState<string>('image/jpeg')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setFile(file)
    setFileType(file?.type || 'image/jpeg')
    console.log('File selected:', file)
    console.log('File type:', file?.type)
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const form = new FormData(e.target)
    console.log(form, e.target)
    const date = form.get('date') as string
    const time = '12:00'
    const number = form.get('number') as string

    console.log('Form data:', { date, time, number })

    try {
      if (file) {
        const url = process.env.NEXT_PUBLIC_API_URL + '/img'
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('idToken') || ''}`,
          },
          body: JSON.stringify({
            key: 'comprovantes/' + file.name,
            expiresIn: 3600,
            ContentType: fileType,
          }),
        })

        if (!response.ok) {
          throw new Error('Erro ao gerar URL para upload')
        }

        const data = await response.json()
        console.log('Signed URL:', data.signedUrl)

        // Upload the file to the signed URL
        const uploadResponse = await fetch(data.signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': fileType,
          },
          body: file,
        })
        if (!uploadResponse.ok) {
          throw new Error('Erro ao fazer upload do arquivo')
        }
        console.log('Arquivo enviado com sucesso!', uploadResponse)
      }

      const userId = `USER#${user.telefone.match(/\d+/g)?.join('') || ''}`

      const dataDeposito = `${date}T${time}:00.000Z`
      const sk = `COMPROVANTE#${dataDeposito}`
      const depositante = user.name

      const addComprovanteResponse = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/comprovantes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('idToken') || ''}`,
          },
          body: JSON.stringify({
            PK: userId,
            SK: sk,
            tipo: 'comprovante',
            nomeArquivo: file?.name ?? '',
            depositante,
            valor: number,
            dataDeposito,
            unidade: user.unidade,
          }),
        },
      )
      if (!addComprovanteResponse.ok) {
        throw new Error('Erro ao adicionar comprovante')
      }
      console.log('Comprovante adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar URL para upload:', error)
      setError('Erro ao gerar URL para upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-bold">Enviar Comprovante</h1>

      <pre className="mb-6 text-gray-600">{JSON.stringify(user, null, 2)}</pre>
      <form className="flex flex-col space-y-4" onSubmit={(e) => handleUpload(e)}>
        <input type="date" id="date" name="date" />
        <input type="time" id="time" name="time" />
        <input type="number" id="number" name="number" step="0.01" />
        <input type="file" onChange={handleFileChange} />

        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={loading}
        >
          Upload
        </button>
      </form>
      {error?.toString()}
      {file?.text()}
    </div>
  )
}
