import { cookies } from "next/headers";
import type { UserData, CurrentUser } from "@/types/userData";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

function profileMediaUrl(value: string | null): string | null {
    if (!value) return null;
    if (/^(https?:|blob:|data:)/i.test(value)) return value;
    const path = value.startsWith("/") ? value : `/${value}`;
    return `${apiBase}${path}`;
}

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
        avatar: profileMediaUrl(profile.avatar),
        banner: profileMediaUrl(profile.banner),
        join_date: new Date(profile.joined_date),
    };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
    const accessToken = (await cookies()).get("access_token")?.value;

    if (!accessToken) {
        return null;
    }

    const response = await fetch(`${apiBase}/auth/me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
    });
    const body = await response.json() as CurrentUser | { detail?: string };

    if (!response.ok) {
        const detail = "detail" in body && body.detail
            ? body.detail
            : "Could not load the user profile.";
        throw new UserApiError(detail, response.status);
    }

    return body as CurrentUser;
}
