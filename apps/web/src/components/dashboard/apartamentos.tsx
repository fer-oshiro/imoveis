import React, { useEffect } from 'react'

import { Apartment, ApartmentWithPaymentResponseDto } from '@imovel/core/domain/apartment'
import { Contract } from '@imovel/core/domain/contract'
import { User } from '@imovel/core/domain/user'

import { ApartmentTable } from './table'

export const Apartamentos = () => {
  const [apartamentos, setApartamentos] = React.useState<
    { apartment: Apartment; contract: Contract | null; user: User | null }[]
  >([])
  const [status, setStatus] = React.useState('idle')

  useEffect(() => {
    const fetchApartamentos = async () => {
      try {
        setStatus('loading')
        const url = process.env.NEXT_PUBLIC_API_URL
        const idToken = localStorage.getItem('idToken')
        const response = await fetch(url + '/apartments/with-payment-info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken || ''}`,
          },
        })
        if (!response.ok) {
          throw new Error('Erro ao buscar apartamentos')
        }
        const { data } = await response.json()
        const apartmentsWithLastPayment = data.map((item: unknown) => {
          const data = ApartmentWithPaymentResponseDto.parse(item)
          return {
            apartment: Apartment.create(data.apartment),
            contract: data.contract ? Contract.create(data.contract) : null,
            user: data.user ? User.create(data.user) : null,
          }
        })

        setApartamentos(apartmentsWithLastPayment || [])
      } catch (error) {
        console.error('Erro ao buscar apartamentos:', error)
        setStatus('error')
      } finally {
        setStatus('idle')
      }
    }
    fetchApartamentos()
  }, [])

  return (
    <div className="mt-4 max-w-5xl text-lg text-gray-700">
      <ApartmentTable data={apartamentos} status={status} />
    </div>
  )
}
