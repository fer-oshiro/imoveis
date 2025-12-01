import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'
import Link from 'next/link'
import { Star } from 'lucide-react'

export const Review = () => {
  return (
    <div className="px-4 sm:px-16">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3">
              <div className="rounded-sm border bg-gray-100 p-4 text-sm text-gray-600">
                <p>
                  Um anfitrião muito bom, sempre atento a qualquer necessidade que eu tivesse. O
                  lugar é muito agradável, limpo e tem tudo o que você precisa. É a melhor opção
                  para uma estadia em São Paulo.
                </p>
                <div className="mt-16 flex items-center justify-between">
                  <Link href="airbnb.com/h/agostinhogomesap2" className="font-bold text-red-700">
                    Ver avaliação
                  </Link>
                  <div className="flex items-center gap-2">
                    <p>(5.0)</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="text-yellow-500"
                          fill="var(--color-yellow-500)"
                          height={12}
                          width={12}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p></p>
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
