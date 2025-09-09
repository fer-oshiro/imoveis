import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Footer } from '@/components/common/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Imóveis | Oshiro',
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
        <link rel="icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Veja os imóveis disponíveis no Oshiro Imóveis" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col antialiased`}>
        <div className="container mx-auto flex-1 p-4">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
