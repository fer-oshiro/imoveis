export const Title = ({ children, maxW }: { children: React.ReactNode, maxW?: string }) => {
  return <div className="flex gap-[1px]">
    <span className="w-[3px] min-h-full bg-green"></span>
    <span className="w-[3px] min-h-full bg-green"></span>
    <span className="w-[3px] min-h-full bg-green"></span>
    <h1 className="text-graphite text-2xl font-semibold uppercase mx-2" style={{ maxWidth: maxW }}>{children}</h1>
  </div>
}
