import Image from 'next/image'
import Link from 'next/link'

export const Header = () => {
  return (
    <nav className="p-8 shadow-none sm:shadow-xl">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="block max-w-fit">
          <Image
            src="/logo.webp"
            alt="Logo"
            width={83}
            height={49}
            sizes="(max-width: 768px) 20vw, 100vw"
            className="h-auto w-[60px] max-w-full object-contain md:w-[83px]"
            loading="eager"
          />
        </Link>

        <ul className="hidden gap-5 sm:flex">
          <li className="cursor-pointer">
            <Link href="/">Início</Link>
          </li>
          <li className="cursor-pointer">
            <Link href="#">Imóveis</Link>
          </li>
          <li className="cursor-pointer">
            <Link href="#">Dúvidas</Link>
          </li>
          <li className="cursor-pointer">
            <Link href="#about">Sobre</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
