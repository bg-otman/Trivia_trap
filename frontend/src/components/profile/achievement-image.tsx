"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { useState } from "react";

export function AchievementImage({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <Trophy className="size-5" aria-hidden="true" />;

  return (
    <Image
      src={src}
      alt={`${name} icon`}
      width={28}
      height={28}
      className="size-7 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
