export const FormCode = ({
  code,
  loading,
  setCode,
  handleCodeSubmit,
}: {
  code: string;
  loading: boolean;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  handleCodeSubmit: (e: React.FormEvent) => void;
}) => {
  return (
    <form onSubmit={handleCodeSubmit} className="flex space-x-4 items-center">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Digite o código"
        className="border border-gray-300 rounded-md p-2"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Confirmando..." : "Confirmar Código"}
      </button>
    </form>
  );
};
