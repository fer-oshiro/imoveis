/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect } from 'react'
import { DataFormatada } from './DataFormatada'
import { EnviarComprovante } from './enviarComprovante'

export const Apartamentos = () => {
  const [apartamentos, setApartamentos] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState(null)

  useEffect(() => {
    const fetchApartamentos = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || '/apartamentos'
        const idToken = localStorage.getItem('idToken')
        const response = await fetch(url + '/apartments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken || ''}`,
          },
        })
        if (!response.ok) {
          throw new Error('Erro ao buscar apartamentos')
        }
        const data = await response.json()
        setApartamentos(data || [])
      } catch (error) {
        console.error('Erro ao buscar apartamentos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchApartamentos()
  }, [])

  const handleClick = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/comprovantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('idToken') || ''}`,
      },
    })
  }

  const handleViewComprovantes = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/comprovantes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('idToken') || ''}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Comprovantes:', data)
      })
      .catch((error) => {
        console.error('Erro ao buscar comprovantes:', error)
      })
  }

  const handleClickUser = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apartamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('idToken') || ''}`,
      },
    })
  }

  const handleTeste = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('idToken') || ''}`,
        },
      })
      if (!response.ok) {
        throw new Error('Erro ao executar teste')
      }
      const data = await response.json()
      console.log('Teste executado com sucesso:', data)
    } catch (error) {
      console.error('Erro ao executar teste:', error)
    }
  }
  return (
    <div className="mt-4 w-5xl text-lg text-gray-700">
      <button className="rounded bg-blue-500 px-4 py-2 text-white" onClick={handleTeste}>
        Teste
      </button>
      <button className="rounded bg-blue-500 px-4 py-2 text-white" onClick={handleClick}>
        Comprovante
      </button>

      <button onClick={handleViewComprovantes}>Ver comprovantes</button>

      <button className="rounded bg-blue-500 px-4 py-2 text-white" onClick={handleClickUser}>
        Usuario
      </button>
      <table className="min-w-full border border-gray-200 bg-white p-4">
        <caption className="mb-4 text-lg font-semibold">
          Lista de Apartamentos {loading ? '(Carregando...)' : ''}
        </caption>
        <thead>
          <tr style={{ fontSize: '12px' }}>
            <th>Unidade</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Saída</th>
            <th>Ultimo pagamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {apartamentos.map((apartamento: any) => (
            <tr key={apartamento.pk} style={{ fontSize: '14px', textAlign: 'center' }}>
              <td>{apartamento.unitLabel}</td>
              <td>{apartamento.contactInfo?.contactName}</td>
              <td>{apartamento.contactInfo?.contactDocument}</td>
              <td>{apartamento.contactInfo?.phoneNumber}</td>
              <td>{apartamento.expectativa_saida ?? '-'}</td>
              <td>{<DataFormatada dataISO={apartamento.lastDepositedAt} />}</td>
              <td>
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => setUser(apartamento)}
                >
                  Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
