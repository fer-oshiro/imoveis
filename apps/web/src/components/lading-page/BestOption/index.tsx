import { Suspense } from 'react'

import { Background } from './Background'
import { Divider } from './Divider'
import Image from 'next/image'
import { BedSingleIcon } from '../../ui/icons/lucide-bed-single'
import { NavigationIcon } from '../../ui/icons/lucide-navigation'
import { ArrowUpRightIcon } from '../../ui/icons/lucide-arrow-up-right'

export const BestOption = () => {
  return (
    <section>
      <div className="relative mt-24 flex flex-col py-24">
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
        <div className="z-20 my-12 flex flex-col justify-center gap-4 px-6 text-white lg:flex-row lg:gap-16">
          <div className="min-w-fit">
            <h2 className="text-sm font-medium">A UM PASSO DE VOCÊ</h2>
            <h1 className="my-4 text-2xl font-bold">Pertinho do Metrô - São Paulo</h1>
          </div>
          <div>
            Conheça nossos empreendimentos prontos para morar, com design em localizações
            estratégicas, próximas ao metrô, comércios e o melhor custo-benefício de São Paulo.
          </div>
        </div>
      </div>
      <div className="mx-8 -mt-12 flex flex-col border border-gray-200 bg-white p-4 sm:mx-20 sm:p-6 lg:flex-row">
        <div className="mx-auto grid w-fit gap-2 lg:mx-4 lg:auto-cols-max lg:grid-flow-col">
          <Image
            src="/ag.png"
            alt="entrada da agostinho gomes"
            loading="lazy"
            width={318}
            height={269}
            className="col-span-2 h-full max-w-full rounded-lg object-cover lg:col-span-1 lg:row-span-2"
          />
          <Image
            src="/stairs.png"
            alt="entrada da agostinho gomes"
            loading="lazy"
            width={104}
            height={138}
            className="row-start-2 h-full rounded-lg object-cover lg:row-start-1"
          />

          <Image
            src="/more.png"
            alt="entrada da agostinho gomes"
            loading="lazy"
            width={210}
            height={138}
            className="h-full max-w-full rounded-lg object-cover lg:w-[104px]"
          />
        </div>
        <div className="flex flex-col justify-center px-2 py-6 sm:px-6">
          <span className="w-fit border-2 border-red-700 p-2 py-1 text-xs font-bold tracking-tight text-red-700 uppercase">
            Melhor Avaliado
          </span>
          <h1 className="my-4 text-xl font-bold">
            Apartamento no Ipiranga, ao lado do Metrô Sacomã
          </h1>
          <p className="my-4 text-sm">
            O equilíbrio perfeito entre conforto, mobilidade e qualidade de vida.
          </p>
          <div className="my-4 flex flex-col gap-3 text-xs md:flex-row">
            <div className="flex gap-3">
              <BedSingleIcon className="text-red-700" size={18} />
              <p>Studio e suíte + 1</p>
            </div>
            <div className="flex gap-3">
              <NavigationIcon size={18} className="text-red-700" />
              <p>Muitas atividades por perto</p>
            </div>
          </div>
          <button className="mt-4 flex items-center justify-center gap-2 rounded-full bg-red-700 py-3 text-white">
            Quero conhecer <ArrowUpRightIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
