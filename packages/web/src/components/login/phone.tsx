import { Input } from "../ui/input";

export const FormPhone = ({
  phone,
  loading,
  setPhone,
  handleSubmit,
}: {
  phone: string;
  loading: boolean;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex  items-center space-x-4">
      <Input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Digite seu telefone"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};
