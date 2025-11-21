import { Footer } from '@imovel/web/components/common/Footer'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Hiro Imóveis',
  description: 'Veja os imóveis disponíveis',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <head>
        <link rel="icon" sizes="32x32" href="/icon.webp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Veja os imóveis disponíveis no Oshiro Imóveis" />
      </head>
      <body className={`flex flex-col antialiased`}>
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
