"use client";

export const Input = ({
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return <input className="border border-gray-300 rounded-md p-2" {...rest} />;
};
