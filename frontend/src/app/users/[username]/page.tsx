"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
// import ProfilePage from "@/components/Profile/ProfilePage";
// import { getUserData } from "@/app/profile/page";

type Props = {
    params: Promise<{
        username: string;
    }>;
};

type Profile = {
  id: number;
  username: string;
  cover_url: string | null;
  avatar_url: string | null;
  created_at: string;
};

type ProfileError = {
  error: string;
};

export default function ProfilePage({ params } : Props) {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const { username } = await params;
        const response = await apiFetch(`/users/${encodeURIComponent(username)}`);
        if (response.status === 401) {
          window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }

        const data = await response.json() as Profile | ProfileError | { detail?: string };

        if ("error" in data && data.error) {
          throw new Error(data.error);
        }

        if (!response.ok) {
          throw new Error("detail" in data && data.detail ? data.detail : "Could not load your profile.");
        }

        if (!cancelled) setProfileData(data as Profile);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Could not load your profile.");
        }
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div>
      <h1>Profile Page</h1>
      {error && <p role="alert">{error}</p>}
      {!error && !profileData && <p>Loading profile...</p>}
      {profileData && <pre>{JSON.stringify(profileData, null, 2)}</pre>}
    </div>
  );
}

// export default async function UserProfile({ params }: Props) {
//     const { username } = await params;
//     const user = await getUserData(username);
//     // if user == currentLoggedUser return redirect(/profile)
//     // if !user return UserNotFoundPage
//     user.username = username; // this just for now because i'm using mock data
//     return <ProfilePage user={user} isOwner={false} />;
// }