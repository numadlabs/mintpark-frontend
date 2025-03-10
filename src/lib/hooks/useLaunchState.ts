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


  hasFCFS,
  fcfsStartsAt,
  fcfsEndsAt,
  
  
  poStartsAt,
  poEndsAt,

  mintedAmount,
  supply,
  isBadge,
  badgeSupply,
}: LaunchDataType): LAUNCH_STATE {
  if (isWhitelisted && (!wlStartsAt || !wlEndsAt)) return LAUNCH_STATE.UNKNOWN;
  if (hasFCFS && (!fcfsStartsAt || !fcfsEndsAt)) return LAUNCH_STATE.UNKNOWN;

  const now = Math.floor(Date.now() / 1000);
  const isInfiniteSupplyBadge = isBadge && badgeSupply === null;
  const isSoldOut = !isInfiniteSupplyBadge && mintedAmount >= supply;

  const isWhiteListActive =
    isWhitelisted && now >= Number(wlStartsAt) && now < Number(wlEndsAt);
  const isFCFSActive =
    hasFCFS && now >= Number(fcfsStartsAt) && now < Number(fcfsEndsAt);
  const isPublicOfferingActive =
    now >= Number(poStartsAt) && poEndsAt !== null && now <= Number(poEndsAt);
  if (
    (isWhiteListActive || isFCFSActive || isPublicOfferingActive) &&
    !isSoldOut
  )
    return LAUNCH_STATE.LIVE;



  const whitelistUpcoming = isWhitelisted && now < Number(wlStartsAt);
  const fcfsUpcoming =
    !whitelistUpcoming && hasFCFS && now < Number(fcfsStartsAt);
  const publicUpcoming =
    !whitelistUpcoming && !fcfsUpcoming && now < Number(poStartsAt);
  if (whitelistUpcoming || fcfsUpcoming || publicUpcoming)
    return LAUNCH_STATE.UPCOMING;
  if (!poEndsAt && !isSoldOut && now >= Number(poStartsAt))
    return LAUNCH_STATE.INDEFINITE;
  return LAUNCH_STATE.ENDED;
}
