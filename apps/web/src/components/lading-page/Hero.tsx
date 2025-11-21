import Image from 'next/image'
import { Building2Icon } from '../ui/icons/lucide-building-2'
import { ChevronRightIcon } from '../ui/icons/lucide-chevron-right'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export const Hero = () => {
  return (
    <div className="relative flex min-h-[calc(100vh-250px)] w-full items-center overflow-hidden py-16 sm:my-16 sm:h-[500px]">
      <Image
        src="/hero.webp"
        alt=""
        loading="eager"
        priority
        width={1200}
        height={600}
        sizes="(max-width: 768px) 100vw, 33vw"
        className="absolute left-1/2 -z-10 mx-auto min-h-full w-full -translate-x-1/2 object-cover brightness-50 lg:w-[90vw]"
      />
      <div className="absolute left-1/2 -z-10 mx-auto h-full min-w-full -translate-x-1/2 bg-linear-to-r from-black/60 via-black/40 to-transparent object-cover lg:min-w-[90vw]" />

      <div className="mx-auto flex min-w-[90vw] flex-col items-start gap-12 p-4 sm:max-w-4xl md:p-16">
        <h1 className="mx-auto max-w-[16ch] text-4xl font-bold text-white md:text-6xl lg:mx-0">
          Encontre o melhor imóvel para você
        </h1>
        <div className="mx-auto flex min-w-fit flex-col gap-8 rounded-xl bg-white p-6 sm:px-12 lg:ml-0 lg:flex-row">
          <div className="flex flex-col">
            <p className="mb-2 md:mb-4">Tipo de imóvel:</p>
            <div className="flex flex-wrap gap-2 *:cursor-pointer">
              <Label className="hover:bg-accent/50 rounded-full border p-3 px-4 has-aria-checked:border-red-600 has-aria-checked:bg-red-50 has-aria-checked:text-red-700 sm:px-6 dark:has-aria-checked:border-red-900 dark:has-aria-checked:bg-red-950">
                <Checkbox id="toggle-2" defaultChecked className="hidden" />
                <p className="text-sm leading-none font-medium">Kitnet</p>
              </Label>
              <Label className="hover:bg-accent/50 rounded-full border p-3 px-4 has-aria-checked:border-red-600 has-aria-checked:bg-red-50 has-aria-checked:text-red-700 sm:px-6 dark:has-aria-checked:border-red-900 dark:has-aria-checked:bg-red-950">
                <Checkbox id="toggle-2" className="hidden" />
                <p className="text-sm leading-none font-medium">Casas</p>
              </Label>
              <Label className="hover:bg-accent/50 rounded-full border p-3 px-4 has-aria-checked:border-red-600 has-aria-checked:bg-red-50 has-aria-checked:text-red-700 sm:px-6 dark:has-aria-checked:border-red-900 dark:has-aria-checked:bg-red-950">
                <Checkbox id="toggle-2" className="hidden" />
                <p className="text-sm leading-none font-medium">Galpão</p>
              </Label>
            </div>
          </div>

          <div className="hidden min-h-full w-px bg-gray-300 lg:block" />

          <div className="flex flex-col gap-4">
            <label htmlFor="" className="align-center flex items-center justify-start gap-2">
              <Building2Icon size={16} />
              <p>Localização</p>
            </label>
            <Select defaultValue="sp">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Escolha uma região" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="sp">São Paulo</SelectItem>
                  <SelectItem value="pt">Pedro de Toledo</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="hidden min-h-full w-px bg-gray-300 lg:block" />

          <button className="my-auto mr-auto flex items-center gap-2 rounded-full bg-red-700 p-4 px-8 font-bold text-white transition hover:cursor-pointer hover:bg-red-800">
            Buscar Imóveis
            <ChevronRightIcon size={16} className="ml-2 inline-block" />
          </button>
        </div>
      </div>
    </div>
  )
}
