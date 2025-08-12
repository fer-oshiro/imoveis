import { Title } from '@/components/ui/title'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <div className="flex items-center gap-4 p-8  font-[family-name:var(--font-geist-sans)]">
        <Image src="/logo.svg" alt="" width={46} height={56} />
        <h1 className="text-salmon mt-4 text-center text-3xl font-medium">
          Oshiro <span className="block text-sm">IMÓVEIS</span>
        </h1>
      </div>
      <section className='px-12 sm:px-8 mt-8'>
        <Title maxW='25ch'>Encontre seu lugar ideal para ficar</Title>
        <p className='my-8 sm:my-4'>Descubra acomodações únicas para alugar por semana ou mês — de apartamentos completos a kitnets aconchegantes.</p>
      </section>
    </>
  )
}
