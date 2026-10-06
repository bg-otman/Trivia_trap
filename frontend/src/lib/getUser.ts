import { cookies } from "next/headers";
import type { UserData } from "@/types/userData";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

type UserProfileResponse = Omit<UserData, "id" | "join_date"> & {
    id: number;
    joined_date: string;
    banner: string | null;
    avatar: string | null;
};

export class UserApiError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
        this.name = "UserApiError";
    }
}

export async function getUser({ username }: { username?: string }): Promise<UserData> {
    const accessToken = (await cookies()).get("access_token")?.value;

    if (!accessToken) {
        throw new UserApiError("Not authenticated", 401);
    }

    if (!username) {
        username = "me";
    }

    const response = await fetch(`${apiBase}/users/${encodeURIComponent(username)}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
    });
    const body = await response.json() as UserProfileResponse | { detail?: string };

    if (!response.ok) {
        const detail = "detail" in body && body.detail
            ? body.detail
            : "Could not load the user profile.";
        throw new UserApiError(detail, response.status);
    }

    const profile = body as UserProfileResponse;
    return {
        ...profile,
        banner: profile.banner ?? "/banners/banner2.png",
        avatar: profile.avatar ?? "/avatars/a1.png",
        join_date: new Date(profile.joined_date),
    };
}
