import { C } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'

export const Review = () => {
  return (
    <div>
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3">
              <div className="rounded-lg bg-gray-100 p-4">
                Um anfitrião muito bom, sempre atento a qualquer necessidade que eu tivesse. O lugar
                é muito agradável, limpo e tem tudo o que você precisa. É a melhor opção para uma
                estadia em São Paulo.
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-8 flex gap-4">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  )
}
