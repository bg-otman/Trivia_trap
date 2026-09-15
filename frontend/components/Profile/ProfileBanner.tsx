'user client';

type BannerProps = {
    username: string;
    banner_url: string;
    avatar_url: string;
};

export default function ProfileBanner({ username, banner_url, avatar_url }: BannerProps)
{
    return (
        <div className="border rounded-lg border-red min-h-50 relative">

        </div>
    );
}