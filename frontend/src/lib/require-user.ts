import { redirect } from "next/navigation";
import { getCurrentUser, UserApiError } from "@/lib/getUser";
import { loginPathFor } from "@/lib/auth-routing";

export async function requireUser(destination: string) {
  try {
    const user = await getCurrentUser();
    if (user) return user;
  } catch (error) {
    if (!(error instanceof UserApiError) || error.status !== 401) throw error;
  }

  redirect(loginPathFor(destination));
}
