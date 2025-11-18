import Image from 'next/image'
import Link from 'next/link'

export const Header = () => {
  return (
    <nav className="p-8 shadow-none sm:shadow-xl">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="block max-w-fit">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={50}
            className="h-8 w-full sm:h-[50px]"
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
            <Link href="#">Sobre</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
