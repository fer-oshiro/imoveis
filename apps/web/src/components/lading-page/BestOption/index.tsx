import { Suspense } from 'react'

import { Background } from './Background'
import { Divider } from './Divider'

export const BestOption = () => {
  return (
    <section className="relative mt-24 flex py-24">
      <Suspense fallback={<div className="h-24" />}>
        <Divider />
      </Suspense>
      <Suspense
        fallback={
          <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden bg-red-700" />
        }
      >
        <Background />
      </Suspense>
      <div className="z-20 mt-12 px-6 text-white">
        <h2 className="text-sm font-medium">A UM PASSO DE VOCÊ</h2>
        <h1 className="my-4 text-2xl font-bold">Pertinho do Metrô - São Paulo</h1>
        <div>
          Conheça nossos empreendimentos prontos para morar, com design em localizações
          estratégicas, próximas ao metrô, comércios e o melhor custo-benefício de São Paulo.
        </div>
      </div>
    </section>
  )
}
