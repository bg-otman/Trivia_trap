'use client';

import { redirect } from "next/navigation";

export default function Error({ error }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
            <p className="text-lg mb-8">{error.message}</p>
            <button onClick={() => redirect("/profile")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Back to Profile
            </button>
        </div>
    );
}
