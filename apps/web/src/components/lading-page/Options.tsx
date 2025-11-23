import { Button } from '../ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'
import { ArrowUpRightIcon } from '../ui/icons/lucide-arrow-up-right'
import { BedSingleIcon } from '../ui/icons/lucide-bed-single'
import { RulerIcon } from '../ui/icons/lucide-ruler'

export const Options = () => {
  return (
    <section className="my-24 px-6">
      <div className="mx-auto flex max-w-7xl justify-between px-4 md:my-8 md:px-16">
        <div>
          <span className="rounded-full border border-[#EAE8DC] bg-[#F5F4EE] px-4 py-2 text-xs">
            AS MELHORES LOCALIZAÇÕES
          </span>
          <h2 className="my-8 text-2xl font-bold">Confira outros imoveis</h2>
        </div>
        <div className="hidden flex-col items-end gap-4 text-end lg:flex">
          <p className="max-w-lg">
            Encontre mais imóveis com localização privilegiada, perto do metrô e com o melhor
            custo-benefício da região.
          </p>
          <Button className="flex max-w-fit items-center gap-4 rounded-full border-2 border-red-700 bg-transparent px-8 py-4 text-red-700 hover:cursor-pointer hover:bg-red-50">
            Ver todos
            <ArrowUpRightIcon />
          </Button>
        </div>
      </div>
      <Carousel className="mx-8 sm:mx-20">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3">
              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <div className="aspect-square w-full rounded-lg bg-gray-400" />
                <div>
                  <h2 className="mt-4 text-xs font-bold tracking-tighter uppercase">
                    Bairro Nobre
                  </h2>
                  <h1 className="mb-4 text-xl font-bold tracking-tighter">
                    Kitnet - Metrô Santos Imigrantes
                  </h1>
                  <div className="my-4 flex flex-col gap-2">
                    <p className="flex items-center gap-2">
                      <BedSingleIcon className="text-red-700" size={18} />1 quarto
                    </p>
                    <p className="flex items-center gap-2">
                      <RulerIcon className="text-red-700" size={18} /> 30 m²
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-8 flex gap-4">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
      <Button className="mt-8 flex w-full gap-4 rounded-full bg-red-700 py-6 md:mr-20 md:ml-auto md:w-fit lg:hidden">
        Quero conhecer <ArrowUpRightIcon />
      </Button>
    </section>
  )
}
