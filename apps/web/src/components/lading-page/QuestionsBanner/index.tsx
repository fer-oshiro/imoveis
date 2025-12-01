import Image from 'next/image'
import { Suspense } from 'react'
import { Button } from '../../ui/button'
import { Background } from './Background'
import { Check } from './Check'

export const QuestionsBanner = () => {
  return (
    <section className="my-24 sm:px-16">
      <div className="relative min-w-full bg-red-700 text-white">
        <Suspense>
          <Background />
        </Suspense>
        <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
          <div className="z-10 my-auto flex-1 p-16">
            <h2 className="mb-6 text-sm font-extrabold">FICOU COM ALGUMA DÚVIDA?</h2>
            <h1 className="text-2xl font-bold">Resolva tudo pelo WhatsApp</h1>
            <ul className="my-8 grid gap-8 gap-y-4 sm:grid-cols-[auto_1fr]">
              <li className="flex items-center gap-2">
                <Check /> Adquirir Imóvel
              </li>
              <li className="flex gap-2">
                <Check /> Tire dúvidas sobre seu contrato
              </li>
              <li className="flex gap-2">
                <Check /> Comprar ou Alugar
              </li>
              <li className="flex gap-2">
                <Check /> E muito mais
              </li>
            </ul>
            <Button className="mx-auto rounded-full bg-white py-6 text-red-700 hover:cursor-pointer hover:bg-red-50">
              Enviar mensagem
            </Button>
          </div>
          <div className="z-10 mx-auto hidden max-w-fit pt-8 pr-8 sm:pt-16 sm:pr-16 lg:flex">
            <Image src="/whatsapp.webp" alt="WhatsApp" width={300} height={300} />
          </div>
        </div>
      </div>
    </section>
  )
}
