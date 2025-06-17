import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
        Login
      </Link>
    </div>
  );
}
