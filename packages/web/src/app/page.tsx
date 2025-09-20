import { Card } from '@/components/lading-page/card'
import { Title } from '@/components/ui/title'
import { LOCATIONS } from '@/constants/location'

export default function Home() {
  return (
    <>
      <div className="flex items-center gap-4 p-8 font-[family-name:var(--font-geist-sans)] sm:p-8">
        <h1 className="text-salmon mt-4 text-center text-2xl font-medium">
          OSHIRO <span className="block text-sm tracking-widest">IMÓVEIS</span>
        </h1>
      </div>
      <section className="mt-8 px-4 sm:px-8">
        <Title maxW="25ch">Encontre seu lugar ideal para ficar</Title>
        <p className="my-8 sm:my-4">
          Descubra acomodações únicas para alugar por semana ou mês — de apartamentos completos a
          kitnets aconchegantes.
        </p>
      </section>

      <div className="mx-4 grid justify-items-center gap-8 sm:mx-20 sm:mt-16 sm:grid-cols-[repeat(auto-fill,minmax(500px,1fr))]">
        {LOCATIONS.map((location) => (
          <Card key={location.title} location={location} />
        ))}
      </div>

      <section className="my-16">
        <Title maxW="25ch">Localizações</Title>
      </section>
    </>
  )
}
