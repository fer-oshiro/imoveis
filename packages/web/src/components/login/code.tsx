export const FormCode = ({
  code,
  loading,
  setCode,
  handleCodeSubmit,
}: {
  code: string
  loading: boolean
  setCode: React.Dispatch<React.SetStateAction<string>>
  handleCodeSubmit: (e: React.FormEvent) => void
}) => {
  return (
    <form onSubmit={handleCodeSubmit} className="flex items-center space-x-4">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Digite o código"
        className="rounded-md border border-gray-300 p-2"
      />
      <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white" disabled={loading}>
        {loading ? 'Confirmando...' : 'Confirmar Código'}
      </button>
    </form>
  )
}
