
import { DEFAULT_AVATAR, UNCLE_JOY_AVATAR, TEAM_AVATARS } from "./avatars";

type AvatarArgs = {
    uid?: string;
    email?: string;
    name?: string;
    avatarUrl?: string | null;
    username?: string | null; // Compatibility with varied naming
    avatar?: string | null;   // Compatibility
    role?: string | null;
    teamId?: string | null;
};

export function getAvatarUrl(args: AvatarArgs | null | undefined): string {
    if (!args) return DEFAULT_AVATAR;

    const { role, teamId } = args;

    // Normalized avatar props
    const rawAvatar = args.avatarUrl || args.avatar;

    // 1. Admin Override (Highest Priority)
    if (role === "admin" || role === "ADMIN") {
        return UNCLE_JOY_AVATAR;
    }

    // 2. User Uploaded Avatar (If valid string and reasonable length)
    if (rawAvatar && typeof rawAvatar === "string" && rawAvatar.trim().length > 5) {
        return rawAvatar;
    }

    // 3. Team Fallback
    if (teamId && TEAM_AVATARS[teamId]) {
        return TEAM_AVATARS[teamId];
    }

    // 4. Generic Fallback
    return DEFAULT_AVATAR;
}
