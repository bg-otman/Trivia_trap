'user client';
import Image from "next/image";
import { CameraIcon, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

type BannerProps = {
    username: string;
    banner_url: string;
    avatar_url: string;
    join_date: Date;
    isOwner: boolean;
};



export function AvatarWithBadge({ avatar_url, isOwner }: { avatar_url: string; isOwner: boolean }) {
  return (
    <Avatar className="relative h-[100px] w-[100px] border-2 border-trap-primary bg-trap-panel shadow-[0_0_0_5px_rgba(17,17,20,.8),0_0_28px_rgba(255,107,53,.28)] md:h-[130px] md:w-[130px]">
        {isOwner && (
            <Button className="absolute cursor-pointer z-10 top-0 w-full h-full rounded-full opacity-0 hover:opacity-50  transition-opacity duration-300 bg-black">
                <CameraIcon className="h-10 w-10 font-bold text-trap-primary-soft" />
            </Button>
        )}
      <AvatarImage src={avatar_url} alt="@shadcn" />
      <AvatarFallback>AV</AvatarFallback>
      <AvatarBadge className="absolute bottom-2 right-5 bg-trap-success ring-2 ring-trap-panel" />
    </Avatar>
  )
}

function BannerSection({ banner_url, isOwner } : { banner_url: string; isOwner: boolean })
{
    return (
        <div className="relative h-full border-2 border-trap-secondary/60">
            <Image
                src={banner_url}
                alt="banner img"
                fill
                priority
                sizes="(min-width:1024px) 1024px, (min-width:640px) 768px, 100vw"
                style={{ objectFit: 'cover' }} 
            />
            {isOwner && (
                <Button
                    className="absolute right-2 top-2 h-8 w-8 cursor-pointer rounded-lg bg-trap-bg/80 p-0 text-xs font-medium text-white transition-colors hover:bg-trap-bg sm:right-4 sm:top-4 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
                    variant="ghost"
                    aria-label="Edit image"
                >
                    <CameraIcon className="h-4 w-4 text-trap-primary-soft" />
                    <span className="hidden text-trap-primary-soft sm:inline">Edit image</span>
                </Button>
            )}
        </div>
    );
}


// this function is used to display the avatar image, username, and join date of the user. It is positioned at the bottom center of the banner image.
function AvatarSection({ username, avatar_url, join_date, isOwner }: { username: string; avatar_url: string; join_date: Date; isOwner: boolean })
{
    return (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[200px] sm:w-[220px] md:w-[240px] flex flex-col items-center gap-2">
            <AvatarWithBadge avatar_url={avatar_url} isOwner={isOwner} />
            <div className="flex flex-col items-center gap-1 w-full px-2">
            <span className="font-blackops text-sm tracking-wide text-white sm:text-lg">{username}</span>
            <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-trap-bg/75 px-3 py-1 text-xs font-semibold text-trap-text-soft sm:text-sm">
                <Calendar className="h-3 w-3 text-trap-primary sm:h-4 sm:w-4" />
                <span className="sm:inline">Joined: </span>
                {join_date && join_date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            </div>
        </div>
    );
}

export default function ProfileHeader({ username, banner_url, avatar_url, join_date, isOwner }: BannerProps)
{
    return (
        <div className="relative h-48 w-full overflow-hidden rounded-2xl border-2 border-trap-secondary/60 bg-trap-panel shadow-[0_18px_50px_rgba(0,0,0,.32)] sm:h-64 md:h-80 lg:h-96">
            <BannerSection banner_url={banner_url} isOwner={isOwner} />
            <AvatarSection
                username={username}
                avatar_url={avatar_url}
                join_date={join_date}
                isOwner={isOwner} />
        </div>
    );
}