'use client'
import { FormCode } from '@/components/login/code'
import { FormPhone } from '@/components/login/phone'
import { confirmCode, sendSMS } from '@/utils/cognito'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Home() {
  const [phone, setPhone] = React.useState('')
  const [session, setSession] = React.useState<string | null>(null)
  const [code, setCode] = React.useState('')
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!phone) throw new Error('Telefone não pode ser vazio')
      if (phone.length < 10) throw new Error('Telefone inválido')
      setLoading(true)
      const session = await sendSMS('+55' + phone)
      if (!session) throw new Error('Sessão não recebida')
      setSession(session)
      setStep(2)
      console.log('Sessão recebida:', session)
      setLoading(false)
    } catch (err) {
      console.error('Erro ao enviar SMS:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (!code || !session) throw new Error('Código ou sessão não podem ser vazios')
      if (code.length < 6) throw new Error('Código inválido')
      const token = await confirmCode('+55' + phone, code, session)
      console.log('Token recebido:', !token, typeof token, token)
      if (!token) throw new Error('Token não recebido')
      console.log('Login bem-sucedido, token:', token)
      localStorage.setItem('idToken', token)
      router.push('/dashboard')
    } catch (err) {
      setStep(1)
      console.error('Erro ao confirmar o código:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-gray-100 font-[family-name:var(--font-geist-sans)]">
      {step === 1 && (
        <FormPhone
          phone={phone}
          loading={loading}
          setPhone={setPhone}
          handleSubmit={handleSubmit}
        />
      )}
      {step === 2 && (
        <FormCode
          code={code}
          loading={loading}
          setCode={setCode}
          handleCodeSubmit={handleCodeSubmit}
        />
      )}
    </div>
  )
}
