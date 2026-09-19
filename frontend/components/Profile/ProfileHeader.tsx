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
    <Avatar className="md:h-[130px] md:w-[130px] h-[100px] w-[100px] relative outline-offset-0 outline-3 outline-white-50 relative border-2 border-[#5B5FEF]">
        {isOwner && (
            <Button className="absolute cursor-pointer z-10 top-0 w-full h-full rounded-full opacity-0 hover:opacity-50 transition-opacity duration-300 bg-black">
                <CameraIcon className="h-10 w-10 text-[#9f85db] font-bold" />
            </Button>
        )}
      <AvatarImage src={avatar_url} alt="@shadcn" />
      <AvatarFallback>AV</AvatarFallback>
      <AvatarBadge className="absolute bottom-2 right-5 bg-green-600 dark:bg-green-800" />
    </Avatar>
  )
}

function BannerSection({ banner_url, isOwner } : { banner_url: string; isOwner: boolean })
{
    return (
        <div className="relative h-full border-2 border-[#5B5FEF]">
            <Image
                src={banner_url}
                alt="banner img"
                fill
                priority
                sizes="(min-width:1024px) 1024px, (min-width:640px) 768px, 100vw"
                style={{ objectFit: 'cover' }} 
            />
            {isOwner && (
                <Button className="absolute top-4 right-4 bg-black/60 hover:bg-black/85 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer" variant="outline">
                    <CameraIcon className="h-4 w-4 text-[#9f85db]" />
                    <span className="text-[#9f85db]">Edit image</span>
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
            <span className="text-sm sm:text-lg font-blackops">{username}</span>
            <div className="flex items-center gap-1 flex-wrap justify-center font-bold text-xs sm:text-sm text-white-400 bg-black/50 px-2 py-1 rounded-md">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sm:inline">Joined: </span>
                {join_date.toLocaleDateString(
                'en-US',
                {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                }
                )}
            </div>
            </div>
        </div>
    );
}

export default function ProfileHeader({ username, banner_url, avatar_url, join_date, isOwner }: BannerProps)
{
    return (
        <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg border-1 border-white-50 overflow-hidden border-2 border-indigo-500/50">
            <BannerSection banner_url={banner_url} isOwner={isOwner} />
            <AvatarSection
                username={username}
                avatar_url={avatar_url}
                join_date={join_date}
                isOwner={isOwner} />
        </div>
    );
}