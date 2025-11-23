import { Button } from "../ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { ArrowUpRightIcon } from "../ui/icons/lucide-arrow-up-right";
import { BedSingleIcon } from "../ui/icons/lucide-bed-single";
import { RulerIcon } from "../ui/icons/lucide-ruler";

export const Options = () => {
  return (
      <section className="my-24 px-6">
          <span className="bg-[#F5F4EE] border border-[#EAE8DC] rounded-full text-xs px-4 py-2">AS MELHORES LOCALIZAÇÕES</span>
          <h2 className="my-8 text-2xl font-bold">Confira outros imoveis</h2>
          <Carousel>
              <CarouselContent>
                  {Array.from({ length: 5 }).map((_, index) => (
                      <CarouselItem key={index}>
                          <div className="p-4 border border-gray-300 rounded-lg">
                              <div className="w-full aspect-square bg-gray-400 rounded-lg" />
                              <div>
                                  <h2 className="mt-4 text-xs font-bold uppercase tracking-tighter">Bairro Nobre</h2>
                                  <h1 className="text-xl tracking-tighter font-bold mb-4">Kitnet - Metrô Santos Imigrantes</h1>
                                  <div className="flex flex-col gap-2 my-4">
                                      <p className="flex gap-2 items-center"><BedSingleIcon className="text-red-700" size={18} />1 quarto</p>
                                      <p className="flex gap-2 items-center"><RulerIcon className="text-red-700" size={18} /> 30 m²</p>
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
          <Button className="mt-8 rounded-full bg-red-700 flex gap-4 w-full py-6">Quero conhecer <ArrowUpRightIcon /></Button>
    </section>
  );
};