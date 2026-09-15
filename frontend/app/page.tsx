import Link from "next/link";


export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="relative z-10">
        <main>
          <Link href={'/profile'} className="rounded-md m-4 text-red-600 p-5 bg-white border-red-50">profile</Link>
        </main>
      </div>
    </div>
  );
}
