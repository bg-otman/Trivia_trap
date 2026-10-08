"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { RefreshCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProfileUser } from "@/mocks/profile";
import { ProfileAvatar } from "./profile-avatar";

export function EditProfileDialog({ open, onOpenChange, user, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; user: ProfileUser; onSave: (user: ProfileUser) => void }) {
  const [draft, setDraft] = useState(user);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setDraft(user);
      setAvatarError(null);
    }
    onOpenChange(nextOpen);
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("The image must be smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setDraft((current) => ({ ...current, avatarUrl: reader.result as string }));
      setAvatarError(null);
    };
    reader.onerror = () => setAvatarError("The image could not be loaded.");
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = draft.displayName.trim();
    const username = draft.username.trim().replace(/^@/, "");
    if (!displayName || !username) return;
    onSave({ ...draft, displayName, username, bio: draft.bio.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-w-lg p-5 sm:p-7">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-secondary text-xl uppercase">Edit profile</DialogTitle>
            <DialogDescription>Update your local player card. Changes are saved for this session only.</DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-black/15 p-3">
              <ProfileAvatar
                name={draft.displayName || "Mehdi"}
                imageUrl={draft.avatarUrl}
                size={56}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white">Avatar</p>
                <p className="mt-1 text-[10px] text-[#777782]">Use your Blobatar or upload an image.</p>
                {avatarError && <p className="mt-1 text-[10px] font-semibold text-trap-danger" role="alert">{avatarError}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="surface" size="sm">
                <label className="cursor-pointer">
                  <Upload className="size-3.5" /> Upload image
                  <input type="file" accept="image/*" onChange={selectImage} className="sr-only" />
                </label>
              </Button>
              <Button type="button" variant="surface" size="sm" onClick={() => { setDraft({ ...draft, avatarUrl: null }); setAvatarError(null); }}>
                <RefreshCcw className="size-3.5" /> Use Blobatar
              </Button>
            </div>

            <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#a6a6ae]">
              Display name
              <Input value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} maxLength={24} className="mt-2" required />
            </label>
            <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#a6a6ae]">
              Username
              <Input value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.target.value })} maxLength={24} className="mt-2" required />
            </label>
            <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#a6a6ae]">
              Bio
              <textarea value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} maxLength={100} rows={3} className="mt-2 w-full resize-none rounded-xl border border-input bg-black/25 px-3 py-2 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => changeOpen(false)}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
