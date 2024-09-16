export function utcToLocalTime(unixDate: any) {
  if (!unixDate) {
    return "";
  }

  const now = new Date(Number(unixDate));
  const nowUtc = now.toUTCString();

  return nowUtc;
}
