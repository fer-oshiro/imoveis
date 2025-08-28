export function Card(props: {
  location: { address: string; title: string; description: string; min: string }
}) {
  return <div className="flex flex-col sm:flex-row bg-white rounded-md shadow-md sm:rounded-lg w-full">
    <div className="flex-1 bg-gray-500 min-h-64 sm:min-h-max rounded-t-md sm:rounded-l-lg"></div>
    <div className="flex-1 p-8 flex flex-col gap-4">
      <p className="text-green font-bold">{props.location.title}</p>
      <p className="text-sm">{props.location.address}</p>
      <p>{props.location.description}</p>
      <p>A partir de {props.location.min}</p>
    </div>
  </div>
}