"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ProfileLoadError({ status }: { status: number }) {
  const router = useRouter();
  const forbidden = status === 403;

  return (
    <div className="rounded-[20px] border border-trap-danger/30 bg-trap-surface p-8 text-center">
      <h2 className="font-secondary text-xl uppercase text-white">{forbidden ? "Profile access denied" : "Could not load profile"}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#a6a6ae]">{forbidden ? "Your account does not have permission to view this profile." : "The profile service is unavailable right now. Please try again."}</p>
      <Button type="button" className="mt-5" onClick={() => router.refresh()}>Try again</Button>
    </div>
  );
}
