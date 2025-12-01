import { Suspense } from "react"
import { Background } from "./Background"
import { Button } from "../../ui/button"
import Image from "next/image"
import { CheckIcon } from "../../ui/icons/lucide-check"
import { Check } from "./Check"

export const QuestionsBanner = () => { 
    return (
        <section className="my-24 sm:px-16">
            <div className="relative bg-red-700 text-white flex-col flex sm:flex-row min-w-full">
                <Suspense>
                    <Background/>
                </Suspense>
                <div className="flex-1 p-16 my-auto z-10">
                    <h2 className=" font-extrabold text-sm mb-6">FICOU COM ALGUMA DÚVIDA?</h2>
                    <h1 className="font-bold text-2xl">Resolva tudo pelo WhatsApp</h1>
                    <ul className="grid grid-cols-[auto_1fr] gap-8 gap-y-4 my-8">
                        <li className="flex gap-2"><Check/> Adquirir Imóvel</li>
                        <li className="flex gap-2"><Check/> Tire dúvidas sobre seu contrato</li>
                        <li className="flex gap-2"><Check/> Comprar ou Alugar</li>
                        <li className="flex gap-2"><Check/> E muito mais</li>
                    </ul>
                    <Button className="hover:cursor-pointer bg-white text-red-700 rounded-full py-6 hover:bg-red-50">Enviar mensagem</Button>
                </div>
                <div className="max-w-fit pt-8 pr-8 sm:pt-16 sm:pr-16 z-10">
                    <Image src="/whatsapp.webp" alt="WhatsApp" width={300} height={300} />
                </div>
            </div>
        </section>  
    )
}