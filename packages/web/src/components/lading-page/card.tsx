export function Card(props: {
  location: { address: string; title: string; description: string; min: string }
}) {
  return (
    <div className="flex w-full flex-col rounded-md bg-white shadow-md sm:flex-row sm:rounded-lg">
      <div className="min-h-64 flex-1 rounded-t-md bg-gray-500 sm:min-h-max sm:rounded-l-lg"></div>
      <div className="flex flex-1 flex-col gap-4 p-8">
        <p className="text-green font-bold">{props.location.title}</p>
        <p className="text-sm">{props.location.address}</p>
        <p>{props.location.description}</p>
        <p>A partir de {props.location.min}</p>
      </div>
    </div>
  )
}
