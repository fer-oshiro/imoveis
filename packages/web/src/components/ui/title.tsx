export const Title = ({ children, maxW }: { children: React.ReactNode; maxW?: string }) => {
  return (
    <div className="flex gap-[1px]">
      <span className="bg-green min-h-full w-[3px]"></span>
      <span className="bg-green min-h-full w-[3px]"></span>
      <span className="bg-green min-h-full w-[3px]"></span>
      <h1
        className="text-graphite mx-2 text-2xl font-semibold uppercase"
        style={{ maxWidth: maxW }}
      >
        {children}
      </h1>
    </div>
  )
}
