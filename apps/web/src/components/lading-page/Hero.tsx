import Image from 'next/image'

export const Hero = () => {
  return (
    <div className="relative flex min-h-[calc(100vh-250px)] w-full items-center overflow-hidden rounded-2xl sm:my-16 sm:h-[500px]">
      <Image
        src="/hero.jpg"
        alt="Imagem de destaque"
        width={1200}
        height={600}
        className="absolute left-1/2 -z-10 mx-auto max-h-[calc(100vh-250px)] w-full -translate-x-1/2 object-cover sm:w-[90vw] sm:rounded-2xl"
      />
      <div className="absolute left-1/2 -z-10 mx-auto min-h-[calc(100vh-250px)] min-w-full -translate-x-1/2 bg-linear-to-r from-black/60 via-black/40 to-transparent object-cover sm:min-w-[90vw] sm:rounded-2xl" />

      <div className="p-16">
        <h1 className="max-w-sm text-4xl font-bold text-white">
          Encontre o melhor imóvel para você
        </h1>
      </div>
    </div>
  )
}
