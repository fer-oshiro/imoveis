import { About } from '../components/lading-page/About'
import { BestOption } from '../components/lading-page/BestOption'
import { Header } from '../components/lading-page/Header'
import { Hero } from '../components/lading-page/Hero'
import { Options } from '../components/lading-page/Options'

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <BestOption />
      <Options />
      <About />
    </>
  )
}
