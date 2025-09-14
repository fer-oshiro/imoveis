'use client'

export const Input = ({ ...rest }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return <input className="rounded-md border border-gray-300 p-2" {...rest} />
}
