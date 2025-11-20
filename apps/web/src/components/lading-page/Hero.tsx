import Image from 'next/image'
import { Building2Icon } from '../ui/icons/lucide-building-2'
import { ChevronRightIcon } from '../ui/icons/lucide-chevron-right'
import { Button } from '../ui/button'
export const Hero = () => {
  return (
    <div className="relative flex min-h-[calc(100vh-250px)] w-full items-center overflow-hidden rounded-2xl sm:my-16 sm:h-[500px]">
      <Image
        src="/hero.jpg"
        alt=""
        width={1200}
        height={600}
        className="absolute left-1/2 -z-10 mx-auto max-h-[calc(100vh-250px)] w-full -translate-x-1/2 object-cover sm:w-[90vw] sm:rounded-2xl"
      />
      <div className="absolute left-1/2 -z-10 mx-auto min-h-[calc(100vh-250px)] min-w-full -translate-x-1/2 bg-linear-to-r from-black/60 via-black/40 to-transparent object-cover sm:min-w-[90vw] sm:rounded-2xl" />

      <div className="sm:p-32 p-8">
        <h1 className="max-w-[16ch] text-2xl sm:text-4xl font-bold text-white">
          Encontre o melhor imóvel para você
        </h1>
        <p className="my-6 max-w-fit rounded-xl bg-white p-4 font-bold text-red-700">
          Explorar Imóveis
        </p>
        <div className="flex gap-8 rounded-xl bg-white p-6 sm:px-12 flex-col sm:flex-row min-w-full">
          <div className="flex flex-col">
            <label>Tipo de imóvel:</label>
            <select>
              <option>Apartamento</option>
              <option>Casa</option>
              <option>Comercial</option>
            </select>
          </div>

          <div className="min-h-full w-px bg-gray-300" />

          <div className="flex flex-col">
            <label htmlFor="" className='flex gap-4 align-center align-baseline'><Building2Icon size={12} />Localização</label>
            <select name="Localização" id="">
              <option>São Paulo</option>
              <option>Toledo</option>
            </select>
          </div>

          <div className="min-h-full w-px bg-gray-300" />

          <button className="rounded-full bg-red-700 p-4 px-8 font-bold text-white flex gap-2 items-center hover:bg-red-800 transition hover:cursor-pointer">
            Buscar Imóveis
            <ChevronRightIcon size={16} className="inline-block ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}
