import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Footer } from '@imovel/web/components/common/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
    <html lang="pt-BR">
      <head>
        <link rel="icon" sizes="32x32" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Veja os imóveis disponíveis no Oshiro Imóveis" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col antialiased`}>
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
