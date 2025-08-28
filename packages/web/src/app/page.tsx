import { Title } from '@/components/ui/title'
import Image from 'next/image'
import { LOCATIONS } from '@/constants/location'
import { Card } from '@/components/lading-page/card'

export default function Home() {
  return (
    <>
      <div className="flex items-center gap-4 p-8 sm:p-8 font-[family-name:var(--font-geist-sans)]">
        <Image src="/logo.svg" alt="" width={46} height={56} />
        <h1 className="text-salmon mt-4 text-center text-3xl font-medium">
          Oshiro <span className="block text-sm">IMÓVEIS</span>
        </h1>
      </div>
      <section className="px-4 sm:px-8 mt-8">
        <Title maxW="25ch">Encontre seu lugar ideal para ficar</Title>
        <p className="my-8 sm:my-4">Descubra acomodações únicas para alugar por semana ou mês — de apartamentos
          completos a kitnets aconchegantes.</p>
      </section>

      <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(500px,1fr))] gap-8 mx-4 sm:mx-20 justify-items-center sm:mt-16">
        {
          LOCATIONS.map((location) => (
            <Card key={location.title} location={location} />
          ))
        }
      </div>

      <section className='my-16'>
        <Title maxW="25ch">Localizações</Title>
      </section>
    </>
  )
}
