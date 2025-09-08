'use client'

import { Apartamentos } from '@/components/dashboard/apartamentos'
import { Users } from '@/components/dashboard/users'
import React from 'react'

export default function DashboardPage() {
  const [step, setStep] = React.useState(1)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4 flex">
        <button
          onClick={() => setStep(1)}
          className={`mr-4 cursor-pointer p-2 ${
            step === 1 ? 'bg-blue-300 font-bold' : 'bg-blue-100'
          }`}
        >
          Apartamento
        </button>
        <button
          onClick={() => setStep(2)}
          className={`mr-4 cursor-pointer p-2 ${
            step === 2 ? 'bg-blue-300 font-bold' : 'bg-blue-100'
          }`}
        >
          Usuário
        </button>
      </div>
      {step === 1 && <Apartamentos />}
      {step === 2 && <Users />}
    </div>
  )
}
