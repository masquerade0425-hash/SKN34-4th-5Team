import type { MemberUser } from "./api/auth";

export const memberRoleLabel = (user: Pick<MemberUser, "is_superuser" | "is_staff">) =>
  user.is_superuser ? "마스터 관리자" : user.is_staff ? "운영 관리자" : "일반 회원";

export type MemberLevel = 1 | 2 | 3;
export function memberLevelForPoints(points: number): MemberLevel {
  if (!Number.isSafeInteger(points) || points < 0) return 1;
  return points <= 500 ? 1 : points <= 1000 ? 2 : 3;
}
// Legacy preview sources; live awards are defined in backend/accounts/point_policy.py.
export const POINT_SOURCES = ["attendance", "course_recommendation", "prediction"] as const;
export const MEMBER_LEVELS: Record<MemberLevel, { label: string; image: string }> = {
  1: { label: "루키", image: "/images/member-levels/rank-bronze.svg" },
  2: { label: "팀 벤치", image: "/images/member-levels/rank-silver.svg" },
  3: { label: "주전", image: "/images/member-levels/rank-gold.svg" },
};

// Six calendar months in KST; clamp month-end dates (Aug 31 -> Feb 28/29).
export function nextNicknameChangeAt(changedAt: string | null): string | null {
  if (!changedAt || !Number.isFinite(Date.parse(changedAt))) return null;
  const date = new Date(Date.parse(changedAt) + 9 * 3600000);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 6);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return new Date(date.getTime() - 9 * 3600000).toISOString();
}

export function nicknameChangeTimestamp(previous: string, next: string, changedAt: string | null, now: Date): string | null {
  if (previous === next.trim()) return changedAt;
  const allowedAt = nextNicknameChangeAt(changedAt);
  if (allowedAt && now.getTime() < Date.parse(allowedAt)) throw new Error("닉네임은 변경 후 6개월이 지나야 다시 바꿀 수 있어요.");
  return now.toISOString();
}
