import { LaunchDataType } from "../types";

export enum LAUNCH_STATE {
  INDEFINITE = "Indefinite",
  ENDED = "Ended",
  LIVE = "Live",
  UPCOMING = "Upcoming",
  UNKNOWN = "Unknown",
}

export function useLaunchState({
  isWhitelisted,
  wlStartsAt,
  wlEndsAt,
  poStartsAt,
  poEndsAt,
  mintedAmount,
  supply,
  isBadge,
  badgeSupply,
}: LaunchDataType): LAUNCH_STATE {
  if (isWhitelisted && (!wlStartsAt || !wlEndsAt)) return LAUNCH_STATE.UNKNOWN;

  const now = Math.floor(Date.now() / 1000);
  const isInfiniteSupplyBadge = isBadge && badgeSupply === null;
  const isSoldOut = !isInfiniteSupplyBadge && mintedAmount >= supply;

  const whitelistUpcoming = isWhitelisted && now < Number(wlStartsAt);
  const publicUpcoming = !whitelistUpcoming && now < Number(poStartsAt);
  if (whitelistUpcoming || publicUpcoming) return LAUNCH_STATE.UPCOMING;

  if (!poEndsAt && !isSoldOut && now >= Number(poStartsAt))
    return LAUNCH_STATE.INDEFINITE;

  const isWhiteListActive =
    isWhitelisted && now >= Number(wlStartsAt) && now < Number(wlEndsAt);
  const isPublicOfferingActive =
    now >= Number(poStartsAt) && poEndsAt !== null && now <= Number(poEndsAt);
  if ((isWhiteListActive || isPublicOfferingActive) && !isSoldOut)
    return LAUNCH_STATE.LIVE;

  return LAUNCH_STATE.ENDED;
}
