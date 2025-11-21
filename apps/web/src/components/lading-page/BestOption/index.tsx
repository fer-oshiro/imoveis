import { Suspense } from 'react'
import { Divider } from './Divider'

export const BestOption = () => {
  return (
    <section className="relative mt-24 h-screen bg-red-300">
      <Suspense fallback={<div className="h-24" />}>
        <Divider />
      </Suspense>
      <div>
        <h1>Best Option Component</h1>
      </div>
      <div>
        <span>Melhor Avaliado</span>
      </div>
    </section>
  )
}
