export type FriendRequestNotification = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type RoomInvitationNotification = {
  id: string;
  room_code: string;
  status: string;
  created_at: string;
  expires_at: string;
  inviter_id: string;
  inviter_username: string;
  inviter_avatar_url: string | null;
};
