"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Profile = {
  id: number;
  username: string;
  cover_url: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await apiFetch("/users/me");
        if (response.status === 401) {
          window.location.replace("/login?next=/profile");
          return;
        }

        const data = await response.json() as Profile | { detail?: string };

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
  }, []);

  return (
    <div>
      <h1>Profile Page</h1>
      {error && <p role="alert">{error}</p>}
      {!error && !profileData && <p>Loading profile...</p>}
      {profileData && <pre>{JSON.stringify(profileData, null, 2)}</pre>}
    </div>
  );
}