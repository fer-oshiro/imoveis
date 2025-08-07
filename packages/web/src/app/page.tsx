import { Title } from '@/components/ui/title'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <div className="flex items-center gap-4 p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
        <Image src="/logo.svg" alt="" width={46} height={56} />
        <h1 className="text-salmon mt-4 text-center text-3xl font-medium">
          Oshiro <span className="block text-sm">IMÓVEIS</span>
        </h1>
      </div>
      <Title>Welcome to Oshiro Imóveis</Title>
    </>
  )
}
