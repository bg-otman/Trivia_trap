"use client";

import { useState } from "react";

export function ProfileBanner({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    // Profile media may be hosted outside Next.js image allowlists.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 size-full object-cover opacity-20"
      onError={() => setFailed(true)}
    />
  );
}
