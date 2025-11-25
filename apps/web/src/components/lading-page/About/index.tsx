import { Suspense } from 'react'
import { Number } from './Number'

export const About = () => {
  return (
    <section className="my-24 bg-[#F3F4F6] py-16" id="about">
      <div className="mx-auto grid max-w-lg gap-12 px-4 md:my-8 md:max-w-7xl md:grid-cols-2 md:gap-7 md:px-16">
        <div>
          <h2 className="mx-auto mb-8 w-fit rounded-full border-2 border-red-700 px-4 py-2 text-xs font-bold text-red-700 md:ml-0">
            Sobre o empreendimento
          </h2>
          <p className="max-w-3xl text-center text-lg md:text-start">
            Mais do que imóveis, entregamos histórias, possibilidades e novos começos. Apoiados por
            anos de experiência
          </p>
        </div>
        <div className="grid grid-cols-2 justify-center gap-4 gap-y-8 text-center">
          <div>
            <Suspense fallback={<p>+250</p>}>
              <Number value={250} />
            </Suspense>
            <p className="mt-2 text-xs text-gray-700">clientes atendidos</p>
          </div>
          <div>
            <Suspense fallback={<p>+8</p>}>
              <Number value={8} />
            </Suspense>
            <p className="mt-2 text-xs text-gray-700">anos de experiência</p>
          </div>
          <div>
            <Suspense fallback={<p>+60</p>}>
              <Number value={60} />
            </Suspense>
            <p className="mt-2 text-xs text-gray-700">unidades prontas para morar</p>
          </div>
          <div>
            <Suspense fallback={<p>+45</p>}>
              <Number value={45} />
            </Suspense>
            <p className="mt-2 text-xs text-gray-700">moradores ativos hoje </p>
          </div>
        </div>
      </div>
    </section>
  )
}
