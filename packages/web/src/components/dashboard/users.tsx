export const Users = () => {
  return (
    <div className="mt-4 text-lg text-gray-700 w-4xl">
      <table className="min-w-full bg-white border border-gray-200">
        <caption className="text-lg font-semibold mb-4">
          Lista de Usuários
        </caption>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Relacao</th>
            <th>Número</th>
            <th>Endereco</th>
            <th>Unidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Usuário 1</td>
            <td>Amigo</td>
            <td>123456789</td>
            <td>Rua A, 123</td>
            <td>Unidade 1</td>
            <td>
              <button className="text-blue-500">Editar</button>
              <button className="text-red-500">Excluir</button>
            </td>
          </tr>
          <tr>
            <td>Usuário 2</td>
            <td>Familiar</td>
            <td>987654321</td>
            <td>Rua B, 456</td>
            <td>Unidade 2</td>
            <td>
              <button className="text-blue-500">Editar</button>
              <button className="text-red-500">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
