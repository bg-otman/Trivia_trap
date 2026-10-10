"use client";

import { Trophy } from "lucide-react";
import { useState } from "react";
import { apiMediaUrl } from "@/lib/api";

export function AchievementImage({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <Trophy className="size-5" aria-hidden="true" />;

  const imageUrl = src.startsWith("/achievements/") ? src : apiMediaUrl(src);
  if (!imageUrl) return <Trophy className="size-5" aria-hidden="true" />;

  return (
    // Known achievement assets live in Next public; other relative media uses the API host.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={`${name} icon`}
      width={28}
      height={28}
      className="size-7 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
